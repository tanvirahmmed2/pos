import { pool } from "@/lib/database/db";
import { getTenant } from "@/lib/database/tenant";
import { NextResponse } from "next/server";
import { isSales, isAdmin, isManagement } from "@/lib/middleware";

async function getOrderDetails(client, orderId, tenantId) {
    const res = await client.query(`
        SELECT 
            o.order_id, o.subtotal_amount, o.total_discount_amount, o.total_amount, o.due_amount, o.status, o.created_at,
            c.name,
            (SELECT JSON_AGG(p_item) FROM (
                SELECT payment_method, payment_status, amount, amount_received, change_amount, transaction_id, paid_at
                FROM ecom_payments 
                WHERE order_id = o.order_id AND tenant_id = o.tenant_id
            ) p_item) AS payments,
            (SELECT JSON_AGG(oi_item) FROM (
                SELECT pr.name, oi.quantity, oi.price
                FROM ecom_order_items oi
                JOIN ecom_products pr ON oi.product_id = pr.product_id
                WHERE oi.order_id = o.order_id AND oi.tenant_id = o.tenant_id
            ) oi_item) AS items
        FROM ecom_orders o
        JOIN ecom_customers c ON o.customer_id = c.customer_id AND o.tenant_id = c.tenant_id
        WHERE o.order_id = $1 AND o.tenant_id = $2
    `, [orderId, tenantId]);
    
    if (res.rowCount === 0) return null;
    
    const row = res.rows[0];
    return {
        ...row,
        customer_name: row.name,
        paid_amount: row.payments?.[0]?.amount_received || 0,
        change_amount: row.payments?.[0]?.change_amount || 0,
        payment_method: row.payments?.[0]?.payment_method || 'N/A'
    };
}

// ─── POST — Place new order (sales/POS) ───────────────────────────────────────
export async function POST(req) {
    const client = await pool.connect();
    try {
        const auth = await isSales();
        if (!auth.success) {
            return NextResponse.json({ success: false, message: auth.message }, { status: 403 });
        }

        const website = await getTenant();
        if (!website) return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
        const tenant_id = website.tenant_id;

        const body = await req.json();
        const { customer_id, phone, items, subtotal, discount, total, paid_amount, change_amount, paymentMethod, transactionId, createdAt } = body;
        
        if (!phone) throw new Error("Phone number is required");

        await client.query('BEGIN');

        // --- CUSTOMER LOOKUP / CREATION LOGIC ---
        let final_customer_id = customer_id;
        if (!final_customer_id) {
            // 1. Check existing customer
            const custRes = await client.query(
                "SELECT customer_id FROM ecom_customers WHERE phone = $1 AND tenant_id = $2",
                [phone, tenant_id]
            );
            if (custRes.rowCount > 0) {
                final_customer_id = custRes.rows[0].customer_id;
            } else {
                // 2. Check ecom_users
                const userRes = await client.query(
                    "SELECT name FROM ecom_users WHERE phone = $1 AND tenant_id = $2",
                    [phone, tenant_id]
                );
                let customerName = 'Guest';
                if (userRes.rowCount > 0) {
                    customerName = userRes.rows[0].name;
                }
                // 3. Create new customer
                const newCustRes = await client.query(
                    "INSERT INTO ecom_customers (tenant_id, name, phone) VALUES ($1, $2, $3) RETURNING customer_id",
                    [tenant_id, customerName, phone]
                );
                final_customer_id = newCustRes.rows[0].customer_id;
            }
        }

        // Calculate financials
        const received_net = (parseFloat(paid_amount) || 0) - (parseFloat(change_amount) || 0);
        const due_amount = Math.max(0, parseFloat(total) - received_net);
        const actual_paid = Math.min(parseFloat(total), received_net);

        const shipping_address = body.shipping_address || 'POS Sale / In-Store';

        const orderRes = await client.query(
            `INSERT INTO ecom_orders (
                customer_id, phone, shipping_address, subtotal_amount, 
                total_discount_amount, total_amount, due_amount, status, created_at, tenant_id
            ) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING order_id`,
            [final_customer_id, phone, shipping_address, subtotal, discount, total, due_amount, 'delivered', createdAt || new Date(), tenant_id]
        );
        const orderId = orderRes.rows[0].order_id;

        for (const item of items) {
            await client.query(
                "INSERT INTO ecom_order_items (order_id, product_id, quantity, price, tenant_id) VALUES ($1, $2, $3, $4, $5)",
                [orderId, item.product_id, item.quantity, item.price, tenant_id]
            );
            
            const stockUpdate = await client.query(
                "UPDATE ecom_products SET stock = stock - $1 WHERE product_id = $2 AND stock >= $1 AND tenant_id = $3",
                [item.quantity, item.product_id, tenant_id]
            );
            if (stockUpdate.rowCount === 0) throw new Error(`Insufficient stock for Product ID: ${item.product_id}`);

            await client.query(
                `INSERT INTO ecom_inventory_logs (tenant_id, product_id, type, quantity, reference_id, note)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [tenant_id, item.product_id, 'sale', -item.quantity, orderId, `POS Sale #${orderId}`]
            );
        }

        await client.query(
            `INSERT INTO ecom_payments (
                order_id, payment_method, amount, amount_received, change_amount, 
                payment_status, transaction_id, tenant_id
            )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [orderId, paymentMethod, actual_paid, paid_amount, change_amount, 'success', transactionId || null, tenant_id]
        );

        await client.query('COMMIT');
        const fullOrder = await getOrderDetails(client, orderId, tenant_id);
        return NextResponse.json({ success: true, message: 'Sale completed successfully', payload: fullOrder }, { status: 201 });

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error("Order Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}

// ─── PUT — Lifecycle actions ───────────────────────────────────────────────────
export async function PUT(req) {
    const client = await pool.connect();
    try {
        const auth = await isManagement();
        if (!auth.success) return NextResponse.json({ success: false, message: auth.message }, { status: 403 });

        const website = await getTenant();
        if (!website) return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
        const tenant_id = website.tenant_id;

        const { orderId, action } = await req.json();
        await client.query('BEGIN');

        const currentOrder = await client.query(
            "SELECT status FROM ecom_orders WHERE order_id = $1 AND tenant_id = $2",
            [orderId, tenant_id]
        );
        if (currentOrder.rowCount === 0) throw new Error("Order not found");
        const orderStatus = currentOrder.rows[0].status;

        const restoreStock = async (oId, tId, notePrefix) => {
            const items = await client.query(
                "SELECT product_id, quantity FROM ecom_order_items WHERE order_id = $1 AND tenant_id = $2",
                [oId, tId]
            );
            for (const item of items.rows) {
                await client.query(
                    "UPDATE ecom_products SET stock = stock + $1 WHERE product_id = $2 AND tenant_id = $3",
                    [item.quantity, item.product_id, tId]
                );
                await client.query(
                    `INSERT INTO ecom_inventory_logs (tenant_id, product_id, type, quantity, reference_id, note)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [tId, item.product_id, 'return', item.quantity, oId, `${notePrefix} #${oId}`]
                );
            }
        };

        if (action === 'cancel') {
            if (orderStatus !== 'delivered') throw new Error(`Cannot cancel an order with status: ${orderStatus}`);
            await restoreStock(orderId, tenant_id, 'Order Cancelled');
            await client.query(
                "UPDATE ecom_orders SET status = 'cancelled' WHERE order_id = $1 AND tenant_id = $2",
                [orderId, tenant_id]
            );
            await client.query('COMMIT');
            return NextResponse.json({ success: true, message: 'Order cancelled & stock restored' });
        }

        if (action === 'return') {
            if (orderStatus === 'returned') throw new Error("Order already returned");
            if (orderStatus !== 'delivered') throw new Error(`Cannot return an order with status: ${orderStatus}`);
            await restoreStock(orderId, tenant_id, 'Order Returned');
            await client.query(
                "UPDATE ecom_orders SET status = 'returned' WHERE order_id = $1 AND tenant_id = $2",
                [orderId, tenant_id]
            );
            await client.query(
                "UPDATE ecom_payments SET payment_status = 'refunded' WHERE order_id = $1 AND tenant_id = $2",
                [orderId, tenant_id]
            );
            await client.query('COMMIT');
            return NextResponse.json({ success: true, message: "Order returned & stock restored" });
        }

        if (action === 'delete') {
            const adminAuth = await isAdmin();
            if (!adminAuth.success) throw new Error(adminAuth.message);
            if (orderStatus === 'delivered') {
                await restoreStock(orderId, tenant_id, 'Order Deleted');
            }
            await client.query("DELETE FROM ecom_order_items WHERE order_id = $1 AND tenant_id = $2", [orderId, tenant_id]);
            await client.query("DELETE FROM ecom_payments WHERE order_id = $1 AND tenant_id = $2", [orderId, tenant_id]);
            await client.query("DELETE FROM ecom_orders WHERE order_id = $1 AND tenant_id = $2", [orderId, tenant_id]);
            await client.query('COMMIT');
            return NextResponse.json({ success: true, message: "Order deleted successfully" });
        }

        throw new Error("Invalid action provided");

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    } finally {
        client.release();
    }
}

// ─── GET — All orders (dashboard list) ────────────────────────────────────────
export async function GET() {
    const client = await pool.connect();
    try {
        const auth = await isManagement();
        if (!auth.success) return NextResponse.json({ success: false, message: auth.message }, { status: 403 });

        const website = await getTenant();
        if (!website) return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
        const tenant_id = website.tenant_id;

        const query = `
            SELECT 
                o.order_id, c.name, c.phone,
                o.total_amount, o.total_discount_amount AS discount,
                o.subtotal_amount AS subtotal, o.status, o.created_at AS date, o.due_amount,
                (SELECT SUM(quantity) FROM ecom_order_items WHERE order_id = o.order_id) AS total_items_count,
                (SELECT JSON_AGG(oi_item) FROM (
                    SELECT pr.name, oi.quantity, oi.price
                    FROM ecom_order_items oi
                    JOIN ecom_products pr ON oi.product_id = pr.product_id
                    WHERE oi.order_id = o.order_id
                ) oi_item) AS product_list,
                (SELECT JSON_AGG(p_item) FROM (
                    SELECT payment_status, payment_method, amount_received, change_amount
                    FROM ecom_payments
                    WHERE order_id = o.order_id
                ) p_item) AS payments
            FROM ecom_orders o
            JOIN ecom_customers c ON o.customer_id = c.customer_id AND o.tenant_id = c.tenant_id
            WHERE o.tenant_id = $1
            ORDER BY o.created_at DESC
        `;
        const data = await client.query(query, [tenant_id]);
        
        const formattedRows = data.rows.map(row => ({
            ...row,
            payment_status: row.payments?.[0]?.payment_status,
            payment_method: row.payments?.[0]?.payment_method,
            amount_received: row.payments?.[0]?.amount_received,
            change_amount: row.payments?.[0]?.change_amount,
            items: row.product_list
        }));

        if (formattedRows.length === 0) return NextResponse.json({ success: false, message: 'No history found' }, { status: 404 });
        return NextResponse.json({ success: true, message: 'Successfully fetched data', payload: formattedRows }, { status: 200 });

    } catch (error) {
        console.error("GET Orders Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}
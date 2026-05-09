import { pool } from "@/lib/database/db";
import { getTenant } from "@/lib/database/tenant";
import { NextResponse } from "next/server";
import { isSales, isAdmin, isManagement } from "@/lib/middleware";

async function getOrderDetails(client, orderId, tenantId) {
    const res = await client.query(`
        SELECT 
            o.order_id, o.subtotal_amount, o.total_discount_amount, o.total_amount, o.status, o.created_at,
            c.name, p.payment_method, p.payment_status, p.amount AS actual_paid, 
            p.amount_received, p.change_amount,
            JSON_AGG(JSON_BUILD_OBJECT('name', pr.name, 'quantity', oi.quantity, 'price', oi.price)) AS items
        FROM ecom_orders o
        JOIN ecom_customers c  ON o.customer_id = c.customer_id AND o.tenant_id = c.tenant_id
        JOIN ecom_payments p   ON o.order_id    = p.order_id    AND o.tenant_id = p.tenant_id
        JOIN ecom_order_items oi ON o.order_id  = oi.order_id   AND o.tenant_id = oi.tenant_id
        JOIN ecom_products pr  ON oi.product_id = pr.product_id AND o.tenant_id = pr.tenant_id
        WHERE o.order_id = $1 AND o.tenant_id = $2
        GROUP BY o.order_id, c.name, p.payment_method, p.payment_status, p.amount_received, p.change_amount, p.amount
    `, [orderId, tenantId]);
    return res.rows[0];
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
        if (!customer_id) throw new Error("Customer ID is required");

        await client.query('BEGIN');

        // Force status to 'delivered' as per requirements
        const orderRes = await client.query(
            `INSERT INTO ecom_orders (customer_id, phone, subtotal_amount, total_discount_amount, total_amount, status, created_at, tenant_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING order_id`,
            [customer_id, phone, subtotal, discount, total, 'delivered', createdAt || new Date(), tenant_id]
        );
        const orderId = orderRes.rows[0].order_id;

        for (const item of items) {
            await client.query(
                "INSERT INTO ecom_order_items (order_id, product_id, quantity, price, tenant_id) VALUES ($1, $2, $3, $4, $5)",
                [orderId, item.product_id, item.quantity, item.price, tenant_id]
            );
            
            // Deduct stock immediately
            const stockUpdate = await client.query(
                "UPDATE ecom_products SET stock = stock - $1 WHERE product_id = $2 AND stock >= $1 AND tenant_id = $3",
                [item.quantity, item.product_id, tenant_id]
            );
            if (stockUpdate.rowCount === 0) throw new Error(`Insufficient stock for Product ID: ${item.product_id}`);
        }

        // Always paid since it's delivered
        await client.query(
            `INSERT INTO ecom_payments (order_id, payment_method, amount, amount_received, change_amount, payment_status, transaction_id, tenant_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [orderId, paymentMethod, total, paid_amount, change_amount, 'paid', transactionId || null, tenant_id]
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

        // ── CANCEL: delivered → cancelled (restore stock) ─────────────────────────
        if (action === 'cancel') {
            if (orderStatus !== 'delivered') throw new Error(`Cannot cancel an order with status: ${orderStatus}`);
            
            const items = await client.query(
                "SELECT product_id, quantity FROM ecom_order_items WHERE order_id = $1 AND tenant_id = $2",
                [orderId, tenant_id]
            );
            for (const item of items.rows) {
                await client.query(
                    "UPDATE ecom_products SET stock = stock + $1 WHERE product_id = $2 AND tenant_id = $3",
                    [item.quantity, item.product_id, tenant_id]
                );
            }
            await client.query(
                "UPDATE ecom_orders SET status = 'cancelled' WHERE order_id = $1 AND tenant_id = $2",
                [orderId, tenant_id]
            );
            await client.query('COMMIT');
            return NextResponse.json({ success: true, message: 'Order cancelled & stock restored' });
        }

        // ── RETURN: delivered → returned, restore stock, refund ──────────────
        if (action === 'return') {
            if (orderStatus === 'returned') throw new Error("Order already returned");
            if (orderStatus !== 'delivered') throw new Error(`Cannot return an order with status: ${orderStatus}`);

            const items = await client.query(
                "SELECT product_id, quantity FROM ecom_order_items WHERE order_id = $1 AND tenant_id = $2",
                [orderId, tenant_id]
            );
            for (const item of items.rows) {
                await client.query(
                    "UPDATE ecom_products SET stock = stock + $1 WHERE product_id = $2 AND tenant_id = $3",
                    [item.quantity, item.product_id, tenant_id]
                );
            }
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

        // ── DELETE: hard delete, restore stock if necessary ──────────────────
        if (action === 'delete') {
            const adminAuth = await isAdmin();
            if (!adminAuth.success) throw new Error(adminAuth.message);

            if (orderStatus === 'delivered') {
                const items = await client.query(
                    "SELECT product_id, quantity FROM ecom_order_items WHERE order_id = $1 AND tenant_id = $2",
                    [orderId, tenant_id]
                );
                for (const item of items.rows) {
                    await client.query(
                        "UPDATE ecom_products SET stock = stock + $1 WHERE product_id = $2 AND tenant_id = $3",
                        [item.quantity, item.product_id, tenant_id]
                    );
                }
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
                o.subtotal_amount AS subtotal, o.status,
                p.payment_status, p.payment_method, o.created_at AS date,
                JSON_AGG(JSON_BUILD_OBJECT('name', pr.name, 'quantity', oi.quantity, 'price', oi.price)) AS product_list,
                SUM(oi.quantity) AS total_items_count
            FROM ecom_orders o
            JOIN ecom_customers c    ON o.customer_id = c.customer_id AND o.tenant_id = c.tenant_id
            JOIN ecom_payments p     ON o.order_id    = p.order_id    AND o.tenant_id = p.tenant_id
            JOIN ecom_order_items oi ON o.order_id    = oi.order_id   AND o.tenant_id = oi.tenant_id
            JOIN ecom_products pr    ON oi.product_id = pr.product_id AND o.tenant_id = pr.tenant_id
            WHERE o.tenant_id = $1
            GROUP BY o.order_id, c.name, c.phone, p.payment_status, p.payment_method, o.created_at
            ORDER BY o.created_at DESC
        `;
        const data = await client.query(query, [tenant_id]);
        if (data.rows.length === 0) return NextResponse.json({ success: false, message: 'No history found' }, { status: 404 });
        return NextResponse.json({ success: true, message: 'Successfully fetched data', payload: data.rows }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}
import { pool } from "@/lib/database/db";
import { getTenant } from "@/lib/database/tenant";
import { NextResponse } from "next/server";

export async function POST(req) {
    const client = await pool.connect();
    try {
        const website = await getTenant();
        if (!website) {
            return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
        }
        const tenant_id = website.tenant_id;

        const { customerName, phone, items, subtotal, discount, total, paymentMethod, transactionId } = await req.json();

        if (!phone) throw new Error("Phone number is required");

        await client.query('BEGIN');
        let customer_id;
        const customerCheck = await client.query(
            "SELECT customer_id FROM ecom_customers WHERE phone = $1 AND tenant_id = $2",
            [phone, tenant_id]
        );

        if (customerCheck.rows.length > 0) {
            customer_id = customerCheck.rows[0].customer_id;
        } else {
            // Create a new guest customer record
            const newCustomer = await client.query(
                "INSERT INTO ecom_customers (name, phone, tenant_id) VALUES ($1, $2, $3) RETURNING customer_id",
                [customerName || 'Guest Customer', phone, tenant_id]
            );
            customer_id = newCustomer.rows[0].customer_id;
        }

        // 2. Insert Order (Force status to 'pending')
        const orderRes = await client.query(
            `INSERT INTO ecom_orders (customer_id, phone, subtotal_amount, total_discount_amount, total_amount, status, tenant_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING order_id`,
            [customer_id, phone, subtotal, discount, total, 'pending', tenant_id]
        );
        const orderId = orderRes.rows[0].order_id;

        for (const item of items) {
            await client.query(
                "INSERT INTO ecom_order_items (order_id, product_id, quantity, price, tenant_id) VALUES ($1, $2, $3, $4, $5)",
                [orderId, item.product_id, item.quantity, item.price, tenant_id]
            );
        }

        // 4. Insert Payment (Force status to 'pending')
        await client.query(
            "INSERT INTO ecom_payments (order_id, payment_method, amount, payment_status, transaction_id, tenant_id) VALUES ($1, $2, $3, $4, $5, $6)",
            [orderId, paymentMethod, total, 'pending', transactionId || null, tenant_id]
        );

        await client.query('COMMIT');

        return NextResponse.json({ 
            success: true, 
            message: 'Order received! Our team will call you soon for confirmation.',
            orderId 
        }, { status: 201 });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Order Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}
import { pool } from "@/lib/database/db";
import { getTenant } from "@/lib/database/tenant";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const website = await getTenant();
        if (!website) return NextResponse.json({ success: false, message: 'Store not found' }, { status: 404 });
        const tenant_id = website.tenant_id;

        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get('orderId')?.trim();
        const phone   = searchParams.get('phone')?.trim();

        if (!orderId && !phone) {
            return NextResponse.json({ success: false, message: 'Please provide an Order ID or phone number.' }, { status: 400 });
        }

        const query = `
            SELECT 
                o.order_id, o.subtotal_amount, o.total_discount_amount, o.total_amount, o.status, o.created_at, o.due_amount,
                c.name AS customer_name, c.phone AS customer_phone,
                (SELECT JSON_AGG(p_item) FROM (
                    SELECT payment_method, payment_status, amount_received AS paid_amount
                    FROM ecom_payments 
                    WHERE order_id = o.order_id AND tenant_id = o.tenant_id
                ) p_item) AS payments,
                (SELECT JSON_AGG(oi_item) FROM (
                    SELECT pr.name, pr.image, oi.quantity, oi.price
                    FROM ecom_order_items oi
                    JOIN ecom_products pr ON oi.product_id = pr.product_id
                    WHERE oi.order_id = o.order_id AND oi.tenant_id = o.tenant_id
                ) oi_item) AS items
            FROM ecom_orders o
            JOIN ecom_customers c ON o.customer_id = c.customer_id AND o.tenant_id = c.tenant_id
            WHERE o.tenant_id = $1 AND (${orderId ? 'o.order_id = $2' : 'c.phone = $2'})
            ORDER BY o.created_at DESC
        `;

        const values = [tenant_id, orderId || phone];
        const { rows } = await pool.query(query, values);

        if (rows.length === 0) {
            return NextResponse.json({
                success: false, 
                message: orderId ? 'No order found with that ID.' : 'No orders found for that phone number.'
            }, { status: 404 });
        }

        const formattedRows = rows.map(row => ({
            ...row,
            payment_method: row.payments?.[0]?.payment_method,
            payment_status: row.payments?.[0]?.payment_status,
            paid_amount: row.payments?.[0]?.paid_amount || 0
        }));

        return NextResponse.json({
            success: true,
            payload: orderId ? formattedRows[0] : formattedRows
        }, { status: 200 });

    } catch (error) {
        console.error('Order Track Error:', error.message);
        return NextResponse.json({ success: false, message: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}

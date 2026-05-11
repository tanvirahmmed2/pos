import { pool } from "@/lib/database/db";
import { getTenant } from "@/lib/database/tenant";
import { NextResponse } from "next/server";

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'];

export async function GET(req) {
    const client = await pool.connect();
    const { searchParams } = new URL(req.url);
    const filterStatus = searchParams.get('q');

    try {
        const website = await getTenant();
        if (!website) return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
        const tenant_id = website.tenant_id;

        if (!filterStatus || !VALID_STATUSES.includes(filterStatus)) {
            return NextResponse.json({
                success: false,
                message: `Valid status required: ${VALID_STATUSES.join(', ')}`
            }, { status: 400 });
        }

        const query = `
            SELECT 
                o.order_id,
                c.name,
                c.phone,
                o.total_amount,
                o.total_discount_amount AS discount,
                o.subtotal_amount AS subtotal,
                o.status,
                o.created_at AS date,
                (SELECT JSON_AGG(p_item) FROM (
                    SELECT payment_status, payment_method, transaction_id, amount_received, change_amount
                    FROM ecom_payments 
                    WHERE order_id = o.order_id AND tenant_id = o.tenant_id
                ) p_item) AS payments,
                (SELECT JSON_AGG(oi_item) FROM (
                    SELECT pr.name, oi.quantity, oi.price, pr.sale_price, pr.discount_price
                    FROM ecom_order_items oi
                    JOIN ecom_products pr ON oi.product_id = pr.product_id
                    WHERE oi.order_id = o.order_id AND oi.tenant_id = o.tenant_id
                ) oi_item) AS product_list
            FROM ecom_orders o
            JOIN ecom_customers c ON o.customer_id = c.customer_id AND o.tenant_id = c.tenant_id
            WHERE o.status = $1 AND o.tenant_id = $2
            ORDER BY o.created_at DESC
        `;

        const data = await client.query(query, [filterStatus, tenant_id]);

        const formattedRows = data.rows.map(row => ({
            ...row,
            payment_status: row.payments?.[0]?.payment_status,
            payment_method: row.payments?.[0]?.payment_method,
            transaction_id: row.payments?.[0]?.transaction_id,
            amount_received: row.payments?.[0]?.amount_received,
            change_amount: row.payments?.[0]?.change_amount
        }));

        return NextResponse.json({
            success: true,
            count: data.rowCount,
            payload: formattedRows
        }, { status: 200 });

    } catch (error) {
        console.error("Database Error:", error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}
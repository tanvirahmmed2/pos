import { pool } from "@/lib/database/db";
import { getTenant } from "@/lib/database/tenant";
import { NextResponse } from "next/server";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get('q') || '';

    try {
        const website = await getTenant();
        if (!website) return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
        const tenant_id = website.tenant_id;

        const query = `
            SELECT 
                c.name,
                c.phone,
                o.order_id,
                o.total_amount,
                o.total_discount_amount,
                o.subtotal_amount,
                o.status,
                o.created_at,
                (SELECT JSON_AGG(p_item) FROM (
                    SELECT payment_status, amount_received, change_amount, payment_method
                    FROM ecom_payments 
                    WHERE order_id = o.order_id AND tenant_id = o.tenant_id
                ) p_item) AS payments,
                (SELECT JSON_AGG(oi_item) FROM (
                    SELECT pr.name, oi.quantity, oi.price, pr.sale_price, pr.discount_price, pr.barcode
                    FROM ecom_order_items oi
                    JOIN ecom_products pr ON oi.product_id = pr.product_id
                    WHERE oi.order_id = o.order_id AND oi.tenant_id = o.tenant_id
                ) oi_item) AS items
            FROM ecom_orders o
            JOIN ecom_customers c ON o.customer_id = c.customer_id AND o.tenant_id = c.tenant_id
            WHERE o.tenant_id = $3 AND (
                c.phone ILIKE $1 OR 
                c.name ILIKE $1 OR 
                CAST(o.order_id AS TEXT) = $2 OR
                CAST(o.created_at AS TEXT) ILIKE $1 OR
                EXISTS (
                    SELECT 1 FROM ecom_order_items oi
                    JOIN ecom_products pr ON oi.product_id = pr.product_id
                    WHERE oi.order_id = o.order_id AND (pr.name ILIKE $1 OR pr.barcode = $2)
                )
            )
            ORDER BY o.created_at DESC
        `;

        const data = await pool.query(query, [`%${searchTerm}%`, searchTerm, tenant_id]);

        const formattedRows = data.rows.map(row => ({
            ...row,
            payment_status: row.payments?.[0]?.payment_status,
            payment_method: row.payments?.[0]?.payment_method,
            paid_amount: row.payments?.[0]?.amount_received || 0,
            amount_received: row.payments?.[0]?.amount_received || 0,
            change_amount: row.payments?.[0]?.change_amount || 0
        }));

        if (formattedRows.length === 0) {
            return NextResponse.json({ success: false, message: 'No orders found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, payload: formattedRows }, { status: 200 });

    } catch (error) {
        console.error("Search Error:", error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
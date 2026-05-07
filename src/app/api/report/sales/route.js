import { pool } from "@/lib/database/db";
import { getTenant } from "@/lib/database/tenant";
import { NextResponse } from "next/server";

export async function GET() {
    const client = await pool.connect();
    try {
        const website = await getTenant();
        if (!website) {
            return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
        }
        const tenant_id = website.tenant_id;

        const statsQuery = `
            SELECT 
                COALESCE(SUM(total_amount), 0) AS total_revenue,
                (SELECT COALESCE(SUM(oi.quantity), 0) FROM ecom_order_items oi JOIN ecom_orders o ON oi.order_id = o.order_id WHERE o.status IN ('confirmed', 'shipped', 'delivered', 'completed', 'confirm') AND oi.tenant_id = $1) AS total_items_sold
            FROM ecom_orders 
            WHERE status IN ('confirmed', 'shipped', 'delivered', 'completed', 'confirm') AND tenant_id = $1;
        `;

        const topProductsQuery = `
            SELECT 
                p.name, 
                SUM(oi.quantity) AS sold_qty,
                SUM(oi.quantity * oi.price) AS revenue
            FROM ecom_order_items oi
            JOIN ecom_products p ON oi.product_id = p.product_id AND oi.tenant_id = p.tenant_id
            JOIN ecom_orders o ON oi.order_id = o.order_id AND oi.tenant_id = o.tenant_id
            WHERE o.status IN ('confirmed', 'shipped', 'delivered', 'completed', 'confirm') AND o.tenant_id = $1
            GROUP BY p.product_id, p.name
            ORDER BY sold_qty DESC
            LIMIT 10;
        `;

        const [statsRes, topRes] = await Promise.all([
            client.query(statsQuery, [tenant_id]),
            client.query(topProductsQuery, [tenant_id])
        ]);

        return NextResponse.json({
            success: true,
            payload: {
                stats: statsRes.rows[0],
                topProducts: topRes.rows
            }
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}
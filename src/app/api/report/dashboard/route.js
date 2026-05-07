import { pool } from "@/lib/database/db";
import { getTenant } from "@/lib/database/tenant";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const website = await getTenant();
        if (!website) {
            return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
        }
        const tenant_id = website.tenant_id;

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'Today';
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        // 1. LIFETIME OVERVIEW
        const overviewQuery = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM ecom_customers WHERE tenant_id = $1) as total_customers,
                (SELECT COUNT(*) FROM ecom_products WHERE tenant_id = $1) as total_products,
                (SELECT COALESCE(SUM(stock), 0) FROM ecom_products WHERE tenant_id = $1) as total_stock_qty,
                (SELECT COALESCE(SUM(stock * purchase_price), 0) FROM ecom_products WHERE tenant_id = $1) as total_stock_value,
                (SELECT COUNT(*) FROM ecom_orders WHERE status IN ('confirmed', 'shipped', 'delivered', 'completed', 'confirm') AND tenant_id = $1) as total_confirmed_orders,
                (SELECT COALESCE(SUM(total_amount), 0) FROM ecom_orders WHERE status IN ('confirmed', 'shipped', 'delivered', 'completed', 'confirm') AND tenant_id = $1) as total_sales_amount,
                (SELECT COALESCE(SUM(total_amount), 0) FROM ecom_orders WHERE status = 'returned' AND tenant_id = $1) as total_returned_amount,
                (SELECT COUNT(*) FROM ecom_purchases WHERE tenant_id = $1) as total_purchase_count,
                (SELECT COALESCE(SUM(total_amount), 0) FROM ecom_purchases WHERE tenant_id = $1) as total_purchase_amount,
                (SELECT COALESCE(SUM((oi.price - pr.purchase_price) * oi.quantity), 0) 
                 FROM ecom_order_items oi 
                 JOIN ecom_products pr ON oi.product_id = pr.product_id AND oi.tenant_id = pr.tenant_id
                 JOIN ecom_orders o ON oi.order_id = o.order_id AND oi.tenant_id = o.tenant_id
                 WHERE o.status IN ('confirmed', 'shipped', 'delivered', 'completed', 'confirm') AND o.tenant_id = $1) as total_profit_amount
        `, [tenant_id]);

        // 2. DYNAMIC FILTER LOGIC
        let dateFilter = "o.tenant_id = $1";
        let params = [tenant_id];

        if (type === 'Custom' && start && end) {
            dateFilter += " AND o.created_at::date >= $2 AND o.created_at::date <= $3";
            params.push(start, end);
        } else {
            const ranges = {
                'Today': "o.created_at::date = CURRENT_DATE",
                'Yesterday': "o.created_at::date = CURRENT_DATE - 1",
                'This Week': "o.created_at::date >= date_trunc('week', CURRENT_DATE)",
                'This Month': "o.created_at::date >= date_trunc('month', CURRENT_DATE)",
                'This Year': "o.created_at::date >= date_trunc('year', CURRENT_DATE)"
            };
            dateFilter += " AND " + (ranges[type] || ranges['Today']);
        }

        const purchaseFilter = dateFilter.replace(/o\.created_at/g, 'p.created_at').replace(/o\.tenant_id/g, 'p.tenant_id');

        // 3. PERIOD STATS
        const rangeStats = await pool.query(`
            SELECT 
                (SELECT COALESCE(SUM(total_amount), 0) FROM ecom_orders o 
                 WHERE status IN ('confirmed', 'shipped', 'delivered', 'completed', 'confirm') AND ${dateFilter}) as sales,
                (SELECT COALESCE(SUM(total_amount), 0) FROM ecom_orders o 
                 WHERE status = 'returned' AND ${dateFilter}) as returns,
                (SELECT COALESCE(SUM(total_amount), 0) FROM ecom_purchases p 
                 WHERE ${purchaseFilter}) as purchases,
                (SELECT COALESCE(SUM((oi.price - pr.purchase_price) * oi.quantity), 0)
                 FROM ecom_order_items oi
                 JOIN ecom_products pr ON oi.product_id = pr.product_id AND oi.tenant_id = pr.tenant_id
                 JOIN ecom_orders o ON oi.order_id = o.order_id AND oi.tenant_id = o.tenant_id
                 WHERE o.status IN ('confirmed', 'shipped', 'delivered', 'completed', 'confirm') AND ${dateFilter}) as profit
        `, params);

        // 4. ACTIVITY LOGS (New)
        let logs = [];
        if (type === 'logs' || type === 'Today') {
            const logsRes = await pool.query(`
                SELECT l.*, p.name as product_name
                FROM ecom_inventory_logs l
                LEFT JOIN ecom_products p ON l.product_id = p.product_id AND l.tenant_id = p.tenant_id
                WHERE l.tenant_id = $1
                ORDER BY l.created_at DESC
                LIMIT 50
            `, [tenant_id]);
            logs = logsRes.rows;
        }

        return NextResponse.json({
            success: true,
            overview: overviewQuery.rows[0],
            activeRange: rangeStats.rows[0],
            payload: { logs }
        });
    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
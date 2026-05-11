import { pool } from "@/lib/database/db";
import { getTenant } from "@/lib/database/tenant";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        const website = await getTenant();
        if (!website) {
            return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
        }
        const tenant_id = website.tenant_id;

        const { id } = await params;

        if (!id) {
            return NextResponse.json({
                success: false, 
                message: 'Order ID is required'
            }, { status: 400 });
        }

        const query = `
            SELECT 
                c.name AS customer_name,
                c.phone AS customer_phone,
                o.order_id,
                o.total_amount,
                o.total_discount_amount,
                o.subtotal_amount,
                o.status,
                o.created_at,
                (SELECT JSON_AGG(p_item) FROM (
                    SELECT payment_status, payment_method, amount_received, change_amount, transaction_id, paid_at
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
            WHERE o.order_id = $1 AND o.tenant_id = $2
        `;

        const data = await pool.query(query, [id, tenant_id]);

        if (data.rowCount === 0) {
            return NextResponse.json({
                success: false, 
                message: 'Order not found'
            }, { status: 404 });
        }

        const order = data.rows[0];
        // Flatten for POS slip page compatibility
        const payload = {
            ...order,
            payment_status: order.payments?.[0]?.payment_status,
            payment_method: order.payments?.[0]?.payment_method,
            paid_amount: order.payments?.[0]?.amount_received || 0,
            change_amount: order.payments?.[0]?.change_amount || 0
        };

        return NextResponse.json({
            success: true,
            payload: payload
        }, { status: 200 });

    } catch (error) {
        console.error("Fetch Order Error:", error.message);
        return NextResponse.json({ 
            success: false, 
            message: "Internal Server Error" 
        }, { status: 500 });
    }
}
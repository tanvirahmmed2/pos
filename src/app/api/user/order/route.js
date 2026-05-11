import { pool } from "@/lib/database/db";
import { getTenant } from "@/lib/database/tenant";
import { NextResponse } from "next/server";
import { isUserLogin } from "@/lib/middleware";

export async function GET() {
    const client = await pool.connect();
    try {
        const auth = await isUserLogin();
        if (!auth.success) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        const website = await getTenant();
        if (!website) return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
        const tenant_id = website.tenant_id;

        const userPhone = auth.payload.phone;

        const customerRes = await client.query(
            "SELECT customer_id FROM ecom_customers WHERE phone = $1 AND tenant_id = $2", 
            [userPhone, tenant_id]
        );

        if (customerRes.rowCount === 0) {
            return NextResponse.json({ success: false, message: "No customer profile found" }, { status: 404 });
        }

        const customerId = customerRes.rows[0].customer_id;

        const query = `
            SELECT 
                o.order_id, o.total_amount, o.status AS order_status, o.created_at, o.due_amount,
                (SELECT JSON_AGG(p_item) FROM (
                    SELECT payment_status, payment_method, transaction_id
                    FROM ecom_payments 
                    WHERE order_id = o.order_id AND tenant_id = o.tenant_id
                ) p_item) AS payments,
                (SELECT JSON_AGG(oi_item) FROM (
                    SELECT pr.name AS product_name, pr.image AS product_image, pr.unit, oi.quantity, oi.price AS unit_price
                    FROM ecom_order_items oi
                    JOIN ecom_products pr ON oi.product_id = pr.product_id
                    WHERE oi.order_id = o.order_id AND oi.tenant_id = o.tenant_id
                ) oi_item) AS items
            FROM ecom_orders o
            WHERE o.customer_id = $1 AND o.tenant_id = $2
            ORDER BY o.created_at DESC;
        `;

        const result = await client.query(query, [customerId, tenant_id]);

        const formattedOrders = result.rows.map(row => ({
            ...row,
            payment: {
                status: row.payments?.[0]?.payment_status || 'unpaid',
                method: row.payments?.[0]?.payment_method || 'N/A',
                transaction_id: row.payments?.[0]?.transaction_id || ''
            }
        }));

        return NextResponse.json({
            success: true,
            payload: formattedOrders
        }, { status: 200 });

    } catch (error) {
        console.error("User Order Fetch Error:", error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}
import { pool } from "@/lib/database/db";
import { getTenant } from "@/lib/database/tenant";
import { NextResponse } from "next/server";

export async function POST(req) {
    const client = await pool.connect();
    try {
        const { product_id, quantity, sale_price, customer_id } = await req.json();
        const total_deduction = parseFloat(sale_price) * parseInt(quantity);

        const website = await getTenant();
        if (!website) return NextResponse.json({ success: false, message: 'Website not found' }, { status: 404 });
        const tenant_id = website.tenant_id;

        await client.query('BEGIN');

        // 1. Create a Negative Order to adjust revenue
        const negOrderQuery = `
            INSERT INTO ecom_orders (customer_id, total_amount, status, created_at, tenant_id)
            VALUES ($1, $2, 'returned', CURRENT_TIMESTAMP, $3)
            RETURNING order_id;
        `;
        
        await client.query(negOrderQuery, [customer_id || null, -total_deduction, tenant_id]);

        const restoreStockQuery = `
            UPDATE ecom_products 
            SET stock = stock + $1 
            WHERE product_id = $2 AND tenant_id = $3
            RETURNING name, stock;
        `;
        const productRes = await client.query(restoreStockQuery, [quantity, product_id, tenant_id]);

        await client.query('COMMIT');

        return NextResponse.json({ 
            success: true, 
            message: `Return processed. ${productRes.rows[0].name} stock is now ${productRes.rows[0].stock}.` 
        });

    } catch (error) {
        await client.query('ROLLBACK');
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}
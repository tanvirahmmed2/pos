import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";

export async function POST(req) {
    const client = await pool.connect();
    try {
        const { product_id, quantity, reason } = await req.json();

        if (!product_id || !quantity) {
            return NextResponse.json({ success: false, message: "Missing data" }, { status: 400 });
        }

        await client.query('BEGIN');

        const damageQuery = `
            UPDATE products 
            SET stock = stock - $1 
            WHERE product_id = $2 AND stock >= $1
            RETURNING name, stock;
        `;
        
        const res = await client.query(damageQuery, [parseInt(quantity), product_id]);

        if (res.rowCount === 0) {
            throw new Error("Product not found or insufficient stock to damage");
        }

       
        await client.query('COMMIT');

        return NextResponse.json({ 
            success: true, 
            message: `Confirmed: ${res.rows[0].name} stock reduced to ${res.rows[0].stock}` 
        });

    } catch (error) {
        await client.query('ROLLBACK');
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}
import { pool } from '@/lib/database/db';
import { NextResponse } from 'next/server';


export async function GET(req, { params }) {
    try {
        const { id } = await params;

        const query = `
            SELECT 
                p.*,
                COALESCE(
                    (SELECT json_agg(json_build_object(
                        'product_id', pi.product_id,
                        'name', pr.name,
                        'quantity', pi.quantity,
                        'purchase_price', pi.purchase_price
                    ))
                    FROM purchase_items pi
                    JOIN products pr ON pi.product_id = pr.product_id
                    WHERE pi.purchase_id = p.purchase_id
                ), '[]') as items
            FROM purchases p
            WHERE p.purchase_id = $1
            LIMIT 1`;

        const res = await pool.query(query, [id]);

        if (res.rows.length === 0) {
            return NextResponse.json({ success: false, message: "Purchase not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, payload: res.rows[0] });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
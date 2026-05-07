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
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        const countRes = await pool.query(
            `SELECT COUNT(*) FROM ecom_products WHERE discount_price > 0 AND tenant_id = $1`,
            [tenant_id]
        );
        const totalItems = parseInt(countRes.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit) || 1;

        const data = await pool.query(
            `SELECT * FROM ecom_products WHERE discount_price > 0 AND tenant_id = $3 ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
            [limit, offset, tenant_id]
        );
        
        const result = data.rows;

        return NextResponse.json({
            success: true, 
            message: result.length > 0 ? 'Successfully fetched data' : 'No offer data available', 
            payload: result,
            pagination: { totalPages, currentPage: page }
        }, { status: 200 });

    } catch (error) {
        console.error("Offer API Error:", error);
        return NextResponse.json({
            success: false, message: error.message
        }, { status: 500 });
    }
}
import { NextResponse } from "next/server";
import { getTenant } from "@/lib/database/tenant";
import { pool } from "@/lib/database/db";

export async function GET(req, { params }) {
    try {
        const { slug } = await params;
        const website = await getTenant();
        
        if (!website) {
            return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
        }
        
        const tenant_id = website.tenant_id;
        
        const productRes = await pool.query(`
            SELECT p.*, c.category_id, c.name as category_name, b.name as brand_name 
            FROM ecom_products p
            LEFT JOIN ecom_categories c ON p.category_id = c.category_id
            LEFT JOIN ecom_brands b ON p.brand_id = b.brand_id
            WHERE p.slug = $1 AND p.tenant_id = $2
        `, [slug, tenant_id]);

        let product = productRes.rows[0];

        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            payload: product
        });

    } catch (error) {
        console.error("API Error (Product By Slug):", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
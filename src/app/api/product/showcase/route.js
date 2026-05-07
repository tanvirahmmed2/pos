import { pool } from "@/lib/database/db";
import { getTenant } from "@/lib/database/tenant";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const website = await getTenant();
        if (!website) {
            return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
        }
        const tenant_id = website.tenant_id;

        const baseSelect = `
            SELECT p.*, c.name AS category_name, b.name AS brand_name
            FROM ecom_products p
            LEFT JOIN ecom_categories c ON p.category_id = c.category_id
            LEFT JOIN ecom_brands b ON p.brand_id = b.brand_id
            WHERE p.tenant_id = $1
        `;

        // Latest 8 products
        const latestRes = await pool.query(
            `${baseSelect} ORDER BY p.created_at DESC LIMIT 8`,
            [tenant_id]
        );

        // Highest discounted 8 products (discount_price > 0)
        const topRes = await pool.query(
            `${baseSelect} AND p.discount_price > 0 ORDER BY p.discount_price DESC LIMIT 8`,
            [tenant_id]
        );

        return NextResponse.json({
            success: true,
            latest: latestRes.rows,
            top: topRes.rows,
        }, { status: 200 });

    } catch (error) {
        console.error("Showcase API Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

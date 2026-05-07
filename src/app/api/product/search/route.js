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
        const q = searchParams.get("q") || "";

        let query = `
            SELECT *
            FROM ecom_products
            WHERE tenant_id = $1
        `;
        const values = [tenant_id];

        if (q) {
            query += `
              AND (COALESCE(name, '') ILIKE $2 
                 OR COALESCE(barcode, '') ILIKE $2)
         `;
            values.push(`%${q}%`);
        }

        query += ` ORDER BY created_at DESC LIMIT 10`;

        const data = await pool.query(query, values);
        const result = data.rows;

        return NextResponse.json(
            { success: true, message: 'Successfully fetched data', payload: result },
            { status: 200 }
        );

    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

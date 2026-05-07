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

        const data = await pool.query(
            `SELECT * FROM ecom_categories WHERE tenant_id = $1 ORDER BY created_at DESC`,
            [tenant_id]
        );

        const result = data.rows;
        if (result.length === 0) {
            return NextResponse.json({
                success: false, message: 'No category found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true, message: 'Successfully fetched data', payload: result
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            success: false, message: error.message
        }, { status: 500 });
    }
}
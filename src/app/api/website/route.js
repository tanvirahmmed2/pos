import { isAdmin } from "@/lib/middleware";
import { pool } from "@/lib/database/pg";
import { getTenant } from "@/lib/database/tenant";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const auth = await isAdmin();
        if (!auth.success) {
            return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
        }

        const website = await getTenant();
        if (!website) {
            return NextResponse.json({ success: false, message: "Website not found" }, { status: 404 });
        }

        // Fetch full website data from the websites table
        const res = await pool.query(
            "SELECT * FROM public.websites WHERE website_id = $1",
            [website.website_id]
        );

        const payload = {
            ...res.rows[0],
            subscription_status: website.subscription_status,
            subscription_expires_at: website.subscription_expires_at,
            tenant_status: website.status // Also include tenant status for completeness
        };

        return NextResponse.json({ success: true, payload });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const auth = await isAdmin();
        if (!auth.success) {
            return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
        }

        const website = await getTenant();
        if (!website) {
            return NextResponse.json({ success: false, message: "Website not found" }, { status: 404 });
        }

        const data = await req.json();

        // Whitelist of fields allowed to be updated
        const allowedFields = [
            'name', 'business_name', 'email', 'phone', 'address', 'city', 'country',
            'logo', 'favicon', 'meta_title', 'meta_description',
            'facebook', 'instagram', 'linkedin', 'youtube',
            'primary_color', 'secondary_color', 'is_public', 'is_store_enabled'
        ];

        const updates = [];
        const values = [];
        let index = 1;

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updates.push(`${field} = $${index}`);
                values.push(data[field]);
                index++;
            }
        }

        if (updates.length === 0) {
            return NextResponse.json({ success: false, message: "No fields to update" }, { status: 400 });
        }

        values.push(website.website_id);
        const query = `
            UPDATE public.websites 
            SET ${updates.join(', ')}, updated_at = now()
            WHERE website_id = $${index}
            RETURNING *
        `;

        const res = await pool.query(query, values);

        // Sync name with tenants table if it was updated
        if (data.name) {
            await pool.query(
                "UPDATE tenants SET name = $1 WHERE tenant_id = $2",
                [data.name, website.tenant_id]
            );
        }

        return NextResponse.json({
            success: true,
            message: "Website settings updated successfully",
            payload: res.rows[0]
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

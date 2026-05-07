import { pool } from "@/lib/database/db";
import { getTenant } from "@/lib/database/tenant";
import { isUserLogin, isManager } from "@/lib/middleware";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const website = await getTenant();
        if (!website) return NextResponse.json({ success: false, message: "Website not found" }, { status: 404 });

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type'); // 'approved' or 'pending'

        let query = "";
        let values = [website.tenant_id];

        if (type === 'pending') {
            const auth = await isManager();
            if (!auth.success) return NextResponse.json(auth, { status: 401 });
            query = `
                SELECT r.*, u.name as user_name 
                FROM ecom_reviews r
                LEFT JOIN ecom_users u ON r.user_id = u.user_id
                WHERE r.tenant_id = $1 AND r.is_approved = FALSE
                ORDER BY r.created_at DESC
            `;
        } else if (type === 'my') {
            const auth = await isUserLogin();
            if (!auth.success) return NextResponse.json(auth, { status: 401 });
            query = `
                SELECT * FROM ecom_reviews 
                WHERE tenant_id = $1 AND user_id = $2
                LIMIT 1
            `;
            values.push(auth.payload.user_id);
        } else {
            // Default: Fetch approved reviews for homepage
            query = `
                SELECT r.*, u.name as user_name 
                FROM ecom_reviews r
                LEFT JOIN ecom_users u ON r.user_id = u.user_id
                WHERE r.tenant_id = $1 AND r.is_approved = TRUE
                ORDER BY r.created_at DESC
            `;
        }

        const res = await pool.query(query, values);
        return NextResponse.json({ success: true, payload: res.rows });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const auth = await isUserLogin();
        if (!auth.success) return NextResponse.json(auth, { status: 401 });

        const website = await getTenant();
        if (!website) return NextResponse.json({ success: false, message: "Website not found" }, { status: 404 });

        const { rating, title, comment } = await req.json();

        // Check if user already reviewed
        const check = await pool.query(
            "SELECT review_id FROM ecom_reviews WHERE tenant_id = $1 AND user_id = $2",
            [website.tenant_id, auth.payload.user_id]
        );

        if (check.rows.length > 0) {
            return NextResponse.json({ success: false, message: "You have already submitted a review" }, { status: 400 });
        }

        const res = await pool.query(
            `INSERT INTO ecom_reviews (tenant_id, user_id, rating, title, comment, is_approved)
             VALUES ($1, $2, $3, $4, $5, FALSE)
             RETURNING *`,
            [website.tenant_id, auth.payload.user_id, rating, title, comment]
        );

        return NextResponse.json({ success: true, message: "Review submitted and pending approval", payload: res.rows[0] });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const auth = await isManager();
        if (!auth.success) return NextResponse.json(auth, { status: 401 });

        const website = await getTenant();
        if (!website) return NextResponse.json({ success: false, message: "Website not found" }, { status: 404 });

        const { review_id, is_approved } = await req.json();

        const res = await pool.query(
            "UPDATE ecom_reviews SET is_approved = $1, updated_at = now() WHERE review_id = $2 AND tenant_id = $3 RETURNING *",
            [is_approved, review_id, website.tenant_id]
        );

        if (res.rows.length === 0) {
            return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Review status updated", payload: res.rows[0] });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const auth = await isManager();
        if (!auth.success) return NextResponse.json(auth, { status: 401 });

        const website = await getTenant();
        if (!website) return NextResponse.json({ success: false, message: "Website not found" }, { status: 404 });

        const { searchParams } = new URL(req.url);
        const review_id = searchParams.get('id');

        const res = await pool.query(
            "DELETE FROM ecom_reviews WHERE review_id = $1 AND tenant_id = $2 RETURNING *",
            [review_id, website.tenant_id]
        );

        if (res.rows.length === 0) {
            return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

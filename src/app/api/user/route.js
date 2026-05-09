import { pool } from "@/lib/database/db";
import { getTenant } from "@/lib/database/tenant";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { isAdmin } from "@/lib/middleware";

export async function POST(req) {
    try {
        const auth = await isAdmin();
        if (!auth.success) {
            return NextResponse.json({ success: false, message: auth.message }, { status: 403 });
        }

        const website = await getTenant();
        if (!website) {
            return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
        }
        const tenant_id = website.tenant_id;

        const { name, email, phone, password, role } = await req.json();

        if (!name || !email || !phone || !password) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const client = await pool.connect();
        try {
            const query = `
                INSERT INTO ecom_users (name, email, phone, password, tenant_id, role)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING user_id, name, email, role;
            `;
            const values = [name, email, phone, hashedPassword, tenant_id, role || 'user'];
            const result = await client.query(query, values);

            return NextResponse.json({
                success: true,
                message: "User created successfully",
                payload: result.rows[0]
            }, { status: 201 });

        } catch (err) {
            if (err.code === '23505') { 
                return NextResponse.json({ success: false, message: "Email or Phone already exists" }, { status: 409 });
            }
            throw err;
        } finally {
            client.release();
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const website = await getTenant();
        if (!website) {
            return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
        }
        const tenant_id = website.tenant_id;

        const res = await pool.query(
            `SELECT user_id, name, email, phone, role, is_active, created_at 
             FROM ecom_users 
             WHERE tenant_id = $1 
             ORDER BY created_at DESC`, 
            [tenant_id]
        );

        return NextResponse.json({
            success: true,
            message: "Successfully fetched users",
            payload: res.rows
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    const client = await pool.connect();
    try {
        const website = await getTenant();
        if (!website) {
            return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
        }
        const tenant_id = website.tenant_id;

        const body = await req.json();
        const { user_id, role } = body;

        if (!user_id) {
            return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 });
        }

        await client.query('BEGIN');

        // 1. Fetch current user data
        const userRes = await client.query(
            "SELECT * FROM ecom_users WHERE user_id = $1 AND tenant_id = $2",
            [user_id, tenant_id]
        );
        if (userRes.rowCount === 0) throw new Error("User not found");
        const currentUser = userRes.rows[0];

        // 2. SAFETY CHECK: Block if trying to demote the last admin
        if (currentUser.role === 'admin' && role !== 'admin') {
            const adminCountRes = await client.query(
                "SELECT COUNT(*) FROM ecom_users WHERE role = 'admin' AND tenant_id = $1",
                [tenant_id]
            );
            if (parseInt(adminCountRes.rows[0].count) <= 1) {
                throw new Error("Cannot demote the last administrator. Please promote another user to admin first.");
            }
        }

        // 3. Partial Update Logic
        const fields = [];
        const values = [];
        let placeholderIdx = 1;

        const updatableFields = ['name', 'phone', 'email', 'role', 'is_active'];
        for (const field of updatableFields) {
            if (body[field] !== undefined) {
                fields.push(`${field} = $${placeholderIdx++}`);
                values.push(body[field]);
            }
        }

        if (body.password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(body.password, salt);
            fields.push(`password = $${placeholderIdx++}`);
            values.push(hashedPassword);
        }

        if (fields.length === 0) {
            throw new Error("No fields provided for update");
        }

        values.push(user_id, tenant_id);
        const query = `
            UPDATE ecom_users 
            SET ${fields.join(', ')}, updated_at = NOW()
            WHERE user_id = $${placeholderIdx++} AND tenant_id = $${placeholderIdx++}
            RETURNING user_id, name, email, phone, role, is_active;
        `;

        const result = await client.query(query, values);
        await client.query('COMMIT');

        return NextResponse.json({ 
            success: true, 
            message: "User updated successfully", 
            payload: result.rows[0] 
        });

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function DELETE(req) {
    const client = await pool.connect();
    try {
        const website = await getTenant();
        if (!website) {
            return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
        }
        const tenant_id = website.tenant_id;

        const { id } = await req.json();

        await client.query('BEGIN');

        // 1. Check if user is admin
        const userRes = await client.query(
            "SELECT role FROM ecom_users WHERE user_id = $1 AND tenant_id = $2",
            [id, tenant_id]
        );
        if (userRes.rowCount === 0) throw new Error("User not found");

        if (userRes.rows[0].role === 'admin') {
            const adminCountRes = await client.query(
                "SELECT COUNT(*) FROM ecom_users WHERE role = 'admin' AND tenant_id = $1",
                [tenant_id]
            );
            if (parseInt(adminCountRes.rows[0].count) <= 1) {
                throw new Error("Cannot delete the last administrator.");
            }
        }

        const result = await client.query("DELETE FROM ecom_users WHERE user_id = $1 AND tenant_id = $2", [id, tenant_id]);
        await client.query('COMMIT');

        return NextResponse.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function PATCH(req) {
    const client = await pool.connect();
    try {
        const website = await getTenant();
        if (!website) {
            return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
        }
        const tenant_id = website.tenant_id;

        const { email, role } = await req.json();

        if (!email || !role) {
            return NextResponse.json({ success: false, message: "Email and Role are required" }, { status: 400 });
        }

        await client.query('BEGIN');

        // 1. Fetch current role
        const userRes = await client.query(
            "SELECT role FROM ecom_users WHERE email = $1 AND tenant_id = $2",
            [email, tenant_id]
        );
        if (userRes.rowCount === 0) throw new Error("User not found");

        // 2. Safety check: Block if demoting last admin
        if (userRes.rows[0].role === 'admin' && role !== 'admin') {
            const adminCountRes = await client.query(
                "SELECT COUNT(*) FROM ecom_users WHERE role = 'admin' AND tenant_id = $1",
                [tenant_id]
            );
            if (parseInt(adminCountRes.rows[0].count) <= 1) {
                throw new Error("Cannot demote the last administrator.");
            }
        }

        const res = await client.query(
            `UPDATE ecom_users 
             SET role = $1 
             WHERE email = $2 AND tenant_id = $3 
             RETURNING user_id, name, email, role`, 
            [role, email, tenant_id]
        );

        await client.query('COMMIT');

        return NextResponse.json({
            success: true,
            message: `User role updated to ${role} successfully`,
            payload: res.rows[0]
        });
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}
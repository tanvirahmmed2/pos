import { pool } from "@/lib/database/db";
import { getTenant } from "@/lib/database/tenant";
import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const website = await getTenant();
        if (!website) {
            return NextResponse.json({ success: false, message: 'Website/Tenant not found. Please ensure at least one tenant exists in the database.' }, { status: 404 });
        }
        const tenant_id = website.tenant_id;

        const adminEmail = "admin@pos.com";
        const adminPassword = "adminpassword123";
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Check if admin already exists
        const exists = await pool.query(
            "SELECT user_id FROM ecom_users WHERE email = $1 AND tenant_id = $2",
            [adminEmail, tenant_id]
        );

        if (exists.rowCount > 0) {
            return NextResponse.json({ 
                success: false, 
                message: `Admin with email ${adminEmail} already exists for this tenant.` 
            }, { status: 400 });
        }

        // Insert admin user
        const newUser = await pool.query(
            `INSERT INTO ecom_users (name, email, phone, password, role, tenant_id) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, name, email, role`,
            ['System Admin', adminEmail, '01700000000', hashedPassword, 'admin', tenant_id]
        );

        return NextResponse.json({
            success: true,
            message: "Admin user created successfully",
            payload: {
                user: newUser.rows[0],
                login_credentials: {
                    email: adminEmail,
                    password: adminPassword
                }
            }
        }, { status: 201 });

    } catch (error) {
        console.error("Seed Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

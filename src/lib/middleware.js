import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";
import { JWT_SECRET } from "./database/secret";
import { pool } from "./database/db";
import { getTenant } from "./database/tenant";

/**
 * Common function to get the authenticated user from the request.
 * It uses the 'nvs_user_token' cookie and validates it against the ecom_users table.
 */
async function getAuthenticatedUser() {
    try {
        const headersList = await headers();
        const website = await getTenant({ headers: headersList });
        if (!website) return null;
        const tenant_id = website.tenant_id;

        const cookieStore = await cookies();
        const token = cookieStore.get('nvs_user_token')?.value;

        if (!token) return null;

        const decoded = jwt.verify(token, JWT_SECRET);

        // Use ecom_users as the single source of truth for all roles
        const res = await pool.query(
            `SELECT user_id, name, email, phone, role, created_at 
             FROM ecom_users 
             WHERE user_id = $1 AND tenant_id = $2 AND is_active = TRUE`,
            [decoded.user_id || decoded.id, tenant_id]
        );

        return res.rows[0] || null;
    } catch (error) {
        return null;
    }
}

export async function isUserLogin() {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, message: 'Please login' };
    return { success: true, payload: user };
}

export async function isAdmin() {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, message: 'Please login' };

    if (user.role !== 'admin') {
        return { success: false, message: 'Access denied: Admin only' };
    }
    return { success: true, payload: user };
}



export async function isManager() {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, message: 'Please login' };

    if (user.role !== 'manager') {
        return { success: false, message: 'Access denied: Managers only' };
    }
    return { success: true, payload: user };
}

export async function isSales() {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, message: 'Please login' };

    if (user.role !== 'sales') {
        return { success: false, message: 'Access denied: Sales staff only' };
    }
    return { success: true, payload: user };
}

export async function isManagement() {
    const user = await getAuthenticatedUser();
    if (!user) return { success: false, message: 'Please login' };

    const managementRoles = ['admin', 'manager', 'sales'];
    if (!managementRoles.includes(user.role)) {
        return { success: false, message: 'Access denied: Management roles only' };
    }
    return { success: true, payload: user };
}
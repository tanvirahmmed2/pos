import { pool } from "./pg";
import { headers } from "next/headers";

export async function getTenant(req) {
    try {
        let host;
        
        if (req && req.headers && typeof req.headers.get === 'function') {
            host = req.headers.get("host");
        } else {
            const headersList = await headers();
            host = headersList.get("host");
        }

        if (!host) {
            return null;
        }

        const query = `
            SELECT 
                t.*, 
                w.website_id, 
                w.status as website_status, 
                w.name as website_name,
                w.theme,
                w.logo,
                w.favicon,
                w.primary_color,
                w.secondary_color,
                w.is_store_enabled,
                w.business_name,
                w.email as website_email,
                w.phone as website_phone,
                w.address as website_address,
                w.meta_title,
                w.meta_description,
                w.facebook,
                w.instagram,
                w.linkedin,
                w.youtube,
                w.city,
                w.country,
                w.is_public,
                s.status as subscription_status,
                s.current_period_end as subscription_expires_at
            FROM tenants t
            LEFT JOIN public.websites w ON t.tenant_id = w.tenant_id
            LEFT JOIN public.subscriptions s ON s.tenant_id = t.tenant_id
            WHERE w.domain = $1 
               OR t.domain = $1 
               OR t.subdomain = $1
            ORDER BY s.current_period_end DESC NULLS LAST
            LIMIT 1;
        `;

        const { rows } = await pool.query(query, [host]);

        if (rows.length === 0) {
            // Handle localhost dev fallback
            if (host.includes('localhost')) {
                const cleanHost = host.split(':')[0];
                const retryResult = await pool.query(query, [cleanHost]);
                if (retryResult.rows.length > 0) return retryResult.rows[0];

                const fallbackResult = await pool.query(`
                    SELECT t.*, w.website_id, w.status as website_status, w.name as website_name
                    FROM tenants t
                    LEFT JOIN websites w ON w.tenant_id = t.tenant_id
                    LIMIT 1
                `);
                if (fallbackResult.rows.length > 0) return fallbackResult.rows[0];
            }
            return null;
        }

        return rows[0];
    } catch (error) {
        console.error("Error fetching tenant/website details:", error);
        return null;
    }
}



import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const query = `
            SELECT 
                p.payment_id,
                p.transaction_id,
                o.subtotal_amount AS subtotal,
                o.total_amount AS payment_amount,
                o.total_discount_amount AS discount,
                c.phone,
                c.name,
                p.created_at AS date
            FROM ecom_payments p
            JOIN ecom_orders o ON p.order_id = o.order_id AND p.tenant_id = o.tenant_id
            JOIN ecom_customers c ON o.customer_id = c.customer_id AND o.tenant_id = c.tenant_id
            WHERE o.status IN ('confirmed', 'shipped', 'delivered', 'completed', 'confirm')
            ORDER BY p.created_at DESC
        `;

        const data = await pool.query(query);
        const result=data.rows
        if(result.length<=0){
            return NextResponse.json({
                success:false, message:'No history found'
            },{status:400})
        }

        return NextResponse.json({ 
            success: true, 
            message:'Successfully fetched data',
            payload: result 
        }, { status: 200 });

    } catch (error) {
        console.error("Transaction Fetch Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
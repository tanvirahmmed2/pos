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

    const query = `
      SELECT s.supplier_id, s.name, s.phone, s.email, s.address,
             COUNT(p.purchase_id) AS total_purchases,
             COALESCE(SUM(p.total_amount), 0) AS total_amount_spent,
             MAX(p.created_at) AS last_purchase_date
      FROM ecom_suppliers s
      LEFT JOIN ecom_purchases p ON s.phone = p.supplier_phone AND s.tenant_id = p.tenant_id
      WHERE s.tenant_id = $1
      GROUP BY s.supplier_id, s.name, s.phone, s.email, s.address
      ORDER BY total_amount_spent DESC`;
    const data = await pool.query(query, [tenant_id]);
    return NextResponse.json({ success: true, payload: data.rows }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const website = await getTenant();
    if (!website) {
      return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
    }
    const tenant_id = website.tenant_id;

    const { name, phone, email, address } = await req.json();
    if (!name || !phone) return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    
    const check = await pool.query("SELECT supplier_id FROM ecom_suppliers WHERE phone = $1 AND tenant_id = $2", [phone, tenant_id]);
    if (check.rows.length > 0) return NextResponse.json({ success: false, message: "Phone number already exists" }, { status: 400 });
    
    const query = "INSERT INTO ecom_suppliers (name, phone, email, address, tenant_id) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const res = await pool.query(query, [name, phone, email || null, address || null, tenant_id]);
    return NextResponse.json({ success: true, message: "Supplier added", payload: res.rows[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const website = await getTenant();
    if (!website) {
      return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
    }
    const tenant_id = website.tenant_id;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    
    const res = await pool.query("DELETE FROM ecom_suppliers WHERE supplier_id = $1 AND tenant_id = $2 RETURNING *", [id, tenant_id]);
    if (res.rowCount === 0) return NextResponse.json({ success: false, message: "Supplier not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Supplier deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
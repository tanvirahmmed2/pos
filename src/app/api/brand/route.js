import { pool } from '@/lib/database/db'
import { getTenant } from '@/lib/database/tenant';
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const website = await getTenant();
    if (!website) {
      return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
    }
    const tenant_id = website.tenant_id;

    const { name, description } = await req.json();

    // 1. Validation
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Please add brand name' },
        { status: 400 }
      );
    }

    const brandName = name.trim();

    // 2. Check if exists
    const existBrand = await pool.query(
      'SELECT 1 FROM ecom_brands WHERE name = $1 AND tenant_id = $2',
      [brandName, tenant_id]
    );

    if (existBrand.rowCount > 0) {
      return NextResponse.json(
        { success: false, message: 'Brand already exists' },
        { status: 409 }
      );
    }

    // 3. Insert only NAME and DESCRIPTION (No slug)
    const newBrand = await pool.query(
      'INSERT INTO ecom_brands(name, description, tenant_id) VALUES($1, $2, $3) RETURNING *',
      [brandName, description || null, tenant_id]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully added brand',
        data: newBrand.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("DATABASE ERROR:", error.message);
    return NextResponse.json(
      { success: false, message: `Database Error: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const website = await getTenant();
    if (!website) {
      return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
    }
    const tenant_id = website.tenant_id;

    const data = await pool.query(
      'SELECT * FROM ecom_brands WHERE tenant_id = $1 ORDER BY created_at DESC',
      [tenant_id]
    )
    const result = data.rows

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No brand found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Successfully fetched brands', payload: result },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(req) {
  try {
    const website = await getTenant();
    if (!website) {
      return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
    }
    const tenant_id = website.tenant_id;

    const { id } = await req.json()

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID not received' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      'DELETE FROM ecom_brands WHERE brand_id = $1 AND tenant_id = $2 RETURNING *',
      [id, tenant_id]
    )

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Brand not found or already deleted' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Successfully deleted brand' },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(req) {
  try {
    const website = await getTenant();
    if (!website) {
      return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
    }
    const tenant_id = website.tenant_id;

    const { id, name, description } = await req.json();

    if (!id || !name) {
      return NextResponse.json(
        { success: false, message: 'ID and Name are required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'UPDATE ecom_brands SET name = $1, description = $2, updated_at = now() WHERE brand_id = $3 AND tenant_id = $4 RETURNING *',
      [name.trim(), description || null, id, tenant_id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Brand not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Successfully updated brand', data: result.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

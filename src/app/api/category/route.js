import { pool } from '@/lib/database/db'
import { getTenant } from '@/lib/database/tenant';
import { NextResponse } from 'next/server'
import { isAdmin, isManagement } from "@/lib/middleware";

export async function POST(req) {
  try {
    const auth = await isAdmin();
    if (!auth.success) return NextResponse.json({ success: false, message: auth.message }, { status: 403 });

    const website = await getTenant();
    if (!website) {
      return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
    }
    const tenant_id = website.tenant_id;

    const { name, parent_id } = await req.json()

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Please add category name' },
        { status: 400 }
      )
    }

    const parentId = parent_id ? parseInt(parent_id) : null;

    const existCat = await pool.query(
      'SELECT 1 FROM ecom_categories WHERE name = $1 AND tenant_id = $2 AND (parent_id = $3 OR (parent_id IS NULL AND $3 IS NULL))',
      [name.trim(), tenant_id, parentId]
    )

    if (existCat.rowCount > 0) {
      return NextResponse.json(
        { success: false, message: 'Category already exists' },
        { status: 409 }
      )
    }

    const newCat = await pool.query(
      'INSERT INTO ecom_categories(name, parent_id, tenant_id) VALUES($1, $2, $3) RETURNING *',
      [name.trim(), parentId, tenant_id]
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully added category',
        data: newCat.rows[0],
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
    try {
        const auth = await isManagement();
        if (!auth.success) return NextResponse.json({ success: false, message: auth.message }, { status: 403 });

        const website = await getTenant();
        if (!website) {
          return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
        }
        const tenant_id = website.tenant_id;

        const data = await pool.query(
            'SELECT * FROM ecom_categories WHERE tenant_id = $1 ORDER BY created_at DESC',
            [tenant_id]
        )
        const result = data.rows

        if (!result || result.length === 0) {
            return NextResponse.json({
                success: false, message: 'No category found'
            }, { status: 400 })
        }

        return NextResponse.json({
            success: true, message: 'Successfully fetched data', payload: result
        }, { status: 200 })
        
    } catch (error) {
        return NextResponse.json({
            success: false, message: error.message
        }, { status: 500 })
    }
}

export async function PUT(req) {
  try {
    const auth = await isAdmin();
    if (!auth.success) return NextResponse.json({ success: false, message: auth.message }, { status: 403 });

    const website = await getTenant();
    if (!website) {
      return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
    }
    const tenant_id = website.tenant_id;

    const { id, name, parent_id } = await req.json();

    if (!id || !name) {
      return NextResponse.json(
        { success: false, message: 'ID and Name are required' },
        { status: 400 }
      );
    }

    const parentId = parent_id ? parseInt(parent_id) : null;

    const result = await pool.query(
      'UPDATE ecom_categories SET name = $1, parent_id = $2 WHERE category_id = $3 AND tenant_id = $4 RETURNING *',
      [name.trim(), parentId, id, tenant_id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Successfully updated category', data: result.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
    try {
        const auth = await isAdmin();
        if (!auth.success) return NextResponse.json({ success: false, message: auth.message }, { status: 403 });

        const website = await getTenant();
        if (!website) {
          return NextResponse.json({ success: false, message: 'Website/Tenant not found' }, { status: 404 });
        }
        const tenant_id = website.tenant_id;

        const { id } = await req.json()
        if (!id) {
            return NextResponse.json({
                success: false, message: 'ID not recieved'
            }, { status: 400 })
        }
        const result = await pool.query(
            `DELETE FROM ecom_categories WHERE category_id = $1 AND tenant_id = $2 RETURNING *`, 
            [id, tenant_id]
        )

        if (result.rowCount === 0) {
            return NextResponse.json({
                success: false, message: 'Failed to delete category'
            }, { status: 400 })
        }

        return NextResponse.json({
            success: true, message: 'Successfully deleted category'
        }, { status: 200 })
        
    } catch (error) {
        return NextResponse.json({
            success: false, message: error.message
        }, { status: 500 })
    }
}
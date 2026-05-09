import UpdateProductForm from '@/components/forms/UpdateProductForm'
import { getTenant } from '@/lib/database/tenant'
import { pool } from '@/lib/database/db'
import { headers } from 'next/headers'
import React from 'react'

const UpdateProduct = async ({ params }) => {
  const { slug } = await params
  
  try {
    const headersList = await headers();
    const website = await getTenant({ headers: headersList });
    
    if (!website) {
       return <p className="p-4 text-slate-500">Website/Tenant not found</p>;
    }
    const tenant_id = website.tenant_id;

    const productRes = await pool.query(`
        SELECT p.*, c.category_id, c.name as category_name, b.name as brand_name 
        FROM ecom_products p
        LEFT JOIN ecom_categories c ON p.category_id = c.category_id
        LEFT JOIN ecom_brands b ON p.brand_id = b.brand_id
        WHERE p.slug = $1 AND p.tenant_id = $2
    `, [slug, tenant_id]);

    const product = productRes.rows[0];

    if (!product) return <p className="p-4 text-slate-500">No data found</p>

    return (
      <div className='w-full p-4'>
         <UpdateProductForm product={product} /> 
      </div>
    )
  } catch (error) {
    console.error("Error fetching product:", error)
    return <p className="p-4 text-slate-500">Error loading product data</p>
  }
}

export default UpdateProduct

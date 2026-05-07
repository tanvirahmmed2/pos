import UpdateProductForm from '@/components/forms/UpdateProductForm'
import { BASE_URL } from '@/lib/database/secret'
import React from 'react'

const UpdateProduct = async ({ params }) => {
  const { slug } = await params
  
  try {
    const res = await fetch(`${BASE_URL}/api/product/${slug}`, { method: "GET", cache: 'no-store' })
    const data = await res.json()
    const product = data.payload
    
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

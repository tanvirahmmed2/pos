'use client'

import Item from "@/components/card/Item"
import AddCutomerForm from "@/components/forms/AddCustomerForm"
import { Context } from "@/components/helper/Context"
import SalesCart from "@/components/page/SalesCart"
import axios from "axios"
import { useContext, useEffect, useState } from "react"



const PosPage = () => {

  const { isCustomerBox, categories } = useContext(Context)
  const [categoryId, setCategoryId] = useState('')
  const [products, setProducts] = useState([])

  const handleCategoryChange = (e) => {
    setCategoryId(e.target.value)
  }

  useEffect(()=>{
    if (!categoryId) {
    setProducts([]); 
    return;
  }
    const fetchProduct=async()=>{
      try {
        const res= await axios.get(`/api/product/category/${categoryId}`, { withCredentials: true })
        setProducts(res.data.payload)
      } catch (error) {
        setProducts([])
        
      }
    }
    fetchProduct()
  },[categoryId])
  
  return (
    <div className="w-full flex flex-col md:flex-row gap-6 relative">
      {
        isCustomerBox === true && <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200]'>
          <div className='bg-white p-6 rounded-2xl shadow-xl'>
            <AddCutomerForm />
          </div>
        </div>
      }
      
      <div className="flex-1 shrink-0">
        <SalesCart />
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <select
            onChange={handleCategoryChange}
            className='w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm font-bold text-slate-700'
          >
            <option value="">Filter by Category</option>
            {categories.length > 0 && categories.map((cat) => (
              <option value={cat.category_id} key={cat.category_id}>
                {cat?.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-h-[500px]">
          {products.length < 1 ? (
            <div className="w-full h-64 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300">
              <p className="font-bold uppercase tracking-widest text-xs">Select a category to view products</p>
            </div>
          ) : (
            <div className='w-full grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
              {products.map(product => (
                <Item product={product} key={product.product_id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PosPage

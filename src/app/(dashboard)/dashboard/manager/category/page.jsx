'use client'
import AddCategoryForm from '@/components/forms/AddCategoryForm'
import { Context } from '@/components/helper/Context'
import axios from 'axios'
import React, { useContext, useState } from 'react'
import { RiAddLine, RiDeleteBinLine, RiArchiveLine, RiEdit2Line } from 'react-icons/ri'
import { toast } from 'react-hot-toast'

const CategoryPage = () => {
  const { categories, fetchCategory, isCategoryBox, setIsCategoryBox, setEditCategory } = useContext(Context)
  const [loadingId, setLoadingId] = useState(null)

  const removeCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    setLoadingId(id)
    try {
      const response = await axios.delete('/api/category', { data: { id }, withCredentials: true })
      toast.success(response.data.message)
      fetchCategory()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to remove category')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className='w-full max-w-7xl mx-auto flex flex-col gap-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100'>
        <div>
          <h1 className='text-2xl font-bold text-slate-800 tracking-tight'>Category Management</h1>
          <p className='text-sm text-slate-500 mt-1'>Organize your products into categories</p>
        </div>
        <button 
          onClick={() => setIsCategoryBox(true)}
          className='flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-sky-200 active:scale-95 whitespace-nowrap'
        >
          <RiAddLine size={20} />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Content */}
      <div className='bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden'>
        {categories.length === 0 ? (
          <div className='w-full h-64 flex flex-col items-center justify-center text-center gap-3 p-6'>
            <div className='w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400'>
              <RiArchiveLine size={32} />
            </div>
            <div>
              <p className='text-slate-600 font-semibold'>No Categories Found</p>
              <p className='text-slate-400 text-sm mt-1'>Get started by adding your first category.</p>
            </div>
          </div>
        ) : (
          <div className='w-full overflow-x-auto'>
            <table className='w-full text-left border-collapse min-w-[500px]'>
              <thead>
                <tr className='bg-slate-50 border-b border-slate-100'>
                  <th className='py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider'>Category Name</th>
                  <th className='py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {categories.map((cat) => (
                  <tr key={cat.category_id} className='hover:bg-slate-50/50 transition-colors group'>
                    <td className='py-4 px-6'>
                      <span className='font-semibold text-slate-800'>{cat.name}</span>
                    </td>
                    <td className='py-4 px-6 text-right flex items-center justify-end gap-2'>
                      <button 
                        onClick={() => {
                          setEditCategory(cat);
                          setIsCategoryBox(true);
                        }}
                        className='inline-flex items-center justify-center p-2 rounded-lg text-sky-500 hover:bg-sky-50 hover:text-sky-600 transition-colors'
                        title="Edit Category"
                      >
                        <RiEdit2Line size={18} />
                      </button>
                      <button 
                        disabled={loadingId === cat.category_id}
                        onClick={() => removeCategory(cat.category_id)}
                        className='inline-flex items-center justify-center p-2 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-50'
                        title="Delete Category"
                      >
                        <RiDeleteBinLine size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isCategoryBox && (
        <div className='fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4'>
          <div className='bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200'>
            <AddCategoryForm />
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryPage

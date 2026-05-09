import React, { useContext, useState, useEffect } from 'react'
import { RiCloseLine } from "react-icons/ri";
import { Context } from '../helper/Context';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AddCategoryForm = () => {
    const { setIsCategoryBox, fetchCategory, categories, editCategory, setEditCategory } = useContext(Context)
    const [category, setCategory] = useState('')
    const [parentId, setParentId] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (editCategory) {
            setCategory(editCategory.name)
            setParentId(editCategory.parent_id || '')
        }
    }, [editCategory])

    const closeBox = () => {
        setIsCategoryBox(false)
        setEditCategory(null)
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            if (editCategory) {
                const response = await axios.put('/api/category', { id: editCategory.category_id, name: category, parent_id: parentId || null }, { withCredentials: true })
                toast.success(response.data.message)
            } else {
                const response = await axios.post('/api/category', { name: category, parent_id: parentId || null }, { withCredentials: true })
                toast.success(response.data.message)
            }
            fetchCategory()
            closeBox()
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to save Category")
        } finally {
            setIsSubmitting(false)
        }
    }

    const topLevelCategories = categories.filter(cat => !cat.parent_id && cat.category_id !== (editCategory?.category_id));

    return (
        <form onSubmit={handleSubmit} className='flex flex-col w-full bg-white'>
            {/* Header */}
            <div className='flex items-center justify-between p-6 border-b border-slate-100'>
                <h2 className='text-lg font-bold text-slate-800 tracking-tight'>
                    {editCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                <button 
                    type='button' 
                    onClick={closeBox} 
                    className='p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors'
                >
                    <RiCloseLine size={24} />
                </button>
            </div>

            {/* Body */}
            <div className='p-6 flex flex-col gap-5'>
                <div className='flex flex-col gap-1.5'>
                    <label htmlFor="category" className='text-sm font-semibold text-slate-700'>Category Name <span className='text-slate-800'>*</span></label>
                    <input 
                        type="text" 
                        id='category' 
                        name='category' 
                        required 
                        placeholder="e.g., Electronics"
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)} 
                        className='w-full border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:border-slate-800 focus:ring-4 focus:ring-slate-800/10 transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400' 
                    />
                </div>

                <div className='flex flex-col gap-1.5'>
                    <label htmlFor="parentId" className='text-sm font-semibold text-slate-700'>Parent Category (Optional)</label>
                    <select 
                        id='parentId' 
                        name='parentId' 
                        value={parentId} 
                        onChange={(e) => setParentId(e.target.value)} 
                        className='w-full border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:border-slate-800 focus:ring-4 focus:ring-slate-800/10 transition-all text-sm font-medium text-slate-800'
                    >
                        <option value="">None (Top Level)</option>
                        {topLevelCategories.map(cat => (
                            <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Footer */}
            <div className='p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3'>
                <button 
                    type='button' 
                    onClick={closeBox}
                    className='px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 bg-slate-200/50 rounded-xl transition-colors'
                >
                    Cancel
                </button>
                <button 
                    disabled={isSubmitting}
                    type='submit' 
                    className='px-6 py-2.5 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-colors shadow-sm shadow-slate-200 disabled:opacity-50 flex items-center gap-2'
                >
                    {isSubmitting ? 'Saving...' : (editCategory ? 'Update Category' : 'Save Category')}
                </button>
            </div>
        </form>
    )
}

export default AddCategoryForm

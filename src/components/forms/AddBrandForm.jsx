import React, { useContext, useState, useEffect } from 'react'
import { RiCloseLine } from 'react-icons/ri'
import { Context } from '../helper/Context'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const AddBrandForm = () => {
    const { setIsBrandBox, fetchBrand, editBrand, setEditBrand } = useContext(Context)
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (editBrand) {
            setFormData({
                name: editBrand.name,
                description: editBrand.description || ''
            })
        }
    }, [editBrand])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const closeBox = () => {
        setIsBrandBox(false)
        setEditBrand(null)
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            if (editBrand) {
                const response = await axios.put('/api/brand', { id: editBrand.brand_id, ...formData }, { withCredentials: true })
                toast.success(response.data.message)
            } else {
                const response = await axios.post('/api/brand', formData, { withCredentials: true })
                toast.success(response.data.message)
            }
            fetchBrand()
            closeBox()
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to save brand")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className='flex flex-col w-full bg-white'>
            {/* Header */}
            <div className='flex items-center justify-between p-6 border-b border-slate-100'>
                <h2 className='text-lg font-bold text-slate-800 tracking-tight'>
                    {editBrand ? 'Edit Brand' : 'Add New Brand'}
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
                    <label htmlFor="name" className='text-sm font-semibold text-slate-700'>Brand Name <span className='text-slate-800'>*</span></label>
                    <input 
                        type="text" 
                        id='name' 
                        name='name' 
                        required 
                        placeholder="e.g., Nike"
                        value={formData.name} 
                        onChange={handleChange} 
                        className='w-full border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:border-slate-800 focus:ring-4 focus:ring-slate-800/10 transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400' 
                    />
                </div>
                
                <div className='flex flex-col gap-1.5'>
                    <label htmlFor="description" className='text-sm font-semibold text-slate-700'>Description</label>
                    <textarea 
                        id='description' 
                        name='description' 
                        rows="3"
                        placeholder="Optional details about this brand..."
                        value={formData.description} 
                        onChange={handleChange} 
                        className='w-full border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:border-slate-800 focus:ring-4 focus:ring-slate-800/10 transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400 resize-none' 
                    />
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
                    {isSubmitting ? 'Saving...' : (editBrand ? 'Update Brand' : 'Save Brand')}
                </button>
            </div>
        </form>
    )
}

export default AddBrandForm

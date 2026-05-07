'use client'
import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { MdDeleteOutline, MdEdit } from 'react-icons/md';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const ProductListPage = () => {
    const [products, setProducts] = useState([])
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 })
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const loadData = useCallback(async (page = 1, search = '') => {
        setLoading(true)
        try {
            let url = search
                ? `/api/product/search?q=${search}`
                : `/api/product?page=${page}`;

            const res = await axios.get(url, { withCredentials: true });

            if (res.data.success) {
                setProducts(res.data.payload || [])
                setPagination(res.data.pagination || { currentPage: 1, totalPages: 1 })
            }
        } catch (error) {
            console.error("Error fetching products", error)
            setProducts([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadData(1, searchTerm)
        }, 400)

        return () => clearTimeout(delayDebounceFn)
    }, [searchTerm, loadData])

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const res = await axios.delete(`/api/product`, { data: { id }, withCredentials: true });
            if (res.data.success) {
                toast.success("Product deleted");
                setProducts(prev => prev.filter(p => p.product_id !== id));
            }
        } catch (error) {
            toast.error("Failed to delete product");
        }
    }

    return (
        <div className="w-full mx-auto p-3 sm:p-4 bg-white rounded-xl shadow-sm border border-slate-100">

            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Product List</h1>
                <div className='w-full sm:w-auto flex flex-col xs:flex-row items-stretch xs:items-center gap-3'>
                    <input
                        type="text"
                        placeholder="Search products..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                        value={searchTerm}
                        className='flex-1 sm:w-64 border border-slate-200 px-4 py-2 rounded-xl outline-none focus:border-primary transition-all text-sm'
                    />
                    <div className="text-right">
                        <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md whitespace-nowrap">
                            Page {pagination.currentPage} / {pagination.totalPages}
                        </span>
                    </div>
                </div>
            </div>

            <div className="w-full grid grid-cols-4 sm:grid-cols-8 border-b border-slate-100 px-2 sm:px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                <div className="col-span-2 sm:col-span-4">Product</div>
                <div className="col-span-1 text-center">Rate</div>
                <div className="hidden sm:block col-span-1 text-center">Stock</div>
                <div className="col-span-1 text-right">Actions</div>
            </div>

            {loading ? (
                <div className="space-y-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-16 bg-slate-50/50 animate-pulse rounded-xl"></div>
                    ))}
                </div>
            ) : (
                <div className="w-full flex flex-col gap-1">
                    {products.map((item) => (
                        <div key={item.product_id} className="w-full grid grid-cols-4 sm:grid-cols-8 border border-transparent px-2 sm:px-4 py-3 items-center hover:bg-slate-50 transition-colors group rounded-xl">
                            <div className="col-span-2 sm:col-span-4 flex flex-col pr-2">
                                <Link className='font-bold text-slate-700 hover:text-primary transition-colors text-sm truncate' href={`/products/${item.slug}`}>
                                    {item.name}
                                </Link>
                                <div className='flex items-center gap-2 mt-0.5'>
                                    <span className='hidden xs:inline text-[9px] text-slate-400 font-mono'>#{item.product_id}</span>
                                    <span className={`sm:hidden px-1.5 py-0.5 text-[8px] font-bold rounded-md ${item.stock > 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {item.stock} in stock
                                    </span>
                                </div>
                            </div>

                            <p className="col-span-1 text-center font-bold text-slate-900 text-sm">
                                ৳{parseFloat(item.sale_price).toFixed(0)}
                            </p>

                            <div className="hidden sm:block col-span-1 text-center">
                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${item.stock > 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {item.stock} Qty
                                </span>
                            </div>

                            <div className="col-span-1 flex justify-end items-center gap-0.5">
                                <Link href={`/dashboard/manager/products/${item.slug}`} className='p-2 text-slate-400 hover:text-primary hover:bg-sky-50 rounded-lg transition-all'>
                                    <MdEdit size={16} />
                                </Link>
                                <button onClick={() => handleDelete(item.product_id)} className='p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all'>
                                    <MdDeleteOutline size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && products.length === 0 && (
                <div className="text-center py-20 border border-dashed border-slate-100 rounded-2xl">
                    <p className="font-bold uppercase text-slate-300 text-xl tracking-tight">No products found</p>
                </div>
            )}

            {!searchTerm && pagination.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                        disabled={pagination.currentPage === 1}
                        onClick={() => loadData(pagination.currentPage - 1)}
                        className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div className="flex items-center gap-1">
                        {pagination.currentPage > 4 && pagination.totalPages > 5 && (
                            <>
                                <button
                                    onClick={() => loadData(1)}
                                    className="w-9 h-9 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                    1
                                </button>
                                <span className="px-1 font-bold text-slate-300 text-xs">...</span>
                            </>
                        )}

                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                            .filter(num => {
                                const current = pagination.currentPage;
                                const total = pagination.totalPages;

                                if (total <= 5) return true;
                                if (current <= 4) return num <= 5;
                                if (current >= total - 3) return num >= total - 4;

                                return num >= current - 1 && num <= current + 1;
                            })
                            .map((num) => (
                                <button
                                    key={num}
                                    onClick={() => loadData(num)}
                                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${pagination.currentPage === num
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}

                        {pagination.currentPage < pagination.totalPages - 3 && pagination.totalPages > 5 && (
                            <>
                                <span className="px-1 font-bold text-slate-300 text-xs">...</span>
                                <button
                                    onClick={() => loadData(pagination.totalPages)}
                                    className="w-9 h-9 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                    {pagination.totalPages}
                                </button>
                            </>
                        )}
                    </div>

                    <button
                        disabled={pagination.currentPage === pagination.totalPages}
                        onClick={() => loadData(pagination.currentPage + 1)}
                        className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all"
                    >
                        <ArrowRight size={18} />
                    </button>
                </div>
            )}
        </div>
    )
}

export default ProductListPage

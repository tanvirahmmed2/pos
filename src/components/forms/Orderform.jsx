import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Context } from '../helper/Context'
import { MdDeleteOutline } from 'react-icons/md'
import { generateReceipt } from '@/lib/database/print'
import { FaMinus, FaPlus } from 'react-icons/fa6'
import BarScanner from '../helper/BarcodeScanner'
import { FaBarcode } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'

const Orderform = ({ cartItems = [] }) => {
    const { decreaseQuantity, clearCart, addToCart, removeFromCart, setCart, customers, setIsCustomerBox, siteData } = useContext(Context)
    const [saleType, setSaleType] = useState('retail')
    const [products, setProducts] = useState([])
    const [searchTerm, setSearchTerm] = useState('')

    // --- NEW STATES FOR MODAL ---
    const [isPaymentModal, setIsPaymentModal] = useState(false)
    const [receivedAmount, setReceivedAmount] = useState(0)

    const [data, setData] = useState({
        customer_id: '22',
        extradiscount: 0,
        subTotal: 0,
        totalDiscount: 0,
        totalPrice: 0,
        transactionId: '',
        paymentMethod: 'cash',
        createdAt: new Date().toISOString().split('T')[0]
    })

    // Search functionality
    useEffect(() => {
        const fetchData = async () => {
            if (!searchTerm) {
                setProducts([])
                return
            }
            try {
                const response = await axios.get(`/api/product/search?q=${searchTerm}`, { withCredentials: true })
                setProducts(response.data.payload)
            } catch (error) {
                console.error(error)
                setProducts([])
            }
        }
        const delayDebounceFn = setTimeout(() => fetchData(), 300)
        return () => clearTimeout(delayDebounceFn)
    }, [searchTerm])

    const handleBarcodeScan = async (code) => {
        if (!code) return
        try {
            const response = await axios.get(`/api/product/search?q=${code}`, { withCredentials: true })
            const foundItems = response.data.payload

            if (foundItems && foundItems.length === 1) {
                const item = foundItems[0];
                if (Number(item.stock) <= 0) {
                    toast.error('Out of stock')
                    return
                }
                const priceToSet = saleType === 'wholesale' ? item.wholesale_price : item.sale_price;
                addToCart({ ...item, price: parseFloat(priceToSet) || 0 })
                setSearchTerm('')
            }
        } catch (error) {
            console.error("Scanner lookup error:", error)
        }
    }

    const handleSaleTypeChange = (type) => {
        setSaleType(type)
        setCart(prev => ({
            ...prev,
            items: prev.items.map(item => ({
                ...item,
                price: type === 'wholesale'
                    ? (parseFloat(item.wholesale_price) || 0)
                    : (parseFloat(item.sale_price) || 0)
            }))
        }))
    }

    const handlePriceChange = (productId, newPrice) => {
        setCart(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.product_id === productId
                    ? { ...item, price: parseFloat(newPrice) || 0 }
                    : item
            )
        }))
    }

    // Master Calculation Effect
    useEffect(() => {
        const subTotal = cartItems.reduce((sum, item) => {
            // Priority: Manual price > default sale/wholesale price
            const itemPrice = item.price !== undefined ? item.price : (saleType === 'retail' ? item.sale_price : item.wholesale_price);
            return sum + (parseFloat(itemPrice) * (item.quantity || 0));
        }, 0)

        const productDiscountTotal = cartItems.reduce((sum, item) => {
            const discountPerUnit = saleType === 'wholesale' ? 0 : (parseFloat(item.discount_price) || 0);
            return sum + (discountPerUnit * (item.quantity || 0));
        }, 0)

        const manualDiscount = parseFloat(data.extradiscount) || 0
        const totalPrice = subTotal - productDiscountTotal - manualDiscount

        setData(prev => ({
            ...prev,
            subTotal,
            totalDiscount: productDiscountTotal,
            totalPrice: Math.max(0, totalPrice)
        }))
    }, [cartItems, data.extradiscount, saleType])

    const handleChange = (e) => {
        const { name, value } = e.target
        setData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (cartItems.length === 0) return toast.error("Cart is empty")
        if (!data.customer_id) return toast.error("Please select a customer")

        setReceivedAmount(data.totalPrice)
        setIsPaymentModal(true)
    }

    
    const changeAmount = (parseFloat(receivedAmount) || 0) - data.totalPrice
    const router = useRouter()


    const finalConfirm = async () => {
        if (changeAmount < 0) {
            toast.error("Received amount is less than total price");
            return
        }
        const selectedCustomer = customers.find(c => String(c.customer_id) === String(data.customer_id))

        const payload = {
            customer_id: data.customer_id,
            phone: selectedCustomer?.phone || '',
            customerName: selectedCustomer?.name || '',
            subtotal: data.subTotal,
            discount: data.totalDiscount + (parseFloat(data.extradiscount) || 0),
            total: data.totalPrice,
            paid_amount: parseFloat(receivedAmount) || 0,
            change_amount: Math.max(0, changeAmount),
            paymentMethod: data.paymentMethod,
            transactionId: data.transactionId,
            saleType: saleType,
            status: 'delivered',
            createdAt: data.createdAt,
            items: cartItems.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                // Ensure we send the current price from state
                price: item.price !== undefined ? item.price : (saleType === 'retail' ? item.sale_price : item.wholesale_price)
            }))
        }

        try {
            const response = await axios.post('/api/order', payload, { withCredentials: true })
            toast.success(response.data.message)
            // if (generateReceipt) generateReceipt(response.data.payload, siteData)
            // console.log(response.data.payload)


            setIsPaymentModal(false)
            clearCart()
            setData({
                customer_id: '22',
                extradiscount: 0,
                transactionId: '',
                paymentMethod: 'cash',
                subTotal: 0,
                totalDiscount: 0,
                totalPrice: 0,
                createdAt: new Date().toISOString().split('T')[0]
            })
            setSaleType('retail')
            router.push(`/dashboard/sales/pos/${response.data.payload.order_id}`)
        } catch (error) {
            toast.error(error?.response?.data?.message || "Checkout failed")
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit} className='w-full flex flex-col gap-4 bg-white'>
                <div className='flex flex-col gap-3'>
                    <input
                        type="date"
                        name="createdAt"
                        value={data.createdAt}
                        onChange={handleChange}
                        className='px-4 py-2 border border-slate-200 rounded-xl outline-none w-full bg-slate-50 focus:bg-white focus:border-primary transition-all text-sm font-medium'
                    />

                    <div className='flex items-center gap-2'>
                        <select
                            name="customer_id"
                            id="customer_id"
                            value={data.customer_id}
                            onChange={handleChange}
                            required
                            className='flex-1 px-4 py-2 border border-slate-200 rounded-xl outline-none bg-slate-50 focus:bg-white focus:border-primary transition-all text-sm font-medium'
                        >
                            <option value="">-- select customer --</option>
                            {customers.map((customer) => (
                                <option value={customer.customer_id} key={customer.customer_id}>
                                    {customer.name}
                                </option>
                            ))}
                        </select>
                        <button type='button' onClick={() => setIsCustomerBox(true)} className='w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-primary hover:text-white transition-all'>+</button>
                    </div>
                </div>

                <div className='grid grid-cols-2 p-1 bg-slate-100 rounded-xl w-full'>
                    <button type="button" onClick={() => handleSaleTypeChange('retail')}
                        className={`py-2 rounded-lg text-xs font-bold transition-all ${saleType === 'retail' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}>Retail Sale</button>
                    <button type="button" onClick={() => handleSaleTypeChange('wholesale')}
                        className={`py-2 rounded-lg text-xs font-bold transition-all ${saleType === 'wholesale' ? 'bg-primary text-white shadow-sm' : 'text-slate-500'}`}>Wholesale</button>
                </div>

                <div className="w-full flex flex-col gap-2 relative">
                    <BarScanner onScan={handleBarcodeScan} />
                    <div className="w-full flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl focus-within:border-primary focus-within:bg-white transition-all">
                        <FaBarcode className='text-slate-400' size={18} />
                        <input
                            type="text"
                            name='searchTerm'
                            id='searchTerm'
                            onChange={(e) => setSearchTerm(e.target.value)}
                            value={searchTerm}
                            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                            placeholder='Search products or scan barcode...'
                            className='w-full bg-transparent outline-none text-sm'
                        />
                    </div>

                    {searchTerm.length > 0 && products && products.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto overflow-x-hidden">
                            {products.map((product) => (
                                <div key={product.product_id} onClick={() => {
                                    if (Number(product.stock) > 0) {
                                        const price = saleType === 'wholesale' ? product.wholesale_price : product.sale_price;
                                        addToCart({ ...product, price: parseFloat(price) });
                                        setSearchTerm('')
                                    } else {
                                        toast.error('Out of stock')
                                    }
                                }} className="w-full cursor-pointer flex items-center justify-between p-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors">
                                    <div className='flex flex-col'>
                                        <span className="text-sm font-bold text-slate-700">{product.name}</span>
                                        <span className='text-[10px] text-slate-400 font-bold uppercase'>{product.unit} · Stock: {product.stock}</span>
                                    </div>
                                    <span className="text-sm font-bold text-primary">৳{saleType === 'retail' ? (product.sale_price - product.discount_price) : product.wholesale_price}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className='w-full flex flex-col gap-2 max-h-[400px] overflow-y-auto border-y border-slate-100 py-3 custom-scrollbar'>
                    <div className='w-full grid grid-cols-6 sm:grid-cols-12 gap-2 px-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1'>
                        <p className='col-span-3 sm:col-span-5'>Product</p>
                        <p className='col-span-2 sm:col-span-3 text-center'>Qty</p>
                        <p className='hidden sm:block col-span-2 text-center'>Rate</p>
                        <p className='col-span-1 sm:col-span-2 text-right'>Total</p>
                    </div>

                    {cartItems.length === 0 ? (
                        <div className='py-12 text-center text-slate-300 italic text-xs flex flex-col items-center gap-2'>
                            <ShoppingBag size={32} className="opacity-20" />
                            <span>Cart is empty</span>
                        </div>
                    ) : cartItems.map(item => {
                        const itemRate = item.price !== undefined ? item.price : (saleType === 'wholesale'
                            ? (parseFloat(item.wholesale_price) || 0)
                            : (parseFloat(item.sale_price) || 0));

                        const itemDiscount = saleType === 'wholesale'
                            ? 0
                            : (parseFloat(item.discount_price) || 0);

                        const rowTotal = (itemRate - itemDiscount) * (item.quantity || 0);

                        return (
                            <div key={item.product_id} className='w-full grid grid-cols-6 sm:grid-cols-12 gap-2 p-2 rounded-xl hover:bg-slate-50 transition-all items-center'>
                                <div className='col-span-3 sm:col-span-5 flex flex-col pr-1'>
                                    <p className='text-xs font-bold text-slate-700 truncate' title={item.name}>{item.name}</p>
                                    <div className='flex items-center gap-2'>
                                        <button onClick={() => removeFromCart(item?.product_id)} className='text-[9px] text-rose-500 font-bold uppercase'>Remove</button>
                                        <span className='sm:hidden text-[9px] text-slate-400'>@ ৳{itemRate}</span>
                                    </div>
                                </div>

                                <div className='col-span-2 sm:col-span-3 flex items-center justify-between bg-slate-100 px-1.5 py-1 rounded-lg'>
                                    <button type='button' onClick={() => decreaseQuantity(item?.product_id)} className='p-1 text-slate-400 hover:text-rose-500'><FaMinus size={8} /></button>
                                    <span className='text-xs font-bold text-slate-700'>{item?.quantity}</span>
                                    <button type='button' onClick={() => addToCart(item)} className='p-1 text-slate-400 hover:text-primary'><FaPlus size={8} /></button>
                                </div>

                                <div className='hidden sm:block col-span-2 text-center'>
                                    <input
                                        type="number"
                                        value={itemRate}
                                        onChange={(e) => handlePriceChange(item.product_id, e.target.value)}
                                        className='w-full bg-transparent text-center text-xs font-bold text-slate-600 outline-none border-b border-transparent focus:border-primary'
                                        step="0.01"
                                    />
                                </div>

                                <p className='col-span-1 sm:col-span-2 text-right font-black text-slate-900 text-xs'>৳{rowTotal.toFixed(0)}</p>
                            </div>
                        )
                    })}
                </div>

                <div className='w-full flex flex-col gap-3 py-2'>
                    <div className='flex justify-between text-xs font-bold text-slate-500'>
                        <span>Sub Total</span>
                        <span className='text-slate-900'>৳{data.subTotal.toFixed(2)}</span>
                    </div>
                    {(data.totalDiscount > 0 || parseFloat(data.extradiscount) > 0) && (
                        <div className='flex justify-between text-xs font-bold text-rose-500'>
                            <span>Total Discount</span>
                            <span>-৳{(data.totalDiscount + (parseFloat(data.extradiscount) || 0)).toFixed(2)}</span>
                        </div>
                    )}
                    
                    <div className='flex items-center justify-between pt-2 border-t border-dashed border-slate-200'>
                        <label className='text-sm font-bold text-slate-800 uppercase tracking-tight'>Total Amount</label>
                        <span className='text-2xl font-black text-primary tracking-tighter'>৳{data.totalPrice.toFixed(0)}</span>
                    </div>
                </div>

                <button className='w-full py-4 rounded-xl bg-primary text-white hover:bg-primary-dark font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] uppercase tracking-widest text-xs mt-2' type='submit'>
                    Complete Order
                </button>
            </form>

            {isPaymentModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100">
                        <div className="p-8 space-y-6">
                            <div className='text-center space-y-1'>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Confirm Payment</h2>
                                <p className='text-slate-400 text-sm'>Enter the amount received from customer</p>
                            </div>

                            <div className="flex flex-col gap-2 items-center justify-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Payable</span>
                                <span className="text-4xl font-black text-slate-900 tracking-tighter">৳{data.totalPrice.toFixed(0)}</span>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Received Amount</label>
                                <input
                                    type="number"
                                    autoFocus
                                    onFocus={(e) => e.target.select()}
                                    value={receivedAmount}
                                    onChange={(e) => setReceivedAmount(e.target.value)}
                                    className="w-full text-4xl font-black p-5 border-2 border-slate-100 rounded-2xl outline-none text-center bg-white focus:border-primary focus:bg-white transition-all text-primary"
                                />
                            </div>

                            <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Change Due</span>
                                <span className="text-2xl font-black text-emerald-700 tracking-tighter">৳{Math.max(0, changeAmount).toFixed(0)}</span>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setIsPaymentModal(false)}
                                    className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all text-xs uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={finalConfirm}
                                    className="flex-[1.5] py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all text-xs uppercase tracking-widest"
                                >
                                    Confirm Sale
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Orderform;

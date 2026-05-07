'use client'
import axios from 'axios'
import React, { createContext, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export const Context = createContext()

const ContextProvider = ({ children, initialSiteData }) => {
  const [siteData, setSiteData] = useState(initialSiteData)
  const [isCategoryBox, setIsCategoryBox] = useState(false)
  const [editCategory, setEditCategory] = useState(null)
  const [isBrandBox, setIsBrandBox] = useState(false)
  const [editBrand, setEditBrand] = useState(null)
  const [isSupplierBox, setIsSupplierBox] = useState(false)
  const [isCustomerBox, setIsCustomerBox] = useState(false)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [hydrated, setHydrated] = useState(false)
  const [cart, setCart] = useState({ items: [] })
  const [userData, setUserData] = useState([])
  const [isDashboardSidebar, setIsDashboardSidebar]=useState(false)

  const fetchCart = () => {
    if (typeof window === 'undefined') return
    const storedCart = localStorage.getItem('nvs')

    if (!storedCart || storedCart === 'undefined') {
      setCart({ items: [] })
      setHydrated(true)
      return
    }

    try {
      const parsed = JSON.parse(storedCart)
      if (parsed && Array.isArray(parsed.items)) {
        setCart(parsed)
      } else {
        setCart({ items: [] })
      }
    } catch (err) {
      localStorage.removeItem('nvs')
      setCart({ items: [] })
    }
    setHydrated(true)
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && hydrated) {
      localStorage.setItem('nvs', JSON.stringify(cart))
    }
  }, [cart, hydrated])

  const addToCart = (product) => {
    if (!product?.product_id) return;

    const stock = Number(product.stock);
    const salePrice = parseFloat(product.sale_price);
    const cartItemId = `${product.product_id}`;

    if (stock <= 0) {
      toast.error("Item is out of stock!");
      return;
    }

    const existingInCart = cart.items.find(item => item.cartItemId === cartItemId);

    if (existingInCart) {
      if (existingInCart.quantity >= stock) {
        toast.error(`Only ${stock} items available in stock`);
        return;
      }

      setCart((prev) => ({
        ...prev,
        items: prev.items.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }));
      toast("Quantity increased", { icon: '➕' });
    } else {
      const wholeSalePrice = parseFloat(product?.wholesale_price) || 0;
      const discountAmount = parseFloat(product?.discount_price) || 0;

      setCart((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            cartItemId,
            product_id: product.product_id,
            name: product.name,
            image: product.image,
            quantity: 1,
            sale_price: salePrice,
            wholesale_price: wholeSalePrice,
            discount_price: discountAmount,
            price: salePrice
          }
        ]
      }));
      toast.success("Added to cart");
    }
  };

  const increaseQuantity = (cartItemId) => {
    const item = cart.items.find(i => i.cartItemId === cartItemId);
    if (!item) return;

    // We don't have stock info here easily without re-fetching or storing it in item
    // For now, just increase, assuming if it's in cart it was available.
    // Ideally we should have stock in the cart item too.
    setCart((prev) => ({
      ...prev,
      items: prev.items.map(i =>
        i.cartItemId === cartItemId
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    }));
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => ({ ...prev, items: prev.items.filter(item => item.cartItemId !== cartItemId) }))
  }

  const decreaseQuantity = (cartItemId) => {
    setCart((prev) => {
      const existing = prev.items.find(item => item.cartItemId === cartItemId)
      if (!existing) return prev
      if (existing.quantity > 1) {
        return {
          ...prev,
          items: prev.items.map(item =>
            item.cartItemId === cartItemId ? { ...item, quantity: item.quantity - 1 } : item
          )
        }
      }
      return { ...prev, items: prev.items.filter(item => item.cartItemId !== cartItemId) }
    })
  }

  const clearCart = () => {
    setCart({ items: [] });
    if (typeof window !== 'undefined') localStorage.removeItem('cart');
    toast.success("Cart cleared"); // Keep this outside of any logic blocks
  };

  const fetchCategory = async () => {
    try {
      const response = await axios.get('/api/category', { withCredentials: true })
      setCategories(response.data.payload || [])
    } catch (error) { setCategories([]) }
  }

  const fetchBrand = async () => {
    try {
      const response = await axios.get('/api/brand', { withCredentials: true })
      setBrands(response.data.payload || [])
    } catch (error) { setBrands([]) }
  }


  const fetchSupplier = async () => {
    try {
      const response = await axios.get('/api/supplier', { withCredentials: true })
      setSuppliers(response.data.payload || [])
    } catch (error) { setSuppliers([]) }
  }
  const [customers, setCustomers] = useState([])
  const fetchCustomer = async () => {
    try {
      const response = await axios.get('/api/customer', { withCredentials: true })
      setCustomers(response.data.payload || [])
    } catch (error) { setCustomers([]) }
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/user/islogin', { withCredentials: true })
        setUserData(res.data.payload)
      } catch (error) {
        console.log(error)
        setUserData([])

      }
    }
    fetchUser()
  }, [])



  useEffect(() => {
    fetchCategory()
    fetchCart()
    fetchBrand()
    fetchSupplier()
    fetchCustomer()

  }, [])

  const [purchaseItems, setPurchaseItems] = useState([]);

  const addToPurchase = (product) => {
    setPurchaseItems((prev) => {
      const existingItem = prev.find(item => item.product_id === product.product_id);

      if (existingItem) {
        return prev.map(item =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, {
        product_id: product.product_id,
        name: product.name,
        purchase_price: parseFloat(product.purchase_price) || 0,
        sale_price: parseFloat(product.sale_price) || 0,
        quantity: 1
      }];
    });
  };

  const removeFromPurchase = (productId) => {
    setPurchaseItems((prev) => prev.filter(item => item.product_id !== productId));
  };

  const clearPurchase = () => {
    setPurchaseItems([]);
  };

  return (
    <Context.Provider value={{
      isBrandBox, setIsBrandBox, editBrand, setEditBrand, isCategoryBox, setIsCategoryBox, editCategory, setEditCategory, 
      brands, setBrands, purchaseItems, addToPurchase, removeFromPurchase,
      isSupplierBox, setIsSupplierBox, fetchSupplier, suppliers, setSuppliers, setPurchaseItems,
      isCustomerBox, setIsCustomerBox, customers, setCustomers,userData, setUserData,fetchBrand, fetchCustomer, fetchSupplier,isDashboardSidebar, setIsDashboardSidebar,
      categories, fetchCategory, cart, setCart, fetchCart, addToCart, increaseQuantity, clearCart, removeFromCart, decreaseQuantity, clearPurchase,
      siteData, setSiteData
    }}>
      {children}
    </Context.Provider>
  )
}

export default ContextProvider

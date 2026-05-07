'use client'
import axios from 'axios'
import React, { useState } from 'react'
import { MdDeleteOutline } from 'react-icons/md'
import { toast } from 'react-hot-toast'

const RemoveFromCart = ({ productId, onRemove }) => {
  const [loading, setLoading] = useState(false)

  const removeItem = async () => {
    if (loading) return
    setLoading(true)
    try {
      const res = await axios.delete('/api/user/cart', {
        data: { productId },
        withCredentials: true
      })
      toast.success(res.data.message)
      if (onRemove) onRemove() 
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to remove')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={removeItem} disabled={loading} className={`text-xl cursor-pointer ${loading ? 'opacity-50' : ''}`}>
      <MdDeleteOutline />
    </button>
  )
}

export default RemoveFromCart

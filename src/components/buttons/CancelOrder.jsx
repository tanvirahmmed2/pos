'use client'
import axios from 'axios';
import React from 'react'
import { ImCancelCircle } from "react-icons/im";
import { toast } from 'react-hot-toast';

const CancelOrder = ({id}) => {
    const cancelOrder=async () => {
        try {
            const response= await axios.post('/api/order/cancel', {id},{withCredentials:true})
            toast.success(response.data.message)
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || 'Failed to deliver order')
        }
        
        
    }
  return (
    <button onClick={cancelOrder} className='w-full px-2 rounded-lg hover:bg-black/10 p-1 cursor-pointer flex flex-row items-center justify-center gap-4'><ImCancelCircle/> Cancel</button>
  )
}

export default CancelOrder

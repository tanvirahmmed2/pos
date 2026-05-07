'use client'
import axios from 'axios';
import React from 'react'
import { MdDeleteOutline } from "react-icons/md";
import { toast } from 'react-hot-toast';

const DeleteSupport = ({id}) => {
    const handleDelete=async () => {
        try {
            const response= await axios.delete('/api/support', {data:{id}, withCredentials:true})
            toast.success(response.data.message)
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || 'Failed to delete message')
        }
        
    }
  return (
    <button onClick={handleDelete} className='text-xl cursor-pointer'><MdDeleteOutline/></button>
  )
}

export default DeleteSupport

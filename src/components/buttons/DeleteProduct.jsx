'use client'
import axios from 'axios';
import React from 'react'

import { MdDeleteOutline } from "react-icons/md";
import { toast } from 'react-hot-toast';

const DeleteProduct = ({ id }) => {
  const deleteProduct = async () => {
    try {
      const res = await axios.delete('/api/product', { data: { id } }, { withCredentials: true })
      console.log(res)
      toast.success(res.data.message)
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.message)

    }
  }
  return (
    <div className='relative group'>
      <p className='-top-8 absolute hidden group-hover:block text-red-500 bg-white shadow p-1 rounded-lg'>Delete</p>
      <button onClick={deleteProduct} className='cursor-pointer text-xl'><MdDeleteOutline /></button>
    </div>
  )
}

export default DeleteProduct

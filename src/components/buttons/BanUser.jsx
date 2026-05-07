'use client'
import axios from 'axios';
import React from 'react'
import { FaBan } from "react-icons/fa";
import { toast } from 'react-hot-toast';

const BanUser = ({id}) => {
    const banuser=async()=>{
        try {
            const response= await axios.post('/api/user/banuser',{id},{ withCredentials: true})
            toast.success(response.data.message)
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || "Status can't be changed")
            
        }
    }
  return (
    <button onClick={banuser} className='cursor-pointer'><FaBan/></button>
  )
}

export default BanUser

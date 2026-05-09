'use client'
import axios from 'axios'
import React from 'react'
import { toast } from 'react-hot-toast'

const Logout = () => {
  const handleLogout=async()=>{
  try {
    const response= await axios.get('/api/user/login', {withCredentials:true})
    toast.success(response.data.message)
    window.location.replace('/login')
  } catch (error) {
    console.log(error)
    toast.error(error?.response?.data?.message || 'Failed to logout')
    
  }
}
  return (
    <button className='w-full flex items-center justify-center text-white gap-3 cursor-pointer bg-slate-300 text-center' onClick={handleLogout}>Logout</button>
  )
}

export default Logout

'use client'
import axios from 'axios';
import React from 'react'
import { MdDeleteOutline } from "react-icons/md";
import { toast } from 'react-hot-toast';

const DeleteUser = ({id}) => {
    const deleteuser= async()=>{
        try {
            const response= await axios.delete('/api/user', {data: {id}},{ withCredentials: true})
            toast.success(response.data.message)
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || "Failed to remove user")
            
        }
    }
  return (
    <button onClick={deleteuser} className='cursor-pointer'><MdDeleteOutline/></button>
  )
}

export default DeleteUser

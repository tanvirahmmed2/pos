'use client'
import Link from 'next/link';
import React from 'react'

import { FaEdit } from "react-icons/fa";

const UpdateProduct = ({slug}) => {
    
  return (
    <div className='relative group'>
      <p className='-top-8 absolute hidden group-hover:block text-red-500 bg-white shadow p-1 rounded-lg'>Edit</p>
      <Link href={`/manage/products/${slug}`}><FaEdit/></Link>
    </div>
  )
}

export default UpdateProduct

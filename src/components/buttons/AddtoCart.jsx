'use client'
import React, { useContext } from 'react'
import { CiShoppingCart } from "react-icons/ci";
import { Context } from '../helper/Context';

const AddtoCart = ({product}) => {
  const {addToCart}= useContext(Context)
  return (
    <button onClick={()=> addToCart(product)} className='w-full p-1 bg-orange-600 flex flex-row items-center justify-center gap-4 text-white cursor-pointer group-hover:bg-orange-400 '>Cart <CiShoppingCart className='text-xl' /></button>
  )
}

export default AddtoCart

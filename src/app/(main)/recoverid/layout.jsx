import { isUserLogin } from '@/lib/middleware'
import { redirect } from 'next/navigation'
import React from 'react'
export const metadata={
    title:"Recover Access"
}

export default async function RecoveryLayout({children}){
    const auth= await isUserLogin()
    if(auth.success) return redirect('/dashboard')
  return (
    <div className='w-full'>
      {children}
    </div>
  )
}

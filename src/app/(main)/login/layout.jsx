import { isUserLogin } from '@/lib/middleware'
import { redirect } from 'next/navigation'
import React from 'react'

export const metadata={
    title:'Login',
    description:'Login Page'
}

const UserLoginLayout = async({children}) => {
    const auth= await isUserLogin()
    if (auth.success) {
      if (auth.payload.role === 'admin' || auth.payload.role === 'manager' || auth.payload.role === 'sales') {
        return redirect('/dashboard')
      }
      return redirect('/profile')
    }
  return (
    <div className='w-full'>
      {children}
    </div>
  )
}

export default UserLoginLayout

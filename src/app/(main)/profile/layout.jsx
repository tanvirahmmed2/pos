import { isUserLogin } from '@/lib/middleware'
import { redirect } from 'next/navigation'
import React from 'react'

export const metadata = {
    title: 'Profile | User Dashboard',
    description: 'Manage your personal information and orders'
}

const UserProfileLayout = async ({ children }) => {
    // Check authentication
    const auth = await isUserLogin()
    if (!auth.success) return redirect('/login')

    const user = auth.payload;

   
    return (
        <div className='w-full min-h-screen bg-gray-50'>
            <header className='w-full bg-white border-b sticky top-0 z-10'>
                <div className='max-w-6xl mx-auto px-4 h-16 flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <div className='h-8 w-8 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm'>
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className='font-semibold text-gray-800 hidden sm:inline-block'>
                            {user.name}
                        </span>
                    </div>

                    
                </div>
            </header>

            <main className='w-full'>
                {children}
            </main>
        </div>
    )
}

export default UserProfileLayout

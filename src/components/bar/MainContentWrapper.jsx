'use client'
import React, { useContext } from 'react'
import { Context } from '../helper/Context'

const MainContentWrapper = ({ children }) => {
    const { isDashboardSidebar } = useContext(Context)

    return (
        <div className={`flex-1 flex flex-col w-full min-h-screen transition-all duration-300 ${isDashboardSidebar ? 'md:pl-64 pl-0' : 'pl-0'}`}>
            {children}
        </div>
    )
}

export default MainContentWrapper

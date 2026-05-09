'use client'
import React, { useContext } from 'react'
import { Context } from '../helper/Context'
import { RiMenuLine, RiMenuFoldLine, RiNotification3Line, RiSearchLine, RiSettings3Line } from 'react-icons/ri'
import { CgMenuMotion } from 'react-icons/cg'

const DashboardTopbar = () => {
    const { isDashboardSidebar, setIsDashboardSidebar, userData } = useContext(Context)

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 transition-all duration-300 w-full shadow-sm">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsDashboardSidebar(!isDashboardSidebar)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-100"
                    title={isDashboardSidebar ? "Close Sidebar" : "Open Sidebar"}
                >
                    {isDashboardSidebar ? <CgMenuMotion size={22} /> : <RiMenuLine size={22} />}
                </button>
                
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <button className="p-2 relative rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
                    <RiNotification3Line size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-slate-800 rounded-full border-2 border-white"></span>
                </button>
                <button className="p-2 hidden sm:block rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
                    <RiSettings3Line size={20} />
                </button>
                
                <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="flex-col items-end hidden sm:flex">
                        <span className="text-sm font-semibold text-slate-800 leading-tight">
                            {userData?.name || 'Administrator'}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                            {userData?.role || 'Admin'}
                        </span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-800 to-slate-800 text-white flex items-center justify-center font-bold shadow-md border border-white">
                        {(userData?.name?.[0] || 'A').toUpperCase()}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default DashboardTopbar

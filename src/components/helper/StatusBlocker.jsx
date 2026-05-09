"use client";
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, ExternalLink, ShieldAlert } from 'lucide-react';

export default function StatusBlocker({ status, subscriptionStatus, websiteStatus, children }) {
    const pathname = usePathname();
    const isActive = status === 'active' && subscriptionStatus === 'active' && websiteStatus === 'active';

    // Allow access to login and settings pages even if suspended
    const isAllowedPath = pathname === '/login' || pathname === '/dashboard/admin/settings';

    if (isActive || isAllowedPath) {
        return <>{children}</>;
    }

    const displayStatus = status !== 'active' ? status : (subscriptionStatus !== 'active' ? subscriptionStatus : websiteStatus);

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#fafafa] text-slate-900 font-sans p-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] max-w-lg w-full text-center border border-slate-100 relative overflow-hidden"
            >
                {/* Decorative Background Element */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-800 via-slate-800 to-slate-800" />
                
                <div className="flex justify-center mb-8">
                    <div className="p-5 bg-slate-50 rounded-3xl">
                        <ShieldAlert size={48} className="text-slate-800" />
                    </div>
                </div>

                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                    Service Suspended
                </h1>
                
                <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                    Access to this platform is currently restricted due to your account status. 
                    Please resolve the outstanding issue to restore full functionality.
                </p>

                <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Status</span>
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 text-slate-900 rounded-full font-bold text-sm uppercase">
                            <AlertCircle size={14} />
                            {displayStatus || 'Inactive'}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-sm font-semibold text-slate-400">
                        Need assistance? Contact our support team:
                    </p>
                    <a 
                        href="https://www.disibin.com" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-slate-200"
                    >
                        Visit disibin.com
                        <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </a>
                </div>
            </motion.div>
            
            <p className="mt-8 text-slate-400 text-xs font-medium">
                &copy; {new Date().getFullYear()} Powered by Disibin.
            </p>
        </div>
    );
}

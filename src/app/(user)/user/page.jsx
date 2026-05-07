"use client";
import React, { useEffect, useState } from "react";
import { User, Mail, Phone, Settings, ShoppingBag, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function UserProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/user/islogin');
                const data = await res.json();
                if (data.success) {
                    setUser(data.payload);
                } else {
                    toast.error(data.message || "Failed to load profile");
                }
            } catch (error) {
                toast.error("An error occurred");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-sm max-w-md w-full">
                    <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h2 className="text-2xl font-bold mb-2">Not Authenticated</h2>
                    <p className="text-gray-500 mb-6">Please log in to view your profile.</p>
                    <Link href="/login" className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">My Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-all hover:shadow-md">
                            <div className="flex items-center space-x-6 mb-8 border-b border-gray-100 pb-8">
                                <div className="h-24 w-24 bg-gradient-to-tr from-gray-900 to-gray-700 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-3xl font-bold text-white uppercase">{user.name.charAt(0)}</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                                    <p className="text-sm text-gray-500 flex items-center mt-1">
                                        Member since {new Date(user.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Email Address</p>
                                    <div className="flex items-center text-gray-900 font-medium">
                                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                        {user.email}
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Phone Number</p>
                                    <div className="flex items-center text-gray-900 font-medium">
                                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                        {user.phone}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <Link href="/user/orders" className="block">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-black transition-all group">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-gray-100 p-3 rounded-lg group-hover:bg-black group-hover:text-white transition-colors">
                                        <ShoppingBag className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">My Orders</h3>
                                        <p className="text-sm text-gray-500">View purchase history</p>
                                    </div>
                                </div>
                                <span className="text-gray-300 group-hover:text-black transition-colors">→</span>
                            </div>
                        </Link>

                        <Link href="/user/settings" className="block">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-black transition-all group">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-gray-100 p-3 rounded-lg group-hover:bg-black group-hover:text-white transition-colors">
                                        <Settings className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Settings</h3>
                                        <p className="text-sm text-gray-500">Update profile & security</p>
                                    </div>
                                </div>
                                <span className="text-gray-300 group-hover:text-black transition-colors">→</span>
                            </div>
                        </Link>

                        <Link href="/user/reviews" className="block">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-black transition-all group">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-gray-100 p-3 rounded-lg group-hover:bg-black group-hover:text-white transition-colors">
                                        <Star className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">My Reviews</h3>
                                        <p className="text-sm text-gray-500">Share your feedback</p>
                                    </div>
                                </div>
                                <span className="text-gray-300 group-hover:text-black transition-colors">→</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

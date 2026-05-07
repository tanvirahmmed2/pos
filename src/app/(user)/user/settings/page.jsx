"use client";
import React, { useEffect, useState } from "react";
import { User, Mail, Phone, Lock, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function UserSettings() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/user/islogin');
                const data = await res.json();
                if (data.success) {
                    setUser(data.payload);
                    setFormData(prev => ({
                        ...prev,
                        name: data.payload.name,
                        email: data.payload.email,
                        phone: data.payload.phone,
                    }));
                } else {
                    toast.error(data.message || "Failed to load profile");
                    router.push('/login');
                }
            } catch (error) {
                toast.error("An error occurred");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [router]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                user_id: user.user_id,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
            };
            
            if (formData.password) {
                payload.password = formData.password;
            }

            const res = await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(data.message || "Profile updated successfully");
                setUser(data.user);
                setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
            } else {
                toast.error(data.message || "Failed to update profile");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 flex items-center">
                    <Link href="/user" className="flex items-center text-gray-500 hover:text-black transition-colors font-medium">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </Link>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-black px-8 py-6 text-white">
                        <h1 className="text-2xl font-bold">Profile Settings</h1>
                        <p className="text-gray-400 mt-1">Update your personal information and security details.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Personal Information</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="pl-10 block w-full rounded-lg border border-gray-300 py-2.5 px-3 focus:ring-black focus:border-black sm:text-sm transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="pl-10 block w-full rounded-lg border border-gray-300 py-2.5 px-3 focus:ring-black focus:border-black sm:text-sm transition-colors"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            className="pl-10 block w-full rounded-lg border border-gray-300 py-2.5 px-3 focus:ring-black focus:border-black sm:text-sm transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Security</h3>
                            <p className="text-xs text-gray-500">Leave password fields blank if you do not wish to change it.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="pl-10 block w-full rounded-lg border border-gray-300 py-2.5 px-3 focus:ring-black focus:border-black sm:text-sm transition-colors"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="pl-10 block w-full rounded-lg border border-gray-300 py-2.5 px-3 focus:ring-black focus:border-black sm:text-sm transition-colors"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex items-center justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {saving ? (
                                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                ) : (
                                    <Save className="w-5 h-5 mr-2" />
                                )}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

"use client";
import React, { useEffect, useState, useContext } from "react";
import { User, Mail, Lock, Save, ShieldCheck, LogOut } from "lucide-react";
import { Context } from "@/components/helper/Context";
import toast from "react-hot-toast";
import axios from "axios";

const roleBadge = {
    manager: "bg-indigo-100 text-indigo-800 border-indigo-200",
    sales:   "bg-emerald-100 text-emerald-800 border-emerald-200",
    user:    "bg-gray-100 text-gray-700 border-gray-200",
};

export default function AccountPage() {
    const { userData, setUserData } = useContext(Context);
    const [staffInfo, setStaffInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    // ── Fetch current logged-in user ──────────────────────────────────────────
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res  = await axios.get("/api/user/islogin", { withCredentials: true });
                const info = res.data.payload;
                setStaffInfo(info);
                setFormData(prev => ({ ...prev, name: info.name, email: info.email }));
            } catch {
                toast.error("Failed to load account information.");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                user_id: staffInfo.user_id,
                name:     formData.name,
                email:    formData.email,
                ...(formData.password ? { password: formData.password } : {}),
            };
            const res = await axios.put("/api/user", payload, { withCredentials: true });
            toast.success(res.data.message || "Account updated successfully");
            const updated = res.data.payload;
            setStaffInfo(prev => ({ ...prev, ...updated }));
            // Sync topbar context
            if (setUserData) setUserData(prev => ({ ...prev, ...updated }));
            setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update account");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.get("/api/user/login", { withCredentials: true });
            toast.success("Logged out successfully");
            window.location.replace("/login");
        } catch {
            toast.error("Failed to logout");
        }
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    const role = staffInfo?.role || "user";

    return (
        <div className="w-full min-h-screen bg-slate-50 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* ── Page Header ────────────────────────────────────────────── */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Account</h1>
                    <p className="text-slate-500 mt-1 text-sm">Manage your staff profile and security settings.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ── Profile Card ───────────────────────────────────────── */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-4 border-4 border-white ring-2 ring-sky-100">
                                {staffInfo?.name?.charAt(0)?.toUpperCase() || "S"}
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">{staffInfo?.name}</h2>
                            <p className="text-slate-500 text-sm mt-1">{staffInfo?.email}</p>
                            <span className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wide ${roleBadge[role] || roleBadge.user}`}>
                                <ShieldCheck className="w-3.5 h-3.5" />
                                {role}
                            </span>

                            <div className="w-full border-t border-slate-100 mt-6 pt-6 space-y-3 text-sm text-left">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    <span className="truncate">{staffInfo?.name}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    <span className="truncate">{staffInfo?.email}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm border border-red-100 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* ── Edit Form ──────────────────────────────────────────── */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-6">
                                <h3 className="text-white text-lg font-bold">Edit Profile</h3>
                                <p className="text-slate-400 text-sm mt-1">Update your name, email address, and password.</p>
                            </div>

                            <div className="p-8 space-y-6">
                                {/* Personal Info */}
                                <div className="space-y-5">
                                    <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
                                        Personal Information
                                    </h4>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all"
                                                placeholder="Your full name"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Security */}
                                <div className="space-y-5 pt-2">
                                    <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
                                        Security
                                    </h4>
                                    <p className="text-xs text-slate-400">Leave password fields blank if you don&apos;t want to change it.</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-sky-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {saving ? (
                                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

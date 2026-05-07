"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function UserOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/user/order');
                const data = await res.json();
                
                if (res.status === 401) {
                    window.location.href = '/login';
                    return;
                }

                if (data.success) {
                    setOrders(data.payload || []);
                } else {
                    toast.error(data.message || "Failed to load orders");
                }
            } catch (error) {
                toast.error("An error occurred while fetching orders");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
            case 'confirmed':
            case 'confirm':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'shipped':
                return <Package className="w-5 h-5 text-blue-500" />;
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'returned':
            case 'cancelled':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Package className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
            case 'confirmed':
            case 'confirm':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'shipped':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'returned':
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <Link href="/user" className="flex items-center text-gray-500 hover:text-black transition-colors font-medium">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </Link>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Purchase History</h1>
                    <p className="text-gray-500 mt-2">View and track all your past orders.</p>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-500 mb-6">Looks like you haven't made any purchases yet.</p>
                        <Link href="/products" className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.order_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="border-b border-gray-100 bg-gray-50/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm">
                                        <div>
                                            <p className="text-gray-500 mb-1">Order Placed</p>
                                            <p className="font-semibold text-gray-900">
                                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric', month: 'long', day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1">Total Amount</p>
                                            <p className="font-semibold text-gray-900">৳ {Number(order.total_amount).toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1">Order ID</p>
                                            <p className="font-semibold text-gray-900">#{order.order_id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.order_status)}`}>
                                            {getStatusIcon(order.order_status)}
                                            <span className="ml-2 uppercase tracking-wide">{order.order_status || 'Pending'}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flow-root">
                                        <ul className="-my-6 divide-y divide-gray-100">
                                            {order.items?.map((item, idx) => (
                                                <li key={idx} className="py-6 flex flex-col sm:flex-row items-center gap-6">
                                                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
                                                        {item.image ? (
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="h-full w-full object-cover object-center"
                                                            />
                                                        ) : (
                                                            <Package className="h-8 w-8 text-gray-300" />
                                                        )}
                                                    </div>

                                                    <div className="flex flex-1 flex-col text-center sm:text-left">
                                                        <div>
                                                            <h4 className="text-base font-bold text-gray-900">{item.name}</h4>
                                                            <p className="mt-1 text-sm text-gray-500">{item.unit}</p>
                                                        </div>
                                                        <div className="flex flex-1 items-end justify-between text-sm mt-4">
                                                            <p className="text-gray-500">Qty {item.quantity}</p>
                                                            <p className="font-medium text-gray-900">৳ {Number(item.price).toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";
import React, { useEffect, useState } from "react";
import { Star, CheckCircle2, Trash2, MessageSquare, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function ManagerReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingReviews();
    }, []);

    const fetchPendingReviews = async () => {
        try {
            const res = await fetch('/api/review?type=pending');
            const data = await res.json();
            if (data.success) {
                setReviews(data.payload);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            const res = await fetch('/api/review', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ review_id: id, is_approved: true })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Review approved");
                setReviews(reviews.filter(r => r.review_id !== id));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to approve review");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this review?")) return;
        try {
            const res = await fetch(`/api/review?id=${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Review deleted");
                setReviews(reviews.filter(r => r.review_id !== id));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to delete review");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Review Management</h1>
                <p className="text-slate-500 font-medium">Moderate customer feedback and testimonials.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                    {reviews.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm text-center"
                        >
                            <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="text-slate-300" size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">No Pending Reviews</h3>
                            <p className="text-slate-500">All customer feedback has been moderated.</p>
                        </motion.div>
                    ) : (
                        reviews.map((review) => (
                            <motion.div
                                key={review.review_id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-start hover:border-slate-100 transition-colors"
                            >
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 font-black">
                                            {review.user_name?.charAt(0) || "U"}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900">{review.user_name || "Customer"}</h4>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                size={16} 
                                                className={i < review.rating ? "fill-slate-400 text-slate-400" : "text-slate-200"} 
                                            />
                                        ))}
                                    </div>

                                    <div className="space-y-2">
                                        <h5 className="text-lg font-bold text-slate-800">{review.title}</h5>
                                        <p className="text-slate-600 text-sm leading-relaxed">"{review.comment}"</p>
                                    </div>
                                </div>

                                <div className="flex md:flex-col gap-3 w-full md:w-auto">
                                    <button
                                        onClick={() => handleApprove(review.review_id)}
                                        className="flex-1 md:w-40 flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
                                    >
                                        <CheckCircle2 size={16} />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleDelete(review.review_id)}
                                        className="flex-1 md:w-40 flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-800 border border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

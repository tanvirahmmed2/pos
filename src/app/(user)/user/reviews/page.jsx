"use client";
import React, { useEffect, useState } from "react";
import { Star, Send, MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function UserReviews() {
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        rating: 5,
        title: "",
        comment: ""
    });

    useEffect(() => {
        fetchMyReview();
    }, []);

    const fetchMyReview = async () => {
        try {
            const res = await fetch('/api/review?type=my');
            const data = await res.json();
            if (data.success && data.payload.length > 0) {
                setReview(data.payload[0]);
            }
        } catch (error) {
            console.error("Failed to fetch review");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                fetchMyReview();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to submit review");
        } finally {
            setSubmitting(false);
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
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Feedback</h1>
                    <p className="text-gray-500 font-medium">Share your experience with us.</p>
                </div>

                {review ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        size={20} 
                                        className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} 
                                    />
                                ))}
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                review.is_approved ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                            }`}>
                                {review.is_approved ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                {review.is_approved ? "Approved" : "Pending Approval"}
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">{review.title}</h3>
                        <p className="text-gray-600 leading-relaxed italic">"{review.comment}"</p>
                        
                        <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400 font-medium">
                            <span>Posted on {new Date(review.created_at).toLocaleDateString()}</span>
                            <span className="uppercase tracking-[0.1em]">Only one review allowed per account</span>
                        </div>
                    </motion.div>
                ) : (
                    <motion.form 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleSubmit}
                        className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6"
                    >
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Overall Rating</label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, rating: num })}
                                        className="p-1 transition-transform hover:scale-110 active:scale-95"
                                    >
                                        <Star 
                                            size={32} 
                                            className={num <= formData.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} 
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Review Title</label>
                            <input 
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Excellent Service!"
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-black focus:bg-white transition-all text-sm font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Your Message</label>
                            <textarea 
                                required
                                rows={4}
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                placeholder="Tell us what you liked or how we can improve..."
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-black focus:bg-white transition-all text-sm font-medium resize-none"
                            />
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit"
                                disabled={submitting}
                                className="w-full flex items-center justify-center gap-3 py-4 bg-black text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
                            >
                                {submitting ? "Submitting..." : (
                                    <>
                                        Submit Review
                                        <Send size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
                            <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
                            <p className="text-[11px] text-blue-700 font-medium leading-relaxed uppercase tracking-tight">
                                Your review will be moderated by our team before being published on the main website. 
                                You can only post one review per account.
                            </p>
                        </div>
                    </motion.form>
                )}
            </div>
        </div>
    );
}

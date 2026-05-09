"use client";
import React, { useEffect, useState, useRef } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch('/api/review');
            const data = await res.json();
            if (data.success) {
                setReviews(data.payload);
            }
        } catch (error) {
            console.error("Failed to fetch reviews");
        } finally {
            setLoading(false);
        }
    };

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' 
                ? scrollLeft - clientWidth / 2 
                : scrollLeft + clientWidth / 2;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    if (loading || reviews.length === 0) return null;

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <Star size={12} className="fill-current" />
                            Testimonials
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                            What Our <span className="text-slate-800">Customers</span> Say
                        </h2>
                    </div>
                    
                    <div className="flex gap-2">
                        <button 
                            onClick={() => scroll('left')}
                            className="p-4 rounded-2xl border border-slate-100 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button 
                            onClick={() => scroll('right')}
                            className="p-4 rounded-2xl border border-slate-100 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                <div 
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-8 -mx-4 px-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {reviews.map((review, index) => (
                        <motion.div
                            key={review.review_id}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex-shrink-0 w-[85vw] md:w-[400px] snap-start"
                        >
                            <div className="h-full bg-slate-50 rounded-[2.5rem] p-8 md:p-10 border border-slate-100 flex flex-col justify-between group hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    size={16} 
                                                    className={i < review.rating ? "fill-slate-400 text-slate-400" : "text-slate-200"} 
                                                />
                                            ))}
                                        </div>
                                        <Quote className="text-slate-200 group-hover:text-slate-800 transition-colors" size={32} />
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-black text-slate-900 leading-tight">
                                            {review.title}
                                        </h3>
                                        <p className="text-slate-500 font-medium leading-relaxed italic">
                                            "{review.comment}"
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-10 pt-8 border-t border-slate-200/50 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-lg">
                                        {review.user_name?.charAt(0) || "U"}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900">{review.user_name || "Valued Customer"}</h4>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Verified Buyer</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
            
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}

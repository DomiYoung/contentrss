import { X, Download, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ArticleDetailData } from "@/types/article";

interface PosterOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    data: ArticleDetailData | null;
}

export function PosterOverlay({ isOpen, onClose, data }: PosterOverlayProps) {
    if (!data) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Poster Container */}
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        className="relative w-full max-w-sm bg-zinc-900 text-white rounded-[24px] overflow-hidden shadow-2xl border border-zinc-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-10">
                            <X size={20} />
                        </button>

                        {/* Poster Content */}
                        <div className="p-8 pt-12 flex flex-col min-h-[500px]">
                            {/* Brand */}
                            <div className="flex items-center gap-2 mb-8 opacity-60">
                                <div className="w-4 h-4 bg-white rounded-sm" />
                                <span className="text-xs font-bold tracking-widest uppercase">Intelligence Pro</span>
                            </div>

                            {/* The Fact */}
                            <h2 className="text-2xl font-bold font-display leading-tight mb-6">
                                {data.fact}
                            </h2>

                            {/* The Impact */}
                            <div className="mt-auto space-y-4">
                                <div className="h-px bg-zinc-800 w-full" />
                                {data.impacts.slice(0, 2).map((impact, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`w-1.5 h-1.5 rounded-full ${impact.trend === 'up' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        <span className="text-sm font-medium text-zinc-300">
                                            {impact.entity} <span className={impact.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}>{impact.trend === 'up' ? '▲' : '▼'}</span>
                                        </span>
                                    </div>
                                ))}
                                <p className="text-xs text-zinc-500 italic mt-2">"{data.opinion}"</p>
                            </div>

                            {/* Footer / Watermark */}
                            <div className="mt-8 flex justify-between items-end">
                                <div>
                                    <div className="text-[10px] items-center gap-1 text-amber-500 font-bold tracking-wider uppercase mb-1 flex">
                                        Insiders Only
                                    </div>
                                    <div className="text-[9px] text-zinc-600">
                                        Scan to access full report
                                    </div>
                                </div>
                                {/* QR Stub */}
                                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                                    <div className="w-8 h-8 bg-zinc-900/10" />
                                </div>
                            </div>

                        </div>

                        {/* Action Button (Floating) */}
                        <div className="bg-zinc-800 p-4 flex justify-center border-t border-zinc-700/50">
                            <button className="flex items-center gap-2 bg-white text-zinc-900 px-6 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform">
                                <Download size={16} /> Save to Photos
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

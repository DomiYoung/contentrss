import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ShieldCheck, Zap } from "lucide-react";
import type { IntelligenceCardData } from "@/types";
import { cn } from "@/lib/utils";

interface SharePosterProps {
    data: IntelligenceCardData;
    isOpen: boolean;
    onClose: () => void;
}

export function SharePoster({ data, isOpen, onClose }: SharePosterProps) {
    if (!data) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg aspect-[3/4] bg-[#FAF9F6] rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Status Bar / Watermark */}
                        <div className="px-8 pt-8 flex justify-between items-start">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-full">
                                <ShieldCheck size={14} className="text-emerald-400" />
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Internal / Insiders Only</span>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-widest leading-none">Intelligence Card</div>
                                <div className="text-[10px] font-mono text-zinc-300 font-bold mt-1">NO. {Math.floor(Math.random() * 89999 + 10000)}</div>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 px-10 flex flex-col justify-center py-6">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm border",
                                data.polarity === 'positive' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                                    data.polarity === 'negative' ? "bg-rose-50 border-rose-100 text-rose-600" :
                                        "bg-zinc-50 border-zinc-100 text-zinc-600"
                            )}>
                                <Zap size={24} fill="currentColor" strokeWidth={0} />
                            </div>

                            <h1 className="text-3xl font-black text-zinc-900 leading-tight mb-6 font-display tracking-tight">
                                {data.title}
                            </h1>

                            <div className="space-y-6">
                                <p className="text-lg leading-relaxed text-zinc-700 font-medium">
                                    {data.fact}
                                </p>

                                <div className="space-y-3">
                                    {data.impacts.map((impact, i) => (
                                        <div key={i} className="flex items-center gap-4 py-3 px-4 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                                            <div className={cn(
                                                "p-1.5 rounded-full shrink-0",
                                                impact.trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                            )}>
                                                <Zap size={14} />
                                            </div>
                                            <div className="flex-1 flex items-center justify-between">
                                                <span className="text-sm font-black text-zinc-900">{impact.entity}</span>
                                                <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-widest">{impact.reason}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer / QR / Brand */}
                        <div className="px-10 pb-10 flex justify-between items-end">
                            <div>
                                <div className="text-[14px] font-black text-zinc-900 mb-1">ContentRSS v3.0</div>
                                <div className="text-[11px] font-medium text-zinc-400 italic">2024-12-25 · Daily Industry Briefing</div>
                            </div>
                            <div className="w-16 h-16 bg-white p-2 rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-center">
                                {/* Simplified Brand Logo instead of QR for MVP */}
                                <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                                    <Zap size={16} className="text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Grain Overlay */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                    </motion.div>

                    {/* Actions Bar */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        className="fixed bottom-12 flex gap-4"
                    >
                        <button
                            onClick={onClose}
                            className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
                        >
                            <X size={24} />
                        </button>
                        <button className="px-8 h-14 bg-white text-zinc-950 font-black rounded-full flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all">
                            <Download size={20} />
                            <span>Save Image</span>
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

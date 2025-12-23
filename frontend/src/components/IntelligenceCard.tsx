import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, MoreHorizontal, Share2, Sparkles } from "lucide-react";
import type { IntelligenceCardData, Polarity } from "@/types/index";
import { cn } from "@/lib/utils";

interface IntelligenceCardProps {
    data: IntelligenceCardData;
    onLongPress?: (data: IntelligenceCardData) => void;
    onClick?: () => void;
}

const polarityStyles: Record<Polarity, { border: string; bg: string; text: string; icon: any }> = {
    positive: { border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700", icon: TrendingUp },
    negative: { border: "border-rose-200", bg: "bg-rose-50", text: "text-rose-700", icon: TrendingDown },
    neutral: { border: "border-zinc-200", bg: "bg-zinc-50", text: "text-zinc-600", icon: Minus },
};

export function IntelligenceCard({ data, onLongPress, onClick }: IntelligenceCardProps) {
    const style = polarityStyles[data.polarity] || polarityStyles.neutral;
    const PolarityIcon = style.icon;

    const handleLongPress = () => {
        if (typeof window !== "undefined" && window.navigator?.vibrate) {
            window.navigator.vibrate(50);
        }
        onLongPress?.(data);
    };

    // Swipe Logic
    const [isVisible, setIsVisible] = useState(true);
    const onDragEnd = (event: any, info: any) => {
        if (info.offset.x < -100) {
            setIsVisible(false); // Dismiss
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    layout
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    onDragEnd={onDragEnd}
                    whileTap={{ scale: 0.99 }}
                    className="bg-white rounded-[20px] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-zinc-100 overflow-hidden mb-4 relative flex flex-col touch-pan-y"
                    onContextMenu={(e) => { e.preventDefault(); handleLongPress(); }}
                    onClick={onClick}
                >
                    {/* Semantic Header */}
                    <div className="px-5 pt-5 pb-2 flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <div className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1", style.bg, style.text)}>
                                <PolarityIcon size={10} strokeWidth={3} />
                                {data.polarity.toUpperCase()}
                            </div>
                            <span className="text-xs text-zinc-400 font-medium truncate max-w-[120px]">
                                {data.source_name}
                            </span>
                        </div>
                        <button className="text-zinc-300 hover:text-zinc-600">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>

                    {/* Content Body */}
                    <div className="px-5 pb-5">
                        <h3 className="text-[17px] font-bold text-zinc-900 leading-[1.3] mb-3 font-display tracking-tight">
                            {data.title}
                        </h3>

                        <p className="text-[15px] leading-relaxed text-zinc-600 mb-4 font-normal">
                            {data.fact}
                        </p>

                        {/* Impact List - The "Core Value" */}
                        <div className="space-y-2">
                            {data.impacts.map((impact, i) => (
                                <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-50/80 border border-zinc-100/50">
                                    <div className={cn("mt-0.5 p-1 rounded-full shrink-0",
                                        impact.trend === 'up' ? "bg-emerald-100/50 text-emerald-600" : "bg-rose-100/50 text-rose-600"
                                    )}>
                                        {impact.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2 mb-0.5">
                                            <span className="text-[13px] font-bold text-zinc-900">{impact.entity}</span>
                                            <span className={cn("text-[10px] uppercase font-bold tracking-wider", impact.trend === 'up' ? "text-emerald-600" : "text-rose-600")}>
                                                {impact.trend}
                                            </span>
                                        </div>
                                        <p className="text-[13px] text-zinc-500 leading-snug truncate">
                                            {impact.reason}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Insight/Opinion - "The Brain" */}
                        {data.opinion && (
                            <div className="mt-4 flex gap-3 items-start">
                                <Sparkles size={14} className="text-amber-500 shrink-0 mt-1" />
                                <p className="text-[13px] text-zinc-500 italic leading-snug border-l-2 border-amber-200 pl-3">
                                    {data.opinion}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

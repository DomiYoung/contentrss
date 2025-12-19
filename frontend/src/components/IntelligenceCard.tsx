import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, MoreHorizontal, Share2, MessageSquareQuote } from "lucide-react";
import { IntelligenceCardData, Polarity } from "@/types";
import { cn } from "@/lib/utils";

interface IntelligenceCardProps {
    data: IntelligenceCardData;
}

const polarityColors: Record<Polarity, string> = {
    positive: "bg-emerald-500",
    negative: "bg-rose-500",
    neutral: "bg-blue-500",
};

const polarityTextColors: Record<Polarity, string> = {
    positive: "text-emerald-600",
    negative: "text-rose-600",
    neutral: "text-blue-600",
};

export function IntelligenceCard({ data }: IntelligenceCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Viral Feature: Long Press Logic
    const handleLongPress = () => {
        // In a real app, this would trigger the Poster Generator
        console.log("Trigger Viral Poster Generator");
        if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(50); // Haptic feedback
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden mb-4 relative"
            onContextMenu={(e) => {
                e.preventDefault();
                handleLongPress();
            }}
        >
            {/* Polarity Indicator Strip */}
            <div className={cn("absolute top-0 left-0 w-1.5 h-full", polarityColors[data.polarity])} />

            <div className="p-5 pl-7">
                {/* Header: Title & Polarity */}
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <span className={cn("text-xs font-bold uppercase tracking-wider mb-1 block", polarityTextColors[data.polarity])}>
                            {data.polarity === "positive" ? "利好 Bullish" : data.polarity === "negative" ? "利空 Bearish" : "关注 Watch"}
                        </span>
                        <h3 className="text-lg font-bold text-zinc-900 leading-tight">{data.title}</h3>
                    </div>
                    <button className="text-zinc-400 hover:text-zinc-600">
                        <MoreHorizontal size={20} />
                    </button>
                </div>

                {/* Core Fact */}
                <div className="mb-4">
                    <p className="text-[15px] font-medium text-zinc-800 leading-relaxed">
                        {data.fact}
                    </p>
                </div>

                {/* Impact Chain */}
                <div className="space-y-2 mb-4">
                    {data.impacts.map((impact, idx) => (
                        <div key={idx} className="flex items-center text-sm bg-zinc-50 p-2 rounded-lg border border-zinc-100/50">
                            {impact.trend === "up" ? (
                                <TrendingUp className="text-emerald-500 mr-2 shrink-0" size={16} />
                            ) : (
                                <TrendingDown className="text-rose-500 mr-2 shrink-0" size={16} />
                            )}
                            <span className="font-semibold text-zinc-700 mr-1">{impact.entity}:</span>
                            <span className="text-zinc-500 truncate">{impact.reason}</span>
                        </div>
                    ))}
                </div>

                {/* Bottom Metadata & Actions */}
                <div className="flex justify-between items-center text-xs text-zinc-400 mt-4 border-t border-zinc-50 pt-3">
                    <div className="flex gap-2">
                        {data.tags.map(tag => (
                            <span key={tag} className="text-zinc-500">#{tag}</span>
                        ))}
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-1 hover:text-zinc-600">
                            <MessageSquareQuote size={14} />
                            <span>辣评</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-zinc-600" onClick={handleLongPress}>
                            <Share2 size={14} />
                            <span>分享</span>
                        </button>
                    </div>
                </div>

                {/* Insight (Collapsed by default logic visualizer) */}
                {data.opinion && (
                    <div className="mt-3 text-xs text-zinc-500 italic bg-yellow-50/50 p-2 rounded border border-yellow-100/50">
                        “{data.opinion}”
                    </div>
                )}
            </div>
        </motion.div>
    );
}

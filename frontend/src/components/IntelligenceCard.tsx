import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Share2, MoreHorizontal, TrendingUp, TrendingDown } from "lucide-react";
import type { IntelligenceCardData, Polarity } from "@/types/index";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/lib/haptic";
import { SharePoster } from "./SharePoster";

interface IntelligenceCardProps {
    data: IntelligenceCardData;
    onLongPress?: (data: IntelligenceCardData) => void;
    onClick?: () => void;
    onDismiss?: (id: number) => void;
    onShare?: (data: IntelligenceCardData) => void;
}

const polarityStyles: Record<Polarity, { bg: string; dot: string; text: string }> = {
    positive: { bg: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-400", text: "Positive" },
    negative: { bg: "bg-rose-50 text-rose-600", dot: "bg-rose-400", text: "Negative" },
    neutral: { bg: "bg-zinc-50 text-zinc-600", dot: "bg-zinc-400", text: "Neutral" },
};

export function IntelligenceCard({ data, onClick, onShare }: IntelligenceCardProps) {
    const [isPosterOpen, setIsPosterOpen] = React.useState(false);
    const polStyle = polarityStyles[data.polarity] || polarityStyles.neutral;

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        triggerHaptic("medium");
        setIsPosterOpen(true);
        onShare?.(data);
    };

    return (
        <motion.div
            layout
            whileTap={{ scale: 0.98 }}
            className="group relative bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden mb-6 transition-all hover:shadow-md cursor-pointer"
            onClick={() => {
                triggerHaptic("light");
                onClick?.();
            }}
        >
            <div className="p-6">
                {/* Header: Source, Time, Polarity */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">{data.source_name}</span>
                        <span className="text-zinc-200">·</span>
                        <span className="text-[11px] text-zinc-400 font-medium tracking-tight">10m ago</span>
                    </div>
                    <div className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight",
                        polStyle.bg
                    )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", polStyle.dot)} />
                        {polStyle.text}
                    </div>
                </div>

                {/* Main Content: Text + Image */}
                <div className="flex gap-4 items-start mb-5">
                    <div className="flex-1">
                        <h3 className="text-[20px] font-black text-zinc-900 leading-[1.2] mb-3 font-display tracking-tight">
                            {data.title}
                        </h3>
                        <ul className="space-y-1.5">
                            {/* Use insights from description/impacts to simulate bullet points from image */}
                            <li className="flex items-start gap-2 text-[14px] text-zinc-500 font-medium leading-snug">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-zinc-300 shrink-0" />
                                {data.fact.split('.')[0]}
                            </li>
                            {data.impacts.slice(0, 1).map((imp, i) => (
                                <li key={i} className="flex items-start gap-2 text-[14px] text-zinc-500 font-medium leading-snug">
                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-zinc-300 shrink-0" />
                                    {imp.entity} {imp.trend === 'up' ? 'positive' : 'negative'} shift detected.
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="w-24 h-24 rounded-2xl bg-zinc-100 overflow-hidden shrink-0 shadow-inner">
                        <img
                            src={`https://picsum.photos/seed/${data.id}/200`}
                            alt="news"
                            className="w-full h-full object-cover grayscale-[0.2] brightness-95"
                        />
                    </div>
                </div>

                {/* Tags Section */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {data.impacts.map((imp, i) => (
                        <div
                            key={i}
                            className={cn(
                                "flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-[11px] font-bold tracking-tight border",
                                imp.trend === 'up'
                                    ? "bg-emerald-50/50 text-emerald-600 border-emerald-100"
                                    : "bg-rose-50/50 text-rose-600 border-rose-100"
                            )}
                        >
                            {imp.trend === 'up' ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
                            {imp.entity} ({imp.trend === 'up' ? 'UP' : 'DN'})
                        </div>
                    ))}
                </div>

                {/* AI Insight Box (Ref uploaded_image_1) */}
                <div className="bg-emerald-50/30 border border-emerald-100/50 rounded-2xl p-4 flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Sparkles size={14} className="text-emerald-600" />
                    </div>
                    <div>
                        <span className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">AI Insight</span>
                        <p className="text-[13px] leading-relaxed text-zinc-700 font-medium">
                            {data.opinion || "Strategic shift indicates long-term growth potential in this sector."}
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-6 pt-4 border-t border-zinc-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleShare}
                            className="text-zinc-400 hover:text-zinc-600 transition-colors"
                        >
                            <Share2 size={20} strokeWidth={2} />
                        </button>
                        <button className="text-zinc-400 hover:text-zinc-600 transition-colors">
                            <motion.div whileTap={{ y: -2 }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 5V19L12 15L19 19V5C19 4.44772 18.5523 4 18 4H6C5.44772 4 5 4.44772 5 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </motion.div>
                        </button>
                    </div>
                    <button className="text-zinc-300 hover:text-zinc-600 p-1">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </div>

            {/* Poster Modal */}
            <SharePoster
                data={data}
                isOpen={isPosterOpen}
                onClose={() => setIsPosterOpen(false)}
            />
        </motion.div>
    );
}

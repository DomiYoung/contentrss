import React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, MoreHorizontal, Sparkles, Share2 } from "lucide-react";
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

const polarityStyles: Record<Polarity, { border: string; bg: string; text: string; icon: React.ElementType; glow: string }> = {
    positive: { border: "border-emerald-100", bg: "bg-emerald-50", text: "text-emerald-700", icon: TrendingUp, glow: "shadow-emerald-500/10" },
    negative: { border: "border-rose-100", bg: "bg-rose-50", text: "text-rose-700", icon: TrendingDown, glow: "shadow-rose-500/10" },
    neutral: { border: "border-zinc-100", bg: "bg-zinc-50", text: "text-zinc-600", icon: Minus, glow: "shadow-zinc-500/10" },
};

export function IntelligenceCard({ data, onLongPress, onClick, onDismiss, onShare }: IntelligenceCardProps) {
    const [isPosterOpen, setIsPosterOpen] = React.useState(false);
    const style = polarityStyles[data.polarity] || polarityStyles.neutral;
    const PolarityIcon = style.icon;

    const x = useMotionValue(0);
    const opacity = useTransform(x, [-100, 0], [0.3, 1]);
    const rotate = useTransform(x, [-100, 0], [-2, 0]);

    const handleLongPress = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        triggerHaptic("medium");
        setIsPosterOpen(true);
        onLongPress?.(data);
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        triggerHaptic("medium");
        setIsPosterOpen(true);
        onShare?.(data);
    };

    return (
        <motion.div
            layout
            style={{ x, opacity, rotate }}
            drag="x"
            dragConstraints={{ left: -150, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
                if (info.offset.x < -100) {
                    triggerHaptic("light");
                    onDismiss?.(data.id);
                }
            }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "intelligence-card group relative bg-[#FAF9F6] rounded-3xl border border-zinc-200/60 overflow-hidden mb-5 transition-shadow hover:shadow-xl touch-pan-y",
                style.glow
            )}
            onClick={() => {
                // Ignore click if it was a drag
                if (Math.abs(x.get()) < 5) {
                    triggerHaptic("light");
                    onClick?.();
                }
            }}
            onContextMenu={handleLongPress}
        >
            {/* Header: Polarity & Meta */}
            <div className="px-6 pt-6 pb-2 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        style.bg, style.text
                    )}>
                        <PolarityIcon size={12} strokeWidth={3} />
                        {data.polarity}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                        {data.source_name}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {/* 显式分享按钮 - Apple HIG: 44pt 触摸区域 */}
                    <button
                        onClick={handleShare}
                        className="p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all active:scale-90"
                        aria-label="分享情报"
                    >
                        <Share2 size={18} />
                    </button>
                    <button className="p-2.5 text-zinc-300 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors">
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </div>

            {/* Content: Title & Summary */}
            <div className="px-6 pb-6">
                <h3 className="text-xl font-black text-zinc-900 leading-[1.2] mb-3 font-display tracking-tight group-hover:text-zinc-800 transition-colors">
                    {data.title}
                </h3>

                <p className="text-[15px] leading-relaxed text-zinc-600 mb-5 font-medium">
                    {data.fact}
                </p>

                {/* Economic Impact Chain */}
                <div className="space-y-2.5">
                    {data.impacts.map((impact, i) => (
                        <div key={i} className="flex items-center gap-4 py-2 px-3 rounded-2xl bg-white/60 border border-zinc-100/50 backdrop-blur-sm shadow-sm">
                            <div className={cn(
                                "p-1.5 rounded-full shrink-0 shadow-sm",
                                impact.trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            )}>
                                {impact.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            </div>
                            <div className="flex-1 flex items-center justify-between min-w-0">
                                <span className="text-[14px] font-black text-zinc-900 truncate">{impact.entity}</span>
                                <span className="text-[11px] font-mono text-zinc-400 font-bold ml-2">
                                    {impact.reason.substring(0, 20)}...
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* AI Insight Overlay */}
                {data.opinion && (
                    <div className="mt-5 pt-4 border-t border-zinc-100 flex gap-3 items-start">
                        <Sparkles size={16} className="text-amber-500 shrink-0" />
                        <p className="text-[13px] text-zinc-500 italic leading-snug font-medium">
                            {data.opinion}
                        </p>
                    </div>
                )}
            </div>

            {/* Dismiss Hint Layer (Visible on Drag) */}
            <div className="absolute inset-y-0 right-0 w-32 bg-rose-500 flex items-center justify-center opacity-0 group-drag:opacity-100 transition-opacity translate-x-full group-drag:translate-x-[50%]">
                <span className="text-white text-xs font-black uppercase tracking-widest -rotate-90">Ignore</span>
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

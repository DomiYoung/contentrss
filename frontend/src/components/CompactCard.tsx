/**
 * 紧凑版情报卡片
 * 设计原则：
 * - 信息密度优先：一屏显示更多内容
 * - 渐进式披露：默认折叠，点击展开
 * - Apple HIG: 44pt 触摸目标
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, ChevronDown, Share2 } from "lucide-react";
import type { IntelligenceCardData, Polarity } from "@/types/index";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/lib/haptic";

interface CompactCardProps {
    data: IntelligenceCardData;
    onClick?: () => void;
    onShare?: (data: IntelligenceCardData) => void;
}

const polarityConfig: Record<Polarity, { bg: string; text: string; icon: React.ElementType }> = {
    positive: { bg: "bg-emerald-100", text: "text-emerald-700", icon: TrendingUp },
    negative: { bg: "bg-rose-100", text: "text-rose-700", icon: TrendingDown },
    neutral: { bg: "bg-zinc-100", text: "text-zinc-600", icon: Minus },
};

export function CompactCard({ data, onClick, onShare }: CompactCardProps) {
    const [expanded, setExpanded] = useState(false);
    const config = polarityConfig[data.polarity] || polarityConfig.neutral;
    const Icon = config.icon;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        triggerHaptic("light");
        setExpanded(!expanded);
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        triggerHaptic("medium");
        onShare?.(data);
    };

    return (
        <motion.div
            layout
            className="compact-card bg-white rounded-xl border border-zinc-100 mb-2 overflow-hidden"
            onClick={onClick}
        >
            {/* 主行：极性 + 标题 + 展开 */}
            <div className="flex items-center gap-3 px-4 py-3">
                {/* 极性指示器 */}
                <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg shrink-0", config.bg)}>
                    <Icon size={16} className={config.text} strokeWidth={2.5} />
                </div>

                {/* 标题 + 来源 */}
                <div className="flex-1 min-w-0">
                    <h4 className="text-[15px] font-bold text-zinc-900 leading-snug truncate">
                        {data.title}
                    </h4>
                    <span className="text-[11px] font-medium text-zinc-400">
                        {data.source_name}
                    </span>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={handleShare}
                        className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors"
                    >
                        <Share2 size={16} />
                    </button>
                    <button
                        onClick={handleToggle}
                        className={cn(
                            "p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 rounded-lg transition-all",
                            expanded && "rotate-180"
                        )}
                    >
                        <ChevronDown size={16} />
                    </button>
                </div>
            </div>

            {/* 展开内容 */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pt-1 border-t border-zinc-50">
                            {/* 核心洞察 */}
                            {data.fact && (
                                <p className="text-[13px] text-zinc-600 leading-relaxed mb-3">
                                    {data.fact}
                                </p>
                            )}

                            {/* 影响链（紧凑版） */}
                            {data.impacts.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {data.impacts.map((impact, i) => (
                                        <span
                                            key={i}
                                            className={cn(
                                                "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium",
                                                impact.trend === 'up'
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-rose-50 text-rose-700"
                                            )}
                                        >
                                            {impact.trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                            {impact.entity}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* AI 观点 */}
                            {data.opinion && (
                                <p className="text-[12px] text-zinc-500 italic border-l-2 border-amber-300 pl-2">
                                    {data.opinion}
                                </p>
                            )}

                            {/* 标签 */}
                            {data.tags && data.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {data.tags.map((tag, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-[10px] font-medium rounded"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

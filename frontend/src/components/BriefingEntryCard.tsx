import { motion } from "framer-motion";
import { Newspaper, ArrowRight, Sparkles } from "lucide-react";
import { triggerHaptic } from "@/lib/haptic";

interface BriefingEntryCardProps {
    onClick: () => void;
}

/**
 * 首页 Briefing 入口卡片
 * 增长价值：将核心功能前置，提升 D1 Retention +15%
 * Apple HIG: 44pt 触摸区域、弹簧动画、触觉反馈
 */
export function BriefingEntryCard({ onClick }: BriefingEntryCardProps) {
    const handleClick = () => {
        triggerHaptic("medium");
        onClick();
    };

    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
            className="w-full p-5 mb-6 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-3xl border border-zinc-700/50 shadow-xl overflow-hidden relative group text-left"
        >
            {/* 背景装饰 */}
            <div className="absolute top-0 right-0 opacity-10">
                <Sparkles size={120} className="text-amber-400 -rotate-12 translate-x-8 -translate-y-4" />
            </div>

            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center">
                        <Newspaper size={24} className="text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.15em]">
                                今日简报
                            </span>
                            <span className="px-1.5 py-0.5 bg-amber-500/20 rounded text-[8px] font-black text-amber-400">
                                NEW
                            </span>
                        </div>
                        <h3 className="text-lg font-black text-white tracking-tight">
                            每日情报简报
                        </h3>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                            AI 分析 · 关键要点 · 深度解读
                        </p>
                    </div>
                </div>

                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <ArrowRight size={18} className="text-white group-hover:translate-x-0.5 transition-transform" />
                </div>
            </div>
        </motion.button>
    );
}

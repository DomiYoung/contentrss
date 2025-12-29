import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchEntityRadar, type EntityRadarData } from "@/lib/api";
import { EntityRadar } from "@/components/EntityRadar";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { triggerHaptic } from "@/lib/haptic";

export function RadarView() {
    const [radarData, setRadarData] = useState<EntityRadarData[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await fetchEntityRadar();
                setRadarData(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const nextEntity = () => {
        if (radarData.length === 0) return;
        triggerHaptic("light");
        setActiveIndex((prev) => (prev + 1) % radarData.length);
    };

    const prevEntity = () => {
        if (radarData.length === 0) return;
        triggerHaptic("light");
        setActiveIndex((prev) => (prev - 1 + radarData.length) % radarData.length);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px]">
                <div className="w-12 h-12 border-4 border-zinc-100 border-t-blue-500 rounded-full animate-spin" />
                <span className="mt-4 text-xs font-bold text-zinc-400 animate-pulse uppercase tracking-widest">
                    Analyzing Entities...
                </span>
            </div>
        );
    }

    if (radarData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] px-10 text-center">
                <div className="w-16 h-16 bg-zinc-50 rounded-3xl flex items-center justify-center mb-4">
                    <Sparkles className="text-zinc-200" size={32} />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 mb-1">暂无足够数据</h3>
                <p className="text-xs text-zinc-400">目前的情报信息不足以生成深度实体雷达，请稍后再试。</p>
            </div>
        );
    }

    const current = radarData[activeIndex];

    return (
        <div className="px-5 py-6 flex flex-col items-center">
            {/* Radar Card (Apple Style) */}
            <div className="w-full bg-white dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-[40px] p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Sparkles size={80} />
                </div>

                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={prevEntity}
                        className="p-3 bg-zinc-50 dark:bg-white/5 rounded-2xl text-zinc-400 hover:text-zinc-900 active:scale-90 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">
                            {activeIndex + 1} / {radarData.length}
                        </span>
                        <div className="flex gap-1">
                            {radarData.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-1 h-1 rounded-full transition-all duration-300 ${i === activeIndex ? "w-4 bg-blue-500" : "bg-zinc-200"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={nextEntity}
                        className="p-3 bg-zinc-50 dark:bg-white/5 rounded-2xl text-zinc-400 hover:text-zinc-900 active:scale-90 transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={current.name}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <EntityRadar data={current} />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Insight */}
            <div className="mt-8 w-full">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Sparkles size={16} className="text-amber-600" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">AI 深度洞察</h3>
                </div>
                <div className="bg-zinc-50 rounded-3xl p-5 border border-zinc-100">
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                        该实体目前在 <span className="text-zinc-900 font-black">{current.dimensions.sentiment > 70 ? '正面情绪' : '市场热度'}</span> 维度表现最为突出。
                        其动能趋于稳定，覆盖面涉及 {current.dimensions.scope > 50 ? '多个核心领域' : '垂直细分领域'}。
                        建议关注其在最新政策影响下的波动率变化。
                    </p>
                </div>
            </div>
        </div>
    );
}

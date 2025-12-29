import { useState, useEffect, useMemo } from "react";
import { fetchIntelligence, type IntelligenceCard } from "@/lib/api";
import { Search, Bookmark, Share2, ThumbsDown, ArrowRight, TrendingUp, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/lib/haptic";
import { RadarView } from "./RadarView";
import { PageSkeleton } from "@/components/PageSkeleton";

// --- Sub-components ---

const SentimentBadge = ({ polarity }: { polarity: string }) => {
    const config = {
        positive: { label: "BULLISH", bg: "bg-blue-50", text: "text-blue-600" },
        negative: { label: "BEARISH", bg: "bg-rose-50", text: "text-rose-600" },
        neutral: { label: "NEUTRAL", bg: "bg-gray-50", text: "text-gray-500" },
    };
    const { label, bg, text } = config[polarity as keyof typeof config] || config.neutral;
    return (
        <span className={cn("px-3 py-1 rounded-full text-[10px] font-black tracking-widest", bg, text)}>
            {label}
        </span>
    );
};

const ImpactChain = ({ impacts }: { impacts: any[] }) => {
    if (!impacts || impacts.length === 0) return null;
    return (
        <div className="mt-4 p-4 bg-gray-50/50 rounded-xl">
            <div className="flex items-center gap-1.5 mb-2 opacity-40">
                <TrendingUp size={12} className="text-gray-900" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-900">Impact Chain</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {impacts.map((impact, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className={cn(
                            "text-xs font-bold",
                            impact.trend === 'up' ? "text-gray-800" : "text-rose-500"
                        )}>
                            {impact.entity}
                        </span>
                        {i < impacts.length - 1 && <ArrowRight size={10} className="text-gray-300" />}
                    </div>
                ))}
            </div>
        </div>
    );
};

interface IntelligenceCardProps {
    article: IntelligenceCard;
    onClick: (article: IntelligenceCard) => void;
    onDislike: (id: number) => void;
}

const IntelligenceCardItem = ({ article, onClick, onDislike }: IntelligenceCardProps) => {
    return (
        <div className="relative overflow-hidden rounded-[32px] mb-6 briefing-card-shadow group">
            {/* 底部 Dislike 背景 */}
            <div className="absolute inset-0 bg-rose-600 flex items-center justify-end px-8">
                <div className="flex flex-col items-center gap-1 text-white">
                    <ThumbsDown size={28} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Dislike</span>
                </div>
            </div>

            {/* 滑动层 */}
            <motion.div
                drag="x"
                dragConstraints={{ right: 0, left: -100 }}
                dragElastic={0.15}
                onDragEnd={(_, info) => {
                    if (info.offset.x < -60) {
                        onDislike(article.id);
                    }
                }}
                className="relative bg-white p-6 border border-gray-100 rounded-[32px] z-10 cursor-pointer active:cursor-grabbing hover:border-gray-200 transition-colors"
                onClick={() => onClick(article)}
            >
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[10px] font-black text-gray-400 border border-gray-100">
                            {article.source_name?.charAt(0) || "B"}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-gray-900 leading-none mb-0.5">{article.source_name || "Bloomberg"}</span>
                            <span className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">精选情报</span>
                        </div>
                    </div>
                    <SentimentBadge polarity={article.polarity} />
                </div>

                <h3 className="text-[21px] font-black leading-[1.25] text-gray-900 mb-4 tracking-tight">
                    {article.title}
                </h3>

                <ImpactChain impacts={article.impacts} />

                <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">2h ago</span>
                        <div className="w-1 h-1 rounded-full bg-gray-200" />
                        <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">{article.tags?.[0] || 'Market'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-gray-300 hover:text-gray-900 transition-colors active:scale-90">
                            <Bookmark size={18} />
                        </button>
                        <button className="text-gray-300 hover:text-gray-900 transition-colors active:scale-90">
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// --- Main View ---

export function IntelligenceView() {
    const [activeTab, setActiveTab] = useState("推荐");
    const [articles, setArticles] = useState<IntelligenceCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState<IntelligenceCard | null>(null);

    // 智能排序与过滤逻辑
    const sortedArticles = useMemo(() => {
        if (activeTab === "热门") {
            // 热门: 按影响链长度或实体数量排序
            return [...articles].sort((a, b) => (b.impacts?.length || 0) - (a.impacts?.length || 0));
        }
        if (activeTab === "行业") {
            // 行业: 简单模拟分类排序
            return [...articles].sort((a, b) => (a.tags?.[0] || "").localeCompare(b.tags?.[0] || ""));
        }
        return articles; // 推荐: 默认顺序
    }, [articles, activeTab]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const res = await fetchIntelligence(20, false, "all");
                setArticles(res.cards || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleDislike = (id: number) => {
        triggerHaptic("medium");
        setArticles(prev => prev.filter(a => a.id !== id));
    };

    if (selectedArticle) {
        // 详情页逻辑
        return (
            <div className="min-h-screen bg-white pb-32">
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-gray-50">
                    <button onClick={() => setSelectedArticle(null)} className="p-2 -ml-2 text-gray-900 hover:bg-gray-50 rounded-full transition-colors">
                        <ArrowRight className="rotate-180" size={24} />
                    </button>
                    <span className="text-sm font-black uppercase tracking-widest text-gray-400">Intelligence Detail</span>
                    <button className="p-2 -mr-2 text-gray-400 hover:text-gray-900">
                        <Share2 size={20} />
                    </button>
                </header>
                <article className="px-6 py-8 font-sans text-gray-900 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-xs font-black text-white">
                                {selectedArticle.source_name?.charAt(0) || "B"}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-gray-900 leading-none mb-1">{selectedArticle.source_name || "Analysis Source"}</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Verified Intelligence</span>
                            </div>
                        </div>
                        <SentimentBadge polarity={selectedArticle.polarity} />
                    </div>

                    <h1 className="text-[32px] font-black leading-[1.1] my-6 tracking-tighter text-gray-900">{selectedArticle.title}</h1>

                    <div className="bg-gray-50 rounded-[32px] p-6 mb-10 border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-50" />
                        <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                            Core Intelligence
                        </div>
                        <p className="text-gray-800 text-[18px] leading-relaxed font-black tracking-tight">{selectedArticle.fact || selectedArticle.opinion}</p>
                    </div>

                    <div className="prose prose-lg max-w-none text-gray-800 leading-[1.8] font-medium tracking-tight mb-12">
                        <p className="mb-6">本情报由 MOSS 智能引擎通过对 15 个垂直信源的交叉验证合成。核心论点在于 {selectedArticle.title} 所引发的连锁反应将深刻影响相关领域的供应链稳定性与估值模型。</p>
                        <p>分析表明，短期内该动态将对二级市场造成一定冲击，但从长远来看，这正是资源向头部企业集中的关键信号。</p>
                    </div>

                    {/* Footer - Date & Action */}
                    <div className="pt-10 border-t border-gray-100 text-center">
                        <div className="text-[11px] font-black text-gray-300 uppercase tracking-[0.3em] mb-8">
                            SYNTHESIZED AT {new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}
                        </div>
                        <button className="w-full py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-gray-200 active:scale-[0.98] transition-transform">
                            生成情报海报
                        </button>
                    </div>
                </article>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white text-gray-900">
            <header className="flex-shrink-0 px-5 py-4 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-gray-50/50">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-0.5">晨间版</span>
                    <h1 className="text-[22px] font-black tracking-tight text-gray-900 leading-none">每日情报</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-900 active:scale-90 transition-transform bg-gray-50 rounded-full">
                        <Search size={20} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-900 active:scale-90 transition-transform bg-gray-50 rounded-full">
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Modern Tabs */}
                <div className="px-5 py-4">
                    <div className="bg-gray-100/50 p-1 rounded-2xl flex items-center">
                        {["推荐", "热门", "行业", "雷达"].map(tab => (
                            <button
                                key={tab}
                                onClick={() => {
                                    triggerHaptic("light");
                                    setActiveTab(tab);
                                }}
                                className={cn(
                                    "flex-1 py-3 rounded-xl text-xs font-black transition-all duration-400",
                                    activeTab === tab ? "bg-white text-gray-900 briefing-card-shadow" : "text-gray-400 hover:text-gray-500"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    {activeTab === "雷达" ? (
                        <motion.div
                            key="radar-tab"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <RadarView />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="feed-tab"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="px-5 pb-8 space-y-4"
                        >
                            {loading ? (
                                <PageSkeleton hasHeader={false} hasTabs={false} itemCount={3} className="min-h-0 bg-transparent" />
                            ) : (
                                sortedArticles.map(article => (
                                    <motion.div
                                        key={article.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    >
                                        <IntelligenceCardItem
                                            article={article}
                                            onClick={setSelectedArticle}
                                            onDislike={handleDislike}
                                        />
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

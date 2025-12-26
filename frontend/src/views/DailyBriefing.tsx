import { useState, useEffect } from "react";
import {
    ArrowLeft, Bookmark, Share2, Search,
    ChevronRight
} from "lucide-react";
import { fetchDailyBriefing } from "@/lib/api";
import { triggerHaptic } from "@/lib/haptic";
import type { DailyBriefingData } from "@/types/briefing";

interface DailyBriefingProps {
    onBack: () => void;
}

// 情绪徽章组件
function SentimentBadge({ polarity }: { polarity: string }) {
    const config = {
        positive: { label: "BULLISH", bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
        negative: { label: "BEARISH", bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/30" },
        neutral: { label: "NEUTRAL", bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500/30" },
    };
    const style = config[polarity as keyof typeof config] || config.neutral;
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text} border ${style.border}`}>
            {style.label}
        </span>
    );
}

// IMPACT CHAIN 组件
function ImpactChain({ path }: { path: string[] }) {
    if (!path || path.length === 0) return null;
    return (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">✦ IMPACT CHAIN</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
                {path.map((item, i) => (
                    <span key={i} className="flex items-center gap-2">
                        <span className={i === path.length - 1 ? "text-cyan-400 font-medium" : "text-slate-200"}>
                            {item}
                        </span>
                        {i < path.length - 1 && <ChevronRight size={14} className="text-slate-500" />}
                    </span>
                ))}
            </div>
        </div>
    );
}

// 单条情报卡片
function BriefingCard({ article, polarity }: { article: any; polarity: string }) {
    const timeAgo = "2h ago"; // 简化处理
    return (
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
            {/* 右侧装饰图 */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-3xl" />

            {/* 来源 + 情绪徽章 */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                        {article.source_name?.[0] || "B"}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{article.source_name || "Bloomberg"} • {timeAgo}</span>
                </div>
                <SentimentBadge polarity={polarity} />
            </div>

            {/* 标题 */}
            <h3 className="text-xl font-bold text-white leading-snug mb-4 pr-8">
                {article.title}
            </h3>

            {/* Impact Chain */}
            <ImpactChain path={article.impacts?.map((i: any) => `${i.entity} ${i.trend}`) || ["Supply Increase", "Auto Production Up", "Margin Recovery"]} />

            {/* 标签 + 操作 */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                <div className="flex gap-2">
                    {(article.tags || ["#Industry", "#Tech"]).slice(0, 2).map((tag: string, i: number) => (
                        <span key={i} className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                            {tag.startsWith("#") ? tag : `#${tag}`}
                        </span>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => triggerHaptic("light")} className="text-slate-500 hover:text-white transition-colors">
                        <Bookmark size={18} />
                    </button>
                    <button onClick={() => triggerHaptic("light")} className="text-slate-500 hover:text-white transition-colors">
                        <Share2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export function DailyBriefing({ onBack }: DailyBriefingProps) {
    const [data, setData] = useState<DailyBriefingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("forYou");

    useEffect(() => {
        fetchDailyBriefing()
            .then(res => {
                setData(res);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    const handleBack = () => {
        triggerHaptic("light");
        onBack();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!data) return <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">Failed to load</div>;

    const tabs = [
        { id: "forYou", label: "For You" },
        { id: "trending", label: "Trending" },
        { id: "sectors", label: "Sectors" },
    ];

    return (
        <div className="min-h-screen bg-[#0D0D0D] text-white font-display antialiased">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                    <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-slate-800 active:scale-95 transition-all">
                        <ArrowLeft size={22} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-sm font-bold">
                            👤
                        </div>
                        <span className="text-lg font-bold">Briefing</span>
                    </div>
                </div>
                <button className="p-2 rounded-full hover:bg-slate-800 transition-colors">
                    <Search size={20} />
                </button>
            </header>

            {/* Tabs */}
            <div className="px-4 py-3 flex gap-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.id
                                ? "bg-white text-black"
                                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Cards */}
            <main className="px-4 pb-24 space-y-4">
                {data.top_picks.map((article, idx) => (
                    <BriefingCard
                        key={article.id || idx}
                        article={article}
                        polarity={article.polarity || (idx % 3 === 0 ? "positive" : idx % 3 === 1 ? "negative" : "neutral")}
                    />
                ))}
            </main>
        </div>
    );
}

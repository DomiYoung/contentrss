import { useState, useEffect } from "react";
import {
    ArrowLeft, Share2, Calendar, TrendingUp, Sparkles, ChevronRight, Star
} from "lucide-react";
import { fetchDailyBriefing } from "@/lib/api";
import { triggerHaptic } from "@/lib/haptic";
import { PageSkeleton } from "@/components/PageSkeleton";
import { usePersona } from "@/context/PersonaContext";
import type { DailyBriefingData } from "@/types/briefing";

interface DailyBriefingProps {
    onBack: () => void;
}

// 编辑寄语区域
function EditorNote({ date }: { date: string }) {
    return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-100/50">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Sparkles size={18} className="text-white" />
                </div>
                <div>
                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">编辑寄语</p>
                    <p className="text-xs text-gray-500">{date}</p>
                </div>
            </div>
            <p className="text-[15px] text-gray-800 leading-relaxed font-medium">
                早安！今日科技圈风起云涌，AI 芯片供应链持续紧张，新能源汽车市场迎来重要拐点。
                我们为您精选了最具价值的行业洞察，助您把握先机。
            </p>
        </div>
    );
}

// 今日焦点 - 大卡片
function FeaturedStory({ article }: { article: any }) {
    if (!article) return null;
    return (
        <div className="relative overflow-hidden rounded-[40px] bg-gray-900 shadow-2xl shadow-blue-900/10 active:scale-[0.98] transition-all group">
            {/* 背景渐变 */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-indigo-900/30" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />

            <div className="relative p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="px-3 py-1 bg-amber-400 rounded-full flex items-center gap-1.5 shadow-lg shadow-amber-400/20">
                        <Star size={12} className="text-gray-900 fill-gray-900" />
                        <span className="text-[10px] text-gray-900 font-black uppercase tracking-widest">今日焦点</span>
                    </div>
                </div>

                <h2 className="text-[26px] font-black text-white leading-[1.2] mb-4 tracking-tighter">
                    {article.title}
                </h2>

                <p className="text-[15px] text-blue-100/70 leading-relaxed mb-8 line-clamp-2 font-medium">
                    {article.summary}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black text-white">
                            {article.source_name?.charAt(0) || "S"}
                        </div>
                        <span className="text-xs font-black text-white/60 tracking-tight">{article.source_name || "MOSS Insight"}</span>
                    </div>
                    <button className="flex items-center gap-1.5 text-blue-300 text-sm font-black uppercase tracking-widest">
                        READ <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// 市场脉搏区域
function MarketPulse() {
    const trends = [
        { label: "AI 芯片", trend: "+12%", positive: true },
        { label: "新能源车", trend: "+8%", positive: true },
        { label: "消费电子", trend: "-3%", positive: false },
    ];

    return (
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-blue-600" />
                <span className="text-sm font-bold text-gray-900">市场脉搏</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {trends.map((item, i) => (
                    <div key={i} className="text-center">
                        <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                        <p className={`text-lg font-bold ${item.positive ? "text-emerald-600" : "text-rose-600"}`}>
                            {item.trend}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// 编辑精选卡片
function CuratedCard({ article, index }: { article: any; index: number }) {
    return (
        <div className="flex gap-5 py-6 border-b border-gray-50 last:border-0 active:bg-gray-50 transition-all px-2 -mx-2 rounded-2xl group">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-[11px] font-black text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {String(index + 1).padStart(2, '0')}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-[17px] font-black text-gray-900 leading-[1.4] mb-2 line-clamp-2 tracking-tight">
                    {article.title}
                </h3>
                <div className="flex items-center gap-3 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                    <span className="text-gray-500">{article.source_name || "SOURCE"}</span>
                    <div className="w-1 h-1 rounded-full bg-gray-200" />
                    <span>3 MIN READ</span>
                </div>
            </div>
            <ChevronRight size={18} className="text-gray-200 flex-shrink-0 mt-3 group-hover:text-blue-600 transition-colors" />
        </div>
    );
}

// --- Main View ---

export function DailyBriefing({ onBack }: DailyBriefingProps) {
    const [data, setData] = useState<DailyBriefingData | null>(null);
    const [loading, setLoading] = useState(true);

    const today = new Date().toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long"
    });

    const { currentPersona } = usePersona();

    useEffect(() => {
        setLoading(true);
        fetchDailyBriefing(currentPersona.id)
            .then(res => {
                setData(res);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [currentPersona.id]);

    const handleBack = () => {
        triggerHaptic("light");
        onBack();
    };

    if (loading) {
        return <PageSkeleton hasTabs={false} itemCount={4} />;
    }

    if (!data) return <div className="h-full flex flex-col items-center justify-center bg-white text-gray-900">Failed to load</div>;

    // 将数据分为焦点和精选
    const featured = data.top_picks[0];
    const curated = data.top_picks.slice(1, 6);

    return (
        <div className="h-full flex flex-col bg-white text-gray-900">
            {/* Fixed Header */}
            <header className="flex-shrink-0 bg-white/95 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
                        <ArrowLeft size={22} className="text-gray-900" />
                    </button>
                    <div>
                        <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">Daily Newsletter</p>
                        <h1 className="text-lg font-black text-gray-900 -mt-0.5">今日内参</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
                        <Calendar size={20} />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
                        <Share2 size={20} />
                    </button>
                </div>
            </header>

            {/* Scrollable Content - Newsletter Style */}
            <main className="flex-1 overflow-y-auto">
                <div className="px-5 py-6 space-y-6 pb-24">
                    {/* 编辑寄语 */}
                    <EditorNote date={today} />

                    {/* 今日焦点 */}
                    <FeaturedStory article={featured} />

                    {/* 市场脉搏 */}
                    <MarketPulse />

                    {/* 编辑精选 */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={14} className="text-gray-400" />
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">编辑精选</span>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 px-4">
                            {curated.map((article, idx) => (
                                <CuratedCard key={article.id || idx} article={article} index={idx} />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

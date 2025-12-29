import { useState, useEffect } from "react";
import { ArrowLeft, Bookmark, Share2, Pin } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { BottomBar } from "@/components/article/BottomBar";
import { PosterOverlay } from "@/components/viral/PosterOverlay";
import { AskAIOverlay } from "@/components/article/AskAIOverlay";
import { NotePad } from "@/components/article/NotePad";
import { fetchArticle } from "@/lib/api";
import { triggerHaptic } from "@/lib/haptic";
import type { ArticleDetailData } from "@/types/article";
import { cn } from "@/lib/utils";

interface ArticleDetailProps {
    id: number;
    onBack: () => void;
}

export function ArticleDetail({ id, onBack }: ArticleDetailProps) {
    const [article, setArticle] = useState<ArticleDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeOverlay, setActiveOverlay] = useState<"poster" | "ask" | "note" | null>(null);

    const x = useMotionValue(0);
    const opacity = useTransform(x, [0, 150], [1, 0.5]);

    useEffect(() => {
        fetchArticle(id)
            .then(data => {
                setArticle(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(`❌ Failed to fetch article ${id}:`, err);
                setError(err.message || "文章加载失败");
                setLoading(false);
            });
    }, [id]);

    const handleBack = () => {
        triggerHaptic("light");
        onBack();
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-white">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
            </div>
        );
    }

    if (!article) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-white text-gray-900 px-6">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-6">📭</div>
                    <h2 className="text-xl font-bold mb-2">文章不存在</h2>
                    <p className="text-gray-500 mb-6">
                        {error || `文章 ID ${id} 不存在或已被删除`}
                    </p>
                    <button
                        onClick={handleBack}
                        className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-medium hover:bg-gray-800 transition-colors"
                    >
                        返回列表
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            style={{ x, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 300 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
                if (info.offset.x > 80) handleBack();
            }}
            className="h-full flex flex-col bg-white text-gray-900"
        >
            {/* Fixed Header */}
            <header className="flex-shrink-0 bg-white/95 backdrop-blur-md z-50 px-5 py-4 flex items-center justify-between border-b border-gray-100">
                <button onClick={handleBack} className="p-2 -ml-2 text-gray-900 active:scale-90 transition-transform rounded-full hover:bg-gray-100">
                    <ArrowLeft size={22} />
                </button>
                <div className="flex items-center gap-1">
                    <button className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100"><Bookmark size={20} /></button>
                    <button className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100" onClick={() => setActiveOverlay("poster")}><Share2 size={20} /></button>
                </div>
            </header>

            {/* Scrollable Content */}
            <main className="flex-1 overflow-y-auto pb-32">
                <article className="px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Meta Labels - Category Only at Top */}
                    <div className="flex items-center gap-3 mb-6">
                        <span className="bg-blue-900 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg shadow-blue-100">
                            {article.tags?.[0] || 'Intelligence'}
                        </span>
                        <div className="h-px bg-gray-100 flex-1" />
                        <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                            {article.source_name || 'MOSS INSIGHT'}
                        </span>
                    </div>

                    <h1 className="text-[36px] font-black leading-[1.05] text-gray-900 tracking-tighter mb-8 font-display">
                        {article.title}
                    </h1>

                    {/* Source Information - Subtitle Style */}
                    {article.source_name && (
                        <div className="flex items-center gap-2 mb-10 pb-6 border-b border-gray-50">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-400">
                                {article.source_name[0]}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-gray-900 leading-none mb-1">来源: {article.source_name}</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Verified Source · High Integrity</span>
                            </div>
                        </div>
                    )}

                    <div className="relative">
                        <div className="absolute -left-6 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full opacity-20" />
                        <p className="text-[18px] text-gray-500 leading-relaxed mb-12 font-medium italic">
                            {article.summary}
                        </p>
                    </div>

                    {/* Key Takeaways Card */}
                    <div className="bg-gray-50 rounded-[40px] p-8 mb-16 border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 rounded-full -mr-24 -mt-24 blur-3xl transition-transform group-hover:scale-125" />
                        <h3 className="text-[20px] font-black text-gray-900 flex items-center gap-3 mb-8 relative z-10">
                            <Pin className="text-blue-600 rotate-12" size={22} strokeWidth={3} />
                            关键见解
                        </h3>
                        <div className="space-y-8 relative z-10">
                            {article.takeaways?.slice(0, 3).map((take: string, i: number) => {
                                const parts = take.includes(':') ? take.split(':') : take.split('：');
                                return (
                                    <div key={i} className="flex gap-5 items-start">
                                        <div className="mt-2 w-2 h-2 rounded-full bg-blue-600 shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                                        <div className="flex-1">
                                            {parts.length > 1 ? (
                                                <>
                                                    <p className="text-[16px] font-black text-gray-900 leading-tight mb-2 tracking-tight">{parts[0]}</p>
                                                    <p className="text-[15px] text-gray-600 leading-relaxed font-medium">{parts[1]}</p>
                                                </>
                                            ) : (
                                                <p className="text-[16px] text-gray-800 leading-relaxed font-bold tracking-tight">{take}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            }) || (
                                    <div className="flex gap-4 items-start">
                                        <div className="mt-2 w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                                        <p className="text-[16px] text-gray-700 leading-relaxed font-bold">AI 实时分析已完成，该趋势预计在 6 个月内形成规模效应。</p>
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="prose prose-gray prose-lg mb-16 px-1">
                        {article.content.split("\n\n").map((para, i) => (
                            <p
                                key={i}
                                className={cn(
                                    "text-[19px] leading-[1.85] text-gray-800 font-medium tracking-tight mb-8 text-justify",
                                    i === 0 && "first-letter:float-left first-letter:text-[5.5rem] first-letter:font-black first-letter:leading-[0.75] first-letter:mr-4 first-letter:mt-3 first-letter:text-gray-900 first-letter:drop-shadow-sm"
                                )}
                            >
                                {para}
                            </p>
                        ))}
                    </div>

                    {/* Article Footer - Time & Source URL */}
                    <div className="pt-12 border-t border-gray-100 space-y-4">
                        <div className="flex items-center justify-between text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <span>发布于</span>
                            <span>{new Date().toLocaleDateString("zh-CN", { year: 'numeric', month: "long", day: "numeric", weekday: "long" })}</span>
                        </div>
                        {article.original_url && (
                            <a
                                href={article.original_url}
                                target="_blank"
                                rel="noreferrer"
                                className="block w-full text-center py-4 bg-gray-50 rounded-2xl text-[12px] font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest border border-gray-100"
                            >
                                查看原始链接
                            </a>
                        )}
                        <div className="py-8 text-center">
                            <div className="inline-block w-8 h-1 bg-gray-100 rounded-full" />
                        </div>
                    </div>
                </article>
            </main>

            <BottomBar
                onShare={() => setActiveOverlay("poster")}
                onAskAI={() => setActiveOverlay("ask")}
                onNote={() => setActiveOverlay("note")}
                onSave={() => triggerHaptic("success")}
            />

            <PosterOverlay isOpen={activeOverlay === "poster"} onClose={() => setActiveOverlay(null)} data={article} />
            <AskAIOverlay isOpen={activeOverlay === "ask"} onClose={() => setActiveOverlay(null)} articleTitle={article.title} />
            <NotePad isOpen={activeOverlay === "note"} onClose={() => setActiveOverlay(null)} articleId={article.id} />
        </motion.div>
    );
}

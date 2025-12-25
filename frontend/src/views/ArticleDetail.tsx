import { useState, useEffect } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { TheBrain } from "@/components/article/TheBrain";
import { BottomBar } from "@/components/article/BottomBar";
import { PosterOverlay } from "@/components/viral/PosterOverlay";
import { AskAIOverlay } from "@/components/article/AskAIOverlay";
import { NotePad } from "@/components/article/NotePad";
import { fetchArticle } from "@/lib/api";
import { triggerHaptic } from "@/lib/haptic";
import type { ArticleDetailData } from "@/types/article";

interface ArticleDetailProps {
    id: number;
    onBack: () => void;
}

export function ArticleDetail({ id, onBack }: ArticleDetailProps) {
    const [article, setArticle] = useState<ArticleDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeOverlay, setActiveOverlay] = useState<"poster" | "ask" | "note" | null>(null);

    // Swipe to dismiss logic
    const x = useMotionValue(0);
    const opacity = useTransform(x, [0, 150], [1, 0.5]);
    const scale = useTransform(x, [0, 150], [1, 0.98]);

    useEffect(() => {
        fetchArticle(id)
            .then(data => {
                setArticle(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [id]);

    const handleBack = () => {
        triggerHaptic("light");
        onBack();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
                <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Intelligence Briefing</span>
            </div>
        );
    }

    if (!article) return <div>Error loading article</div>;

    return (
        <motion.div
            style={{ x, opacity, scale }}
            drag="x"
            dragConstraints={{ left: 0, right: 300 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
                if (info.offset.x > 100) {
                    handleBack();
                }
            }}
            className="min-h-screen bg-white pb-24 relative touch-pan-y"
        >
            {/* Header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-md z-20 px-4 h-14 flex items-center justify-between border-b border-zinc-100">
                <button onClick={handleBack} className="p-2 -ml-2 text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors active:scale-90">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-zinc-900 uppercase tracking-[0.2em]">Industry Report</span>
                    <span className="text-[8px] text-zinc-400 font-mono">ID: {id}</span>
                </div>
                <button className="p-2 -mr-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                    <ExternalLink size={20} />
                </button>
            </div>

            {/* Body */}
            <article className="px-6 pt-10 pb-32 max-w-screen-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">

                <h1 className="text-4xl font-black font-display text-zinc-900 leading-[1.1] mb-8 tracking-tighter">
                    {article.title}
                </h1>

                <div className="flex items-center gap-4 text-[11px] text-zinc-400 mb-10 pb-6 border-b border-zinc-50">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-zinc-900 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                            {article.source_name?.[0] || "I"}
                        </div>
                        <span className="font-bold text-zinc-900">{article.source_name}</span>
                    </div>
                    <span>·</span>
                    <span className="font-mono uppercase">{new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}</span>
                </div>

                <TheBrain summary={article.summary} polarity={article.polarity} />

                <div className="mt-12 text-zinc-800 space-y-6">
                    {article.content.split("\n\n").map((para, idx) => (
                        <p key={idx} className="font-serif text-[18px] leading-[1.8] tracking-normal">
                            {para.startsWith("##") ? (
                                <span className="block font-sans font-black text-xl text-zinc-900 mt-12 mb-4 tracking-tight">
                                    {para.replace("## ", "")}
                                </span>
                            ) : para.startsWith("###") ? (
                                <span className="block font-sans font-bold text-lg text-zinc-900 mt-8 mb-3">
                                    {para.replace("### ", "")}
                                </span>
                            ) : (
                                para
                            )}
                        </p>
                    ))}
                </div>
            </article>

            <BottomBar
                onShare={() => setActiveOverlay("poster")}
                onAskAI={() => setActiveOverlay("ask")}
                onNote={() => setActiveOverlay("note")}
                onSave={() => {
                    triggerHaptic("success");
                    alert("Intelligence Stored");
                }}
            />

            <PosterOverlay
                isOpen={activeOverlay === "poster"}
                onClose={() => setActiveOverlay(null)}
                data={article}
            />

            <AskAIOverlay
                isOpen={activeOverlay === "ask"}
                onClose={() => setActiveOverlay(null)}
                articleTitle={article.title}
            />

            <NotePad
                isOpen={activeOverlay === "note"}
                onClose={() => setActiveOverlay(null)}
                articleId={article.id}
            />
        </motion.div>
    );
}

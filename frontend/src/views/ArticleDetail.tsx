import { useState, useEffect } from "react";
import { ArrowLeft, ExternalLink, Bookmark, Share2, Pin } from "lucide-react";
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
    const [activeOverlay, setActiveOverlay] = useState<"poster" | "ask" | "note" | null>(null);

    const x = useMotionValue(0);
    const opacity = useTransform(x, [0, 150], [1, 0.5]);

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
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
            </div>
        );
    }

    if (!article) return <div>Error loading article</div>;

    return (
        <motion.div
            style={{ x, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 300 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
                if (info.offset.x > 80) handleBack();
            }}
            className="min-h-screen bg-white pb-32"
        >
            {/* Header: Ref uploaded_image_2 */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-xl z-50 px-4 h-14 flex items-center justify-between">
                <button onClick={handleBack} className="p-2 -ml-2 text-zinc-900 active:scale-90 transition-transform">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex items-center gap-1">
                    <button className="p-2 text-zinc-900"><Bookmark size={20} /></button>
                    <button className="p-2 text-zinc-900" onClick={() => setActiveOverlay("poster")}><Share2 size={20} /></button>
                </div>
            </div>

            <article className="max-w-md mx-auto px-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Meta Labels */}
                <div className="flex items-center gap-3 mb-4">
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">Daily Briefing</span>
                    <span className="text-[11px] text-zinc-400 font-medium">
                        {new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric" })} · 5 min read
                    </span>
                </div>

                <h1 className="text-[32px] font-black leading-[1.1] text-zinc-900 tracking-tighter mb-6 font-display">
                    {article.title}
                </h1>

                <p className="text-[17px] text-zinc-500 leading-relaxed mb-10 font-medium">
                    {article.summary.slice(0, 150)}...
                </p>

                {/* Key Takeaways Card: Ref uploaded_image_2 */}
                <div className="bg-blue-50/50 rounded-[32px] p-6 mb-12 border border-blue-100/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <h3 className="text-[18px] font-black text-zinc-900 flex items-center gap-2.5 mb-6 relative z-10">
                        <Pin className="text-blue-600 rotate-12" size={20} strokeWidth={3} />
                        关键要点
                    </h3>
                    <ul className="space-y-6 relative z-10">
                        {article.takeaways?.slice(0, 3).map((take, i) => (
                            <li key={i} className="flex gap-4 items-start group">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 group-hover:scale-150 transition-transform" />
                                <div>
                                    <p className="text-[15px] font-black text-zinc-900 leading-tight mb-1">{take.split(':')[0]}</p>
                                    <p className="text-[14px] text-zinc-600 leading-relaxed font-medium">{take.split(':')[1] || take}</p>
                                </div>
                            </li>
                        )) || (
                                <li className="flex gap-4 items-start">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                                    <p className="text-[15px] text-zinc-700 leading-relaxed font-medium">AI Insights indicate a strong market shift toward sustainable architectures.</p>
                                </li>
                            )}
                    </ul>
                </div>

                {/* Content with Drop Cap: Ref uploaded_image_2 */}
                <div className="prose prose-zinc prose-lg">
                    {article.content.split("\n\n").map((para, i) => (
                        <p
                            key={i}
                            className={cn(
                                "text-[18px] leading-[1.8] text-zinc-800 font-medium tracking-tight mb-6",
                                i === 0 && "first-letter:float-left first-letter:text-[4.5rem] first-letter:font-black first-letter:leading-[0.8] first-letter:mr-3 first-letter:mt-2 first-letter:text-blue-600"
                            )}
                        >
                            {para}
                        </p>
                    ))}
                </div>
            </article>

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

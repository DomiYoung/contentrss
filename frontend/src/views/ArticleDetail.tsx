import { useState, useEffect } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { TheBrain } from "@/components/article/TheBrain";
import { BottomBar } from "@/components/article/BottomBar";
import { PosterOverlay } from "@/components/viral/PosterOverlay";
import { fetchArticle } from "@/lib/api";
import type { ArticleDetailData } from "@/types/article";
// import ReactMarkdown from 'react-markdown';

interface ArticleDetailProps {
    id: number;
    onBack: () => void;
}

export function ArticleDetail({ id, onBack }: ArticleDetailProps) {
    const [article, setArticle] = useState<ArticleDetailData | null>(null);
    const [loading, setLoading] = useState(true);

    const [showPoster, setShowPoster] = useState(false);

    useEffect(() => {
        fetchArticle(id)
            .then(data => {
                setArticle(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return <div className="min-h-screen bg-white flex items-center justify-center text-zinc-400 animate-pulse">Loading Intelligence...</div>;
    }

    if (!article) return <div>Error loading article</div>;

    return (
        <div className="min-h-screen bg-white pb-24 relative">
            {/* Header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-md z-20 px-4 h-14 flex items-center justify-between border-b border-zinc-100">
                <button onClick={onBack} className="p-2 -ml-2 text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Confidential</span>
                <button className="p-2 -mr-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                    <ExternalLink size={20} />
                </button>
            </div>

            {/* Body */}
            <article className="px-6 pt-8 pb-32 max-w-screen-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

                <h1 className="text-3xl font-black font-display text-zinc-900 leading-[1.2] mb-6 tracking-tight">
                    {article.title}
                </h1>

                <div className="flex items-center gap-3 text-xs text-zinc-400 mb-6">
                    <span className="font-medium text-zinc-900">{article.source_name}</span>
                    <span>·</span>
                    <span>{new Date().toLocaleDateString()}</span>
                </div>

                <TheBrain summary={article.summary} polarity={article.polarity} />

                <div className="prose prose-zinc prose-p:font-serif prose-p:text-[17px] prose-p:leading-[1.8] prose-headings:font-sans prose-headings:font-bold mt-8 text-zinc-800">
                    {/* Simple Content Render for MVP - Replace with ReactMarkdown if needed */}
                    <div className="whitespace-pre-wrap font-serif">
                        {article.content}
                    </div>
                </div>
            </article>

            <BottomBar
                onShare={() => setShowPoster(true)}
                onSave={() => alert("Saved to Collection")}
            />

            <PosterOverlay
                isOpen={showPoster}
                onClose={() => setShowPoster(false)}
                data={article}
            />
        </div>
    );
}

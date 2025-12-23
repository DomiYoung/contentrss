import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Share, Bookmark, Calendar, Sparkles, Clock, CheckCircle } from "lucide-react";
import { IntelligenceCard } from "@/components/IntelligenceCard";
import { ImpactChain } from "@/components/article/ImpactChain";
import { FrameworkVisual } from "@/components/article/FrameworkVisual";
import { fetchDailyBriefing } from "@/lib/api";
import type { DailyBriefingData } from "@/types/briefing";

interface DailyBriefingProps {
    onBack: () => void;
}

export function DailyBriefing({ onBack }: DailyBriefingProps) {
    const [data, setData] = useState<DailyBriefingData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDailyBriefing()
            .then(res => {
                setData(res);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 space-y-6">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-2 border-zinc-100 border-t-zinc-900 rounded-full"
                />
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em]">Publishing...</p>
            </div>
        );
    }

    if (!data) return <div>Failed to load briefing</div>;

    return (
        <div className="min-h-screen bg-white text-zinc-900 pb-20 selection:bg-zinc-900 selection:text-white">
            {/* Elite Navbar */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-30 px-6 h-16 flex items-center justify-between border-b border-zinc-50">
                <button onClick={onBack} className="p-2 -ml-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex gap-6 items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Lenny's Style Edition</span>
                    <button className="text-zinc-400 hover:text-zinc-900 transition-colors"><Bookmark size={18} /></button>
                    <button className="text-zinc-400 hover:text-zinc-900 transition-colors"><Share size={18} /></button>
                </div>
            </div>

            <main className="max-w-[640px] mx-auto px-6 pt-12">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                            <Calendar size={12} />
                            <span>{new Date(data.date).toLocaleDateString()}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-zinc-200" />
                        <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                            <Clock size={12} />
                            <span>{data.read_time}</span>
                        </div>
                    </div>

                    <h1 className="text-5xl font-black tracking-tight text-zinc-900 leading-[1.05] mb-6 font-serif">
                        {data.title}
                    </h1>

                    {data.subtitle && (
                        <p className="text-xl text-zinc-500 font-medium leading-relaxed mb-10">
                            {data.subtitle}
                        </p>
                    )}

                    <div className="flex items-center gap-3 p-1 pr-4 bg-zinc-50 rounded-full w-fit border border-zinc-100">
                        <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-[10px] font-black text-white">AI</div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Editorial Analysis</span>
                    </div>
                </motion.div>

                <div className="h-px bg-zinc-100 w-full mb-16" />

                {/* Key Takeaways - The Lenny Touch */}
                <section className="mb-20">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 mb-8">Key Takeaways</h3>
                    <div className="space-y-6">
                        {data.takeaways.map((task, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex gap-4 items-start"
                            >
                                <CheckCircle className="text-emerald-500 mt-0.5 shrink-0" size={20} />
                                <p className="text-lg font-bold text-zinc-800 leading-snug">{task}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Narrative Synthesis */}
                <article className="prose prose-zinc max-w-none mb-20">
                    <div className="text-2xl font-medium leading-relaxed font-serif text-zinc-800 mb-12 space-y-6">
                        {data.synthesis.split('\n\n').map((paragraph, i) => (
                            <p key={i} className={i === 0 ? "first-letter:text-6xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8] first-letter:text-zinc-900" : ""}>
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </article>

                {/* Framework Visual */}
                {data.framework && <FrameworkVisual data={data.framework} />}

                {/* Impact Chain */}
                <ImpactChain data={data.impact_chain} />

                {/* The Core Feed (Embedded) */}
                <section className="mt-24">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900">The Intelligence Core</h2>
                        <span className="text-[10px] font-bold text-zinc-400">{data.top_picks.length} Evidence Points</span>
                    </div>

                    <div className="space-y-4">
                        {data.top_picks.map((article) => (
                            <IntelligenceCard key={article.id} data={article} />
                        ))}
                    </div>
                </section>

                {/* Bottom CTA */}
                <footer className="mt-32 pb-20 border-t border-zinc-100 pt-16 text-center">
                    <p className="text-sm text-zinc-400 font-medium mb-8">Stay ahead of the market convergence.</p>
                    <button className="px-8 py-4 bg-zinc-900 text-white rounded-full text-sm font-black active:scale-95 transition-all shadow-xl shadow-zinc-200">
                        Subscribe to Premium
                    </button>
                </footer>
            </main>
        </div>
    );
}

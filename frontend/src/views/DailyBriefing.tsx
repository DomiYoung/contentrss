import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Share, Bookmark, Calendar, Clock, CheckCircle, ShieldCheck } from "lucide-react";
import { IntelligenceCard } from "@/components/IntelligenceCard";
import { ImpactChain } from "@/components/article/ImpactChain";
import { FrameworkVisual } from "@/components/article/FrameworkVisual";
import { fetchDailyBriefing } from "@/lib/api";
import { triggerHaptic } from "@/lib/haptic";
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

    const handleBack = () => {
        triggerHaptic("light");
        onBack();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-8 space-y-6">
                <div className="w-12 h-12 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.4em]">Compiling Narrative...</p>
            </div>
        );
    }

    if (!data) return <div>Failed to load briefing</div>;

    return (
        <div className="min-h-screen bg-[#FAF9F6] text-zinc-900 pb-20 selection:bg-zinc-900 selection:text-white">
            {/* Elite V2 Navbar */}
            <div className="sticky top-0 bg-[#FAF9F6]/90 backdrop-blur-2xl z-40 px-6 h-16 flex items-center justify-between border-b border-zinc-200/50">
                <button onClick={handleBack} className="p-2 -ml-2 text-zinc-900 hover:bg-zinc-100 rounded-full transition-all active:scale-90">
                    <ArrowLeft size={22} />
                </button>
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                        <ShieldCheck size={10} className="text-zinc-900" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">Intelligence Brief</span>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <button onClick={() => { triggerHaptic("medium"); }} className="text-zinc-400 hover:text-zinc-900"><Bookmark size={20} /></button>
                    <button onClick={() => { triggerHaptic("medium"); }} className="text-zinc-400 hover:text-zinc-900"><Share size={20} /></button>
                </div>
            </div>

            <main className="max-w-[680px] mx-auto px-6 pt-16">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-20"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex items-center gap-2 text-zinc-400 text-[11px] font-bold uppercase tracking-widest font-mono">
                            <Calendar size={14} />
                            <span>{new Date(data.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-zinc-300" />
                        <div className="flex items-center gap-2 text-zinc-400 text-[11px] font-bold uppercase tracking-widest font-mono">
                            <Clock size={14} />
                            <span>{data.read_time} READ</span>
                        </div>
                    </div>

                    <h1 className="text-6xl font-black tracking-tighter text-zinc-900 leading-[0.95] mb-8 font-display">
                        {data.title}
                    </h1>

                    {data.subtitle && (
                        <p className="text-2xl text-zinc-500 font-medium leading-relaxed mb-12 max-w-[540px]">
                            {data.subtitle}
                        </p>
                    )}

                    <div className="flex items-center gap-3 p-1.5 pr-5 bg-white shadow-sm border border-zinc-200/60 rounded-full w-fit">
                        <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-xs font-black text-white">OS</div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">System Analysis</span>
                            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-tighter">Verified Content</span>
                        </div>
                    </div>
                </motion.div>

                {/* Key Takeaways */}
                <section className="mb-24 p-10 bg-white rounded-[40px] border border-zinc-200/50 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 scale-150 opacity-[0.03] rotate-12">
                        <ShieldCheck size={120} />
                    </div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-10">Executive Takeaways</h3>
                    <div className="space-y-8">
                        {data.takeaways.map((task, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 + 0.5 }}
                                className="flex gap-6 items-start"
                            >
                                <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mt-1">
                                    <CheckCircle className="text-emerald-600" size={14} strokeWidth={3} />
                                </div>
                                <p className="text-xl font-bold text-zinc-800 leading-tight tracking-tight">{task}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Narrative Synthesis */}
                <article className="mb-24">
                    <div className="text-[22px] font-medium leading-[1.6] font-serif text-zinc-800 space-y-8">
                        {data.synthesis.split('\n\n').map((paragraph, i) => (
                            <p key={i} className={i === 0 ? "first-letter:text-7xl first-letter:font-black first-letter:mr-4 first-letter:float-left first-letter:leading-[0.85] first-letter:text-zinc-900 first-letter:mt-1" : ""}>
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </article>

                {/* Data Visuals */}
                <div className="space-y-16 mb-24">
                    {data.framework && <FrameworkVisual data={data.framework} />}
                    <ImpactChain data={data.impact_chain} />
                </div>

                {/* The Core Feed */}
                <section className="mt-32 pb-32">
                    <div className="flex items-center justify-between mb-16 border-b border-zinc-200/50 pb-6">
                        <div className="flex flex-col">
                            <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900">Intelligence Evidence</h2>
                            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mt-1">Foundational Signals</span>
                        </div>
                        <div className="px-4 py-1.5 bg-zinc-100 rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">
                            {data.top_picks.length} Items
                        </div>
                    </div>

                    <div className="space-y-2">
                        {data.top_picks.map((article) => (
                            <IntelligenceCard key={article.id} data={article} />
                        ))}
                    </div>
                </section>

                {/* Footer Status */}
                <footer className="mt-20 pb-20 pt-16 border-t border-zinc-200/50 text-center flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white font-black mb-8 shadow-xl shadow-zinc-200">OS</div>
                    <p className="text-sm text-zinc-400 font-bold uppercase tracking-[0.2em] mb-4">Market Convergence Protocol</p>
                    <div className="flex items-center gap-2 mb-12">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-widest text-emerald-600/60">System Synchronized</span>
                    </div>
                </footer>
            </main>
        </div>
    );
}

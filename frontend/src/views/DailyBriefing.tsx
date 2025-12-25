import { useState, useEffect } from "react";
import {
    ArrowLeft, Bookmark, Share2,
    Pin, BarChart2, Link as LinkIcon, FolderOpen,
    ExternalLink, TrendingUp
} from "lucide-react";
import { fetchDailyBriefing } from "@/lib/api";
import { triggerHaptic } from "@/lib/haptic";
import type { DailyBriefingData } from "@/types/briefing";

interface DailyBriefingProps {
    onBack: () => void;
}

export function DailyBriefing({ onBack }: DailyBriefingProps) {
    const [data, setData] = useState<DailyBriefingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
            <div className="min-h-screen bg-background-light flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!data) return <div>Failed to load briefing</div>;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display antialiased text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-surface-dark relative shadow-xl overflow-hidden">
                {/* Sticky Nav */}
                <nav className={`sticky top-0 z-50 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md border-b border-gray-100 dark:border-white/5 px-4 h-14 flex items-center justify-between transition-all ${scrolled ? 'shadow-sm' : ''}`}>
                    <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-transform text-gray-800 dark:text-white">
                        <ArrowLeft size={24} strokeWidth={1.5} />
                    </button>
                    <h1
                        className={`text-base font-bold text-gray-900 dark:text-white transition-all duration-300 ${scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                    >
                        情报简报
                    </h1>
                    <div className="flex items-center gap-1">
                        <button onClick={() => triggerHaptic("medium")} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-transform text-gray-800 dark:text-white">
                            <Bookmark size={22} strokeWidth={1.5} />
                        </button>
                        <button onClick={() => triggerHaptic("medium")} className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 active:scale-95 transition-transform text-gray-800 dark:text-white">
                            <Share2 size={22} strokeWidth={1.5} />
                        </button>
                    </div>
                </nav>

                <main className="pb-20">
                    <header className="px-5 pt-6 pb-2">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2 py-1 rounded">Daily Briefing</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {new Date(data.date).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })} · {data.read_time}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white tracking-tight mb-4">
                            {data.title.includes(" ") ? (
                                <>
                                    {data.title.split(" ")[0]} <br />
                                    <span className="text-gray-900 dark:text-gray-100">{data.title.substring(data.title.indexOf(" ") + 1)}</span>
                                </>
                            ) : data.title}
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                            {data.subtitle || "AI technology surge creates new opportunities across the supply chain."}
                        </p>
                    </header>
                    <div className="h-6"></div>

                    {/* Key Takeaways */}
                    <section className="px-5">
                        <div className="bg-background-light dark:bg-white/5 rounded-xl p-5 border border-primary/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 pointer-events-none"></div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4 relative z-10">
                                <Pin className="text-primary" size={20} />
                                关键要点
                            </h3>
                            <ul className="space-y-3 relative z-10">
                                {data.takeaways.map((point, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                                        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                                            {point}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                    <div className="h-8"></div>

                    {/* Narrative */}
                    <section className="px-5">
                        <div className="prose prose-lg dark:prose-invert text-gray-800 dark:text-gray-200 leading-7">
                            {data.synthesis.split('\n\n').map((para, i) => (
                                <p key={i} className={`mt-4 ${i === 0 ? 'first-letter:float-left first-letter:text-[3.5rem] first-letter:leading-[0.8] first-letter:font-bold first-letter:mr-3 first-letter:mt-1 first-letter:text-primary' : ''}`}>
                                    {para}
                                </p>
                            ))}
                        </div>
                    </section>
                    <div className="h-10"></div>

                    {/* Analysis Framework */}
                    <section className="px-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <BarChart2 className="text-primary" size={20} />
                                分析框架
                            </h3>
                            <span className="text-xs text-gray-400 font-medium bg-gray-100 dark:bg-white/10 px-2 py-1 rounded">Risk vs Opportunity</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5">
                            <div className="relative w-full aspect-[4/3] grid grid-cols-2 grid-rows-2 gap-1.5">
                                {/* Low Risk / High Growth */}
                                <div className="bg-white dark:bg-white/10 rounded-lg p-3 flex flex-col justify-between shadow-sm">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold">Low Risk / High Growth</span>
                                    <div className="text-sm font-bold text-primary">Software Svcs</div>
                                </div>
                                {/* High Risk / High Growth (Highlighted) */}
                                <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-3 flex flex-col justify-between relative overflow-hidden border border-primary/20">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                                    <span className="text-[10px] text-primary/70 uppercase font-bold z-10">High Risk / High Growth</span>
                                    <div className="text-sm font-bold text-primary z-10 flex items-center gap-1">
                                        Semi-conductors
                                        <TrendingUp size={14} />
                                    </div>
                                </div>
                                {/* Low Risk / Low Growth */}
                                <div className="bg-white dark:bg-white/10 rounded-lg p-3 flex flex-col justify-between shadow-sm opacity-60">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold">Low Risk / Low Growth</span>
                                    <div className="text-sm font-bold text-gray-600 dark:text-gray-300">Legacy IT</div>
                                </div>
                                {/* High Risk / Low Growth */}
                                <div className="bg-white dark:bg-white/10 rounded-lg p-3 flex flex-col justify-between shadow-sm">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold">High Risk / Low Growth</span>
                                    <div className="text-sm font-bold text-gray-600 dark:text-gray-300">Crypto Assets</div>
                                </div>
                                {/* Axis Labels */}
                                <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-gray-400 tracking-widest">RISK</div>
                                <div className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 tracking-widest">GROWTH POTENTIAL</div>
                            </div>
                        </div>
                    </section>
                    <div className="h-10"></div>

                    {/* Impact Chain */}
                    <section className="px-5">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                            <LinkIcon className="text-primary" size={20} />
                            影响链
                        </h3>
                        <div className="relative pl-4 border-l-2 border-dashed border-gray-200 dark:border-white/10 ml-3 space-y-8 py-2">
                            {/* Manually render 3 items for demo, or map if data is suitable */}
                            {data.impact_chain && data.impact_chain.length >= 2 ? (
                                <>
                                    <div className="relative">
                                        <div className="absolute -left-[23px] top-0 bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center ring-4 ring-white dark:ring-surface-dark"></div>
                                        <div className="bg-white dark:bg-white/5 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                                            <div className="text-xs text-primary font-bold uppercase mb-1">Event Trigger</div>
                                            <div className="font-semibold text-gray-900 dark:text-white">{data.impact_chain[0].entity}</div>
                                        </div>
                                    </div>
                                    <div className="absolute left-[-10px] top-[75px] text-gray-300 dark:text-gray-600">
                                        <span className="material-symbols-outlined text-[20px] bg-white dark:bg-surface-dark">↓</span>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-[23px] top-3 w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full ring-4 ring-white dark:ring-surface-dark"></div>
                                        <div className="bg-white dark:bg-white/5 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                                            <div className="text-xs text-gray-500 font-bold uppercase mb-1">Direct Outcome (Positive)</div>
                                            <div className="font-semibold text-gray-900 dark:text-white">{data.impact_chain[1].entity}</div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="relative">
                                    <div className="absolute -left-[23px] top-0 bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center ring-4 ring-white dark:ring-surface-dark"></div>
                                    <div className="bg-white dark:bg-white/5 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                                        <div className="text-xs text-primary font-bold uppercase mb-1">Event Trigger</div>
                                        <div className="font-semibold text-gray-900 dark:text-white">New AI Regulation Policy Passed</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                    <div className="h-10"></div>

                    {/* Evidence / Top Picks */}
                    <section className="px-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FolderOpen className="text-primary" size={20} />
                                情报证据
                            </h3>
                        </div>
                        <div className="space-y-4">
                            {data.top_picks.map((article, idx) => (
                                <a key={article.id || idx} className="block group bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5 shadow-sm active:scale-[0.99] transition-all" href={article.source_url} target="_blank">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${idx % 3 === 0 ? 'bg-orange-100 text-orange-600' : idx % 3 === 1 ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                                {article.source_name ? article.source_name[0] : 'S'}
                                            </div>
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{article.source_name}</span>
                                        </div>
                                        <ExternalLink className="text-gray-300 group-hover:text-primary transition-colors" size={20} />
                                    </div>
                                    <h4 className="font-bold text-gray-900 dark:text-white leading-snug mb-2 group-hover:text-primary transition-colors">
                                        {article.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                        {article.fact}
                                    </p>
                                </a>
                            ))}
                        </div>
                    </section>
                    <div className="h-8"></div>
                </main>
            </div>
        </div>
    );
}

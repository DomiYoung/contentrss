import { useState } from "react";
import {
    Settings, Edit3, ChevronRight, Clock, Folder, Image, MessageSquareQuote
} from "lucide-react";
import { triggerHaptic } from "@/lib/haptic";

interface ProfilePageProps {
    onBack?: () => void;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
    const [user] = useState({
        name: "Alex Chen",
        title: "Senior Analyst",
        avatar: "https://i.pravatar.cc/150?img=11",
        isPro: true,
    });

    const stats = [
        { icon: <Image size={20} className="text-cyan-400" />, value: 12, label: "Generated Posters", bg: "bg-slate-800" },
        { icon: <MessageSquareQuote size={20} className="text-amber-400" />, value: 5, label: "Golden Sentences", bg: "bg-amber-500/10" },
    ];

    const recentInsight = {
        quote: "The market shift in Q3 indicates a structural change in consumer behavior, prioritizing sustainability over speed in...",
        source: "Q3 Market Analysis",
        type: "REPORT",
        time: "2h ago",
    };

    const knowledgeStack = [
        { icon: <Folder size={20} />, title: "My Collections", subtitle: "24 saved articles" },
        { icon: <Clock size={20} />, title: "Reading History", subtitle: 'Resume "AI Trends 2024"' },
    ];

    return (
        <div className="min-h-screen bg-[#0D0D0D] text-white font-display antialiased">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-800/50">
                <button className="p-2 -ml-2 rounded-full hover:bg-slate-800 transition-colors">
                    <Settings size={22} />
                </button>
                <span className="text-lg font-bold">My Knowledge Base</span>
                <button className="p-2 -mr-2 rounded-full hover:bg-slate-800 transition-colors">
                    <Edit3 size={20} />
                </button>
            </header>

            <main className="px-4 pb-24">
                {/* User Profile */}
                <div className="py-6 flex items-center gap-4">
                    <div className="relative">
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-slate-700"
                        />
                        {user.isPro && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center border-2 border-[#0D0D0D]">
                                <span className="text-[10px]">★</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{user.name}</h2>
                        <p className="text-sm text-slate-400">{user.title}</p>
                        {user.isPro && (
                            <span className="mt-1 inline-block px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold rounded uppercase tracking-wider border border-cyan-500/30">
                                Insider Pro
                            </span>
                        )}
                    </div>
                </div>

                {/* My Second Brain */}
                <section className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold">My Second Brain</h3>
                        <span className="text-xs text-slate-500">Last synced 2m ago</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {stats.map((stat, i) => (
                            <div
                                key={i}
                                className={`${stat.bg} rounded-xl p-4 border border-slate-700/50 relative overflow-hidden`}
                            >
                                <div className="absolute top-3 right-3 text-slate-600">
                                    <ChevronRight size={16} />
                                </div>
                                <div className="mb-3">{stat.icon}</div>
                                <div className="text-3xl font-bold">{stat.value}</div>
                                <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recent Insight */}
                <section className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold">Recent Insight</h3>
                        <button className="text-xs text-cyan-400 font-medium">View All</button>
                    </div>
                    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                        <div className="border-l-2 border-cyan-500 pl-3 mb-3">
                            <p className="text-sm text-slate-300 italic leading-relaxed">
                                "{recentInsight.quote}"
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-400 font-medium">
                                {recentInsight.type}
                            </span>
                            <span className="text-slate-500">{recentInsight.source}</span>
                            <span className="text-slate-600 ml-auto">{recentInsight.time}</span>
                        </div>
                    </div>
                </section>

                {/* Knowledge Stack */}
                <section>
                    <h3 className="text-base font-bold mb-3">Knowledge Stack</h3>
                    <div className="space-y-2">
                        {knowledgeStack.map((item, i) => (
                            <button
                                key={i}
                                onClick={() => triggerHaptic("light")}
                                className="w-full bg-slate-900 rounded-xl p-4 border border-slate-800 flex items-center gap-3 hover:bg-slate-800/50 transition-colors active:scale-[0.99]"
                            >
                                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                                    {item.icon}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium">{item.title}</div>
                                    <div className="text-xs text-slate-500">{item.subtitle}</div>
                                </div>
                                <ChevronRight size={20} className="text-slate-600" />
                            </button>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

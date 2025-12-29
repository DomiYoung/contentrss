import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Briefcase, Hash, Factory } from "lucide-react";
import { fetchEntities, toggleSubscription } from "@/lib/api";
import { triggerHaptic } from "@/lib/haptic";
import type { Entity } from "@/types/entities";
import { Sparkles, TrendingUp, BarChart3, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function EntityRadar() {
    const [entities, setEntities] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "company" | "industry" | "topic">("all");

    useEffect(() => {
        fetchEntities()
            .then(data => {
                setEntities(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    const handleToggle = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        triggerHaptic("medium");
        try {
            const res = await toggleSubscription(id);
            setEntities(prev => prev.map(e =>
                e.id === id ? { ...e, is_subscribed: res.is_subscribed } : e
            ));
        } catch {
            // Error handling
        }
    };

    const filteredEntities = entities.filter(e => {
        const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === "all" || e.type === activeTab;
        return matchesSearch && matchesTab;
    });

    const typeIcons = {
        company: Factory,
        industry: Briefcase,
        topic: Hash
    };

    const typeColors = {
        company: "bg-blue-100 text-blue-600",
        industry: "bg-orange-100 text-orange-600",
        topic: "bg-indigo-100 text-indigo-600"
    };

    const AISignals = ({ dimensions }: { dimensions: Record<string, number> }) => {
        return (
            <div className="flex gap-2 mt-3">
                <div className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    <Activity size={10} className="text-emerald-600" />
                    <span className="text-[9px] font-black text-emerald-700 uppercase tracking-tighter">SENTIMENT {dimensions.sentiment}%</span>
                </div>
                <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    <BarChart3 size={10} className="text-blue-600" />
                    <span className="text-[9px] font-black text-blue-700 uppercase tracking-tighter">VOLUME {dimensions.volume}%</span>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-white text-gray-900">
            {/* Fixed Header */}
            <header className="flex-shrink-0 px-5 py-4 bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="mb-0">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        实体雷达
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        个性化订阅 · 追踪关注
                    </p>
                </div>
            </header>

            {/* Scrollable Content */}
            <main className="flex-1 overflow-y-auto px-5 pb-8 pt-4">

                {/* Search Bar */}
                <div className="relative mb-5">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="搜索公司、行业或话题..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-white/5 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400"
                    />
                </div>

                <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
                    {[
                        { id: "all", label: "全部" },
                        { id: "company", label: "公司" },
                        { id: "industry", label: "行业" },
                        { id: "topic", label: "话题" }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                triggerHaptic("light");
                                setActiveTab(tab.id as any);
                            }}
                            className={cn(
                                "px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                                activeTab === tab.id
                                    ? "bg-gray-900 text-white shadow-lg shadow-gray-200"
                                    : "bg-gray-100/50 text-gray-400 hover:bg-gray-100"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="h-20 bg-gray-50/50 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            filteredEntities.map((entity, i) => {
                                const Icon = typeIcons[entity.type as keyof typeof typeIcons] || Hash;
                                const colorClass = typeColors[entity.type as keyof typeof typeColors] || "bg-gray-100 text-gray-600";

                                return (
                                    <motion.div
                                        key={entity.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3, delay: i * 0.05 }}
                                        className="flex items-center justify-between p-4 bg-white dark:bg-white/5 border border-gray-50 dark:border-white/5 rounded-2xl shadow-sm"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner", colorClass)}>
                                                {entity.icon || <Icon size={24} />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-black text-gray-900 text-[16px] tracking-tight">
                                                        {entity.name}
                                                    </h4>
                                                    {entity.dimensions && (
                                                        <Sparkles size={12} className="text-amber-500 fill-amber-500 animate-pulse" />
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                    {entity.subscriber_count > 999 ? (entity.subscriber_count / 1000).toFixed(1) + 'k' : entity.subscriber_count} 关注者 • {entity.type.toUpperCase()}
                                                </p>
                                                <div className="flex gap-1.5 mt-1">
                                                    {entity.tags?.map(tag => (
                                                        <span key={tag} className="text-[8px] bg-zinc-50 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-100 font-black uppercase tracking-tighter">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                {entity.dimensions && <AISignals dimensions={entity.dimensions} />}
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => handleToggle(entity.id, e)}
                                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center gap-1 ${entity.is_subscribed
                                                ? "bg-white border border-gray-200 text-gray-500"
                                                : "bg-primary text-white shadow-lg shadow-primary/30"
                                                }`}
                                        >
                                            {entity.is_subscribed ? (
                                                <>已订阅</>
                                            ) : (
                                                <>
                                                    <Plus size={12} strokeWidth={3} /> 订阅
                                                </>
                                            )}
                                        </button>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>

                {/* Recommendations Header */}
                <div className="mt-12 mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp size={16} className="text-amber-600" />
                        <h3 className="font-black text-gray-900 tracking-tight">热度增长潜力</h3>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-6">AI 推荐关注 · 实时同步</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {entities.slice(5, 12).map(entity => (
                        <button
                            key={entity.id}
                            className="px-4 py-2 bg-gray-50 hover:bg-zinc-100 text-gray-600 rounded-xl text-xs font-bold transition-all border border-gray-100 flex items-center gap-2 group"
                            onClick={() => {
                                triggerHaptic("light");
                                setSearchQuery(entity.name);
                            }}
                        >
                            <span className="opacity-40 group-hover:opacity-100 transition-opacity">#</span>
                            {entity.name}
                        </button>
                    ))}
                </div>
            </main>
        </div>
    );
}

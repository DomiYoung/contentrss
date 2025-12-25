import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Briefcase, Hash, Factory } from "lucide-react";
import { fetchEntities, toggleSubscription } from "@/lib/api";
import { triggerHaptic } from "@/lib/haptic";
import type { Entity } from "@/types/entities";

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
        topic: "bg-purple-100 text-purple-600"
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 pb-24">
            <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-surface-dark relative shadow-xl overflow-hidden px-5 pt-8">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
                        实体雷达
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        个性化订阅 · 追踪关注
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
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

                {/* Category Pills */}
                <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
                    {[
                        { id: "all", label: "全部" },
                        { id: "company", label: "公司" },
                        { id: "industry", label: "行业" },
                        { id: "topic", label: "话题" }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab.id
                                ? "bg-white shadow-sm text-gray-900 border border-gray-100"
                                : "bg-gray-100/50 text-gray-400 hover:bg-gray-100"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <div className="text-center py-20">
                                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest animate-pulse">Scanning...</span>
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
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
                                                <Icon size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white text-[15px] leading-tight mb-1">
                                                    {entity.name}
                                                </h4>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    {entity.subscriber_count > 999 ? (entity.subscriber_count / 1000).toFixed(1) + 'k' : entity.subscriber_count} 关注
                                                </p>
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
                <div className="mt-10 mb-6 flex items-center gap-2">
                    <span className="text-lg">🔥</span>
                    <h3 className="font-bold text-gray-900">热门推荐</h3>
                </div>

                <div className="flex flex-wrap gap-3">
                    {["LVMH", "苹果 Apple", "NVidia", "SpaceX", "元宇宙", "新能源"].map(tag => (
                        <button key={tag} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

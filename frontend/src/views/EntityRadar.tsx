import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Check, Radio, Briefcase, Hash } from "lucide-react";
import { RadarPulse } from "@/components/layout/RadarPulse";
import { fetchEntities, toggleSubscription } from "@/lib/api";
import type { Entity } from "@/types/entities";

export function EntityRadar() {
    const [entities, setEntities] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchEntities()
            .then(data => {
                setEntities(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleToggle = async (id: string) => {
        try {
            const res = await toggleSubscription(id);
            setEntities(prev => prev.map(e =>
                e.id === id ? { ...e, is_subscribed: res.is_subscribed } : e
            ));
        } catch (err) {
            console.error(err);
        }
    };

    const filteredEntities = entities.filter(e =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const typeIcons = {
        company: Briefcase,
        industry: Radio,
        topic: Hash
    };

    return (
        <div className="relative min-h-[60vh] flex flex-col p-2 overflow-hidden">
            {/* Background Tech Layer */}
            <div className="absolute inset-0 z-0">
                <RadarPulse />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 w-full max-w-md mx-auto">
                <div className="mb-8 text-center pt-8">
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">主体雷达</h2>
                    <p className="text-sm text-zinc-500 font-medium">踪你关心的行业核心动态</p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8 px-4">
                    <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none text-zinc-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="搜索公司、行业或话题..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/80 backdrop-blur-xl border border-zinc-100 rounded-2xl py-4 pl-14 pr-6 text-sm shadow-xl shadow-zinc-200/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                </div>

                {/* Entity Grid/List */}
                <div className="space-y-3 px-4 pb-20">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <div className="text-center py-20 text-zinc-400 text-sm animate-pulse">Scanning Market Entities...</div>
                        ) : (
                            filteredEntities.map((entity, i) => {
                                const Icon = typeIcons[entity.type as keyof typeof typeIcons];
                                return (
                                    <motion.div
                                        key={entity.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${entity.is_subscribed
                                                ? "bg-emerald-50/50 border-emerald-200 shadow-lg shadow-emerald-500/5"
                                                : "bg-white border-zinc-100 hover:border-zinc-200"
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${entity.is_subscribed ? "bg-white" : "bg-zinc-50"
                                            }`}>
                                            {entity.icon}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className="font-bold text-zinc-900 text-sm truncate">{entity.name}</h4>
                                                <div className="px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-400">
                                                    <Icon size={10} />
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-zinc-400 font-medium">
                                                {entity.subscriber_count.toLocaleString()} 关注者
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleToggle(entity.id)}
                                            className={`p-2.5 rounded-full transition-all active:scale-90 ${entity.is_subscribed
                                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                                                    : "bg-zinc-50 text-zinc-400 hover:bg-zinc-100"
                                                }`}
                                        >
                                            {entity.is_subscribed ? <Check size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
                                        </button>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

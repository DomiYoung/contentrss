import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Check, Radio, Briefcase, Hash, ShieldCheck } from "lucide-react";
import { RadarPulse } from "@/components/layout/RadarPulse";
import { fetchEntities, toggleSubscription } from "@/lib/api";
import { triggerHaptic } from "@/lib/haptic";
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
        triggerHaptic("medium");
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
        <div className="relative min-h-[85vh] flex flex-col pt-4 overflow-hidden bg-[#FAF9F6]">
            {/* Background Tech Layer */}
            <div className="absolute inset-0 z-0 select-none">
                <RadarPulse />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 w-full max-w-md mx-auto px-6">
                <div className="mb-12 text-center pt-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <ShieldCheck size={20} className="text-zinc-900" />
                        <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase italic">Entity Radar</h2>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-black uppercase tracking-[0.3em]">Sector Monitoring Active</p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-10 group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
                        <Search size={18} strokeWidth={2.5} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search entities, topics, or sectors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/60 backdrop-blur-3xl border border-zinc-200/60 rounded-[28px] py-4 pl-14 pr-6 text-[13px] font-bold shadow-2xl shadow-zinc-200/20 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all placeholder:text-zinc-300"
                    />
                </div>

                {/* Entity Grid/List */}
                <div className="space-y-4 pb-32">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <div className="text-center py-20">
                                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest animate-pulse">Scanning Market...</span>
                            </div>
                        ) : (
                            filteredEntities.map((entity, i) => {
                                const Icon = typeIcons[entity.type as keyof typeof typeIcons];
                                return (
                                    <motion.div
                                        key={entity.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4, delay: i * 0.03 }}
                                        className={`group relative flex items-center gap-5 p-5 rounded-[32px] border transition-all duration-500 ${entity.is_subscribed
                                            ? "bg-white border-zinc-900 shadow-xl shadow-zinc-900/5"
                                            : "bg-white/40 border-zinc-200/50 hover:bg-white/80"
                                            }`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform duration-500 group-hover:scale-110 ${entity.is_subscribed ? "bg-zinc-50" : "bg-white"
                                            }`}>
                                            {entity.icon}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-black text-zinc-900 text-[15px] truncate tracking-tight">{entity.name}</h4>
                                                <div className="px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                                                    <Icon size={10} strokeWidth={3} />
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                                                {entity.subscriber_count.toLocaleString()} Signals
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleToggle(entity.id)}
                                            className={`p-3 rounded-full transition-all active:scale-75 ${entity.is_subscribed
                                                ? "bg-zinc-900 text-white shadow-xl shadow-zinc-900/20 rotate-0"
                                                : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                                                }`}
                                        >
                                            {entity.is_subscribed ? <Check size={20} strokeWidth={4} /> : <Plus size={20} strokeWidth={4} />}
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

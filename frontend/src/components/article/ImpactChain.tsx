import { motion } from "framer-motion";
import { ArrowDown, Zap } from "lucide-react";
import type { ImpactSegment } from "@/types/briefing";

interface ImpactChainProps {
    data: ImpactSegment;
}

export function ImpactChain({ data }: ImpactChainProps) {
    return (
        <div className="my-10 p-6 bg-zinc-900 text-white rounded-[32px] overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full" />

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-8 text-emerald-400">
                    <Zap size={18} fill="currentColor" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Impact Analysis</span>
                </div>

                {/* Trigger */}
                <div className="mb-6">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-2">The Trigger</span>
                    <h4 className="text-lg font-bold text-white leading-tight">{data.trigger}</h4>
                </div>

                {/* Path */}
                <div className="space-y-4 relative pl-4 border-l border-zinc-800 ml-1">
                    {data.path.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + (i * 0.2) }}
                            className="relative"
                        >
                            <div className="absolute -left-[21px] top-2 w-2 h-2 rounded-full bg-zinc-700 border-2 border-zinc-900" />
                            <p className="text-sm text-zinc-400 font-medium leading-relaxed">{step}</p>
                            {i < data.path.length - 1 && (
                                <ArrowDown size={12} className="text-zinc-800 mt-2" />
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Conclusion */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl"
                >
                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block mb-1">Synthesis</span>
                    <p className="text-sm font-bold text-emerald-50 text-balance leading-snug">
                        {data.conclusion}
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

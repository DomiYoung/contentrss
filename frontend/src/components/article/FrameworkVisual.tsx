import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import type { Framework } from "@/types/briefing";

interface FrameworkVisualProps {
    data: Framework;
}

export function FrameworkVisual({ data }: FrameworkVisualProps) {
    return (
        <div className="my-12 p-8 bg-zinc-50 border border-zinc-100 rounded-[32px] overflow-hidden">
            <div className="flex items-center gap-2 mb-8 opacity-40">
                <Layers size={14} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{data.title}</span>
            </div>

            {data.type === "matrix" && (
                <div className="grid grid-cols-1 gap-4">
                    {data.nodes.map((node, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-4 group"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 group-hover:scale-150 transition-transform" />
                            <div className="flex-1 border-b border-zinc-200/60 pb-4 flex justify-between items-baseline gap-4">
                                <span className="text-sm font-bold text-zinc-900 whitespace-nowrap">{node.label}</span>
                                <span className="text-xs text-zinc-400 font-medium text-right">{node.value}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Placeholder for other types like pyramid/venn */}
            {data.type !== "matrix" && (
                <div className="text-center py-8 text-zinc-400 text-xs italic">
                    Visualizing {data.type} model...
                </div>
            )}
        </div>
    );
}

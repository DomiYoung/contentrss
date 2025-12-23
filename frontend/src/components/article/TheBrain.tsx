import { Sparkles, Zap, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

interface SummaryData {
    thesis: string;
    facts: string[];
    sentiment: "bullish" | "bearish" | "neutral";
}

interface TheBrainProps {
    summary: string | SummaryData; // Support both raw string and structured data
    polarity: "positive" | "negative" | "neutral";
}

export function TheBrain({ summary, polarity }: TheBrainProps) {
    // Parse summary if it's a JSON string (mock often provides strings)
    let data: SummaryData;
    try {
        data = typeof summary === "string" ? JSON.parse(summary) : summary;
    } catch (e) {
        // Fallback for raw text
        data = {
            thesis: typeof summary === "string" ? summary : "No thesis available",
            facts: [],
            sentiment: polarity === "positive" ? "bullish" : polarity === "negative" ? "bearish" : "neutral"
        };
    }

    const sentimentConfig = {
        bullish: { color: "text-emerald-500", icon: TrendingUp, label: "Bullish", bg: "bg-emerald-50" },
        bearish: { color: "text-rose-500", icon: TrendingDown, label: "Bearish", bg: "bg-rose-50" },
        neutral: { color: "text-zinc-400", icon: Minus, label: "Neutral", bg: "bg-zinc-50" }
    };

    const config = sentimentConfig[data.sentiment || "neutral"];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative rounded-2xl p-[1px] bg-gradient-to-br from-amber-400 via-amber-200 to-amber-500 shadow-2xl shadow-amber-200/40 my-8 overflow-hidden"
        >
            {/* Pulsing Interior Glow */}
            <motion.div 
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-amber-300 blur-2xl" 
            />

            <div className="relative bg-white rounded-[15px] overflow-hidden">
                {/* Accent Top Bar */}
                <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
                
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-amber-50 rounded-lg text-amber-600 shadow-sm">
                                <Sparkles size={18} fill="currentColor" className="animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-amber-600 uppercase tracking-[0.15em] leading-none">The Brain</h3>
                                <p className="text-[10px] text-zinc-400 font-medium mt-1">AI Intelligence Core</p>
                            </div>
                        </div>

                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} border border-${config.color.split('-')[1]}-100 transition-all duration-500`}>
                            <config.icon size={12} className={config.color} />
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
                                {config.label}
                            </span>
                        </div>
                    </div>

                    {/* Thesis (The "So What") */}
                    <div className="mb-6">
                        <p className="text-[17px] font-bold leading-snug text-zinc-900 font-display">
                            {data.thesis}
                        </p>
                    </div>

                    {/* Key Facts */}
                    {data.facts && data.facts.length > 0 && (
                        <div className="space-y-3 border-t border-zinc-50 pt-5">
                            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Key Intelligence</h4>
                            {data.facts.map((fact, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + (i * 0.1) }}
                                    className="flex gap-3 items-start"
                                >
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 shadow-sm shadow-amber-400/50" />
                                    <p className="text-sm text-zinc-600 font-medium leading-relaxed">{fact}</p>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Footer / Meta */}
                    <div className="mt-6 pt-4 border-t border-zinc-50 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Zap size={10} className="text-amber-500 fill-amber-500" />
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">High Confidence Analysis</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

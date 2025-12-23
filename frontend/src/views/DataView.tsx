import { useState, useEffect } from "react";
import { fetchFeed } from "@/lib/api";
import { Code, RefreshCw, Layers, Terminal as TerminalIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function DataView() {
    const [rawData, setRawData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = () => {
        setLoading(true);
        fetchFeed()
            .then(data => {
                setRawData(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="flex flex-col min-h-[85vh] bg-zinc-950 rounded-[32px] overflow-hidden border border-zinc-800 shadow-2xl animate-in fade-in zoom-in-95 duration-700">
            {/* Analyst Header */}
            <div className="px-6 py-5 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <TerminalIcon size={14} className="text-emerald-500" />
                        <span className="text-[11px] font-black text-zinc-100 uppercase tracking-[0.2em]">Master Ledger v2.0</span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Raw Intelligence Packets</span>
                </div>
                <button
                    onClick={loadData}
                    className="p-2 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-full text-[10px] font-black text-emerald-500 transition-all active:scale-95 flex items-center gap-2 border border-emerald-500/20"
                >
                    <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                    SYNC DATA
                </button>
            </div>

            {/* Metrics Bar */}
            <div className="px-6 py-3 bg-zinc-900/20 border-b border-zinc-800 flex gap-6">
                <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">Total Objects</span>
                    <span className="text-lg font-mono font-black text-zinc-100">{rawData.length.toString().padStart(2, '0')}</span>
                </div>
                <div className="flex flex-col border-l border-zinc-800 pl-6">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">Network Latency</span>
                    <span className="text-lg font-mono font-black text-emerald-500">22ms</span>
                </div>
                <div className="flex flex-col border-l border-zinc-800 pl-6">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">Status</span>
                    <span className="text-lg font-mono font-black text-emerald-500 animate-pulse">LIVE</span>
                </div>
            </div>

            {/* Structured Content Area */}
            <div className="flex-1 overflow-auto p-4 space-y-3 no-scrollbar">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
                        <div className="w-8 h-8 border-2 border-zinc-800 border-t-emerald-500 rounded-full animate-spin" />
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Querying Database...</span>
                    </div>
                ) : (
                    rawData.map((item, idx) => (
                        <div
                            key={item.id || idx}
                            className="p-5 bg-zinc-900/30 border border-zinc-800 rounded-2xl hover:bg-zinc-900/50 transition-colors group"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-mono text-zinc-600 font-bold px-2 py-0.5 border border-zinc-800 rounded">#{item.id}</span>
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        item.polarity === "positive" ? "bg-emerald-500" : item.polarity === "negative" ? "bg-rose-500" : "bg-zinc-500"
                                    )} />
                                    <span className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest">{item.source_name}</span>
                                </div>
                                <Layers size={14} className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                            </div>

                            <h4 className="text-sm font-bold text-zinc-200 mb-2 leading-tight">{item.title}</h4>

                            <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50 mb-3">
                                <p className="text-[11px] font-mono text-zinc-500 leading-relaxed italic">
                                    {item.fact}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {item.tags?.map((tag: string) => (
                                    <span key={tag} className="text-[9px] font-mono text-emerald-500/70 py-0.5 px-2 bg-emerald-500/5 border border-emerald-500/10 rounded uppercase">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* System Footer */}
            <div className="px-6 py-4 bg-zinc-900/40 border-t border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                        <Code size={12} />
                        <span>Build 1.2.9-X</span>
                    </div>
                </div>
                <div className="text-[9px] font-mono font-bold text-zinc-700 uppercase tracking-tighter">
                    Kernel: PRODUCER_SERVICE_01
                </div>
            </div>
        </div>
    );
}

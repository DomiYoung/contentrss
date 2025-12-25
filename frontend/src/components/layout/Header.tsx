import { Search, ShieldCheck } from "lucide-react";
import { useMemo } from "react";

export function Header() {
    const today = useMemo(() => new Date().toLocaleDateString("zh-CN", {
        month: "long",
        day: "numeric",
        weekday: "short"
    }), []);

    return (
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-2xl border-b border-zinc-100/50 px-5 h-16 flex justify-between items-center">
            <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none mb-0.5">
                    <ShieldCheck size={14} className="text-zinc-900" />
                    <span className="font-black text-zinc-900 tracking-tight text-base">情报中心</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-400 font-bold tracking-wider">{today}</span>
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button className="p-2.5 bg-zinc-50 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all active:scale-95">
                    <Search size={18} strokeWidth={2.5} />
                </button>
                <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-400" />
                </div>
            </div>
        </div>
    );
}

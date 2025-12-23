import { Search } from "lucide-react";

export function Header() {
    return (
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-zinc-100/50 px-4 h-14 flex justify-between items-center transition-all duration-300">
            <div className="flex items-center gap-2">
                {/* Simple Brand Placeholder */}
                <div className="w-5 h-5 bg-zinc-900 rounded-md flex items-center justify-center text-white font-bold text-xs">
                    I
                </div>
                <span className="font-semibold text-zinc-900 tracking-tight text-lg">Intelligence</span>
            </div>
            <button className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors">
                <Search size={20} />
            </button>
        </div>
    );
}

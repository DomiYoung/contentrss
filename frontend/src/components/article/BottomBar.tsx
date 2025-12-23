import { Share2, Bookmark, MessageSquarePlus, PenLine } from "lucide-react";

interface BottomBarProps {
    onShare: () => void;
    onSave: () => void;
}

export function BottomBar({ onShare, onSave }: BottomBarProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-zinc-100 pb-safe pt-2 z-30">
            <div className="flex items-center justify-between px-6 max-w-md mx-auto h-14">

                {/* Secondary Actions */}
                <div className="flex gap-6 text-zinc-400">
                    <button className="flex flex-col items-center gap-0.5 hover:text-zinc-900 transition-colors" onClick={() => console.log("Note")}>
                        <PenLine size={22} strokeWidth={1.5} />
                        <span className="text-[9px]">Note</span>
                    </button>
                    <button className="flex flex-col items-center gap-0.5 hover:text-amber-500 transition-colors" onClick={() => console.log("Ask AI")}>
                        <MessageSquarePlus size={22} strokeWidth={1.5} />
                        <span className="text-[9px]">Ask AI</span>
                    </button>
                </div>

                {/* Primary Actions */}
                <div className="flex gap-4 items-center">
                    <button className="p-2 text-zinc-400 hover:text-yellow-500 transition-colors" onClick={onSave}>
                        <Bookmark size={24} strokeWidth={1.5} />
                    </button>

                    <button
                        onClick={onShare}
                        className="bg-zinc-900 text-white px-5 py-2 rounded-full flex items-center gap-2 shadow-lg shadow-zinc-900/20 active:scale-95 transition-all"
                    >
                        <Share2 size={16} />
                        <span className="text-xs font-bold">Share</span>
                    </button>
                </div>

            </div>
        </div>
    );
}

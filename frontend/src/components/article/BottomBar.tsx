import { Share2, Bookmark, Sparkles, PenLine } from "lucide-react";
import { triggerHaptic } from "@/lib/haptic";
import { motion } from "framer-motion";

interface BottomBarProps {
    onShare: () => void;
    onSave: () => void;
    onNote: () => void;
    onAskAI: () => void;
}

export function BottomBar({ onShare, onSave, onNote, onAskAI }: BottomBarProps) {
    const handleAction = (cb: () => void, type: any = "light") => {
        triggerHaptic(type);
        cb();
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-zinc-100 pb-safe pt-2 z-30">
            <div className="flex items-center justify-between px-6 max-w-md mx-auto h-14">

                {/* Secondary Actions */}
                <div className="flex gap-6 text-zinc-400">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="flex flex-col items-center gap-0.5 hover:text-zinc-900 transition-colors"
                        onClick={() => handleAction(onNote, "light")}
                    >
                        <PenLine size={22} strokeWidth={1.5} />
                        <span className="text-[9px]">Note</span>
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="flex flex-col items-center gap-0.5 hover:text-amber-500 transition-colors"
                        onClick={() => handleAction(onAskAI, "medium")}
                    >
                        <Sparkles size={22} strokeWidth={1.5} />
                        <span className="text-[9px]">Ask AI</span>
                    </motion.button>
                </div>

                {/* Primary Actions */}
                <div className="flex gap-4 items-center">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-zinc-400 hover:text-yellow-500 transition-colors"
                        onClick={() => handleAction(onSave, "light")}
                    >
                        <Bookmark size={24} strokeWidth={1.5} />
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAction(onShare, "medium")}
                        className="bg-zinc-900 text-white px-5 py-2 rounded-full flex items-center gap-2 shadow-lg shadow-zinc-900/20 active:scale-95 transition-all"
                    >
                        <Share2 size={16} />
                        <span className="text-xs font-bold">Share</span>
                    </motion.button>
                </div>

            </div>
        </div>
    );
}

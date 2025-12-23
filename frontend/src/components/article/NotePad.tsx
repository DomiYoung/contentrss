import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, FileText } from "lucide-react";
import { triggerHaptic } from "@/lib/haptic";

interface NotePadProps {
    isOpen: boolean;
    onClose: () => void;
    articleId: number;
}

export function NotePad({ isOpen, onClose, articleId }: NotePadProps) {
    const storageKey = `note_article_${articleId}`;
    const [note, setNote] = useState(() => localStorage.getItem(storageKey) || "");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setNote(localStorage.getItem(storageKey) || "");
    }, [articleId, storageKey]);

    const handleSave = () => {
        triggerHaptic("medium");
        setIsSaving(true);
        localStorage.setItem(storageKey, note);
        setTimeout(() => setIsSaving(false), 800);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="fixed inset-x-6 top-32 bottom-40 bg-[#FFFDF7] rounded-[24px] z-50 shadow-2xl flex flex-col border border-zinc-200/50"
                        style={{
                            backgroundImage: "radial-gradient(#E5E7EB 0.5px, transparent 0.5px)",
                            backgroundSize: "20px 20px"
                        }}
                    >
                        {/* Header */}
                        <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-200/30">
                            <div className="flex items-center gap-2">
                                <FileText size={18} className="text-zinc-400" />
                                <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest">Internal Note</h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-7 h-7 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 active:scale-90 transition-transform"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Text Area */}
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Type your insights here..."
                            className="flex-1 w-full bg-transparent p-6 text-zinc-800 text-[16px] leading-[1.6] font-serif focus:outline-none resize-none"
                            autoFocus
                        />

                        {/* Footer */}
                        <div className="px-6 py-4 flex justify-end items-center gap-4">
                            {isSaving && (
                                <span className="text-[10px] font-mono text-emerald-500 uppercase animate-pulse">Saved to local</span>
                            )}
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all shadow-lg shadow-zinc-900/10"
                            >
                                <Save size={14} />
                                Save Note
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

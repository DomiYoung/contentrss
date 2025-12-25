import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Link as LinkIcon, Highlighter, Tag } from "lucide-react";
import { triggerHaptic } from "@/lib/haptic";

interface NotePadProps {
    isOpen: boolean;
    onClose: () => void;
    articleId: number;
    initialHighlight?: string;
    sourceUrl?: string; // Add sourceUrl prop
}

export function NotePad({ isOpen, onClose, articleId, initialHighlight = "", sourceUrl = "" }: NotePadProps) {
    const storageKey = `note_article_${articleId}`;
    const [note, setNote] = useState(() => localStorage.getItem(storageKey) || "");
    const [link, setLink] = useState(sourceUrl);
    const [highlight] = useState(initialHighlight);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const tags = ["Important", "Action Item", "Insight", "Question"];

    useEffect(() => {
        setNote(localStorage.getItem(storageKey) || "");
        // In a real app, retrieve tags and link from storage too
    }, [articleId, storageKey]);

    const handleSave = () => {
        triggerHaptic("medium");
        setIsSaving(true);
        localStorage.setItem(storageKey, note);
        // Save other metadata
        setTimeout(() => {
            setIsSaving(false);
            onClose();
        }, 800);
    };

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
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
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-x-4 top-20 bottom-24 bg-white dark:bg-surface-dark rounded-3xl z-50 shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">添加笔记</h3>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">

                            {/* Link Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <LinkIcon size={14} /> 参考链接
                                </label>
                                <input
                                    type="text"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-white/5 text-sm p-3 rounded-xl border-none text-blue-600 font-medium focus:ring-2 focus:ring-blue-100"
                                    placeholder="https://"
                                />
                            </div>

                            {/* Text Area */}
                            <div className="space-y-2 h-40 flex flex-col">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    笔记内容
                                </label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="记录你的思考..."
                                    className="flex-1 w-full bg-gray-50 dark:bg-white/5 p-4 rounded-xl text-gray-800 dark:text-gray-200 text-base leading-relaxed resize-none focus:ring-2 focus:ring-blue-100 border-none placeholder:text-gray-400"
                                    autoFocus
                                />
                            </div>

                            {/* Highlight */}
                            {highlight && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <Highlighter size={14} /> 原文引用
                                    </label>
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                                        <p className="text-sm text-gray-600 dark:text-gray-300 italic border-l-2 border-yellow-400 pl-3">
                                            "{highlight}"
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <Tag size={14} /> 标签
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedTags.includes(tag)
                                                ? "bg-blue-50 border-blue-200 text-blue-600"
                                                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-surface-dark pb-8">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full bg-primary text-white py-4 rounded-xl text-base font-bold shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        保存中...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} /> 保存笔记
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

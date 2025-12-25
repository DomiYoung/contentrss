import { useState } from "react";
import { ArrowLeft, Search, Calendar, MoreHorizontal } from "lucide-react";
import { triggerHaptic } from "@/lib/haptic";

interface MyNotesProps {
    onBack: () => void;
}

export function MyNotes({ onBack }: MyNotesProps) {
    const [searchQuery, setSearchQuery] = useState("");

    // Demo Data
    const notes = [
        {
            id: 1,
            title: "Insights on AI Supply Chain",
            preview: "Semiconductors are becoming the new oil...",
            date: "2024-05-15",
            tags: ["Important", "Insight"],
            color: "blue"
        },
        {
            id: 2,
            title: "Follow up on New Regulations",
            preview: "Check the new EU AI Act details regarding...",
            date: "2024-05-14",
            tags: ["Action Item"],
            color: "orange"
        },
        {
            id: 3,
            title: "Competitor Analysis: OpenAI vs Google",
            preview: "Key differentiators in the enterprise market...",
            date: "2024-05-10",
            tags: ["Research"],
            color: "purple"
        }
    ];

    const tagColors: Record<string, string> = {
        "Important": "bg-red-50 text-red-600",
        "Action Item": "bg-orange-50 text-orange-600",
        "Insight": "bg-blue-50 text-blue-600",
        "Research": "bg-purple-50 text-purple-600"
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 pb-20">
            <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-surface-dark relative shadow-xl overflow-hidden flex flex-col">

                {/* Header */}
                <div className="sticky top-0 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md z-10 px-4 h-14 flex items-center gap-4 border-b border-gray-100 dark:border-white/5">
                    <button
                        onClick={() => {
                            triggerHaptic("light");
                            onBack();
                        }}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-800 dark:text-white"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">我的笔记</h1>
                </div>

                {/* Search */}
                <div className="p-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="搜索笔记..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Notes List */}
                <div className="flex-1 px-4 space-y-3 pb-8">
                    {notes.map(note => (
                        <div key={note.id} className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4 rounded-2xl shadow-sm active:scale-[0.99] transition-transform">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-900 dark:text-white leading-tight">
                                    {note.title}
                                </h3>
                                <button className="text-gray-400 p-1 -mr-2">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                                {note.preview}
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    {note.tags.map(tag => (
                                        <span key={tag} className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${tagColors[tag] || "bg-gray-100 text-gray-500"}`}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                    <Calendar size={10} /> {note.date}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

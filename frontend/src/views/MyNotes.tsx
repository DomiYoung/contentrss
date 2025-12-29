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
        <div className="h-full flex flex-col bg-white text-gray-900">
            {/* Fixed Header */}
            <header className="flex-shrink-0 bg-white/95 backdrop-blur-md px-5 py-4 flex items-center gap-4 border-b border-gray-100">
                <button
                    onClick={() => {
                        triggerHaptic("light");
                        onBack();
                    }}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all"
                >
                    <ArrowLeft size={22} className="text-gray-900" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">我的笔记</h1>
            </header>

            {/* Scrollable Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Search */}
                <div className="px-5 py-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="搜索笔记..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-100 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Notes List */}
                <div className="px-5 pb-24 space-y-4">
                    {notes.map(note => (
                        <div key={note.id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm active:scale-[0.99] transition-transform">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-gray-900 leading-tight text-[15px]">
                                    {note.title}
                                </h3>
                                <button className="text-gray-400 p-1 -mr-2 hover:text-gray-600">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                                {note.preview}
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    {note.tags.map(tag => (
                                        <span key={tag} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${tagColors[tag] || "bg-gray-100 text-gray-500"}`}>
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
            </main>
        </div>
    );
}

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles } from "lucide-react";
import { triggerHaptic } from "@/lib/haptic";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

interface AskAIOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    articleTitle: string;
}

export function AskAIOverlay({ isOpen, onClose, articleTitle }: AskAIOverlayProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: `Hello! I'm your Intelligence Assistant. Do you have any specific questions about "${articleTitle}"?`
        }
    ]);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        triggerHaptic("medium");
        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");

        // Simulate AI Reply
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Based on my analysis, this insight highlights a significant shift in market sentiment. The impact chain suggests a 15% increase in operational efficiency for early adopters."
            };
            setMessages(prev => [...prev, aiMsg]);
            triggerHaptic("light");
        }, 1000);
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
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 top-20 bg-[#FAF9F6] rounded-t-[32px] z-50 flex flex-col shadow-2xl overflow-hidden border-t border-white/50"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Ask Intelligence</h3>
                                    <p className="text-[10px] text-zinc-400 font-mono">V2 AGENT CORE</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 active:scale-90 transition-transform"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scroll-smooth"
                        >
                            {messages.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === "user"
                                            ? "bg-zinc-900 text-white rounded-br-none"
                                            : "bg-white text-zinc-800 border border-zinc-100 rounded-bl-none font-serif"
                                        }`}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white border-t border-zinc-100 pb-safe">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    placeholder="Ask for more details..."
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 pr-14 text-[15px] focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center disabled:opacity-30 disabled:grayscale transition-all active:scale-90"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

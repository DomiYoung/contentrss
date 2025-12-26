import { X, Download, Copy, QrCode } from "lucide-react";
import { triggerHaptic } from "@/lib/haptic";

interface SharePosterModalProps {
    isOpen: boolean;
    onClose: () => void;
    article: {
        title: string;
        fact?: string;
        category?: string;
        date?: string;
        imageUrl?: string;
    };
}

export function SharePosterModal({ isOpen, onClose, article }: SharePosterModalProps) {
    if (!isOpen) return null;

    const handleClose = () => {
        triggerHaptic("light");
        onClose();
    };

    const handleSave = () => {
        triggerHaptic("medium");
        // 实际实现需要 html2canvas 等库
        alert("Save poster to gallery");
    };

    const handleShareWeChat = () => {
        triggerHaptic("medium");
        alert("Share to WeChat");
    };

    const handleShareLinkedIn = () => {
        triggerHaptic("medium");
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, "_blank");
    };

    const handleCopy = () => {
        triggerHaptic("light");
        navigator.clipboard.writeText(`${article.title}\n\n${article.fact || ""}`);
        alert("Copied to clipboard!");
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-sm mx-4 bg-[#0D0D0D] rounded-3xl overflow-hidden shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 bg-slate-800/80 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Poster Content */}
                <div className="p-1">
                    <div className="relative rounded-2xl overflow-hidden bg-slate-900">
                        {/* Header Image */}
                        <div className="relative h-40 bg-gradient-to-br from-slate-700 to-slate-900">
                            <img
                                src={article.imageUrl || "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=400&fit=crop"}
                                alt="Industry"
                                className="w-full h-full object-cover opacity-80"
                            />
                            {/* Category + Date Badge */}
                            <div className="absolute top-4 left-4 flex items-center gap-2">
                                <span className="px-2 py-1 bg-cyan-500/90 text-[10px] font-bold uppercase rounded text-white">
                                    {article.category || "LOGISTICS"}
                                </span>
                                <span className="px-2 py-1 bg-black/40 text-[10px] font-medium rounded text-white">
                                    {article.date || "Dec 26"}
                                </span>
                            </div>
                        </div>

                        {/* Quote Section */}
                        <div className="p-5">
                            <div className="text-cyan-400 text-3xl mb-2">❝</div>
                            <h2 className="text-xl font-bold text-white leading-snug mb-4">
                                {article.title}
                            </h2>
                            <div className="w-10 h-0.5 bg-cyan-500 mb-4"></div>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                {article.fact || "The shift from just-in-time to just-in-case inventory models marks a permanent structural change in global logistics operations."}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="px-5 pb-5 flex items-end justify-between">
                            <div>
                                <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">INDUSTRY INTELLIGENCE</div>
                                <div className="text-[10px] text-slate-500">Insiders Only</div>
                            </div>
                            {/* QR Code Placeholder */}
                            <div className="w-14 h-14 bg-white rounded-lg p-1.5">
                                <div className="w-full h-full bg-slate-100 rounded flex items-center justify-center">
                                    <QrCode size={24} className="text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="px-4 pb-4 space-y-3">
                    {/* Save Image */}
                    <button
                        onClick={handleSave}
                        className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                    >
                        <Download size={18} />
                        Save Image
                    </button>

                    {/* Social Share */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleShareWeChat}
                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                        >
                            <span className="w-5 h-5 bg-white rounded flex items-center justify-center text-emerald-600 text-xs font-bold">W</span>
                            WeChat
                        </button>
                        <button
                            onClick={handleShareLinkedIn}
                            className="flex-1 py-3 bg-[#0A66C2] hover:bg-[#0D80E8] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                        >
                            <span className="text-lg">in</span>
                            LinkedIn
                        </button>
                        <button
                            onClick={handleCopy}
                            className="w-12 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center transition-colors active:scale-[0.98]"
                        >
                            <Copy size={18} className="text-slate-400" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import {
    Settings, Edit3, ChevronRight, Clock, Folder, Image, MessageSquareQuote,
    Sparkles, Target, Zap, ShieldCheck, Rocket
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/lib/haptic";
import { usePersona, PERSONAS } from "@/context/PersonaContext";
import type { PersonaType } from "@/context/PersonaContext";
import { cn } from "@/lib/utils";

interface ProfilePageProps {
    onBack?: () => void;
}

export function ProfilePage({ onBack: _onBack }: ProfilePageProps) {
    const { currentPersona, setPersona } = usePersona();

    const stats = [
        { icon: <Image size={20} className="text-blue-600" />, value: 12, label: "已生成海报", bg: "bg-blue-50" },
        { icon: <MessageSquareQuote size={20} className="text-amber-600" />, value: 5, label: "精彩语录", bg: "bg-amber-50" },
    ];

    const personaIcons: Record<string, any> = {
        VISIONARY: Target,
        INVESTOR: Zap,
        SPECIALIST: ShieldCheck,
        FOUNDER: Rocket
    };

    const insights: Record<PersonaType, any> = {
        VISIONARY: {
            quote: "等离子体推进引擎的最新突破可能在 2030 年前让地火往返时间缩短 40%，这是深空探索的拐点。",
            source: "arXiv: 深空动力学",
            type: "论文",
            time: "10分钟前"
        },
        INVESTOR: {
            quote: "分析 10 年期美债收益率与科技权重股的负相关性，当前正是布局 AI 基础设施分红股的窗口期。",
            source: "高盛宏观周报",
            type: "研究",
            time: "1小时前"
        },
        SPECIALIST: {
            quote: "Figma 的多变量插件极大提升了设计系统的原子化效率，但核心竞争力仍在复杂场景的交互决策。",
            source: "Design Systems Digest",
            type: "洞察",
            time: "3小时前"
        },
        FOUNDER: {
            quote: "在 PLG 阶段，用户获取成本 (CAC) 已不再是核心，用户留存 (Retention) 决定了 LTV 的天花板。",
            source: "SaaS 增长实验室",
            type: "策略",
            time: "30分钟前"
        }
    };

    const recentInsight = insights[currentPersona.id];

    const knowledgeStack = [
        { icon: <Folder size={20} />, title: "我的收藏", subtitle: `24 篇已收藏内容` },
        { icon: <Clock size={20} />, title: "阅读历史", subtitle: `继续追踪 "${currentPersona.name}" 专题` },
    ];

    return (
        <div className="h-full flex flex-col bg-white text-gray-900 font-sans antialiased">
            {/* Fixed Header */}
            <header className="flex-shrink-0 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-100">
                <button className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600">
                    <Settings size={22} />
                </button>
                <span className="text-lg font-bold text-gray-900 tracking-tight">我的知识空间</span>
                <button className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600">
                    <Edit3 size={20} />
                </button>
            </header>

            {/* Scrollable Content */}
            <main className="flex-1 overflow-y-auto px-4 pb-8">
                {/* User Profile & Active Persona */}
                <div className="py-8 flex flex-col items-center">
                    <div className="relative mb-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentPersona.id}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.1, opacity: 0 }}
                                className={cn(
                                    "w-24 h-24 rounded-[32px] bg-gradient-to-br flex items-center justify-center text-4xl shadow-2xl shadow-gray-200 transition-all duration-500",
                                    currentPersona.color
                                )}
                            >
                                {currentPersona.icon}
                            </motion.div>
                        </AnimatePresence>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-50">
                            <Sparkles size={16} className="text-amber-500 fill-amber-500" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 mb-1">{currentPersona.name}</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mb-4">MOSS PERSONAL IDENTITY</p>

                    <div className="flex gap-2 mb-6">
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", currentPersona.secondaryColor)}>
                            {currentPersona.label}
                        </span>
                        <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest leading-none flex items-center">
                            PRO UNLOCKED
                        </span>
                    </div>
                </div>

                {/* Persona Dock - Apple Watch Style Selector */}
                <section className="mb-8 overflow-hidden">
                    <div className="px-2 mb-4">
                        <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">切换情报角色</h3>
                    </div>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 px-1">
                        {(Object.values(PERSONAS) as any[]).map((p) => {
                            const Icon = personaIcons[p.id] || Sparkles;
                            const isActive = p.id === currentPersona.id;

                            return (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        triggerHaptic("medium");
                                        setPersona(p.id as PersonaType);
                                    }}
                                    className={cn(
                                        "flex-shrink-0 w-32 h-40 rounded-[28px] p-4 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group active:scale-95",
                                        isActive
                                            ? "bg-gray-900 text-white shadow-xl shadow-gray-300 -translate-y-1"
                                            : "bg-gray-50 text-gray-400 grayscale hover:grayscale-0 hover:bg-gray-100"
                                    )}
                                >
                                    <Icon size={24} className={cn(isActive ? "text-white" : "text-gray-300")} />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-tighter mb-1 opacity-60">ROLE</p>
                                        <p className="text-sm font-black leading-tight">{p.name.replace('者', '').replace('人', '')}</p>
                                    </div>
                                    {isActive && (
                                        <motion.div
                                            layoutId="hover-outline"
                                            className="absolute inset-0 border-2 border-blue-500/20 rounded-[28px]"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* My Second Brain */}
                <section className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold text-gray-900">我的第二大脑</h3>
                        <span className="text-xs text-gray-400">上次同步于 2分钟前</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {stats.map((stat, i) => (
                            <div
                                key={i}
                                className={`${stat.bg} rounded-xl p-4 border border-gray-100 relative overflow-hidden`}
                            >
                                <div className="absolute top-3 right-3 text-gray-300">
                                    <ChevronRight size={16} />
                                </div>
                                <div className="mb-3">{stat.icon}</div>
                                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recent Insight */}
                <section className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold text-gray-900">近期见解</h3>
                        <button className="text-xs text-blue-600 font-medium">查看全部</button>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="border-l-2 border-blue-600 pl-3 mb-3">
                            <p className="text-sm text-gray-600 italic leading-relaxed">
                                "{recentInsight.quote}"
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-0.5 bg-white rounded text-gray-500 font-medium border border-gray-200">
                                {recentInsight.type}
                            </span>
                            <span className="text-gray-400">{recentInsight.source}</span>
                            <span className="text-gray-300 ml-auto">{recentInsight.time}</span>
                        </div>
                    </div>
                </section>

                {/* Knowledge Stack */}
                <section>
                    <h3 className="text-base font-bold mb-3 text-gray-900">知识储备</h3>
                    <div className="space-y-2">
                        {knowledgeStack.map((item, i) => (
                            <button
                                key={i}
                                onClick={() => triggerHaptic("light")}
                                className="w-full bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-3 hover:bg-gray-100 transition-colors active:scale-[0.99]"
                            >
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-500 border border-gray-200">
                                    {item.icon}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-medium text-gray-900">{item.title}</div>
                                    <div className="text-xs text-gray-400">{item.subtitle}</div>
                                </div>
                                <ChevronRight size={20} className="text-gray-300" />
                            </button>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

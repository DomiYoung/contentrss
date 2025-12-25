import { Notebook, BarChart2, Bell, Globe, Moon, ChevronRight, LogOut } from "lucide-react";
import { triggerHaptic } from "@/lib/haptic";

interface ProfileProps {
    onNavigate: (view: string) => void;
}

export function Profile({ onNavigate }: ProfileProps) {
    const menuItems = [
        { icon: Notebook, label: "我的笔记", id: "my-notes" },
        { icon: Bell, label: "消息通知", id: "notifications" },
        { icon: BarChart2, label: "阅读统计", id: "stats" },
    ];

    const settingsItems = [
        { icon: Globe, label: "语言", value: "中文 (简体)" },
        { icon: Moon, label: "深色模式", value: "系统默认" },
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 pb-24">
            <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-surface-dark relative shadow-xl overflow-hidden">

                {/* Header Profile Section */}
                <div className="pt-12 pb-8 px-6 bg-gradient-to-br from-blue-50 to-white dark:from-surface-dark dark:to-background-dark text-center relative border-b border-gray-100 dark:border-white/5">
                    <div className="relative inline-block mb-4">
                        <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center mx-auto">
                            <span className="text-3xl">👨‍💻</span>
                        </div>
                        <div className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Alex Chen</h2>
                    <p className="text-xs text-gray-500 font-medium">Core Member · Shanghai</p>

                    <button className="mt-4 px-6 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 shadow-sm active:scale-95 transition-all">
                        Edit Profile
                    </button>
                </div>

                {/* Main Menu */}
                <div className="p-6 space-y-6">
                    <div className="space-y-3">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    triggerHaptic("light");
                                    if (item.id === "my-notes") {
                                        onNavigate("my-notes");
                                    }
                                }}
                                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 hover:bg-gray-100 transition-colors active:scale-[0.99]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                                        <item.icon size={20} />
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-white">{item.label}</span>
                                </div>
                                <ChevronRight size={18} className="text-gray-400" />
                            </button>
                        ))}
                    </div>

                    {/* Settings Section */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Settings</h3>
                        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
                            {settingsItems.map((item, i) => (
                                <div key={i} className={`flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${i !== settingsItems.length - 1 ? 'border-b border-gray-50 dark:border-white/5' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <item.icon size={18} className="text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400 font-medium">{item.value}</span>
                                        <ChevronRight size={16} className="text-gray-300" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sign Out */}
                    <button className="w-full py-4 text-center text-red-500 font-bold text-sm hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-2">
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}

import { Home, Radio, User, Newspaper, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/lib/haptic";

type Tab = "home" | "subscribe" | "briefing" | "data" | "profile";

interface BottomNavProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    const tabs = [
        { id: "home" as Tab, icon: Home, label: "Feed" },
        { id: "subscribe" as Tab, icon: Radio, label: "Radar" },
        { id: "briefing" as Tab, icon: Newspaper, label: "Brief" },
        { id: "data" as Tab, icon: Database, label: "Data" },
        { id: "profile" as Tab, icon: User, label: "Me" },
    ];

    const handleTabClick = (tabId: Tab) => {
        if (activeTab !== tabId) {
            triggerHaptic("light");
            onTabChange(tabId);
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#FAF9F6]/95 backdrop-blur-2xl border-t border-zinc-200/50 z-50 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className="relative flex flex-col items-center justify-center flex-1 h-full gap-1 group active:scale-90 transition-transform duration-200"
                        >
                            {isActive && (
                                <div className="absolute top-0 w-8 h-1 bg-zinc-900 rounded-b-full animate-in slide-in-from-top-2 duration-300" />
                            )}
                            <Icon
                                size={22}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={cn(
                                    "transition-all duration-300",
                                    isActive ? "text-zinc-900 scale-110" : "text-zinc-400 group-hover:text-zinc-600"
                                )}
                            />
                            <span
                                className={cn(
                                    "text-[9px] font-black uppercase tracking-[0.15em] transition-colors duration-300",
                                    isActive ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-500"
                                )}
                            >
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

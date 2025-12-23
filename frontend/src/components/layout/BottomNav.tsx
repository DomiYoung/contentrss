import { Home, Radio, User, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "home" | "subscribe" | "briefing" | "profile";

interface BottomNavProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    const tabs = [
        { id: "home" as Tab, icon: Home, label: "Feed" },
        { id: "subscribe" as Tab, icon: Radio, label: "Radar" },
        { id: "briefing" as Tab, icon: Newspaper, label: "\u7b80\u62a5" },
        { id: "profile" as Tab, icon: User, label: "Me" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-zinc-100 z-50 pb-safe">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform"
                        >
                            <Icon
                                size={24}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={cn(
                                    "transition-colors duration-200",
                                    isActive ? "text-zinc-900" : "text-zinc-400"
                                )}
                            />
                            <span
                                className={cn(
                                    "text-[10px] font-medium transition-colors duration-200",
                                    isActive ? "text-zinc-900" : "text-zinc-400"
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

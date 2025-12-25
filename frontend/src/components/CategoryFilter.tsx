/**
 * 统一分类标签筛选器
 * 情报首页和数据中心共用
 */
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/lib/haptic";

// 统一分类定义（与后端 tags.py 保持一致）
export const CATEGORY_TAGS = [
    { key: "all", name: "全部", icon: "📋" },
    { key: "legal", name: "法律法规", icon: "⚖️", color: "#6366F1" },
    { key: "digital", name: "数字化", icon: "💻", color: "#0EA5E9" },
    { key: "brand", name: "品牌", icon: "💎", color: "#EC4899" },
    { key: "rd", name: "新品研发", icon: "🧪", color: "#8B5CF6" },
    { key: "global", name: "国际形势", icon: "🌍", color: "#14B8A6" },
    { key: "insight", name: "行业洞察", icon: "📊", color: "#F59E0B" },
    { key: "ai", name: "AI", icon: "🤖", color: "#10B981" },
    { key: "management", name: "企业管理", icon: "📋", color: "#64748B" },
];

interface CategoryFilterProps {
    activeKey: string;
    onChange: (key: string) => void;
    compact?: boolean; // 紧凑模式：只显示图标
}

export function CategoryFilter({ activeKey, onChange, compact = false }: CategoryFilterProps) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORY_TAGS.map((cat) => {
                const isActive = activeKey === cat.key;
                return (
                    <button
                        key={cat.key}
                        onClick={() => {
                            triggerHaptic("light");
                            onChange(cat.key);
                        }}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                            "border border-transparent",
                            isActive
                                ? "bg-zinc-900 text-white shadow-lg"
                                : "bg-white text-zinc-600 hover:bg-zinc-50 border-zinc-200"
                        )}
                        style={{
                            boxShadow: isActive && cat.color
                                ? `0 4px 14px ${cat.color}30`
                                : undefined
                        }}
                    >
                        <span className="text-base">{cat.icon}</span>
                        {!compact && <span>{cat.name}</span>}
                    </button>
                );
            })}
        </div>
    );
}

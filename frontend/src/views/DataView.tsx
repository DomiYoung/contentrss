import { useState, useEffect } from "react";
import { fetchRawData } from "@/lib/api";
import { DATA_CATEGORIES, type DataCategoryId } from "@/lib/data-categories";
import { RefreshCw, AlertCircle, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/lib/haptic";

// 通用记录类型，适配 Special Chat 返回
interface DataRecord {
    id: string;
    fields: Record<string, unknown>;
}

export function DataView() {
    const [activeCategory, setActiveCategory] = useState<DataCategoryId>("legal");
    const [records, setRecords] = useState<DataRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async (categoryId: DataCategoryId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchRawData(categoryId);
            const items = Array.isArray(response.items) ? response.items : [];
            const mapped = items.map((item: any, idx: number) => {
                const raw = item && typeof item === "object" ? item : {};
                const fields = (raw as any).fields && typeof (raw as any).fields === "object"
                    ? (raw as any).fields
                    : raw;
                const id =
                    (raw as any).record_id ||
                    (raw as any).id ||
                    (fields as any).自增ID ||
                    (fields as any).id ||
                    `item-${idx}`;

                return {
                    id: String(id),
                    fields: fields && typeof fields === "object" ? fields : {}
                };
            });
            setRecords(mapped);
        } catch (err) {
            setError(err instanceof Error ? err.message : "加载失败");
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(activeCategory);
    }, [activeCategory]);

    const handleCategoryChange = (categoryId: DataCategoryId) => {
        if (categoryId !== activeCategory) {
            triggerHaptic("light");
            setActiveCategory(categoryId);
        }
    };

    const activeConfig = DATA_CATEGORIES.find(c => c.id === activeCategory);

    return (
        <div className="flex flex-col min-h-[85vh] bg-zinc-950 rounded-[32px] overflow-hidden border border-zinc-800 shadow-2xl animate-in fade-in zoom-in-95 duration-700">
            {/* 紧凑头部: 分类 Chip + 刷新按钮 */}
            <div className="px-4 py-3 bg-zinc-900/50 border-b border-zinc-800 flex items-center gap-3">
                <div className="flex-1 overflow-x-auto no-scrollbar">
                    <div className="flex gap-2 min-w-max">
                        {DATA_CATEGORIES.map((category) => {
                            const isActive = activeCategory === category.id;
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategoryChange(category.id)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 whitespace-nowrap border",
                                        isActive
                                            ? "text-white border-transparent shadow-lg"
                                            : "bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:bg-zinc-800 hover:text-zinc-200"
                                    )}
                                    style={isActive ? { backgroundColor: category.color } : undefined}
                                >
                                    <span>{category.icon}</span>
                                    <span>{category.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
                <button
                    onClick={() => loadData(activeCategory)}
                    disabled={loading}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-zinc-400 transition-all active:scale-95 disabled:opacity-50 shrink-0"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* 状态栏 */}
            <div className="px-4 py-2 bg-zinc-900/30 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-zinc-400">
                        共 {records.length} 条
                    </span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-[11px] font-bold" style={{ color: activeConfig?.color }}>
                        {activeConfig?.label}
                    </span>
                </div>
                <span className={cn(
                    "text-[10px] font-mono font-bold uppercase",
                    loading ? "text-amber-500 animate-pulse" : error ? "text-rose-500" : "text-emerald-500"
                )}>
                    {loading ? "加载中..." : error ? "错误" : "就绪"}
                </span>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-3 space-y-2 no-scrollbar">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
                        <div className="w-8 h-8 border-2 border-zinc-800 border-t-emerald-500 rounded-full animate-spin" />
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">查询 {activeConfig?.label}...</span>
                    </div>
                ) : error ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
                        <AlertCircle size={32} className="text-rose-500" />
                        <span className="text-[12px] font-bold text-rose-400">{error}</span>
                        <button
                            onClick={() => loadData(activeCategory)}
                            className="px-4 py-2 bg-rose-500/10 text-rose-400 rounded-full text-[11px] font-bold hover:bg-rose-500/20 transition-colors"
                        >
                            重试
                        </button>
                    </div>
                ) : records.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
                        <Layers size={32} className="text-zinc-600" />
                        <span className="text-[12px] font-bold text-zinc-500">暂无数据</span>
                    </div>
                ) : (
                    records.map((record, idx) => (
                        <div
                            key={record.id || idx}
                            className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl hover:bg-zinc-900/50 transition-colors group"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-mono text-zinc-600 font-bold px-1.5 py-0.5 border border-zinc-800 rounded">#{idx + 1}</span>
                                    <div
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: activeConfig?.color }}
                                    />
                                </div>
                                <Layers size={12} className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                            </div>

                            {/* 渲染字段 */}
                            <div className="space-y-3">
                                {Object.entries(record.fields || {}).map(([key, value]) => {
                                    // 尝试解析嵌套的 JSON 字符串（如 "文章信息"）
                                    let parsedValue = value;
                                    let isNested = false;

                                    if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
                                        try {
                                            parsedValue = JSON.parse(value);
                                            isNested = true;
                                        } catch (e) {
                                            // 解析失败则保持原样
                                        }
                                    }

                                    return (
                                        <div key={key} className="flex flex-col gap-1">
                                            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider border-l-2 border-zinc-700 pl-2">
                                                {key}
                                            </span>
                                            <div className="bg-zinc-950/50 rounded-lg p-2 border border-zinc-800/30">
                                                {isNested && typeof parsedValue === 'object' ? (
                                                    <div className="space-y-2">
                                                        {Object.entries(parsedValue as Record<string, any>).map(([subKey, subValue]) => (
                                                            <div key={subKey} className="flex flex-col">
                                                                <span className="text-[7px] text-zinc-600 uppercase font-black">{subKey}</span>
                                                                <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                                                                    {String(subValue || '-')}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-[11px] font-mono text-zinc-300 leading-relaxed break-all">
                                                        {String(value || '-')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 紧凑 Footer */}
            <div className="px-4 py-2 bg-zinc-900/40 border-t border-zinc-800 flex justify-between items-center">
                <span className="text-[8px] text-zinc-600 font-mono uppercase">元数据源</span>
                <span className="text-[8px] text-zinc-600 font-mono">feishu-bitable</span>
            </div>
        </div>
    );
}

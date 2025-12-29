import { useState, useEffect, useCallback } from "react";
import { fetchRawData, clearApiCache } from "@/lib/api";
import { DATA_CATEGORIES, type DataCategoryId } from "@/lib/data-categories";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/lib/haptic";
import { PullToRefresh } from "@/components/ui/PullToRefresh";

// 扩展数据类型以包含图片和元数据
interface ArticleItem {
    id: string;
    title: string;
    description: string;
    category: string;
    imageUrl: string;
    date: string;
    readTime: string;
}

// 模拟图片生成器 (基于分类)
const getCategoryResultImage = (_categoryId: string, index: number) => {
    const images = [
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80", // AI
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",     // Tech
        "https://images.unsplash.com/photo-1611974765270-ca12586343bb?w=800&q=80",   // Finance
        "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80",   // Legal
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",      // Data
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",   // Business
    ];
    return images[index % images.length];
};

export function DataView() {
    const [activeCategory, setActiveCategory] = useState<DataCategoryId | "all">("all");
    const [articles, setArticles] = useState<ArticleItem[]>([]);
    const [loading, setLoading] = useState(true);

    // 加载数据的函数
    const loadArticles = useCallback(async (forceRefresh: boolean = false) => {
        if (!forceRefresh) {
            setLoading(true);
        }

        try {
            // 如果强制刷新，先清除缓存
            if (forceRefresh) {
                await clearApiCache();
                console.log("🔄 缓存已清除，正在获取最新数据...");
            }

            let rawItems: Array<Record<string, unknown>> = [];
            if (activeCategory === "all") {
                const [res1, res2] = await Promise.all([
                    fetchRawData("ai", forceRefresh),
                    fetchRawData("digital", forceRefresh)
                ]);
                rawItems = [...(res1.items || []), ...(res2.items || [])];
            } else {
                const res = await fetchRawData(activeCategory, forceRefresh);
                rawItems = res.items || [];
            }

            // 转换数据格式 (参考 specs/interface-data-mapping/spec.md)
            const mapped: ArticleItem[] = rawItems.map((item: Record<string, unknown>, idx: number) => {
                const fields = (item.fields || {}) as Record<string, unknown>;

                // 1. 优先使用直接字段
                let title = fields["文章标题-moss用"] as string;
                let description = "";

                // 2. 解析嵌套 JSON 作为备选
                const infoStr = fields["文章信息"] as string;
                if (infoStr && typeof infoStr === 'string') {
                    try {
                        const info = JSON.parse(infoStr);
                        title = title || info.文章标题 || info["文章标题"];
                        description = info.摘要 || info["摘要"] || "";
                    } catch (e) {
                        console.warn("JSON parse failed for 文章信息:", e);
                    }
                }

                // 3. 最终 fallback
                title = title || (fields["Title"] as string) || "Untitled Article";
                description = description || (fields["Summary"] as string) || "No description available.";

                // 4. 格式化日期
                const ingestedAt = item.ingested_at as string;
                let dateDisplay = "Unknown";
                if (ingestedAt) {
                    try {
                        const date = new Date(ingestedAt);
                        const now = new Date();
                        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
                        dateDisplay = diffDays === 0 ? "Today" : diffDays === 1 ? "Yesterday" : `${diffDays}d ago`;
                    } catch {
                        dateDisplay = ingestedAt.split("T")[0];
                    }
                }

                return {
                    id: (item.record_id as string) || `art-${idx}`,
                    title,
                    description,
                    category: activeCategory === "all" ? (idx % 2 === 0 ? "AI" : "Tech") : DATA_CATEGORIES.find(c => c.id === activeCategory)?.label || "General",
                    imageUrl: getCategoryResultImage(activeCategory, idx),
                    date: dateDisplay,
                    readTime: `${Math.max(2, Math.ceil(description.length / 200))} min read`
                };
            });

            setArticles(mapped);
        } catch (err) {
            console.error("Failed to load articles", err);
        } finally {
            setLoading(false);
        }
    }, [activeCategory]);

    // 初始加载
    useEffect(() => {
        loadArticles();
    }, [loadArticles]);

    // 下拉刷新处理
    const handlePullRefresh = async () => {
        await loadArticles(true);
    };

    const handleCategoryChange = (id: DataCategoryId | "all") => {
        triggerHaptic("light");
        setActiveCategory(id);
    };

    // const filteredArticles = articles; // Removed unused variable

    return (
        <div className="h-screen flex flex-col bg-white text-gray-900 font-sans selection:bg-blue-100">
            {/* Fixed Header */}
            <header className="flex-shrink-0 px-5 py-4 flex items-center justify-between bg-white border-b border-gray-100">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-0.5">Intelligence Hub</span>
                    <h1 className="text-[22px] font-black tracking-tight text-gray-900 leading-none">Articles</h1>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-900 active:scale-90 transition-transform bg-gray-50 rounded-full">
                    <Search size={20} />
                </button>
            </header>

            {/* Scrollable Content Area with Pull-to-Refresh */}
            <PullToRefresh onRefresh={handlePullRefresh} disabled={loading}>
                <div className="px-5 pt-4 pb-28">

                    {/* Modern Category Chips */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
                        <button
                            onClick={() => handleCategoryChange("all")}
                            className={cn(
                                "px-5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all duration-300",
                                activeCategory === "all"
                                    ? "bg-gray-900 text-white briefing-card-shadow"
                                    : "bg-gray-50 text-gray-400 hover:text-gray-600"
                            )}
                        >
                            ALL
                        </button>
                        {DATA_CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.id)}
                                className={cn(
                                    "px-5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all duration-300",
                                    activeCategory === cat.id
                                        ? "bg-gray-900 text-white briefing-card-shadow"
                                        : "bg-gray-50 text-gray-400 hover:text-gray-600"
                                )}
                        >
                            {cat.label.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Articles List */}
                <div className="space-y-4">
                    {loading ? (
                        // Loading skeleton - matches article card structure
                        Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="flex gap-4 p-4">
                                    {/* Thumbnail skeleton */}
                                    <div className="flex-shrink-0 w-24 h-24 rounded-xl skeleton-shimmer" />
                                    {/* Content skeleton */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                        <div className="space-y-2">
                                            {/* Category + date */}
                                            <div className="flex items-center gap-2">
                                                <div className="h-3 w-12 rounded skeleton-shimmer" />
                                                <div className="h-3 w-16 rounded skeleton-shimmer" />
                                            </div>
                                            {/* Title */}
                                            <div className="h-4 w-full rounded skeleton-shimmer" />
                                            <div className="h-4 w-3/4 rounded skeleton-shimmer" />
                                            {/* Description */}
                                            <div className="h-3 w-full rounded skeleton-shimmer opacity-60" />
                                        </div>
                                        {/* Read time */}
                                        <div className="h-3 w-16 rounded skeleton-shimmer opacity-40 mt-2" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : articles.length > 0 ? (
                        // Article cards
                        articles.map((article) => (
                            <article
                                key={article.id}
                                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all duration-200 active:scale-[0.99]"
                            >
                                <div className="flex gap-4 p-4">
                                    {/* Thumbnail */}
                                    <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
                                        <img
                                            src={article.imageUrl}
                                            alt=""
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                                                    {article.category}
                                                </span>
                                                <span className="text-[10px] text-gray-300">•</span>
                                                <span className="text-[10px] text-gray-400">{article.date}</span>
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug mb-1">
                                                {article.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                                {article.description}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] text-gray-400">{article.readTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        // Empty state
                        <div className="py-20 text-center flex flex-col items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200">
                                <Search size={24} />
                            </div>
                            <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No articles found</p>
                        </div>
                    )}
                </div>
                </div>
            </PullToRefresh>
        </div>
    );
}

// NavItem handles by App.tsx through BottomNav

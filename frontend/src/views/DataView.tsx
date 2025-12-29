import { useState, useEffect, useCallback } from "react";
import { fetchRawData, clearApiCache } from "@/lib/api";
import { DATA_CATEGORIES, type DataCategoryId } from "@/lib/data-categories";
import { Search, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/lib/haptic";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { ArticleDetail } from "@/views/ArticleDetail";
import { AppleNewsCard } from "@/components/AppleNewsCard";

// Apple News 风格数据结构 (简洁、真实数据优先)
interface ArticleItem {
    id: number;  // ✅ 改为number以匹配后端和ArticleDetail
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
    const [activeCategory, setActiveCategory] = useState<DataCategoryId | "all">("legal"); // ✅ 默认法律法规
    const [articles, setArticles] = useState<ArticleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);

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

            // 直接请求当前分类的数据
            const res = await fetchRawData(activeCategory, forceRefresh);
            const rawItems = res.items || [];

            // 转换数据格式（后端返回的是扁平结构，直接读取字段）
            const mapped: ArticleItem[] = rawItems.map((item: Record<string, unknown>, idx: number) => {
                // ✅ 后端返回扁平结构：{ title, summary, ingested_at, source_name, ... }
                const title = (item.title as string) || "无标题";
                const description = (item.summary as string) || "暂无摘要";
                const sourceName = (item.source_name as string) || "未知来源"; // ✅ 提取来源

                // 格式化日期（显示实际日期 YYYY-MM-DD）
                const ingestedAt = item.ingested_at as string;
                let dateDisplay = "Unknown";
                if (ingestedAt) {
                    // 直接提取日期部分（格式：2025-12-29 16:29:23 或 2025-12-29T16:29:23）
                    dateDisplay = ingestedAt.split(" ")[0].split("T")[0]; // 提取 YYYY-MM-DD
                }

                return {
                    id: (item.id as number) || idx,  // ✅ 使用后端返回的 id 字段
                    title,
                    description,
                    category: activeCategory === "all" ? (idx % 2 === 0 ? "AI" : "Tech") : DATA_CATEGORIES.find(c => c.id === activeCategory)?.label || "General",
                    imageUrl: getCategoryResultImage(activeCategory, idx),
                    date: dateDisplay,
                    readTime: sourceName // ✅ 用 sourceName 替代 readTime
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

    // 处理文章点击 - 跳转到详情页
    const handleArticleClick = (articleId: number) => {
        triggerHaptic("medium");
        setSelectedArticleId(articleId);
    };

    // 如果选中了文章,显示详情页
    if (selectedArticleId !== null) {
        return <ArticleDetail id={selectedArticleId} onBack={() => setSelectedArticleId(null)} />;
    }

    // const filteredArticles = articles; // Removed unused variable

    return (
        <div className="h-screen flex flex-col bg-[#F5F5F7] text-gray-900 selection:bg-rose-100">
            {/* Fixed Header - Apple News Style */}
            <header className="flex-shrink-0 px-6 py-5 flex items-center justify-between bg-white border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <Newspaper size={24} className="text-rose-600" strokeWidth={2.5} />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-rose-600 uppercase tracking-widest">Intelligence</span>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 leading-none">Latest Stories</h1>
                    </div>
                </div>
                <button className="p-2.5 text-gray-400 hover:text-gray-900 active:scale-90 transition-all bg-gray-100 rounded-full">
                    <Search size={20} strokeWidth={2.5} />
                </button>
            </header>

            {/* Scrollable Content Area with Pull-to-Refresh */}
            <PullToRefresh onRefresh={handlePullRefresh} disabled={loading}>
                <div className="px-5 pt-4 pb-28">

                    {/* Apple News Category Pills */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
                        <button
                            onClick={() => handleCategoryChange("all")}
                            className={cn(
                                "px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-300 rounded-full",
                                activeCategory === "all"
                                    ? "bg-gray-900 text-white shadow-lg"
                                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                            )}
                        >
                            全部
                        </button>
                        {DATA_CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.id)}
                                className={cn(
                                    "px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-all duration-300 rounded-full",
                                    activeCategory === cat.id
                                        ? "bg-gray-900 text-white shadow-lg"
                                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                )}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Articles Grid - Apple News Style */}
                <div className="grid grid-cols-1 gap-6">
                    {loading ? (
                        // Apple News Loading Skeleton
                        Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-3xl overflow-hidden animate-pulse border border-gray-200"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="aspect-[16/9] bg-gray-200" />
                                <div className="p-5 space-y-3">
                                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                                    <div className="h-4 bg-gray-100 rounded w-full" />
                                    <div className="h-4 bg-gray-100 rounded w-5/6" />
                                </div>
                            </div>
                        ))
                    ) : articles.length > 0 ? (
                        // Apple News Style Cards
                        articles.map((article) => (
                            <AppleNewsCard
                                key={article.id}
                                id={article.id}
                                title={article.title}
                                description={article.description}
                                category={article.category}
                                imageUrl={article.imageUrl}
                                date={article.date}
                                readTime={article.readTime}
                                onClick={() => handleArticleClick(article.id)}
                            />
                        ))
                    ) : (
                        // Empty state - Apple News Style
                        <div className="py-24 text-center flex flex-col items-center gap-5">
                            <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center text-gray-300">
                                <Search size={32} strokeWidth={2} />
                            </div>
                            <div className="space-y-2">
                                <p className="text-lg font-bold text-gray-900">暂无内容</p>
                                <p className="text-sm text-gray-500">调整分类筛选或稍后再试</p>
                            </div>
                        </div>
                    )}
                </div>
                </div>
            </PullToRefresh>
        </div>
    );
}

// NavItem handles by App.tsx through BottomNav

import { useState, useEffect } from "react";
import { fetchRawData } from "@/lib/api";
import { DATA_CATEGORIES, type DataCategoryId } from "@/lib/data-categories";
import { Search, Settings, Clock, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/lib/haptic";

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
const getCategoryResultImage = (categoryId: string, index: number) => {
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
    const [searchQuery, setSearchQuery] = useState("");

    // 加载数据
    useEffect(() => {
        const loadArticles = async () => {
            setLoading(true);
            try {
                // 如果是 "all"，我们可以并行加载几个主要分类，或者只加载默认的一个
                // 为了演示效果，这里我们加载 'ai' 和 'digital' 作为混合数据
                let rawItems = [];
                if (activeCategory === "all") {
                    const [res1, res2] = await Promise.all([
                        fetchRawData("ai"),
                        fetchRawData("digital")
                    ]);
                    rawItems = [...(res1.items || []), ...(res2.items || [])];
                } else {
                    const res = await fetchRawData(activeCategory);
                    rawItems = res.items || [];
                }

                // 转换数据格式
                const mapped: ArticleItem[] = rawItems.map((item: any, idx: number) => {
                    const fields = item.fields || {};
                    return {
                        id: item.record_id || `art-${idx}`,
                        title: fields["文章标题"] || fields["Title"] || "Untitled Article",
                        description: fields["摘要"] || fields["Summary"] || "No description available for this intelligence item.",
                        category: activeCategory === "all" ? (idx % 2 === 0 ? "AI" : "Tech") : DATA_CATEGORIES.find(c => c.id === activeCategory)?.label || "General",
                        imageUrl: getCategoryResultImage(activeCategory, idx),
                        date: "2d ago", // 模拟数据
                        readTime: "5 min read" // 模拟数据
                    };
                });

                setArticles(mapped);
            } catch (err) {
                console.error("Failed to load articles", err);
            } finally {
                setLoading(false);
            }
        };

        loadArticles();
    }, [activeCategory]);

    const handleCategoryChange = (id: DataCategoryId | "all") => {
        triggerHaptic("light");
        setActiveCategory(id);
    };

    // 过滤文章
    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0D0D0D] text-white font-sans selection:bg-cyan-500/30 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-slate-800/50">
                <h1 className="text-lg font-bold">Intelligence</h1>
                <button className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors">
                    <Settings size={20} />
                </button>
            </header>

            <div className="px-4 mt-2">
                {/* Search Bar */}
                <div className="relative mb-6 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-xl py-3 pl-10 pr-4 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    />
                </div>

                {/* Category Chips */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
                    <button
                        onClick={() => handleCategoryChange("all")}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border",
                            activeCategory === "all"
                                ? "bg-slate-800 text-white border-slate-700"
                                : "bg-transparent text-slate-500 border-slate-800 hover:text-slate-300"
                        )}
                    >
                        All
                    </button>
                    {DATA_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryChange(cat.id)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border",
                                activeCategory === cat.id
                                    ? "bg-slate-800 text-white border-slate-700"
                                    : "bg-transparent text-slate-500 border-slate-800 hover:text-slate-300"
                            )}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Articles List */}
                <div className="space-y-6">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="w-full h-48 bg-slate-900 rounded-2xl mb-3"></div>
                                <div className="h-4 bg-slate-900 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-slate-900 rounded w-1/2"></div>
                            </div>
                        ))
                    ) : filteredArticles.length > 0 ? (
                        filteredArticles.map((article) => (
                            <div
                                key={article.id}
                                className="group cursor-pointer active:scale-[0.98] transition-transform duration-200"
                                onClick={() => triggerHaptic("medium")}
                            >
                                {/* Image Card */}
                                <div className="relative aspect-[16/9] mb-3 overflow-hidden rounded-2xl border border-slate-800/50">
                                    <img
                                        src={article.imageUrl}
                                        alt={article.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent opacity-60"></div>
                                </div>

                                {/* Content */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-100 leading-snug mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                                        {article.title}
                                    </h3>
                                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-2">
                                        {article.description}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                        <span>{article.date}</span>
                                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                        <span>{article.readTime}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center text-slate-500">
                            No articles found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

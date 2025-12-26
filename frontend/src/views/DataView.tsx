import { useState, useEffect } from "react";
import { fetchRawData } from "@/lib/api";
import { DATA_CATEGORIES, type DataCategoryId } from "@/lib/data-categories";
import { Search, Settings, Eye, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/lib/haptic";
import { useReadingTracker } from "@/hooks/useReadingTracker";

// 扩展数据类型以包含图片和元数据
interface ArticleItem {
    id: string;
    title: string;
    description: string;
    content: string; // 完整内容，用于详情页
    category: string;
    imageUrl: string;
    date: string;  // 格式化后的时间字符串 ("2天前")
    ingestedAt: string;  // 原始入库时间
    readTime: string;
    viewCount: number; // 阅读人数
    sourceName?: string;
    sourceUrl?: string;
    // AI 洞察字段
    popularityScore: number;  // 热度指数 (0-100)
    sentiment: 'positive' | 'negative' | 'neutral';  // 情感倾向
    impactScore: number;  // 影响力 (0-100)
    freshness: 'hot' | 'recent' | 'archived';  // 时效性
}

// 模拟图片生成器 (基于分类)
const getCategoryImage = (categoryId: string, index: number) => {
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

// 根据内容长度计算阅读时间
const calculateReadTime = (content: string): string => {
    const wordsPerMinute = 200; // 中文约每分钟 200 字
    const charCount = content?.length || 0;
    const minutes = Math.max(1, Math.ceil(charCount / wordsPerMinute));
    return `${minutes} 分钟阅读`;
};

// 格式化时间为"几天前"
const formatTimeAgo = (dateStr: string): string => {
    if (!dateStr) return '刚刚';

    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return '刚刚';
        if (diffMins < 60) return `${diffMins} 分钟前`;
        if (diffHours < 24) return `${diffHours} 小时前`;
        if (diffDays < 7) return `${diffDays} 天前`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`;
        return `${Math.floor(diffDays / 30)} 个月前`;
    } catch {
        return '刚刚';
    }
};

// 模拟阅读人数（基于 id hash）
const generateViewCount = (id: string): number => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i);
    }
    return Math.abs(hash % 1000) + 100; // 100-1100 之间
};

interface ArticleDetailViewProps {
    article: ArticleItem;
    onBack: () => void;
}

// 内嵌的详情页组件 - Premium Design
function ArticleDetailView({ article, onBack }: ArticleDetailViewProps) {
    // 阅读时间追踪
    const { markCompleted } = useReadingTracker({
        articleId: article.id,
        onComplete: () => console.log('阅读完成:', article.id)
    });

    // 计算 AI 洞察指标
    const getSentimentLabel = (s: string) => {
        switch (s) {
            case 'positive': return { text: '正面', color: 'text-emerald-600' };
            case 'negative': return { text: '负面', color: 'text-rose-500' };
            default: return { text: '中性', color: 'text-gray-600' };
        }
    };

    const getFreshnessLabel = (f: string) => {
        switch (f) {
            case 'hot': return { text: '热点', color: 'text-rose-500' };
            case 'recent': return { text: '近期', color: 'text-blue-600' };
            default: return { text: '归档', color: 'text-gray-400' };
        }
    };

    const getImpactLabel = (score: number) => {
        if (score >= 70) return { text: '高', color: 'text-rose-500' };
        if (score >= 40) return { text: '中', color: 'text-orange-500' };
        return { text: '低', color: 'text-gray-400' };
    };

    const sentimentInfo = getSentimentLabel(article.sentiment);
    const freshnessInfo = getFreshnessLabel(article.freshness);
    const impactInfo = getImpactLabel(article.impactScore);

    const aiInsights = {
        summary: article.description,
        metrics: [
            { label: "热度指数", value: `${article.popularityScore}%`, color: article.popularityScore >= 60 ? "text-orange-500" : "text-gray-600" },
            { label: "情感倾向", value: sentimentInfo.text, color: sentimentInfo.color },
            { label: "影响力", value: impactInfo.text, color: impactInfo.color },
            { label: "时效性", value: freshnessInfo.text, color: freshnessInfo.color },
        ]
    };

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 text-gray-900 active:scale-90 transition-transform"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:text-gray-900 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M3 12h18M3 18h18" />
                        </svg>
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-900 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                        </svg>
                    </button>
                </div>
            </header>

            <article className="px-5 py-4">
                {/* AI 导读卡片 (THE BRAIN) */}
                <div className="bg-[#f8fafc] rounded-2xl p-5 mb-6 border border-gray-100">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white text-sm">?</span>
                        </div>
                        <span className="text-sm font-bold text-blue-600 tracking-wide">AI 导读 (THE BRAIN)</span>
                    </div>

                    {/* TL;DR Summary */}
                    <div className="mb-5">
                        <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-bold rounded mr-2">TL;DR</span>
                        <span className="text-base text-gray-800 leading-relaxed font-medium">
                            {aiInsights.summary}
                        </span>
                    </div>

                    {/* Separator */}
                    <div className="border-t border-gray-200 my-4"></div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {aiInsights.metrics.map((metric, i) => (
                            <div key={i}>
                                <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">{metric.label}</div>
                                <div className={cn("text-base font-bold", metric.color)}>{metric.value}</div>
                            </div>
                        ))}
                    </div>
                    {/* 原文链接 */}
                    {article.sourceUrl && (
                        <a
                            href={article.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full text-sm font-medium transition-colors"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                            原文链接
                        </a>
                    )}
                </div>

                {/* Title */}
                <h1 className="text-[24px] font-black text-gray-900 leading-[1.2] tracking-tight mb-4">
                    {article.title}
                </h1>

                {/* Author Info */}
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                        {article.sourceName?.charAt(0) || "A"}
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">{article.sourceName || "Unknown Author"}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{article.date}</span>
                            <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {article.readTime}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content Body with Drop Cap */}
                <div className="space-y-5">
                    {article.content.split('\n\n').map((para, i) => {
                        // 检测是否为标题（短且无句号）
                        const isHeading = para.length < 30 && !para.includes('。') && !para.includes('.');
                        // 检测是否为引用（双引号开头）
                        const isQuote = para.startsWith('"') || para.startsWith('"') || para.startsWith('「');

                        if (isHeading) {
                            return (
                                <h2 key={i} className="text-lg font-bold text-gray-900 mt-8 mb-3">
                                    {para}
                                </h2>
                            );
                        }

                        if (isQuote) {
                            return (
                                <blockquote key={i} className="border-l-4 border-blue-500 pl-4 py-2 my-6 italic text-gray-600">
                                    {para}
                                </blockquote>
                            );
                        }

                        return (
                            <p
                                key={i}
                                className={cn(
                                    "text-[15px] leading-[1.8] text-gray-700",
                                    i === 0 && "first-letter:float-left first-letter:text-[3rem] first-letter:font-black first-letter:mr-2 first-letter:mt-1 first-letter:leading-none first-letter:text-blue-600"
                                )}
                            >
                                {para}
                            </p>
                        );
                    })}
                </div>

                {/* Hero Image with Caption */}
                <figure className="my-8 -mx-5">
                    <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full aspect-[16/10] object-cover"
                    />
                    <figcaption className="px-5 pt-2 text-xs text-gray-400 italic">
                        Figure 1: {article.category} 相关图表
                    </figcaption>
                </figure>
            </article>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-3 flex items-center justify-between z-50">
                <div className="flex items-center gap-6">
                    <button className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-gray-900 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
                        </svg>
                        <span className="text-[10px] font-medium">Share</span>
                    </button>
                    <button className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-gray-900 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                        <span className="text-[10px] font-medium">Save</span>
                    </button>
                    <button className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-gray-900 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        <span className="text-[10px] font-medium">Note</span>
                    </button>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-lg shadow-blue-200">
                    <span>✦</span>
                    AI Follow-up
                </button>
            </div>
        </div>
    );
}

export function DataView() {
    const [activeCategory, setActiveCategory] = useState<DataCategoryId | "all">("all");
    const [articles, setArticles] = useState<ArticleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);

    // 加载数据
    useEffect(() => {
        const loadArticles = async () => {
            setLoading(true);
            try {
                const categoryToFetch = activeCategory === "all" ? "legal" : activeCategory;
                const res = await fetchRawData(categoryToFetch);
                const rawItems = res.items || [];

                const mapped: ArticleItem[] = rawItems.map((item: any, idx: number) => {
                    const fields = item.fields || {};
                    let title = item.title || fields["文章标题"] || fields["Title"] || fields["title"];
                    let summary = item.fact || item.summary || fields["摘要"] || fields["Summary"] || fields["summary"];
                    let content = item.content || fields["content"] || summary || "";
                    let source = item.source_name || fields["来源"] || fields["Source"] || "Unknown Source";
                    let sourceUrl = item.source_url || fields["文章URL"] || fields["url"];

                    // 解析 "文章信息" 嵌套 JSON
                    if (fields["文章信息"] && typeof fields["文章信息"] === 'string') {
                        try {
                            const info = JSON.parse(fields["文章信息"]);
                            title = info["文章标题"] || title;
                            summary = info["摘要"] || summary;
                            content = info["摘要"] || content; // 使用摘要作为内容
                            source = info["作者名称"] || source;
                            sourceUrl = info["文章URL"] || sourceUrl;
                        } catch (e) {
                            console.warn("Failed to parse 文章信息", e);
                        }
                    }

                    if (!title) return null;

                    const articleId = String(item.id || item.record_id || `art-${idx}`);
                    const articleViewCount = generateViewCount(articleId);
                    const contentLength = (content || summary || "").length;
                    const ingestedAt = item.ingested_at || new Date().toISOString();

                    // 计算 AI 洞察指标
                    // 热度指数: 基于 viewCount 的模拟百分位 (0-100)
                    const popularityScore = Math.min(100, Math.round((articleViewCount / 1100) * 100));

                    // 情感倾向: 基于关键词简单判断 (实际应由 AI 分析)
                    const positiveWords = ['增长', '突破', '成功', '创新', '利好', '上涨', '批准'];
                    const negativeWords = ['下跌', '风险', '危机', '损失', '失败', '警告', '违规'];
                    const textToAnalyze = String(title) + String(summary);
                    const posCount = positiveWords.filter(w => textToAnalyze.includes(w)).length;
                    const negCount = negativeWords.filter(w => textToAnalyze.includes(w)).length;
                    const sentiment: 'positive' | 'negative' | 'neutral' =
                        posCount > negCount ? 'positive' : negCount > posCount ? 'negative' : 'neutral';

                    // 影响力: 基于内容长度和来源 (0-100)
                    const lengthFactor = Math.min(50, Math.round(contentLength / 20));
                    const sourceFactor = source.includes('央视') || source.includes('人民') ? 50 :
                        source.includes('财经') || source.includes('第一') ? 40 : 30;
                    const impactScore = Math.min(100, lengthFactor + sourceFactor);

                    // 时效性: 基于 ingested_at 计算
                    const hoursAgo = (Date.now() - new Date(ingestedAt).getTime()) / (1000 * 60 * 60);
                    const freshness: 'hot' | 'recent' | 'archived' =
                        hoursAgo < 24 ? 'hot' : hoursAgo < 168 ? 'recent' : 'archived';

                    return {
                        id: articleId,
                        title: String(title),
                        description: summary ? String(summary).slice(0, 120) + "..." : "No description available.",
                        content: content || summary || "暂无详细内容",
                        category: DATA_CATEGORIES.find(c => c.id === activeCategory)?.label || "General",
                        imageUrl: getCategoryImage(activeCategory === "all" ? "tech" : activeCategory, idx),
                        date: formatTimeAgo(ingestedAt),
                        ingestedAt: ingestedAt,
                        readTime: calculateReadTime(content || summary || ""),
                        viewCount: articleViewCount,
                        sourceName: source,
                        sourceUrl: sourceUrl,
                        // AI 洞察字段
                        popularityScore,
                        sentiment,
                        impactScore,
                        freshness
                    };
                }).filter(Boolean) as ArticleItem[];

                setArticles(mapped);
            } catch (err) {
                console.error("Failed to load articles", err);
                setArticles([]);
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

    const handleArticleClick = (article: ArticleItem) => {
        triggerHaptic("medium");
        setSelectedArticle(article);
    };

    const handleBack = () => {
        triggerHaptic("light");
        setSelectedArticle(null);
    };

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 详情页视图
    if (selectedArticle) {
        return <ArticleDetailView article={selectedArticle} onBack={handleBack} />;
    }

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-100 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-transparent">
                <div className="flex-1"></div>
                <h1 className="text-base font-bold text-gray-900">Intelligence</h1>
                <div className="flex-1 flex justify-end">
                    <button className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            <div className="px-4 mt-2">
                {/* Search Bar */}
                <div className="relative mb-4 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400 group-focus-within:text-gray-600 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent text-gray-900 text-sm rounded-xl py-3 pl-10 pr-4 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-100 transition-all"
                    />
                </div>

                {/* Category Chips */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
                    <button
                        onClick={() => handleCategoryChange("all")}
                        className={cn(
                            "px-5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-sm",
                            activeCategory === "all"
                                ? "bg-black text-white border-black"
                                : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                        )}
                    >
                        All
                    </button>
                    {DATA_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryChange(cat.id)}
                            className={cn(
                                "px-5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-sm",
                                activeCategory === cat.id
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
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
                            <div key={i} className="animate-pulse space-y-3">
                                <div className="w-full h-48 bg-gray-100 rounded-2xl"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))
                    ) : filteredArticles.length > 0 ? (
                        filteredArticles.map((article) => (
                            <div
                                key={article.id}
                                className="group cursor-pointer active:scale-[0.99] transition-transform duration-200"
                                onClick={() => handleArticleClick(article)}
                            >
                                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group-hover:shadow transition-all">
                                    <div className="relative aspect-[2/1] overflow-hidden">
                                        <img
                                            src={article.imageUrl}
                                            alt={article.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                                            {article.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">
                                            {article.description}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                                            <span>{article.date}</span>
                                            <span className="w-0.5 h-0.5 bg-gray-300 rounded-full"></span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {article.readTime}
                                            </span>
                                            <span className="w-0.5 h-0.5 bg-gray-300 rounded-full"></span>
                                            <span className="flex items-center gap-1">
                                                <Eye size={12} />
                                                {article.viewCount}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center text-gray-400">
                            <div className="mb-2">🍃</div>
                            No articles found.
                            {activeCategory !== 'all' && (
                                <button
                                    className="block mx-auto mt-4 text-xs text-blue-500 underline"
                                    onClick={() => handleCategoryChange('all')}
                                >
                                    View All Categories
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import { Clock, Bookmark } from "lucide-react";
import type { FC } from "react";

// Apple News 风格卡片
interface AppleNewsCardProps {
    id: number;  // ✅ 改为number类型
    title: string;
    description: string;
    category: string;
    imageUrl: string;
    date: string;
    readTime: string;
    onClick: () => void;
}

// 计算相对时间
const getRelativeTime = (dateStr: string): string => {
    const now = new Date();
    const articleDate = new Date(dateStr);
    const hoursAgo = Math.floor((now.getTime() - articleDate.getTime()) / (1000 * 60 * 60));
    
    if (hoursAgo < 1) return "刚刚";
    if (hoursAgo < 24) return `${hoursAgo}小时前`;
    const daysAgo = Math.floor(hoursAgo / 24);
    if (daysAgo < 7) return `${daysAgo}天前`;
    return dateStr;
};

export const AppleNewsCard: FC<AppleNewsCardProps> = ({
    title,
    description,
    category,
    imageUrl,
    date,
    readTime,
    onClick
}) => {
    const timeText = getRelativeTime(date);

    return (
        <article
            onClick={onClick}
            className="group bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 active:scale-[0.98] cursor-pointer border border-gray-100"
        >
            {/* 封面图片 */}
            <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                <img
                    src={imageUrl}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect fill='%23f3f4f6' width='400' height='225'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='-apple-system' font-size='16' fill='%239ca3af'%3E暂无图片%3C/text%3E%3C/svg%3E";
                    }}
                />
                
                {/* 分类标签 */}
                <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-rose-600 shadow-lg">
                        {category}
                    </span>
                </div>

                {/* 收藏按钮 */}
                <button 
                    className="absolute top-4 right-4 w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg text-gray-400 hover:text-rose-600 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        // 收藏逻辑
                    }}
                >
                    <Bookmark size={16} />
                </button>
            </div>

            {/* 内容区 */}
            <div className="p-5">
                {/* 标题 */}
                <h3 className="text-xl font-bold text-gray-900 leading-snug mb-3 line-clamp-2 group-hover:text-rose-600 transition-colors">
                    {title}
                </h3>

                {/* 摘要 */}
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
                    {description}
                </p>

                {/* 元信息 */}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock size={14} />
                    <span>{timeText}</span>
                    <span>·</span>
                    <span>{readTime}</span>
                </div>
            </div>
        </article>
    );
};

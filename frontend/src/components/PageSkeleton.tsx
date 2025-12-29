import { cn } from "@/lib/utils";

interface PageSkeletonProps {
    hasTabs?: boolean;
    hasHeader?: boolean;
    itemCount?: number;
    className?: string;
}

/**
 * MOSS 全局标准骨架屏
 * 遵循 Ghost View 规范，模拟真实内容布局，消除长白屏感。
 */
export function PageSkeleton({
    hasTabs = true,
    hasHeader = true,
    itemCount = 3,
    className
}: PageSkeletonProps) {
    return (
        <div className={cn("w-full bg-white min-h-screen animate-in fade-in duration-500", className)}>
            {/* 1. Header Skeleton - 镜像自 Intelligence/Briefing Header */}
            {hasHeader && (
                <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50/50 bg-white/80 backdrop-blur-xl">
                    <div className="flex flex-col gap-1.5">
                        <div className="h-2 w-16 bg-zinc-100 rounded-full animate-pulse" />
                        <div className="h-6 w-28 bg-zinc-200/60 rounded-lg animate-pulse" />
                    </div>
                    <div className="flex gap-2">
                        <div className="w-10 h-10 rounded-full bg-zinc-50 animate-pulse border border-zinc-50" />
                        <div className="w-10 h-10 rounded-full bg-zinc-50 animate-pulse border border-zinc-50" />
                    </div>
                </div>
            )}

            {/* 2. Tabs Skeleton - 镜像自 SegmentedControl */}
            {hasTabs && (
                <div className="px-5 py-4">
                    <div className="bg-zinc-50 p-1 rounded-2xl flex items-center gap-1">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-10 flex-1 rounded-xl bg-white shadow-sm animate-pulse"
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* 3. Content Cards Skeleton - 经典 Intelligence Card 布局 */}
            <div className="px-5 pb-8 space-y-6">
                {Array.from({ length: itemCount }).map((_, i) => (
                    <div key={i} className="bg-white rounded-3xl border border-zinc-100 p-6 space-y-5 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-zinc-100 animate-pulse" />
                                <div className="h-3 w-32 bg-zinc-100/60 rounded-full animate-pulse" />
                            </div>
                            <div className="h-6 w-16 bg-zinc-100 rounded-full animate-pulse" />
                        </div>

                        <div className="space-y-3">
                            <div className="h-6 w-full bg-zinc-200/40 rounded-lg animate-pulse" />
                            <div className="h-6 w-4/5 bg-zinc-200/40 rounded-lg animate-pulse" />
                        </div>

                        {/* Impact Chain Area */}
                        <div className="h-16 w-full bg-zinc-50/80 rounded-2xl animate-pulse" />

                        <div className="flex justify-between items-center pt-2 border-t border-zinc-50">
                            <div className="flex gap-3">
                                <div className="h-3 w-12 bg-zinc-100/60 rounded animate-pulse" />
                                <div className="h-3 w-12 bg-zinc-100/60 rounded animate-pulse" />
                            </div>
                            <div className="flex gap-5">
                                <div className="w-5 h-5 bg-zinc-100 rounded-md animate-pulse" />
                                <div className="w-5 h-5 bg-zinc-100 rounded-md animate-pulse" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

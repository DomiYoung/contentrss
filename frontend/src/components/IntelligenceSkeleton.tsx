import React from "react";
import { cn } from "@/lib/utils";

export function IntelligenceSkeleton() {
    return (
        <div className="w-full bg-[#FAF9F6] min-h-screen animate-in fade-in duration-500">
            {/* 1. Header Skeleton (Nav) */}
            <div className="px-5 py-4 flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-zinc-200/60 animate-pulse" />
                <div className="h-8 w-44 bg-zinc-200/60 rounded-full animate-pulse" />
                <div className="w-10 h-10 rounded-full bg-zinc-200/60 animate-pulse" />
            </div>

            {/* 2. Tabs Skeleton */}
            <div className="px-5 py-2 flex gap-3 overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "h-9 shrink-0 rounded-full bg-zinc-200/60 animate-pulse",
                            i === 0 ? "w-16" : i === 1 ? "w-20" : i === 2 ? "w-24" : "w-16"
                        )}
                    />
                ))}
            </div>

            <div className="px-5 mt-6">
                {/* 3. Hero Card Skeleton (Flagship) */}
                <div className="bg-white rounded-[32px] border border-zinc-200/40 p-1 overflow-hidden shadow-sm shadow-zinc-200/20 mb-8">
                    <div className="aspect-[16/9] w-full bg-zinc-100/80 rounded-[28px] animate-pulse relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-200/20 to-transparent" />
                    </div>
                    <div className="px-5 pt-5 pb-6 space-y-3">
                        <div className="h-5 w-24 bg-zinc-200/60 rounded-full animate-pulse" />
                        <div className="h-7 w-4/5 bg-zinc-200/80 rounded-lg animate-pulse" />
                        <div className="h-7 w-2/3 bg-zinc-200/80 rounded-lg animate-pulse" />
                        <div className="pt-2 flex items-center justify-between">
                            <div className="h-4 w-32 bg-zinc-100/80 rounded animate-pulse" />
                            <div className="w-8 h-8 rounded-full bg-zinc-100 animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* 4. List Items Skeleton */}
                <div className="space-y-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex gap-4 items-start">
                            <div className="flex-1 space-y-2.5 pt-1">
                                <div className="h-4 w-4/5 bg-zinc-200/60 rounded animate-pulse" />
                                <div className="h-4 w-full bg-zinc-200/60 rounded animate-pulse" />
                                <div className="h-4 w-2/3 bg-zinc-200/60 rounded animate-pulse" />
                                <div className="flex gap-2 pt-1">
                                    <div className="h-3 w-12 bg-zinc-100/80 rounded animate-pulse" />
                                    <div className="h-3 w-12 bg-zinc-100/80 rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="w-20 h-20 rounded-2xl bg-zinc-200/60 animate-pulse shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

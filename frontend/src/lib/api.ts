import type { IntelligenceCardData } from "@/types/index";
import type { ArticleDetailData } from "@/types/article";
import type { DailyBriefingData } from "@/types/briefing";
import type { Entity, SubscriptionResponse } from "@/types/entities";

const API_BASE = "http://localhost:8000/api";

export async function fetchFeed(): Promise<IntelligenceCardData[]> {
    const res = await fetch(`${API_BASE}/feed`);
    if (!res.ok) throw new Error("Failed to fetch feed");
    return res.json();
}

export async function fetchArticle(id: number): Promise<ArticleDetailData> {
    const res = await fetch(`${API_BASE}/article/${id}`);
    if (!res.ok) throw new Error("Failed to fetch article");
    return res.json();
}

export async function fetchEntities(): Promise<Entity[]> {
    const res = await fetch(`${API_BASE}/entities`);
    if (!res.ok) throw new Error("Failed to fetch entities");
    return res.json();
}

export async function toggleSubscription(entityId: string): Promise<SubscriptionResponse> {
    const res = await fetch(`${API_BASE}/entities/toggle/${entityId}`, {
        method: "POST"
    });
    if (!res.ok) throw new Error("Failed to toggle subscription");
    return res.json();
}

export async function fetchDailyBriefing(): Promise<DailyBriefingData> {
    const res = await fetch(`${API_BASE}/briefing/daily`);
    if (!res.ok) throw new Error("Failed to fetch briefing");
    return res.json();
}

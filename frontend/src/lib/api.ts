// Token 管理逻辑
let _apiToken: string | null = localStorage.getItem('access_token');

import type { IntelligenceCardData } from "@/types";
import type { ArticleDetailData } from "@/types/article";
import type { Entity, SubscriptionResponse } from "@/types/entities";
import type { DailyBriefingData } from "@/types/briefing";

export const setApiToken = (token: string) => {
    _apiToken = token;
    localStorage.setItem('access_token', token);
};

export const getApiToken = () => _apiToken;

// 后端 API 基础地址
const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// 后端情报 API 响应类型
export interface IntelligenceCard {
    id: number;
    title: string;
    polarity: 'positive' | 'negative' | 'neutral';
    fact: string;
    impacts: Array<{ entity: string; trend: 'up' | 'down'; reason: string }>;
    opinion: string;
    tags: string[];
    source_name?: string;
    source_url?: string;
    // 新增深度分析字段
    core_insight?: string;
    catalyst?: string;
    root_cause?: string;
    alpha_opportunity?: string;
    confidence?: 'high' | 'medium' | 'low';
}

export interface IntelligenceResponse {
    count: number;
    cards: IntelligenceCard[];
}

/**
 * 获取 AI 分析后的情报卡片（调用后端 /api/intelligence）
 */
export async function fetchIntelligence(
    limit: number = 20,
    skipAi: boolean = false,
    category?: string
): Promise<IntelligenceResponse> {
    const params = new URLSearchParams({
        limit: String(limit),
        skip_ai: String(skipAi),
    });
    if (category && category !== "all") {
        params.set("category", category);
    }
    const url = `${BACKEND_BASE_URL}/api/intelligence?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Intelligence API Error: ${response.status}`);
    }

    return response.json();
}

// 通用请求包装器 (参考 react-ai 风格)
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = getApiToken();
    const headers = new Headers(options.headers);

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    // parity with react-ai
    headers.set('page_url', window.location.pathname);
    headers.set('Content-Type', 'application/json');

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.res_message || `API Error: ${response.status}`);
    }

    return response.json();
}

/**
 * 特殊接口请求 (Special Chat)
 * 参考 react-ai/src/api/chat/chatAPI.ts
 */
export interface SpecialChatParams {
    content: string;
    chainId: number;
    sync: boolean;
}

export interface SpecialChatResponse {
    res_status_code: string;
    res_message?: string;
    res_content?: {
        runId?: number;
        response?: string;
        content?: string;
        analysis?: string;
        [key: string]: unknown;
    };
}

export async function fetchSpecialChat(content: string, chainId: number = 1036, sync: boolean = true): Promise<SpecialChatResponse> {
    const GATE_API = import.meta.env.VITE_SPECIAL_API_URL || "https://gate.shjinjia.com.cn/api/databrain/Chat/http/special";

    return request<SpecialChatResponse>(GATE_API, {
        method: 'POST',
        body: JSON.stringify({ content, chainId, sync }),
    });
}

// 统一使用后端基础地址
const API_BASE = `${BACKEND_BASE_URL}/api`;

export async function fetchFeed(): Promise<IntelligenceCardData[]> {
    return request(`${API_BASE}/feed`);
}

export async function fetchArticle(id: number): Promise<ArticleDetailData> {
    return request(`${API_BASE}/article/${id}`);
}

export async function fetchEntities(): Promise<Entity[]> {
    return request(`${API_BASE}/entities`);
}

export async function toggleSubscription(entityId: string): Promise<SubscriptionResponse> {
    return request(`${API_BASE}/entities/toggle/${entityId}`, {
        method: "POST"
    });
}

export async function fetchDailyBriefing(): Promise<DailyBriefingData> {
    return request(`${API_BASE}/briefing/daily`);
}

export interface RawDataResponse {
    category: string;
    label: string;
    count: number;
    items: Array<Record<string, unknown>>;
}

export async function fetchRawData(category: string): Promise<RawDataResponse> {
    const safeCategory = encodeURIComponent(category);
    return request(`${API_BASE}/raw-data?category=${safeCategory}`);
}

// 飞书多维表格 API (Data View 重构后使用通用 request)
import { DATA_API_ENDPOINT, DATA_CATEGORIES, type DataCategoryId } from './data-categories';

export interface BitableRecord {
    id: string;
    fields: Record<string, unknown>;
    [key: string]: unknown;
}

export interface BitableResponse {
    code: number;
    msg: string;
    data: {
        items: BitableRecord[];
        total: number;
        has_more: boolean;
    };
}

export async function fetchBitableData(categoryId: DataCategoryId): Promise<BitableResponse> {
    const category = DATA_CATEGORIES.find(c => c.id === categoryId);
    if (!category) throw new Error(`Unknown category: ${categoryId}`);

    return request<BitableResponse>(DATA_API_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({ url: category.url }),
    });
}

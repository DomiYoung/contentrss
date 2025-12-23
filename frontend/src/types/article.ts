import type { IntelligenceCardData } from "./index";

export interface ArticleDetailData extends IntelligenceCardData {
    content: string; // Markdown body
    summary: string; // The Brain TL;DR
    original_url?: string;
}

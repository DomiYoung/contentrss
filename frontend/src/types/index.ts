export type Polarity = "positive" | "negative" | "neutral";

export interface Impact {
    entity: string;
    trend: "up" | "down";
    reason: string;
}

export interface IntelligenceCardData {
    id: number;
    title: string;
    polarity: Polarity;
    fact: string;
    impacts: Impact[];
    opinion: string;
    tags: string[];
    source_name?: string;
    source_url?: string;
}

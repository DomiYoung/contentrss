import type { IntelligenceCardData } from "./index";

export interface ImpactSegment {
    trigger: string;
    path: string[];
    conclusion: string;
}

export interface FrameworkNode {
    label: string;
    value: string;
}

export interface Framework {
    type: "matrix" | "pyramid" | "list";
    title: string;
    nodes: FrameworkNode[];
}

export interface DailyBriefingData {
    date: string;
    title: string;
    subtitle?: string;
    read_time: string;
    synthesis: string;
    takeaways: string[];
    top_picks: IntelligenceCardData[];
    impact_chain: ImpactSegment;
    framework?: Framework;
}

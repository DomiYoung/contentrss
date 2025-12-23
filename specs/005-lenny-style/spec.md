# Design Spec: Lenny Style (Editorial Excellence)

## 1. Visual Language: "The Professional's Desk"
- **Background**: `#FFFFFF` or very light cream `#FAF9F6`.
- **Primary Text**: Dark charcoal `#1A1A1A`.
- **Accent**: Subtle sage green or deep blue for structural elements.
- **Typography**:
    - **Titles**: Heavy Serif (e.g., `Playfair Display` or `Georgia`).
    - **Body**: Highly readable Serif/Sans-serif hybrid (e.g., `Charter` or `Inter`).
    - **Metrics**: Monospace for data points to imply "raw intelligence".

## 2. Content Structure (A Lenny Template)
1. **The Lead**: 1-sentence hook + Estimated Read Time.
2. **The TL;DR (Executive Summary)**: 3 bullet points with Bold starts.
3. **The Big Idea**: A conceptual "Framework" (Matrix, Venn, or List).
4. **Deep Dive**: The core feed items, integrated seamlessly with connective prose.
5. **The Closing**: "What to do next" (Actionable steps).

## 3. Data Model (briefing.ts)
```typescript
interface Framework {
    type: "matrix" | "pyramid" | "list";
    title: string;
    nodes: { label: string, value: string }[];
}

interface LennyBriefing {
    title: string;
    subtitle: string;
    read_time: string;
    takeaways: string[];
    framework: Framework;
    content_flow: (IntelligenceCardData | string)[]; // Mixed feed and narrative prose
}
```

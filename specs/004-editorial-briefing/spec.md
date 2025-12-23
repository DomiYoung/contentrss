# Specification: Editorial Briefing (Feature 004)

## 1. Background
Individual intelligence cards are powerful but fragmented. Top-tier industry professionals prefer a "narrative" that connects the dots, similar to high-end newsletters (e.g., *The Economist*, *Stratechery*).

## 2. Information Architecture
### 2.1 The Big Picture (Header)
- **Title**: e.g., "The Luxury Pivot & AI Supremacy: Dec 23 Briefing".
- **Synthesis**: A 200-character summary of why today matters.
- **Sentiment Gauge**: Overall market pulse.

### 2.2 Deep Insights
- Individual cards rendered with **editorial styling**:
  - Larger initial letter (Drop cap) for key facts.
  - Borderless layout within the briefing scroll.
  - Side-annotations for "Analyst Notes".

### 2.3 The Impact Chain (Visual)
- A specialized component showing the logical flow:
  - `[Event A]` -> `[Immediate Impact]` -> `[Long-term Consequence]`.

## 3. Data Model
```typescript
interface DailyBriefing {
    date: string;
    title: string;
    synthesis: string;
    top_picks: IntelligenceCardData[];
    impact_chain: {
        trigger: string;
        path: string[];
        conclusion: string;
    };
}
```

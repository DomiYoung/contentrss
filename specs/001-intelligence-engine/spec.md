# Specification: Intelligence Engine & H5 Feed

## 1. Background
To provide "Industry Intelligence" to professionals, we need a system that transforms raw articles into structured "Intelligence Cards" containing 5W1H facts, AI-deduced impacts, and polarity signals.

## 2. Goals
- **High Signal-to-Noise**: Zero "fluff" in the feed.
- **Decision Support**: Explicit "Positive/Negative" impact analysis.
- **Viral Growth**: Shareable artifacts (Posters).

## 3. User Stories
- As a **CEO**, I want to see the "Impact" of a news event on my supply chain so I can make decisions.
- As an **Investor**, I want to know if a news item is "Bullish" or "Bearish" for a specific entity.
- As a **User**, I want to swipe left to dismiss irrelevant intelligence.
- As a **User**, I can long-press a card to generate a shareable poster.

## 4. Functional Requirements
### 4.1 Intelligence Card
The atomic unit of information is a Card, not an Article.
- **Polarity**: ENUM (Positive, Negative, Neutral).
- **Fact**: Max 2 sentences, absolute fact.
- **Impacts**: List of `(Entity, Trend, Reason)`.
- **Opinion**: One sharp insight (optional).

### 4.2 Feed
- List of Intelligence Cards.
- Sorted by AI-calculated "Importance Score" (or Time for MVP).
- Grouped by "Briefing Date".

### 4.3 Entity Radar (Future)
- Subscription based on Entity Tags (e.g., #LVMH).

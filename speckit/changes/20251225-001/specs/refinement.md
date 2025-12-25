# Spec: UI Refinement & Unification (v1.0)

## 1. Information Architecture (BottomNav)
- **Tabs**: `[Home, Subscribe, Briefing, Me]`
- **Icons (Lucide)**: `Home`, `Radar`, `Edit3`, `User`
- **Labels**: `情报`, `雷达`, `内参`, `我`
- **Design Tokens**: 
  - Active: `#1A1A1A`
  - Inactive: `#A1A1AA`
  - Background: Overlay Blur (`backdrop-blur-xl`)

## 2. Component: IntelligenceCard (Single Source of Truth)
- **Aesthetic**: Paper Cream Header (`#FAF9F6`), White Body.
- **Fact**: Bold, High-Contrast (`text-zinc-900`, `font-black`).
- **Glow**: Subtle shadow based on polarity (Emerald/Rose/Zinc).
- **Actions**: Left-swipe to "Save/Bookmark" (Optional P1), Right-swipe to "Dismiss" (Done).
- **Share**: Visible Share button + Long-press to trigger `SharePoster`.

## 3. Component: SharePoster (Premium Viral Engine)
- **Watermark**: "Internal / Insiders Only" in Jet Black Capsule.
- **Grain**: Subtle noise overlay (3% opacity).
- **Watermark Logo**: Simplified Zap icon.

## 4. Feature: Briefing-First Feed
- **Behavior**: The first item in the `IntelligenceFeed` is always a special variant of `IntelligenceCard` or a dedicated `BriefingEntryCard`.
- **Content**: Summary of the daily internal briefing.
- **Action**: Clicking leads straight to `DailyBriefing` view.

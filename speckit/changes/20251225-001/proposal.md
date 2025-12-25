# Proposal: Professional UI Refinement (20251225-001)

## Problem Statement
The current UI has fragmented components (`IntelligenceCard` vs `CompactCard`, `SharePoster` vs `PosterOverlay`) and a slightly crowded information architecture (5 tabs). The "Today's Briefing" value is also buried below too many layers.

## Goals
1. **Unify Intelligence Delivery**: Establish `IntelligenceCard` as the primary delivery unit.
2. **Amplify Viral Growth**: Unify `SharePoster` as the "Elite" sharing tool.
3. **Streamline IA**: Transition to a 4-tab model and bring "Daily Briefing" to the forefront of the Home Feed.
4. **Professional Polish**: Ensure all designs follow the Paper Cream/High-Fidelity aesthetic.

## Proposed Changes

### [IA] Bottom Navigation
- **Modify**: `BottomNav.tsx`
- **Action**: Reduce tabs to `[Home, Radar, Briefing, Me]`. Move `Data` to Settings/Profile.

### [UI] Home Feed
- **Modify**: `App.tsx`
- **Action**: Replace `CompactCard` list with `IntelligenceCard`. Insert `DailyBriefingCard` as the first item.

### [UI] Component Unification
- **Modify**: `IntelligenceCard.tsx` / `SharePoster.tsx`
- **Action**: Ensure maximum fidelity to Master PRD v3.0 (Bold Fact, Polarity Glow).
- **Delete**: `CompactCard.tsx` and `PosterOverlay.tsx` (after migration).

## Verification Plan
1. **Visual Scan**: Verify 4-tab layout and Paper Cream aesthetic.
2. **Interaction Test**: Test Long-press -> SharePoster flow.
3. **Logic Test**: Verify "Briefing Card" correctly navigates to the Daily Briefing view.

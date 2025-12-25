# Tasks: UI Refinement (20251225-001)

## Phase 1: Preparation
- [ ] Refactor `App.tsx` to use `IntelligenceCard` for main list.
- [ ] Ensure `IntelligenceCard` handles all fields from `IntelligenceCardData`.

## Phase 2: Implementation
- [ ] **IA Cleanup**: 
    - [ ] Update `BottomNav.tsx` to 4-tab model.
    - [ ] Remove `DataView` from main navigation.
- [ ] **Component Unification**:
    - [ ] Migrate any remaining logic from `PosterOverlay` to `SharePoster`.
    - [ ] Implement the "Save" action (Long-press secondary menu or swipe).
- [ ] **Home Feed Polish**:
    - [ ] Fix the "Today's Briefing" entry card to match Paper Cream aesthetic.
    - [ ] Add empty states for all categories.

## Phase 3: Cleanup
- [ ] Delete `CompactCard.tsx`.
- [ ] Delete `PosterOverlay.tsx`.
- [ ] Delete `src/components/viral/PosterOverlay.tsx`.

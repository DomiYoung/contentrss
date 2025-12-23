# Task List: Feature 002 (Detail & Viral)

## Phase 1: Backend & Data <!-- id: 002-1 -->
- [x] **Update Mock Data**: Add `content` (Markdown) and `summary` fields. <!-- id: 002-1-1 -->
- [x] **Implement API Endpoint**: `GET /api/article/{id}`. <!-- id: 002-1-2 -->
- [x] **Verify API**: Verified via curl. <!-- id: 002-1-3 -->

## Phase 2: Frontend Core <!-- id: 002-2 -->
- [ ] **Type Definitions**: Create `src/types/article.ts` extending `IntelligenceCardData`. <!-- id: 002-2-1 -->
- [ ] **API Client**: Add `fetchArticle(id)` to `src/lib/api.ts`. <!-- id: 002-2-2 -->
- [ ] **Router Setup**: Update `App.tsx` to handle `view: 'detail'` and `articleId`. <!-- id: 002-2-3 -->

## Phase 3: Premium Detail UI (The Report) <!-- id: 002-3 -->
- [ ] **The Brain Component**: Create `src/components/article/TheBrain.tsx` with **Pulsing Glow** and **Gradient Border**. <!-- id: 002-3-1 -->
- [ ] **Article Layout**: Implement "Readability Mode" (Serif Font, No Ads). <!-- id: 002-3-2 -->
- [ ] **Action Bar**: Implement Bottom Bar with **Save (Collection)**, Share, and Ask AI. <!-- id: 002-3-3 -->
- [ ] **Highlight Action**: Add simple "Long Press Text" stub -> "Highlight/Note" Menu. <!-- id: 002-3-4 -->

## Phase 4: Viral Engine (The Poster) <!-- id: 002-4 -->
- [ ] **Card Interaction (Swipe)**: Add `framer-motion` **Drag** to dismiss (Life Swipe with Haptic). <!-- id: 002-4-1 -->
- [ ] **Poster Overlay**: Create `src/components/viral/PosterOverlay.tsx`.
    - [ ] **Visual**: High Contrast Black/White.
    - [ ] **Watermark**: "Industry Intelligence · Insiders Only".
    - [ ] **QR Code**: Mock Component.
    - [ ] **Trigger**: Long Press Card or Share Button. <!-- id: 002-4-2 -->

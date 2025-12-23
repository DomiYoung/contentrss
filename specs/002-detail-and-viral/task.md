# Task List: Feature 002 (Detail & Viral)

## Phase 1: Backend & Data <!-- id: 002-1 -->
- [x] **Update Mock Data**: Add `content` (Markdown) and `summary` fields. <!-- id: 002-1-1 -->
- [x] **Implement API Endpoint**: `GET /api/article/{id}`. <!-- id: 002-1-2 -->
- [x] **Verify API**: Verified via curl. <!-- id: 002-1-3 -->

## Phase 2: Frontend Core <!-- id: 002-2 -->
- [x] **Type Definitions**: Create `src/types/article.ts` extending `IntelligenceCardData`. <!-- id: 002-2-1 -->
- [x] **API Client**: Add `fetchArticle(id)` to `src/lib/api.ts`. <!-- id: 002-2-2 -->
- [x] **Router Setup**: Update `App.tsx` to handle `view: 'detail'` and `articleId`. <!-- id: 002-2-3 -->

## Phase 3: Premium Detail UI (DONE)
- [x] **The Brain Component**: Create `src/components/article/TheBrain.tsx` with **Pulsing Glow** and **Gradient Border**. <!-- id: 002-3-1 -->
- [x] **Article Layout**: Implement "Readability Mode" (Serif Font, No Ads). <!-- id: 002-3-2 -->
- [x] **Rich Content**: Enable production-grade rendering (Parser implemented). <!-- id: 002-3-x -->
- [x] **Action Bar Polish**: Implement `Ask AI` and `Write Note` triggers in `BottomBar`. <!-- id: 002-3-3 -->
- [x] **Haptic Feedback**: Add `triggerHaptic` to all primary actions (Share, Save, Back). <!-- id: 002-3-x -->

## Phase 4: Viral Engine & Gestures (DONE)
- [x] **Poster Overlay**: Create `src/components/viral/PosterOverlay.tsx`. <!-- id: 002-4-1 -->
- [x] **Visual**: High Contrast Black/White. <!-- id: 002-4-x -->
- [x] **Watermark**: "Industry Intelligence · Insiders Only". <!-- id: 002-4-x -->
- [x] **Trigger**: Long Press Card or Share Button. <!-- id: 002-4-2 -->
- [x] **Swipe-to-Dismiss**: Add `framer-motion` **Drag** to dismiss for Article View. <!-- id: 002-4-3 -->
- [ ] **Highlight Action**: Add simple "Long Press Text" stub -> "Highlight/Note" Menu. <!-- id: 002-4-x -->

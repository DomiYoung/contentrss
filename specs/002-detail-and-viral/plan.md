# Implementation Plan: Feature 002 (Detail & Viral)

## Tech Stack
- **Frontend**: React (Vite), TailwindCSS, Framer Motion.
- **Markdown**: `react-markdown` + `remark-gfm`.
- **Haptic**: Custom utility using `navigator.vibrate`.

## Steps

### Phase 1: Logic & Foundation (DONE)
- [x] Backend mock data integration.
- [x] Frontend routing and routing state.

### Phase 2: Premium Detail UI (OPTIMIZATION)
1. **Markdown Rendering**:
   - Replace `whitespace-pre-wrap` with `react-markdown`.
   - Apply `prose-serif` styles for readability.
2. **Bottom Bar Enhancement**:
   - Add `Sparkles` (Ask AI) and `Pen` (Note) icons.
   - Add `Haptic Feedback` to all buttons (light/medium).
3. **The Brain Polish**:
   - Ensure the golden pulsing glow strictly follows `apple-ui-scientist` principles.

### Phase 3: Gestures & Viral (NEW)
1. **Swipe-to-Dismiss**:
   - Use `framer-motion` `drag="x"` for the entire article container.
   - Threshold-based back navigation.
2. **Interactive Highlights**:
   - Long-press text stub (Haptic trigger).

## Tech Tasks
- `src/lib/haptic.ts`: Shared haptic utility.
- `src/components/article/BottomBar.tsx`: Add missing action buttons.
- `src/views/ArticleDetail.tsx`: Wrap in `motion.div` for swipe support.
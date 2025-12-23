# Implementation Plan: Feature 002 (Detail & Viral)

## Tech Stack
- **Frontend**: React (Vite), TailwindCSS, Framer Motion (for Glow/Transitions).
- **Icons**: Lucide React.
- **Data**: Mocked "Long Content" in Backend.

## Steps
1. **Backend**:
   - Update `MOCK_DB` in `analyst.py` to include `content` (Markdown) and `summary`.
   - Ensure `/api/article/{id}` works.

2. **Frontend Components**:
   - `views/ArticleDetail.tsx`: Main container.
   - `components/TheBrain.tsx`: The glowing AI summary box.
   - `components/BottomBar.tsx`: Fixed action bar.
   - `components/ViralPoster.tsx`: Modal overlay for sharing.

3. **Style & Polish**:
   - Implement "Readability Mode" typography (Serif).
   - Add "Pulse" animation to `TheBrain`.

4. **Integration**:
   - Add `onCardClick` prop to `IntelligenceCard`.
   - Update `App.tsx` Router to handle `view: 'detail'` and `articleId`.
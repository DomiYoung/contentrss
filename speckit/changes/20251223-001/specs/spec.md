# Spec: Feature 002 Delta

## MODIFIED: analyst.py
- Add `content` and `summary` fields to `MOCK_DB`.

## ADDED: ArticleDetail.tsx
- Route: `/article/:id`.
- Component: Fetches article, renders `TheBrain`, `Content`, and `BottomBar`.

## ADDED: TheBrain.tsx
- Props: `summary: { thesis: string, facts: string[], sentiment: string }`.
- Style: Gradient border, pulse animation.

## ADDED: ViralPoster.tsx
- Layout: Vertical stack, high contrast.
- Elements: Title, Highlights, QR Code.

## MODIFIED: App.tsx
- View State: `view: 'list' | 'detail'`.
- Article State: `articleId: string | null`.

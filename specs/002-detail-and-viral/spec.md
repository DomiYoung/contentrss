# Specification: Article Detail & Viral Actions (Feature 002)

## 1. Background
To achieve the "High Signal-to-Noise" goal, the Detail View must not just be a text reader, but an "AI Augmented" experience. The "Viral Loop" relies on users sharing high-quality "Intelligence Posters".

## 2. User Stories
- **AI Brain**: As a user, I want to see a **glowing "The Brain" container** at the top with TL;DR and Sentiment, so I get the value without reading the full text.
- **Deep Dive**: As a user, I want a clean, ad-free "Readability Mode" for the body text.
- **Viral Share**: As a user, I **long-press** any card (or click Share in Detail) to generate a poster used for "Social Currency" (WeChat Moments).
- **Interactive Reading**: As a user, I can use the Bottom Bar to "Take Notes" or "Ask AI" (Mock/Stub for now).

## 3. UI/UX Requirements
### 3.1 Article Detail Page (`/article/:id`)
- **Header**:
    - Transparent/Blur effect.
    - `Back` button.
    - `Original Link` icon.
- **Core Component: The Brain (AI 导读)**:
    - **Visual**: Border with subtle pulsing glow (Gold/Blue gradient).
    - **Content**:
        1. **One-line Thesis** (The "So What").
        2. **Key Facts** (Bulleted).
        3. **Sentiment**: Visual gauge (Bullish/Bearish).
- **Body Text**:
    - Serif font (e.g., `Merriweather` or `Noto Serif SC`).
    - Spacious line-height (1.8).
- **Fixed Bottom Bar**:
    - `Share` (Posters).
    - `Collect` (Star).
    - `Write Note` (Pen icon - Opens specialized input).
    - `Ask AI` (Sparkles icon - Chat interface).

### 3.2 Viral Poster Generator (Overlay)
- Triggered by: Long Press on Card OR Share Button.
- **Visuals**:
    - High-contrast background (Black/White).
    - Large Typography for "The Fact".
    - Visible "Impact Chain" (A -> B).
    - QRCode + Branding ("Industry Intelligence").
- **Action**: "Save Image".

## 4. Technical Logic
- **Routing**: `App.tsx` handles view switching.
- **Data**: `GET /api/article/{id}` includes `summary` and `content`.
- **Poster**: Use HTML/CSS overlay first (easier than Canvas), user screenshots it.

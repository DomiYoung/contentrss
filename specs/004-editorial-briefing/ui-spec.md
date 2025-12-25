# Daily Briefing (Editorial Briefing) - UI Specification

> **Version**: 1.0 | **Last Updated**: 2024-12-24
> **Expert Source**: `apple-hig-design` + `frontend-design` (Lenny Style)

---

## 1. Page Overview

**Purpose**: 叙事性日报，将碎片情报编织成高管简报式的阅读体验。

**Core Experience**: 
- The Economist / Stratechery 风格的编辑叙事
- Lenny Newsletter 的视觉语言 (Paper Cream + Serif)
- Framework Gallery 可视化（矩阵/金字塔）

---

## 2. Page Structure

```
┌─────────────────────────────────────┐
│ ← Back      Daily Briefing    [📤] │  ← Nav Bar
├─────────────────────────────────────┤
│                                     │
│  Dec 24, 2024 · 8 min read          │  ← Meta (12px Mono)
│                                     │
│  THE LUXURY PIVOT &                 │  ← Title (Serif, 34px)
│  AI SUPREMACY                       │
│                                     │
│  Why today's shifts matter for      │  ← Subtitle (17px)
│  the next decade of business.       │
│                                     │
├─────────────────────────────────────┤
│ ■ Sentiment: Moderately Bullish     │  ← Gauge (inline)
├─────────────────────────────────────┤
│                                     │
│  TL;DR                              │  ← Section (Sticky)
│  ─────                              │
│  • LVMH shifts to experiences       │
│  • OpenAI closes $10B funding       │
│  • Apple enters AR headset market   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  THE BIG PICTURE                    │  ← Framework Title
│  ─────────────────                  │
│  ┌─────────┬─────────┐              │
│  │ High $  │ High $  │              │  ← 2×2 Matrix
│  │ Low R   │ High R  │              │
│  ├─────────┼─────────┤              │
│  │ Low $   │ Low $   │              │
│  │ Low R   │ High R  │              │
│  └─────────┴─────────┘              │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  DEEP DIVE                          │  ← Narrative Section
│  ─────────                          │
│                                     │
│  L orem ipsum dolor sit amet...     │  ← Drop Cap
│    consectetur adipiscing elit.     │
│    Sed do eiusmod tempor...         │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Intelligence Card (Embedded) │  │  ← Borderless Card
│  └───────────────────────────────┘  │
│                                     │
│  Analyst Note: This signals a       │  ← Side Annotation
│  strategic pivot...                 │     (indented box)
│                                     │
├─────────────────────────────────────┤
│                                     │
│  WHAT'S NEXT                        │  ← Closing Section
│  ──────────                         │
│  1. Watch LVMH Q4 earnings          │
│  2. Monitor OpenAI partnerships     │
│                                     │
└─────────────────────────────────────┘
```

---

## 3. Component Specs

### 3.1 Lead Header

| Element | Spec |
|:---|:---|
| **Date + Read Time** | 12px, Mono, `--color-text-tertiary` |
| **Title** | 34px, Playfair Display Bold, `--color-text-primary` |
| **Subtitle** | 17px, Charter Regular, `--color-text-secondary` |
| **Padding** | 24px 16px |

### 3.2 Sentiment Gauge (Inline)

```
■ Sentiment: Moderately Bullish ████████░░ 72%
```

| Property | Value |
|:---|:---|
| **Height** | 40px (with padding) |
| **Bar Height** | 8px |
| **Bar Radius** | 4px |
| **Background** | `#F2F2F7` |
| **Fill Gradient** | Bearish → Bullish |

### 3.3 TL;DR Section

| Property | Value |
|:---|:---|
| **Title** | 20px, Semibold, ALL CAPS |
| **Divider** | 2px solid `--color-text-primary`, 40px width |
| **List Style** | • Bullet, 17px Body |
| **Item Bold Start** | First 3-4 words bold |

### 3.4 Framework Gallery

**2×2 Matrix**:
| Property | Value |
|:---|:---|
| **Container** | 100% width, 1:1 aspect ratio |
| **Cell Padding** | 12px |
| **Cell Background** | `#F8F8F8` |
| **Border** | 1px solid `#E8E8E8` |
| **Font** | 13px Medium, center aligned |

**Pyramid**:
| Property | Value |
|:---|:---|
| **Levels** | 3 (Peak → Middle → Base) |
| **Colors** | Gradient from accent to light |
| **Width Ratio** | 40% → 70% → 100% |

### 3.5 Drop Cap (首字下沉)

```css
.drop-cap::first-letter {
  font-family: "Playfair Display", serif;
  font-size: 72px;
  float: left;
  line-height: 0.8;
  padding-right: 8px;
  color: var(--color-text-primary);
}
```

### 3.6 Analyst Note (Side Annotation)

```
┌──────────────────────────────────────┐
│  💡 Analyst Note                     │
│  This signals a strategic pivot      │
│  toward experiential luxury...       │
└──────────────────────────────────────┘
```

| Property | Value |
|:---|:---|
| **Background** | `#FFF9E6` (warm yellow tint) |
| **Border Left** | 4px solid `#FFB800` |
| **Padding** | 12px 16px |
| **Font** | 15px Italic |

### 3.7 Sticky Section Headers

| Property | Value |
|:---|:---|
| **Position** | `position: sticky; top: 0` |
| **Background** | `--color-background` with blur |
| **Padding** | 12px 16px |
| **Font** | 13px, ALL CAPS, letter-spacing 1px |

---

## 4. Interactions

### 4.1 Scroll Behavior

| Trigger | Action |
|:---|:---|
| Scroll Down | Section headers stick to top |
| Tap Embedded Card | Expand to full Article Detail |
| Long Press Card | Show Viral Poster option |

### 4.2 Share Options

| Option | Action |
|:---|:---|
| Share Briefing | 生成 Briefing 摘要图片 |
| Share to Slack | Formatted text + link |
| Copy Link | Deep link to briefing |

---

## 5. Empty State

```
┌─────────────────────────────────────┐
│                                     │
│          📰                         │
│    "No briefing yet today"          │
│                                     │
│  Our analysts are preparing         │
│  today's intelligence digest.       │
│  Check back in a few hours.         │
│                                     │
│       [Browse Feed Instead]         │
│                                     │
└─────────────────────────────────────┘
```

---

## 6. Typography Guide (Lenny Style)

| Element | Font | Size | Weight | Color |
|:---|:---|:---|:---|:---|
| Page Title | Playfair Display | 34px | Bold | Primary |
| Section Title | SF Pro | 20px | Semibold | Primary |
| Body | Charter | 17px | Regular | Primary |
| Quote | Charter | 19px | Italic | Secondary |
| Data | JetBrains Mono | 13px | Medium | Tertiary |
| Caption | SF Pro | 12px | Regular | Tertiary |

---

## 7. Accessibility

- [ ] Semantic heading hierarchy (h1 → h2 → h3)
- [ ] Skip to content link
- [ ] Images have alt text
- [ ] Color is not the only indicator for sentiment

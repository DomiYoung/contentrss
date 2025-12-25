# ContentRSS Design Tokens

> **Version**: 1.0 | **Last Updated**: 2024-12-24
> **Expert Source**: `apple-hig-design` + `frontend-design` + `brand-guidelines`

---

## 1. Color System

### 1.1 Brand Colors (Lenny Style)

| Token | Value | Usage |
|:---|:---|:---|
| `--color-background` | `#FAF9F6` | Paper Cream 主背景 |
| `--color-surface` | `#FFFFFF` | 卡片/模态框背景 |
| `--color-text-primary` | `#1A1A1A` | Dark charcoal 主文本 |
| `--color-text-secondary` | `#6B6B6B` | 次要文本 |
| `--color-text-tertiary` | `#9B9B9B` | 占位符/辅助文本 |

### 1.2 Semantic Colors

| Token | Value | Usage |
|:---|:---|:---|
| `--color-bullish` | `#34C759` | 看涨/积极信号 |
| `--color-bearish` | `#FF3B30` | 看跌/消极信号 |
| `--color-neutral` | `#8E8E93` | 中性信号 |
| `--color-accent` | `#007AFF` | 主要操作/链接 |
| `--color-accent-tinted` | `rgba(0,122,255,0.12)` | 浅色按钮背景 |

### 1.3 Dark Mode (Optional)

| Token | Light | Dark |
|:---|:---|:---|
| `--color-background` | `#FAF9F6` | `#1C1C1E` |
| `--color-surface` | `#FFFFFF` | `#2C2C2E` |
| `--color-text-primary` | `#1A1A1A` | `#FFFFFF` |
| `--color-separator` | `#E8E8E8` | `#38383A` |

---

## 2. Typography System

### 2.1 Font Families

| Token | Font Stack | Usage |
|:---|:---|:---|
| `--font-display` | `"Playfair Display", Georgia, serif` | 大标题/Lead |
| `--font-body` | `"Charter", "Lora", Georgia, serif` | 正文/叙事 |
| `--font-ui` | `"SF Pro", -apple-system, sans-serif` | UI 元素 |
| `--font-mono` | `"JetBrains Mono", "SF Mono", monospace` | 数据/代码 |

### 2.2 Type Scale (Apple HIG)

| Token | Size | Weight | Line Height | Usage |
|:---|:---|:---|:---|:---|
| `--text-large-title` | 34px | Bold | 1.2 | 页面主标题 |
| `--text-title-1` | 28px | Bold | 1.25 | 一级标题 |
| `--text-title-2` | 22px | Bold | 1.3 | 二级标题 |
| `--text-title-3` | 20px | Semibold | 1.35 | 三级标题 |
| `--text-headline` | 17px | Semibold | 1.4 | 卡片标题 |
| `--text-body` | 17px | Regular | 1.5 | 正文 |
| `--text-callout` | 16px | Regular | 1.45 | 辅助说明 |
| `--text-subhead` | 15px | Regular | 1.4 | 副标题 |
| `--text-footnote` | 13px | Regular | 1.35 | 脚注 |
| `--text-caption` | 12px | Regular | 1.3 | 图片说明 |
| `--text-data` | 10px | Medium | 1.2 | 原始数据 (Mono) |

---

## 3. Spacing System (4pt Grid)

| Token | Value | Usage |
|:---|:---|:---|
| `--space-1` | 4px | 紧凑内边距 |
| `--space-2` | 8px | 相关元素间距 |
| `--space-3` | 12px | 小组件间距 |
| `--space-4` | 16px | 标准内边距/外边距 |
| `--space-5` | 20px | 卡片内边距 |
| `--space-6` | 24px | 区块间距 |
| `--space-8` | 32px | 页面边距 |
| `--space-10` | 40px | 大区块分隔 |

### 3.1 Safe Areas (iOS)

| Token | Value | Description |
|:---|:---|:---|
| `--safe-top` | `env(safe-area-inset-top)` | 顶部刘海 |
| `--safe-bottom` | `env(safe-area-inset-bottom)` | 底部 Home 指示器 |
| `--content-max-width` | 428px | 最佳可读宽度 |

---

## 4. Elevation (Shadow)

| Token | Value | Usage |
|:---|:---|:---|
| `--shadow-low` | `0 1px 3px rgba(0,0,0,0.08)` | 卡片悬浮 |
| `--shadow-medium` | `0 4px 12px rgba(0,0,0,0.12)` | 模态框 |
| `--shadow-high` | `0 8px 24px rgba(0,0,0,0.16)` | 弹出层 |

---

## 5. Motion & Animation

### 5.1 Duration

| Token | Value | Usage |
|:---|:---|:---|
| `--duration-fast` | 100ms | 微交互（按钮状态） |
| `--duration-normal` | 200ms | 状态切换 |
| `--duration-slow` | 350ms | 页面转场 |
| `--duration-spring` | 500ms | 弹性动画 |

### 5.2 Easing Curves

| Token | Value | Usage |
|:---|:---|:---|
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | 元素进入 |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | 元素退出 |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | 状态切换 |
| `--spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | 弹性效果 |

### 5.3 Spring Config (Framer Motion)

```javascript
const springConfig = {
  damping: 20,
  stiffness: 300,
  mass: 0.8
};
```

---

## 6. Touch Targets (Apple HIG)

| Token | Value | Description |
|:---|:---|:---|
| `--touch-min` | 44px | 最小触摸区域 |
| `--touch-recommended` | 48px | 推荐触摸区域 |
| `--button-min-height` | 44px | 按钮最小高度 |
| `--icon-touch-padding` | 12px | 图标触摸扩展区 |

---

## 7. Border Radius

| Token | Value | Usage |
|:---|:---|:---|
| `--radius-xs` | 4px | 标签/徽章 |
| `--radius-sm` | 8px | 按钮/输入框 |
| `--radius-md` | 12px | 卡片 |
| `--radius-lg` | 16px | 模态框 |
| `--radius-xl` | 24px | 大卡片/Sheet |
| `--radius-full` | 9999px | 圆形按钮/头像 |

---

## 8. z-index Scale

| Token | Value | Usage |
|:---|:---|:---|
| `--z-base` | 0 | 基础层 |
| `--z-dropdown` | 100 | 下拉菜单 |
| `--z-sticky` | 200 | 吸顶导航 |
| `--z-modal` | 300 | 模态框 |
| `--z-toast` | 400 | Toast 提示 |
| `--z-tooltip` | 500 | Tooltip |

---

## Usage Example (CSS Variables)

```css
:root {
  /* Colors */
  --color-background: #FAF9F6;
  --color-text-primary: #1A1A1A;
  --color-accent: #007AFF;
  
  /* Typography */
  --font-display: "Playfair Display", Georgia, serif;
  --text-headline: 17px;
  
  /* Spacing */
  --space-4: 16px;
  
  /* Motion */
  --duration-normal: 200ms;
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
}

.intelligence-card {
  background: var(--color-surface);
  padding: var(--space-5);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-low);
  transition: transform var(--duration-normal) var(--ease-out);
}
```

# ContentRSS: 功能与页面全景审计报告 (Spec-Focused)

基于当前项目的 `specs/` 目录和优化的 Skills（Apple UI Scientist, Senior Analyst, SuperClaude Framework），以下是项目的核心功能及页面地图：

## 1. 核心页面地图 (Navigation Map)

| 页面名称 | 访问路径 | 对应 View 组件 | 核心目的 | 功能状态 |
| :--- | :--- | :--- | :--- | :--- |
| **Intelligence Feed** | `/` (Tab 1) | `HomeView` (App.tsx) | 高信号情报流，点击卡片进入详情 | ✅ 已实现基础流 |
| **Article Detail** | `/article/:id` | `ArticleDetail.tsx` | 沉浸式阅读 + AI 导读 (The Brain) | ✅ 已优化 (Haptic/Swipe) |
| **Entity Radar** | `/radar` (Tab 2) | `EntityRadar.tsx` | 情报雷达：订阅/追踪行业、公司、话题 | 🔄 基础 UI 在，逻辑待补全 |
| **Daily Briefing** | `/briefing` (Tab 3) | `DailyBriefing.tsx` | 叙事性日报 (Lenny Style)：连接碎片情报 | 🔄 基础架构在，叙事流待优化 |

---

## 2. 核心功能及页面细节

### 🧩 2.1 情报卡片 (Intelligence Card) - 基础原子
- **功能点**：极性信号 (Bullish/Bearish)、核心事实 (5W1H)、影响链 (Entity → Trend → Reason)。
- **交互**：
  - **Single Tap**: 进入详情页。
  - **Long Press**: 唤起海报生成器 (Viral Poster)。
  - **Swipe (Future)**: 快速忽略不感兴趣的情报。

### 🧠 2.2 详情页 (Article Detail) - The Report View
- **核心组件：The Brain (AI 导读)**：单行论文结论 + 核心事实列表 + 极性仪表盘。
- **视觉风格**：衬线体排版、1.8倍行高、无广告 Readability 模式。
- **高级交互**：Apple 风格侧滑返回、触感反馈、底部功能栏 (Share, Store, Note, Ask AI)。

### 📡 2.3 实体雷达 (Entity Radar) - Subscription Hub
- **功能点**：分类别订阅 (Luxury, AI, Tech)、动态雷达波纹动效。
- **下一步**：实现“My Radar”模式，即 Feed 流基于订阅内容进行实时过滤。

### 💎 2.4 叙事日报 (Daily Briefing) - Lenny Style
- **结构化叙事**：Lead Header -> TL;DR Takeaways -> **Logical Framework (Matrix/Pyramid)** -> Narrative Feed -> Closing.
- **视觉风格**：仿报纸排版 (Professional's Desk)，黑/白/灰/深蓝配色，使用 Monospace 展示硬核数据。

---

## 3. 下一步开发建议

1. **逻辑闭环 (Radar)**：将前端订阅状态与 `analyst.py` 的 Mock Filter 真正联通，实现“我的订阅”情报流。
2. **叙事逻辑 (Briefing)**：优化 `DailyBriefing.tsx` 的叙事转换，将碎片 Card 缝合进“Lenny Style”的正文流中。
3. **交互补全**：实现 `Ask AI` 的简单对话 Stub 和 `Note` 的笔记输入框（符合 Apple 反馈规范）。

请确认以上结构和页面功能是否符合您的预期，或者我们需要针对某个具体页面进行深挖？

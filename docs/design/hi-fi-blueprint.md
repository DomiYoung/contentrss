# ContentRSS Hi‑Fi Design Blueprint

> **Purpose**: 高保真设计统一稿  
> **Positioning**: 行业情报参谋 / Industry Intelligence OS  
> **Audience**: 专业从业者（运营/增长/成分/舆情/财务/研发/金融）

---

## 1. 设计总纲（视觉方向）

**核心气质**：Editorial Intelligence Desk  
**关键词**：冷静、可信、证据密度高、决策效率  
**视觉隐喻**：纸面情报 + 研究台 + 信号仪表

**记忆点（必须有）**
- 极性信号灯（🟢/🔴）是第一视觉焦点
- “Daily 5” 结构（只给 5 条）形成强记忆
- 影响链像“推理链条”，不是摘要

---

## 2. 视觉系统（与现有 Tokens 对齐）

### 2.1 颜色
- 背景：`#FAF9F6`（Paper Cream）
- 表面：`#FFFFFF`
- 主文本：`#1A1A1A`
- 次文本：`#6B6B6B`
- 分隔线：`#E8E8E8`
- 主要操作：`#007AFF`

**极性颜色**
- Bullish：`#34C759`
- Bearish：`#FF3B30`
- Neutral：`#8E8E93`

**角色 Lens 辅助色（用现有语义色，背景 12% 透明）**
- 运营：`#0EA5E9`（digital）
- 增长：`#F59E0B`（insight）
- 成分：`#10B981`（ai/tech）
- 舆情：`#EC4899`（brand）
- 财务：`#6366F1`（legal/finance）
- 研发：`#8B5CF6`（rd）
- 银行：`#14B8A6`（global）

### 2.2 字体
- 标题：`Playfair Display`（权威）
- 正文：`Charter` / `Lora`（可读）
- UI：`SF Pro`（控制感）
- 数据：`JetBrains Mono`

### 2.3 布局网格
- 4pt 网格
- 主边距：16/20
- 最大可读宽度：428
- 最小触控：44×44

### 2.4 材质细节
- 顶部轻微纸纹噪点（2%-4%）
- 页面首屏使用柔和浅色渐变（纸面光感）

---

## 3. “角色视角 Lens”设计

**核心逻辑**：事实层共用，视角层分化

**Lens 控件**
- 位置：首页顶部（搜索下方），横向滚动 Pill
- 状态：选中态为“柔色底 + 信号点”
- 交互：切换后触发卡片排序与字段显隐（不改变事实核）
- 默认：通用 Lens（未选角色时）

**Lens 输出差异（同一事件，不同视角）**
| Lens | 关注重点 | 卡片强调 | 额外模块 |
| --- | --- | --- | --- |
| 通用 | 行业大事/高信号 | 极性 + 事实核 | 无 |
| 运营 | 渠道/竞品/定价/库存 | 价格变化、竞品动作 | “渠道影响”小条 |
| 增长 | 漏斗/投放/转化/留存 | 可执行动作、平台规则 | “增长动作建议” |
| 成分 | 法规/功效/安全/替代 | 成分变更、监管风险 | “成分/法规对照” |
| 舆情 | 情绪/扩散/窗口期 | 负面/正面情绪 | “情绪曲线” |
| 财务 | 现金流/成本/利润 | 成本/毛利影响 | “财务敏感点” |
| 研发 | 技术路线/突破 | 技术里程碑 | “路线图节点” |
| 银行 | 风险/信用/政策 | 风险等级提示 | “风险摘要” |

---

## 4. 信息架构与导航

**主导航（Tab Bar，4 项）**
- Feed（情报）
- Radar（雷达）
- Briefing（简报）
- Profile/Notes（资产）

**顶层结构**
Feed = 事实+影响  
Briefing = 叙事+框架  
Notes = 个人资产

**Profile/Notes 内部**
- 角色与标签管理（Lens/兴趣标签可随时调整）
- 订阅与通知设置

---

## 5. 关键页面（高保真必须出图）

### 5.1 Onboarding（选择视角）
- Step 1：选择角色视角（Lens，可多选，支持跳过进入通用流）
- Step 2：关注标签（行业/品牌/公司）
- Step 3：Radar 订阅实体（默认预勾 3 个）
- Step 4：通知价值引导
- Step 5：登录提示（仅在收藏/笔记/同步时触发）

### 5.2 Feed 首页（Daily 5）
**结构**
1. 顶部：Search + Lens Switcher  
2. 主标题：Today’s 5  
3. Top 5 卡片  
4. “更多已折叠”入口

**卡片密度**
- 默认折叠态：56px
- 展开态：显示影响链与 AI 观点

### 5.3 Intelligence Card（核心原子）
```
[🟢] 事实核标题（最多两行）
     关键事实（1-2 句）
     影响链：A → B → C
     来源 · 时间 · Lens 标签
     右侧：短线强度条（可选）
     长按：海报
     左滑：不感兴趣
     点击：详情页
```

### 5.4 Article Detail（The Brain）
- 顶部 AI 导读：一行结论 + 事实清单 + 极性仪表
- Body：衬线体 + 大行高
- 底部栏：Share / Save / Note / Ask AI

### 5.5 Daily Briefing（编辑叙事）
- Lead 标题 + TL;DR
- Framework Gallery（矩阵/金字塔）
- Deep Dive（嵌入卡片）
- What’s Next（动作建议）

### 5.6 Entity Radar
- 分类列表 + 订阅开关
- “My Radar” 顶置
- 订阅状态影响 Feed 排序

### 5.7 Notes（Second Brain）
- 时间轴列表 + 实体筛选
- 笔记关联实体与事件
- 卡片式“历史判断”回看

### 5.8 Viral Poster
- 高对比黑/白模板
- Watermark: `Internal / Insiders Only`
- 固定结构：极性 + 事实核 + 影响链 + 来源

### 5.9 关键界面内容与功能清单

**Onboarding（角色与标签）**
- 内容：价值主张、角色卡片、兴趣标签、推荐订阅实体、进度指示
- 功能：选择/跳过角色、选择标签、订阅实体、继续/返回

**Feed（Daily 5）**
- 内容：搜索、Lens 切换、Today’s 5 标题、Top 5 卡片、折叠区入口
- 功能：切换 Lens、展开/折叠卡片、左滑忽略、长按海报、点击进入详情

**Intelligence Card**
- 内容：极性信号、事实核、影响链、来源/时间、Lens 标签
- 功能：点击详情、左滑忽略、长按海报、展开/收起

**Article Detail（The Brain）**
- 内容：返回/原文、AI 结论、关键事实、极性仪表、正文、底部栏
- 功能：分享、收藏、记笔记、Ask AI、打开原文

**Daily Briefing**
- 内容：标题/摘要、TL;DR、Framework、叙事流、What’s Next
- 功能：章节跳转、展开卡片、分享摘要

**Entity Radar**
- 内容：分类、实体列表、订阅状态、My Radar 区域
- 功能：订阅/取消、搜索实体、筛选类别

**Notes（Second Brain）**
- 内容：时间轴、实体筛选、笔记卡片、关联事件
- 功能：编辑/删除、按实体过滤、回看历史判断

**Poster（分享）**
- 内容：极性、事实核、影响链、来源、Watermark
- 功能：保存图片、系统分享

### 5.10 交互状态表（关键页面）

| 页面 | 状态 | 触发/说明 |
| --- | --- | --- |
| Onboarding | Default | 首次进入或跳过登录 |
| Onboarding | Selecting | 选择角色/标签中 |
| Onboarding | Empty | 未选任何项时提示最小建议 |
| Onboarding | Error | 网络异常/加载失败 |
| Feed | Default | Top 5 + 折叠入口 |
| Feed | Loading | Skeleton 卡片 |
| Feed | Expanded | 某张卡片展开 |
| Feed | Swiping | 左滑忽略状态 |
| Feed | Empty | 无结果/需调整标签 |
| Feed | Offline | 显示缓存 + 重试 |
| Card | Default | 折叠态 |
| Card | Expanded | 展开态（影响链/观点） |
| Card | Pressed | 点击态反馈 |
| Card | LongPress | 海报预览 |
| Detail | Default | The Brain + 正文 |
| Detail | Loading | 内容拉取中 |
| Detail | Saving | Save/Note 操作反馈 |
| Detail | Error | 原文/数据加载失败 |
| Briefing | Default | 标题/摘要/框架 |
| Briefing | Loading | Skeleton |
| Briefing | Empty | 今日未生成 |
| Radar | Default | 分类 + 列表 |
| Radar | Toggling | 订阅切换中 |
| Radar | Empty | 未订阅提示 |
| Notes | Default | 时间轴列表 |
| Notes | Empty | 无笔记提示 |
| Notes | Editing | 编辑/高亮态 |
| Poster | Preview | 预览展示 |
| Poster | Saving | 保存中反馈 |

---

## 6. 组件规格（关键尺寸）

- 信号灯：32×32，圆角 16
- Lens Pill：高度 28，内边距 10×16
- 卡片内边距：20
- 卡片圆角：12
- 底部栏按钮：最小 44×44

---

## 7. 动效与反馈

- 卡片进入：淡入 + 轻微上浮（200ms）
- 长按：海报预览弹出（350ms）
- 左滑忽略：位移 + 渐隐
- 关键动作：轻触感（Haptic）

---

## 8. 文案风格

- 句式短、结论先行
- 禁用“热闹口吻”
- 每条事实控制在 2 句以内

---

## 9. 交付清单（高保真出图）

1. Onboarding（Lens 选择）
2. Feed（Top 5 + 折叠）
3. Feed（Lens 切换对比）
4. Detail（The Brain + 底部栏）
5. Briefing（Lenny Style）
6. Radar（订阅状态）
7. Notes（资产视图）
8. Poster（分享模板）

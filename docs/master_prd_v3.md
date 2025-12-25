# ContentRSS Master PRD v3.0 (Unified)

> **Status**: Final (Unified)
> **Date**: 2025-12-25
> **Scope**: 统一定位 + 体验闭环 + 设计/规格入口

---

## 0. 文档入口 (Single Source of Truth)

**产品定位与核心需求（本文件）**
- `docs/master_prd_v3.md`

**设计规格与系统**
- UI 设计规格：`docs/design/ui-spec.md`
- 设计系统 Tokens：`docs/design-system/design-tokens.md`
- 组件规格：`docs/design-system/component-spec.md`
- 用户流程：`docs/design-system/user-flows.md`
- 增长策略：`docs/design-system/growth-strategy.md`

**V2 设计与落地映射**
- 设计概念：`docs/v2-design/design_v2.md`
- 功能/页面地图：`docs/v2-design/feature_map.md`
- 实施计划：`docs/v2-design/implementation_plan.md`
- 交付总结：`docs/v2-design/walkthrough.md`

**后端与数据规范**
- Supabase API + DB 设计：`docs/backend/api-db-spec.md`

**功能级 Specs**
- 情报引擎：`specs/001-intelligence-engine/spec.md`
- 详情页与传播：`specs/002-detail-and-viral/spec.md`
- 实体雷达：`specs/003-entity-radar/spec.md`
- 叙事简报：`specs/004-editorial-briefing/spec.md`
- Lenny 风格：`specs/005-lenny-style/spec.md`

**工程/智能体规则（非产品定位）**
- `docs/agent-evolution/GEMINI.md`

---

## 1. 定位与价值主张

### 1.1 一句话定位
ContentRSS 是把公众号等公域内容炼成“可决策情报”的行业参谋系统，让专业人士每天 8 分钟掌握真正重要的 5 件事。

### 1.2 目标用户（核心 Persona）
- **Sarah（CEO/高管）**：关注定价权、竞品大动作、行业政策风向。
- **Dr. Li（研究/技术负责人）**：关注技术路线、学术与产业化动态。
- **财务负责人/财务分析**：关注现金流风险、供应链冲击、政策与成本变化。
- **研发同学/工程师**：关注技术路线变化、关键突破、竞品迭代节奏。
- **银行从业者**：关注行业风险、企业重大事件、宏观政策信号。

### 1.3 竞争定位（核心差异）
- **vs 科技媒体（36Kr/虎嗅）**：剔除软文与正确的废话，提供决策价值而非阅读消费。
- **vs 阅读工具（语鲸类）**：不止摘要，输出“影响链”与判断。
- **vs 电商情报通**：不做战术指标，而做战略动向与行业趋势。

---

## 2. 三大核心需求（Final）

### 2.1 极高信噪比（Signal-to-Noise）
**目标**：今天全网信息里，只有 5 件值得你知道。

**落地机制**
- **Hard Cap**：默认只展示 Top 5（其余折叠）。
- **极性门槛**：必须具备明确利好/利空/中性信号才进入主视野。
- **反馈训练**：左滑“不感兴趣”持续提纯偏好。

### 2.2 信息源破壁（Phased）
**当前现实**：数据源以公众号为主。  
**策略**：分阶段扩展，避免虚假“多源”。

**Phase 1（现在）**
- 公众号作为唯一 P0 数据源。
- 卡片底部展示来源元数据（作者/公众号）。

**Phase 2（下一阶段）**
- 引入 36Kr/虎嗅/外媒/研报/X 等多源。
- 卡片支持多来源聚合展示（“来源：公众号 + 研报 + 外媒”）。

### 2.3 结构化摘要（升级版）
**旧期望**：背景 + 核心事件 + 行业影响 + 辣评  
**最终标准**：极性 + 事实核 + 影响链 + AI 观点（可选）

**为什么升级**
- 行业用户不需要背景科普，直接给事实与影响。
- 去掉“网友/专家辣评”，避免噪音与不可控主观意见。
- 用“影响链”替代“辣评”，更可验证、更可决策。

**统一摘要 Schema（P0）**
| 模块 | 内容 | 说明 |
| --- | --- | --- |
| 极性 | Bullish/Bearish/Neutral | 快速信号灯 |
| 事实核 | 2 句话内的核心事实 | 只留硬信息 |
| 影响链 | Entity → Trend → Reason | 逻辑推演 |
| AI 观点 | 1 句可选锐评 | 可关闭 |

---

## 3. 核心体验模块

### 3.1 Intelligence Feed（情报卡片）
- 情报卡片是原子单位，不是文章。
- 一眼看到：极性 + 事实核 + 影响链。
- 长按触发分享海报（带水印）。

### 3.2 Article Detail（The Brain）
- AI 导读置顶：一行结论 + 关键事实 + 情绪/极性仪表盘。
- 阅读模式：衬线体 + 大行高。

### 3.3 Entity Radar（订阅雷达）
- 订阅实体/行业/人物，驱动个性化排序。
- “My Radar” 模式优先推送订阅相关。

### 3.4 Daily Briefing（叙事简报）
- Lenny Style：Lead → TL;DR → Framework → Deep Dive → Closing。
- 将碎片卡片编织成可执行叙事。

### 3.5 Viral Poster（增长引擎）
- 长按卡片生成海报。
- 默认水印：`Internal / Insiders Only`。

---

## 4. 关键交互画面（UI 确认）

1. **情报卡片**：第一眼看到极性信号 + 加粗事实核。
2. **分享动作**：长按弹出高质海报，带“Internal/Insiders Only”水印。
3. **无感入场**：访客可直接浏览；当触发收藏/笔记时再要求登录。

---

## 5. 留存系统（Second Brain）

### 5.1 收藏（Save）
- 收藏的不是“文章”，而是**当时的 AI 判断**。

### 5.2 笔记（Notes）
- 支持高亮与写想法。
- 笔记自动关联到实体标签，形成可回溯的“个人观点轨迹”。

---

## 6. 体验闭环（Content Loop）

```
Ingest → Analyst → Intelligence Card → Briefing
         ↓                              ↓
     Radar偏好  ←  Notes/Save  ←  分享海报
```

**设计哲学支撑**
- Fortress Philosophy：证据密度、动态演进、可回溯。
- 不追求“内容多”，追求“判断可用”。

---

## 7. 数据与 AI 分析（当前实现对齐代码）

**数据源（P0 现实）**
- 公众号为唯一输入源（Special API 拉取）。
- `/api/raw-data` 返回分组后的原始公众号数据（分类维度）。

**AI 分析方式（Python）**
- `backend/main.py` 调用 `backend/prompts/analyst_v1.md` 生成结构化输出。
- 输出字段：`polarity`、`fact`、`impacts[]`、`opinion`、`tags[]`。
- `/api/intelligence` 聚合各分类（每类最多 3 条）并返回情报卡片。

**已存在的“决策信息”字段**
- 极性（Polarity）
- 事实核（Fact）
- 影响链（Impacts）
- 观点（Opinion）

**当前缺口（需补齐）**
- Top 5 的“硬限制”尚未在后端排序中实现。
- 角色 Lens 的排序/字段显隐逻辑尚未进入后端。
- 详情页的 The Brain 结构（thesis/facts/sentiment）在主 API 中未标准化输出。

---

## 8. 设计系统与视觉原则（摘要）

- **视觉基调**：Paper Cream 背景 + Serif 标题（可读性与权威感）。
- **交互基调**：Haptic + Motion 提升“工具质感”。
- **组件核心**：Intelligence Card、The Brain、Poster、Briefing Flow。

详细规范见设计系统文档（见“文档入口”）。

---

## 9. 关键用户流程（摘要）

- **Onboarding**：角色可选 → 兴趣选择 → 订阅实体 → 进入 Feed（跳过角色=通用流）。
- **每日阅读**：Briefing TL;DR → 重点卡片 → 深度详情。
- **情报反馈**：滑动忽略 → 影响下一次排序。
- **深度沉淀**：收藏/笔记 → 关联实体 → 形成个人知识资产。

---

## 10. 交互原则与高级交互规范（Apple HIG + 交互科学）

**设计原则**
- **直接操作**：卡片可滑动/长按/点击，减少进入深层页面的成本。
- **强反馈**：关键动作配合 Haptic + 视觉反馈（Toast/Badge）。
- **一致性**：左滑=忽略、长按=分享、点击=详情，在全局保持一致。
- **渐进披露**：默认只展示 Top 5，展开后显示影响链与 AI 观点。
- **系统替用户承担复杂度**：默认智能排序，用户只需调整角色/标签。
- **可撤销**：忽略动作提供短暂 Undo（减少误操作焦虑）。
- **可达性**：触控目标 ≥ 44×44，重要操作置于底部栏。

**关键交互（P0 必须）**
| 场景 | 交互 | 反馈 |
| --- | --- | --- |
| Feed 卡片 | 点击进入详情 | 轻触感 + 卡片展开动效 |
| Feed 卡片 | 左滑忽略 | 位移+渐隐+Undo |
| Feed 卡片 | 长按分享 | 海报预览弹出 |
| Lens 切换 | 横向滑动选择 | 卡片重新排序 |
| Detail | 底部栏操作 | 触感 + 状态提示 |
| Notes | 保存/高亮 | “已保存”标记 |

**空状态与异常**
- 离线：展示缓存卡片 + 重试按钮
- 无结果：提示调整标签/订阅

---

## 11. 增长策略与商业化（Business Growth）

**AARRR 路径**
- **Acquisition**：分享海报 + Briefing Web 分享页
- **Activation**：首次 TL;DR 命中个人兴趣（Aha Moment）
- **Retention**：Daily Briefing 推送 + Radar 更新提醒
- **Referral**：海报水印 + Deep Link
- **Revenue**：Freemium（AI 问答、雷达上限、去水印）

**增长引擎（P0）**
- Viral Poster：长按即生成，默认水印
- 访客模式：无感浏览，资产动作触发登录
- Radar 订阅：提高回访与推送粘性

**商业化触发**
- 超额使用 AI 问答
- 超出订阅实体上限
- 去水印/导出需求

**指标（首月重点）**
- D1/D7 留存
- Daily Briefing 打开率
- 分享海报转化率
- 角色选择转化率

---

## 12. MVP 范围与阶段

### P0（现在必须）
- 公众号数据摄取与清洗。
- 情报卡片（极性 + 事实核 + 影响链）。
- Daily Briefing（叙事结构）。
- Entity Radar（订阅 + 基础过滤）。
- Notes/Save（留存资产）。
- Viral Poster（带水印）。
- 访客模式与“收藏触发登录”。

### P1（下一阶段）
- 多源破壁（36Kr/虎嗅/外媒/研报/X）。
- 重要性评分与权重排序。
- 证据链接与来源对照。

---

## 13. 验收标准（Design Audit Checklist）

- **信噪比**：默认 Top 5 + 折叠策略生效。
- **结构化摘要**：每张卡片满足统一 Schema。
- **来源透明**：来源元数据清晰展示。
- **留存闭环**：收藏与笔记能形成可回溯资产。
- **增长闭环**：长按海报可分享、带水印。
- **无感入场**：访客可浏览，登录只在资产动作触发。
- **交互一致性**：左滑忽略 / 长按分享 / 点击详情统一生效。
- **角色分流**：未选角色=通用流，选角色=Lens 生效。

---

## 14. 统一口径决议（解决历史冲突）

- **定位**：统一对外为“行业情报参谋 / Industry Intelligence OS”。  
  “堡垒型知识库”降级为内部的留存系统描述。
- **摘要结构**：以“极性 + 事实核 + 影响链 + AI 观点（可选）”为唯一标准。
- **多源策略**：明确 Phase 1 单源（公众号），Phase 2 再破壁。
- **滑动动作**：统一为“左滑忽略”。

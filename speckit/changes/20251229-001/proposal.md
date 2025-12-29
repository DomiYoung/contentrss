# Proposal: Entity Radar (实体雷达) v1.0

## 问题陈述
当前系统（Intelligence OS）能够提取实体影响链（Impact Chain），但缺乏对实体全局态势的直观展示。用户需要一个横跨多个维度的“雷达图”，用于快速识别热门实体、情绪倾向及未来潜力。

## 目标
1. **视觉卓越**：实现符合 Apple-UI 审美的高保真雷达图界面。
2. **多维分析**：展示实体在情绪、热度、影响力、稳定性和潜力五个维度的评分。
3. **交互集成**：雷达图应与现有情报列表（Intelligence Feed）深度联动。

## Expert Panel（模型推荐）

| 专家角色 | 关注点 (DoD) | 对应验证动作 |
| :--- | :--- | :--- |
| **前端设计专家** | Apple-UI 风格、微交互、数据可视化美感 | 评审雷达图阴影、渐变与玻璃拟态效果 (Quartz/Glassmorphism) |
| **框架专家** | 组件复用性、Echarts 与 React 生命周期的正确集成 | 检查数据更新时的动效流畅度与内存泄露 |
| **后端/数据库专家** | 实体聚合算法的准确性、接口响应延迟 (RTT < 200ms) | 压测大批量 impacts 数据下的 SQL 聚合效率 |

## 实施方案

### 1. 数据模型与接口 (Backend)
- 新增 `EntityService.get_radar_data()` 逻辑。
- 聚合 `raw_articles.ai_impacts` 字段，识别唯一 `entity`。
- **算法维度**：
    - `Sentiment`: 基于 `polarity` 的加权得分。
    - `Frequency`: 出现次数。
    - `Momentum`: 近期增长速度 (dIngestedAt)。
    - `Volatility`: 情绪波动率。
    - `Sector Coverage`: 覆盖的分类（tags）数量。
- 新增 API：`GET /api/entities/radar`。

### 2. 前端实现 (Frontend)
- **组件**：`EntityRadar.tsx` (基于 Apache ECharts)。
- **布局**：集成到 `IntelligenceView.tsx`，作为“探索”或侧边抽屉展示。
- **技术栈**：`echarts-for-react`, `framer-motion`。

## 风险与缓释
- **数据量风险**：实体过多导致聚合慢。-> *缓释：增加 24h 缓存机制或限制 top 30 实体。*
- **视觉冲突**：Echarts 默认样式与 Apple-UI 不搭。-> *缓释：手动配置 Echarts theme，使用系统定义的渐变色。*

## 验证计划
- **自动化测试**：API 响应数据结构校验。
- **手动验证**：在移动端调试，确保雷达图触控交互灵敏。

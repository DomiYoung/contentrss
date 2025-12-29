# KI (Knowledge Iteration) 机制补充方案

> **遗漏问题**: 原方案中缺少 KI 自进化机制
> **严重程度**: ⚠️ 高 - 这会导致经验无法沉淀，Skills 无法持续优化
> **解决方案**: 整合 KI 机制到现有流程

---

## 📋 原 GEMINI.md 中的 KI 机制

### 核心概念

**KI (Knowledge Iteration)** - 技能自进化系统：
```yaml
定义: 每次会话结束前反思沉淀经验，持续优化 Skills

三步循环:
  1. 会话中: 使用 Skills 完成任务
  2. 会话末: 反思是否有值得沉淀的经验
  3. 沉淀后: 更新 Skills 或创建新 KI
```

### KI 存储位置

```
~/.gemini/antigravity/knowledge/
├── contentrss/                 # 项目知识库
│   └── artifacts/
│       ├── product/            # 产品决策
│       ├── strategy/           # 市场策略
│       ├── technical/          # 技术规范
│       └── ui/                 # UI 设计规范
└── {framework_name}/           # 框架知识
```

### 知识优先原则

```yaml
新会话启动流程:
  1. 先检查 KI - 是否有该问题的已有答案
  2. 再加载 Skills - 执行具体任务
  3. 任务后更新 KI - 沉淀新知识
```

### 反思清单

```yaml
会话结束前自检:
  ① 踩了什么坑？     → 记录到 KI
  ② 发现什么更优实践？ → 更新 Skills
  ③ 用户纠正了什么？  → 内化到 Skills/KI
```

---

## 🔄 整合到当前方案

### 方案 6: KI 自进化机制（新增）

**目标**: 让 Skills 和项目知识持续进化，避免重复犯错

**整合点**:
1. **会话启动时**: 读取 contentrss KI
2. **会话进行中**: 记录关键决策和踩坑
3. **会话结束前**: 反思并更新 KI/Skills

---

## 🚀 实施方案

### Step 1: 创建 KI 目录结构

```bash
mkdir -p ~/.gemini/antigravity/knowledge/contentrss/artifacts/{product,technical,ui,strategy}
```

**目录说明**:
```
~/.gemini/antigravity/knowledge/contentrss/
├── artifacts/
│   ├── product/
│   │   ├── feature_decisions.md         # 功能决策记录
│   │   └── requirement_changes.md       # 需求变更历史
│   ├── technical/
│   │   ├── architecture_decisions.md    # 架构决策（ADR）
│   │   ├── api_patterns.md              # API 设计模式
│   │   ├── component_patterns.md        # 组件设计模式
│   │   └── pitfalls.md                  # 踩坑记录
│   ├── ui/
│   │   ├── design_system.md             # 设计系统规范
│   │   └── interaction_patterns.md      # 交互模式
│   └── strategy/
│       └── project_goals.md             # 项目目标和策略
```

### Step 2: 创建初始 KI 文件

**technical/pitfalls.md** (踩坑记录):
```markdown
# ContentRSS 技术踩坑记录

## 数据库

### ❌ 坑 1: SQLite 并发限制
**日期**: 2025-12-XX
**问题**: 开发环境使用 SQLite，遇到并发写入锁死
**解决**: 生产环境切换到 PostgreSQL (Railway)
**教训**: 从一开始就用 PostgreSQL 开发，避免环境差异

### ❌ 坑 2: AI 分析缓存策略
**日期**: 2025-12-XX
**问题**: raw_articles 表中 ai_analysis 字段频繁重复计算
**解决**: 增加缓存逻辑，检查字段是否已有值
**教训**: AI 分析成本高，必须强制缓存

## 前端

### ❌ 坑 3: IndexedDB 缓存一致性
**日期**: 2025-12-XX
**问题**: 后端数据更新后，前端 IndexedDB 缓存未失效
**解决**: 实现 fetchWithCache 时增加 TTL 机制
**教训**: 缓存必须有失效策略

### ❌ 坑 4: Framer Motion 性能问题
**日期**: 2025-12-XX
**问题**: 长列表使用动画导致卡顿
**解决**: 仅对可见区域应用动画，使用 will-change
**教训**: 动画要克制，性能优先

## API 设计

### ❌ 坑 5: 响应格式不统一
**日期**: 2025-12-XX
**问题**: 不同 API 返回格式不一致（有的 {data: ...}, 有的直接返回）
**解决**: 统一为 {success, data, error} 格式
**教训**: 一开始就定义 API 响应规范，严格执行
```

**technical/architecture_decisions.md** (ADR):
```markdown
# Architecture Decision Records (ADR)

## ADR-001: 使用 FastAPI 而非 Flask

**日期**: 2025-12-XX
**状态**: ✅ 已采纳

**背景**:
- 需要现代化的 Python 后端框架
- 需要自动 API 文档生成
- 需要异步支持

**决策**: 使用 FastAPI

**理由**:
1. 原生支持 async/await
2. 自动生成 OpenAPI 文档
3. Pydantic 类型验证
4. 性能优于 Flask

**后果**:
- ✅ API 文档自动化
- ✅ 类型安全
- ⚠️ 团队需要学习 async 编程

---

## ADR-002: 前端使用 React 19 + Vite 7

**日期**: 2025-12-XX
**状态**: ✅ 已采纳

**背景**:
- 需要现代化前端框架
- 需要快速开发体验

**决策**: React 19 + Vite 7 + TypeScript

**理由**:
1. React 19 服务端组件和并发特性
2. Vite 极速开发服务器
3. TypeScript 类型安全

**后果**:
- ✅ 开发体验极佳
- ✅ 构建速度快
- ⚠️ 需要学习 React 19 新特性

---

## ADR-003: 使用 Railway PostgreSQL

**日期**: 2025-12-XX
**状态**: ✅ 已采纳

**背景**:
- SQLite 并发限制
- 需要生产级数据库

**决策**: Railway PostgreSQL

**理由**:
1. 零配置部署
2. 自动备份
3. 性能监控

**后果**:
- ✅ 稳定可靠
- ✅ 无需自己运维
- ⚠️ 成本增加（可接受）
```

**technical/component_patterns.md** (组件模式):
```markdown
# ContentRSS 组件设计模式

## 通用模式

### 1. 可复用组件必须有语义化类名

**规则**: 每个可交互组件必须有稳定的、语义化的 CSS 类名

**示例**:
```tsx
// ✅ 正确
<div className="intelligence-card bg-white p-4 rounded-lg">

// ❌ 错误（仅依赖 Tailwind 动态类名）
<div className="bg-white p-4 rounded-lg">
```

**原因**: 自动化测试需要稳定选择器

---

### 2. 触觉反馈集成

**规则**: 关键操作配合 triggerHaptic()

**示例**:
```tsx
import { triggerHaptic } from '@/lib/haptic';

const handleClick = () => {
  triggerHaptic('medium');
  // ... 业务逻辑
};
```

**适用场景**: 按钮点击、滑动操作、长按

---

### 3. fetchWithCache 优先

**规则**: 所有 API 调用优先使用 fetchWithCache

**示例**:
```tsx
import { fetchWithCache } from '@/lib/api';

const data = await fetchWithCache('/api/intelligence', {
  ttl: 300000, // 5分钟缓存
});
```

**原因**: 减少服务器压力，提升用户体验
```

**product/feature_decisions.md** (功能决策):
```markdown
# ContentRSS 功能决策记录

## 已决策功能

### Intelligence Engine - 情报卡片

**决策日期**: 2025-12-XX
**状态**: ✅ 已实现

**核心功能**:
- 极性判断（Bullish/Bearish）
- 影响链展示
- The Brain 深度分析

**关键决策**:
1. 极性用颜色区分（红/绿）
2. 影响链最多显示 3 个维度
3. The Brain 采用 Paper Cream 背景

**教训**:
- ✅ 颜色编码直观
- ⚠️ 影响链过多会导致信息过载

---

### Article Detail - 文章详情

**决策日期**: 2025-12-XX
**状态**: ✅ 已实现

**核心功能**:
- The Brain 深度分析
- NotePad 用户笔记
- SharePoster 分享海报

**关键决策**:
1. 分享海报使用 html2canvas 生成
2. NotePad 支持 Markdown

**教训**:
- ✅ 用户笔记功能受欢迎
- ⚠️ html2canvas 性能需优化

---

## 废弃功能

### RSS 全文抓取

**决策日期**: 2025-12-XX
**状态**: ❌ 已废弃

**原因**:
1. 大部分站点有反爬限制
2. 维护成本高
3. AI 分析摘要已足够

**替代方案**: 仅抓取 RSS 摘要 + AI 扩展分析
```

### Step 3: 整合到工作流

**在 Superpowers finishing 阶段增加 KI 反思**:

```yaml
Phase 4: Finishing（Superpowers + Product Manager + KI）

AI:
  1. product-manager 核对 checklist
  2. 生成验收报告
  3. 更新 SESSION.md

  4. 【新增】KI 反思:
     → 检查本次功能开发是否有：
       - 踩坑经验需记录？
       - 更优实践需沉淀？
       - 架构决策需记录（ADR）？

     → 如果有，更新相应 KI 文件:
       - 踩坑 → technical/pitfalls.md
       - 架构决策 → technical/architecture_decisions.md
       - 组件模式 → technical/component_patterns.md
       - 功能决策 → product/feature_decisions.md
```

**在新会话启动时读取 KI**:

```yaml
新会话启动流程（更新版）:

1. 【新增】读取 contentrss KI
   → 检查 ~/.gemini/antigravity/knowledge/contentrss/
   → 加载相关踩坑记录、架构决策、组件模式

2. 自动读取 CLAUDE.md
   → 加载项目上下文

3. 匹配 Skills
   → 根据用户请求触发相应 Skills

4. 开始工作
   → 基于 KI 知识避免重复踩坑
```

### Step 4: 创建 KI 管理 Skill

**~/.claude/skills/ki-manager/SKILL.md**:

```yaml
---
name: ki-manager
description: "Knowledge Iteration 管理专家。负责会话结束前的经验沉淀、KI 更新、Skills 优化。触发：会话结束、功能完成、用户说'总结一下'、'记录经验'、'沉淀知识'。自动在 finishing 阶段触发。"
---

# KI Manager - Knowledge Iteration 管理专家

## 核心职责

在每次会话结束前，主动反思并沉淀经验到 KI 系统。

## 反思清单

### 1. 踩坑经验检查

**问题**:
- 本次开发是否遇到意外的技术问题？
- 是否有调试很久才解决的 bug？
- 是否有文档不清晰导致的误用？

**行动**:
→ 如果有，记录到 `~/.gemini/antigravity/knowledge/contentrss/artifacts/technical/pitfalls.md`

**格式**:
```markdown
### ❌ 坑 X: [简短描述]
**日期**: YYYY-MM-DD
**问题**: [详细问题描述]
**解决**: [解决方案]
**教训**: [一句话经验]
```

---

### 2. 架构决策检查

**问题**:
- 本次开发是否做了重要的技术选型？
- 是否选择了某个库/框架/工具？
- 是否有架构层面的变更？

**行动**:
→ 如果有，记录到 `~/.gemini/antigravity/knowledge/contentrss/artifacts/technical/architecture_decisions.md`

**格式**:
```markdown
## ADR-XXX: [决策标题]

**日期**: YYYY-MM-DD
**状态**: ✅ 已采纳 / ⚠️ 讨论中 / ❌ 已废弃

**背景**: [为什么需要这个决策]
**决策**: [具体决策内容]
**理由**: [决策理由]
**后果**: [采纳后的影响]
```

---

### 3. 组件模式检查

**问题**:
- 本次开发是否创建了可复用的组件？
- 是否发现了更优的组件设计模式？
- 是否有值得推广的代码模式？

**行动**:
→ 如果有，记录到 `~/.gemini/antigravity/knowledge/contentrss/artifacts/technical/component_patterns.md`

**格式**:
```markdown
### [模式名称]

**规则**: [一句话规则]

**示例**:
\```tsx
// ✅ 正确
[示例代码]

// ❌ 错误
[反例代码]
\```

**原因**: [为什么这样做]
```

---

### 4. 功能决策检查

**问题**:
- 本次开发是否做了重要的功能决策？
- 是否有功能被废弃或调整？
- 是否有用户反馈影响了功能设计？

**行动**:
→ 如果有，记录到 `~/.gemini/antigravity/knowledge/contentrss/artifacts/product/feature_decisions.md`

---

### 5. Skills 优化检查

**问题**:
- 某个 Skill 的触发词是否不够准确？
- 某个 Skill 的逻辑是否需要优化？
- 是否需要创建新的 Skill？

**行动**:
→ 如果有，更新相应 Skill 的 SKILL.md

---

## 触发时机

### 自动触发
- Superpowers finishing 阶段完成后
- 用户说 "总结一下"、"记录经验"

### 手动触发
- 用户显式调用: `/skill ki-manager`

---

## 工作流

### Step 1: 反思本次会话
```yaml
回顾本次会话:
  - 完成了什么功能？
  - 遇到了什么问题？
  - 做了什么决策？
  - 发现了什么模式？
```

### Step 2: 逐项检查反思清单
```yaml
依次检查:
  1. 踩坑经验
  2. 架构决策
  3. 组件模式
  4. 功能决策
  5. Skills 优化
```

### Step 3: 更新 KI 文件
```yaml
对每个需要记录的项:
  1. 读取相应 KI 文件
  2. 使用 Edit 工具追加新内容
  3. 保持格式一致性
```

### Step 4: 提示用户
```yaml
输出摘要:
  ✅ 已记录 X 条踩坑经验
  ✅ 已记录 Y 个架构决策
  ✅ 已更新 Z 个组件模式
```

---

## 集成示例

```
# Superpowers finishing 完成后

AI:
  1. product-manager 核对 checklist ✅
  2. 更新 SESSION.md ✅
  3. 自动触发 ki-manager 反思

ki-manager:
  → 反思: 本次开发"用户关注功能"

  → 发现踩坑 1 条:
     "user_follows 表忘记添加唯一索引导致重复关注"
     → 记录到 pitfalls.md

  → 发现架构决策 1 个:
     "选择双向关注而非单向关注"
     → 记录 ADR-007

  → 发现组件模式 1 个:
     "FollowButton 的乐观更新模式"
     → 记录到 component_patterns.md

  → 输出:
     "✅ 已沉淀 3 条经验到 KI 系统
      下次开发类似功能时将自动避免这些坑"
```
```

---

## 🎯 整合后的完整流程

### 新会话启动流程（含 KI）

```
1. 【KI】读取 contentrss 知识库
   → 加载踩坑记录、架构决策、组件模式

2. 【自动】读取 CLAUDE.md
   → 加载项目上下文

3. 【自动】触发 project-session-management
   → 读取 SESSION.md，恢复上次进度

4. 【自动】匹配 Skills
   → 根据用户请求触发相应 Skills

5. 开始工作
   → 基于 KI 知识 + SESSION.md + Skills
```

### 功能完成流程（含 KI）

```
1. Superpowers execute-plan 完成

2. Superpowers finishing 阶段
   → product-manager 核对 checklist
   → 更新 SESSION.md

3. 【KI】ki-manager 自动反思
   → 检查踩坑经验
   → 检查架构决策
   → 检查组件模式
   → 检查功能决策
   → 检查 Skills 优化需求

4. 【KI】更新 KI 文件
   → 记录到相应的 .md 文件

5. 提示用户
   → "✅ 已沉淀 X 条经验，下次自动避坑"
```

---

## 📋 更新后的验收标准

**原有验收标准** (保持不变):
- [ ] project-session-management 安装成功
- [ ] component-reuse-expert 自动触发
- [ ] Hooks 成功拦截 specs/ 修改
- [ ] product-manager 生成进度报告

**新增 KI 验收标准**:
- [ ] KI 目录结构创建完成
- [ ] 初始 KI 文件（pitfalls.md, architecture_decisions.md 等）创建
- [ ] ki-manager skill 创建并测试
- [ ] finishing 阶段自动触发 ki-manager
- [ ] KI 文件成功更新（至少测试一次）
- [ ] 新会话启动时成功读取 KI

---

## 🎯 实施优先级（更新）

### Phase 1: 快速见效（30 分钟）
1. ✅ 安装 project-session-management
2. ✅ 创建 KI 目录结构
3. ✅ 创建初始 KI 文件（pitfalls.md 等）

### Phase 2: 核心能力（2-3 小时）
1. ✅ 创建 component-reuse-expert
2. ✅ 增强 product-manager
3. ✅ 创建 Hooks 需求冻结
4. ✅ **创建 ki-manager skill**

### Phase 3: 文档和集成（1 小时）
1. ✅ 更新 CLAUDE.md（增加 KI 说明）
2. ✅ 创建工作流文档
3. ✅ 完整流程测试（含 KI 反思）

---

## 📊 KI 机制的价值

| 问题 | 没有 KI | 有 KI |
|:---|:---|:---|
| **重复踩坑** | 每次都要重新调试 | 自动避免已知坑 |
| **架构决策** | 忘记为什么这样设计 | 有 ADR 记录可查 |
| **组件模式** | 每次都要重新思考 | 直接使用已验证模式 |
| **Skills 优化** | 永远不进化 | 持续优化，越用越好 |

**预期效果**:
- ✅ 减少 70% 重复踩坑
- ✅ 架构决策可追溯
- ✅ 组件设计一致性提升 80%
- ✅ Skills 质量持续提升

---

## 🎉 总结

**KI 机制是自进化的核心**！

**整合方案**:
1. ✅ 创建 KI 目录和初始文件
2. ✅ 创建 ki-manager skill
3. ✅ 整合到 finishing 阶段
4. ✅ 新会话启动时读取 KI

**下一步**:
→ 更新实施计划文档，增加 KI 相关步骤
→ 测试完整流程（含 KI 反思）

**重要性**: ⭐⭐⭐⭐⭐
**必须实施**: ✅ 是的，这是长期质量保障的关键

# ContentRSS 自动触发机制说明

> **核心问题**: CLAUDE.md、Skills、工作流程是否需要显式调用？
> **答案**: 部分自动，部分需显式调用

---

## 📋 自动化机制总览

| 组件 | 是否自动 | 触发方式 | 需要显式调用吗？ |
|:---|:---|:---|:---|
| **CLAUDE.md** | ✅ 完全自动 | 每次会话开始时自动读取 | ❌ 不需要 |
| **Skills (领域专家)** | ✅ 自动触发 | 语义匹配 description | ⚠️ 可选（建议自动） |
| **Superpowers 工作流** | ⚠️ 半自动 | 可自动可显式 | ⚠️ 建议显式调用 |
| **project-session-management** | ✅ 自动触发 | 触发词匹配 | ❌ 不需要 |
| **component-reuse-expert** | ✅ 自动触发 | 触发词匹配 | ❌ 不需要 |
| **Hooks** | ✅ 完全自动 | 事件驱动 | ❌ 不需要 |

---

## 1️⃣ CLAUDE.md - **完全自动**

### 行为
```yaml
每次新会话启动:
  1. Claude Code 自动读取 contentrss/CLAUDE.md
  2. 加载项目上下文、技术栈、核心理念
  3. 无需用户任何操作
```

### 您需要做什么？
❌ **什么都不需要做**

### 示例
```
# 新会话
用户: "帮我优化一下前端性能"

AI（内部）:
  → 自动读取 CLAUDE.md
  → 了解到技术栈是 React 19 + Vite 7
  → 了解到设计风格是 Apple Design Scientist
  → 开始回答...
```

---

## 2️⃣ Skills (领域专家) - **自动触发**

### 触发机制
Claude Code 通过 **语义相似度匹配** 自动激活 Skills：

```yaml
工作原理:
  1. 分析用户输入的语义
  2. 与所有 Skills 的 description 进行相似度计算
  3. 相似度超过阈值 → 自动加载该 Skill
  4. 执行 Skill 中的指令
```

### ⚠️ 关键：description 必须包含丰富触发词

**好的 description 示例** (frontend-expert):
```yaml
description: "前端开发专家。当用户需要：(1) 开发前端组件/UI (2) React/Vue/Angular 实现 (3) CSS/TailwindCSS 样式 (4) 响应式设计 (5) 无障碍性优化 (6) 前端性能优化时触发。用户可能说'做个组件'、'前端页面'、'UI 实现'、'样式优化'。优先级：用户需求 > 无障碍性 > 性能 > 技术优雅。"
```

**为什么好？**
- ✅ 包含大量触发词：组件、UI、React、前端、样式
- ✅ 包含用户可能的说法："做个组件"、"前端页面"
- ✅ 明确适用场景

### 您需要做什么？
⚠️ **可选择显式调用，但建议让其自动触发**

### 示例 1: 自动触发 (推荐)
```
用户: "帮我做个用户关注按钮"

AI（内部）:
  → 语义匹配: "做个" + "按钮" → 前端组件
  → 自动加载 frontend-expert skill
  → 遵循 Apple Design Scientist 风格
  → 使用 TailwindCSS
  → 开始实现...
```

### 示例 2: 显式调用 (可选)
```
用户: "/skill frontend-expert 帮我做个用户关注按钮"

AI:
  → 显式加载 frontend-expert
  → 开始实现...
```

---

## 3️⃣ Superpowers 工作流 - **建议显式调用**

### 触发方式

**方式 1: 显式调用 (推荐)**
```
用户: "/superpowers:brainstorm"
用户: "我想做用户关注功能" + 按回车调用 brainstorming
```

**方式 2: 自然语言触发 (需要触发词)**
```
用户: "我想做用户关注功能，帮我 brainstorm 一下"
→ 可能自动触发 superpowers:brainstorming
```

### 为什么建议显式调用？

1. **明确意图**: 让 AI 知道您要进入哪个工作流阶段
2. **避免误触**: 防止普通对话被误认为要启动工作流
3. **更可控**: 您决定何时进入 brainstorming、planning、execution

### Superpowers 7 阶段调用方式

| 阶段 | 显式调用 | 自然触发词 |
|:---|:---|:---|
| **1. Brainstorming** | `/superpowers:brainstorm` | "帮我 brainstorm"、"设计一下" |
| **2. Git Worktrees** | `/superpowers:using-git-worktrees` | "创建工作分支" |
| **3. Writing Plans** | `/superpowers:write-plan` | "写个实施计划" |
| **4. Executing Plans** | `/superpowers:execute-plan` | "执行计划" |
| **5. TDD** | `/superpowers:test-driven-development` | "写测试" |
| **6. Code Review** | `/superpowers:requesting-code-review` | "代码审查" |
| **7. Finishing** | `/superpowers:finishing-a-development-branch` | "完成这个功能" |

---

## 4️⃣ project-session-management - **自动触发**

### 触发词
```yaml
自动触发条件:
  - "start project tracking"
  - "resume work"
  - "show progress"
  - "continue project"
  - "项目进度"
  - "恢复工作"
```

### 您需要做什么？
❌ **什么都不需要** - 说这些词就会自动触发

### 示例
```
# 场景 1: 新会话开始
用户: "继续昨天的工作"

AI（内部）:
  → 检测到 "继续" + "工作"
  → 自动触发 project-session-management
  → 读取 SESSION.md
  → 获取上次进度和下一步行动
  → 回答: "上次我们做到了 XX，下一步是 YY"

# 场景 2: 查询进度
用户: "项目进度如何？"

AI（内部）:
  → 检测到 "项目进度"
  → 自动触发 project-session-management
  → 读取 SESSION.md
  → 生成进度报告
```

---

## 5️⃣ component-reuse-expert - **自动触发**

### 触发词 (需要在 description 中设计)

推荐 description:
```yaml
description: "组件复用专家。在开发新功能前自动检查已有组件/API/工具函数/数据库表，防止重复开发。触发：用户说'开发新功能'、'做个组件'、'加个 API'、'我想做'、Superpowers brainstorming 或 write-plan 阶段。"
```

### 自动触发场景
```yaml
场景 1: 用户说 "我想做用户关注功能"
  → 检测到 "我想做" + "功能"
  → 自动触发 component-reuse-expert
  → 检查已有组件
  → 输出复用建议

场景 2: Superpowers brainstorming 阶段
  → brainstorming skill 调用 component-reuse-expert
  → 自动检查复用机会
```

### 您需要做什么？
❌ **什么都不需要** - 但需要确保 description 包含丰富触发词

---

## 6️⃣ Hooks - **完全自动**

### 触发机制
```yaml
事件驱动:
  - ToolUse 事件: 当 AI 尝试使用 Edit/Write 工具时
  - 自动检查: 是否修改 specs/ 下的关键文件
  - 自动拦截: 如果是，阻止并提示用户确认
```

### 您需要做什么？
❌ **什么都不需要** - Hooks 自动监控

### 示例
```
用户: "帮我把 spec.md 里的功能改一下"

AI（内部）:
  → 准备使用 Edit 工具修改 specs/001/spec.md
  → Hooks 检测到 ToolUse 事件
  → 拦截！输出警告:
     "⚠️  检测到规范文件修改: specs/001/spec.md
      🔒 需求冻结保护
      这是有意的需求变更吗？"

用户确认后:
  → 才允许修改
```

---

## 🎯 推荐的日常使用方式

### 方式 1: 完全自动化（推荐给您）

**优点**: 无缝体验，无需记忆命令
**缺点**: 依赖 Skills description 质量

```
# 新功能开发
用户: "我想做用户关注功能"

AI:
  → 自动读取 CLAUDE.md ✅
  → 自动触发 component-reuse-expert ✅
  → 自动检查复用机会
  → 进入 brainstorming（如果 description 包含触发词）
  → 或提示: "检测到新功能需求，是否需要 brainstorming？"

# 继续工作
用户: "继续昨天的工作"

AI:
  → 自动触发 project-session-management ✅
  → 读取 SESSION.md
  → 恢复上下文

# 查询进度
用户: "项目进度如何？"

AI:
  → 自动触发 product-manager ✅
  → 读取 SESSION.md
  → 生成进度报告
```

### 方式 2: 混合模式（最灵活）

**优点**: 关键阶段显式调用，其他自动
**缺点**: 需要记住 Superpowers 命令

```
# 新功能开发 - 显式调用 Superpowers
用户: "/superpowers:brainstorm"
提示: "我想做用户关注功能"

AI:
  → 进入 brainstorming 工作流 ✅
  → 自动触发 component-reuse-expert ✅
  → 检查复用机会

# 写计划 - 显式调用
用户: "/superpowers:write-plan"

AI:
  → 拆解任务
  → 生成复用清单
  → 输出 plan.md

# 其他自动触发
用户: "继续工作" → 自动触发 session management
用户: "项目进度" → 自动触发 product-manager
```

---

## ✅ 最终建议（针对您的情况）

### 您应该使用：**混合模式**

**原因**:
1. ✅ 您是前端开发者，不熟悉产品/后端/数据库
2. ✅ Superpowers 显式调用更清晰（知道进入哪个阶段）
3. ✅ 其他 Skills 自动触发更自然（不用记命令）

### 具体建议

**显式调用** (这些需要记住):
- `/superpowers:brainstorm` - 新功能设计
- `/superpowers:write-plan` - 生成实施计划
- `/superpowers:execute-plan` - 执行计划

**自动触发** (只需自然说话):
- "继续工作" → project-session-management
- "项目进度" → product-manager
- "我想做 XX" → component-reuse-expert
- "做个组件" → frontend-expert
- "加个 API" → backend-expert

**完全自动** (无需任何操作):
- CLAUDE.md 读取
- Hooks 需求保护

---

## 🔧 如何确保自动触发生效？

### 1. 检查 Skills description 是否包含触发词

**查看当前 Skills**:
```bash
cat ~/.claude/skills/frontend-expert/SKILL.md
cat ~/.claude/skills/backend-expert/SKILL.md
cat ~/.claude/skills/product-manager/SKILL.md
```

**确保 description 包含**:
- 用户可能说的话："做个组件"、"加个 API"
- 功能关键词：组件、API、数据库、进度
- 触发场景：brainstorming、write-plan

### 2. 测试自动触发

```bash
# 测试 frontend-expert
说: "帮我做个按钮"
验证: AI 是否自动使用 TailwindCSS + Apple 风格

# 测试 component-reuse-expert
说: "我想做分享功能"
验证: AI 是否先检查已有组件

# 测试 project-session-management
说: "项目进度如何？"
验证: AI 是否读取 SESSION.md
```

### 3. 如果自动触发失败

**方案 A: 显式调用**
```
/skill component-reuse-expert 检查复用机会
```

**方案 B: 优化 description**
```yaml
# 在 SKILL.md 中增加更多触发词
description: "...触发：用户说'我想做'、'帮我做'、'开发'、'实现'..."
```

---

## 📋 快速参考卡片

### 我需要记住的命令

| 场景 | 命令 | 是否必须 |
|:---|:---|:---|
| **新功能设计** | `/superpowers:brainstorm` | ✅ 推荐显式 |
| **生成计划** | `/superpowers:write-plan` | ✅ 推荐显式 |
| **执行计划** | `/superpowers:execute-plan` | ✅ 推荐显式 |
| **继续工作** | "继续工作" | ❌ 自动触发 |
| **查询进度** | "项目进度" | ❌ 自动触发 |
| **做组件** | "做个 XX 组件" | ❌ 自动触发 |
| **加 API** | "加个 XX API" | ❌ 自动触发 |

### 完全不需要管的

- ✅ CLAUDE.md 读取
- ✅ Hooks 需求保护
- ✅ SESSION.md 更新
- ✅ 领域专家 Skills 触发（如果 description 好）

---

## 🎉 总结

**您的工作流程 90% 自动化**:

1. **完全自动** (60%): CLAUDE.md、Hooks、领域专家 Skills
2. **建议显式调用** (30%): Superpowers 3 个核心命令
3. **可选调用** (10%): 如果自动触发失败时的备用方案

**最简单的使用方式**:
```
# 新功能
→ "/superpowers:brainstorm" + 描述需求
→ 后续自动检查复用、生成计划

# 继续工作
→ "继续工作" 或 "项目进度"
→ 自动恢复上下文

# 日常开发
→ 自然描述需求
→ AI 自动选择合适的 Skills
```

**您只需要记住 3 个 Superpowers 命令，其他全自动！** 🚀

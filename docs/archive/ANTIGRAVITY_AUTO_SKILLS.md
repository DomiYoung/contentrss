# Antigravity 自动 Skills 调用规范

> **强制规则**：Antigravity 在每次会话开始时，必须根据用户请求自动匹配并加载相关 skills。

---

## 1. 核心原则

> 如果有 1% 的可能性某个 skill 适用，**必须**调用它。
> 这不是建议，这不是可选的。你不能以任何理由绕过这条规则。

---

## 2. Skills 触发器映射表

| 触发词/场景 | Skill | 路径 |
|:---|:---|:---|
| **复杂需求、多领域任务、全流程开发** | `workflow-orchestrator` | `~/.claude/skills/workflow-orchestrator/SKILL.md` |
| 分析行业新闻、极性判断、影响链 | `senior-analyst` | `~/.claude/skills/senior-analyst/SKILL.md` |
| **PRD、用户故事、产品路线图** | `product-manager` | `~/.claude/skills/product-manager/SKILL.md` |
| **数据库设计、SQL 优化、迁移** | `database-expert` | `~/.claude/skills/database-expert/SKILL.md` |
| **系统设计、技术选型、架构图** | `senior-architect` | `~/.claude/skills/senior-architect/SKILL.md` |
| **Flask API、蓝图、路由** | `flask-expert` | `~/.claude/skills/flask-expert/SKILL.md` |
| 前端组件、UI 设计、React | `frontend-expert` | `~/.claude/skills/frontend-expert/SKILL.md` |
| **视觉设计、美学、界面美化** | `frontend-design` | `~/.claude/skills/frontend-design/SKILL.md` |
| 手势交互、触觉反馈、iOS 设计 | `apple-ui-scientist` | `~/.claude/skills/apple-ui-scientist/SKILL.md` |
| 后端 API、数据库、可靠性 | `backend-expert` | `~/.claude/skills/backend-expert/SKILL.md` |
| 系统架构、SOLID 原则 | `architecture-review` | `~/.claude/skills/architecture-review/SKILL.md` |
| 动画、framer-motion | `framer-motion-expert` | `~/.claude/skills/framer-motion-expert/SKILL.md` |
| TypeScript 类型系统 | `typescript-expert` | `~/.claude/skills/typescript-expert/SKILL.md` |
| TailwindCSS 样式 | `tailwindcss-expert` | `~/.claude/skills/tailwindcss-expert/SKILL.md` |
| 测试、Playwright | `webapp-testing` | `~/.claude/skills/webapp-testing/SKILL.md` |
| 新功能需求、"我想做 XX" | `brainstorming` | 内置工作流 (见 BRAINSTORMING_WORKFLOW.md) |
| 多角色协作 | `superclaude-framework` | `~/.claude/skills/superclaude-framework/SKILL.md` |
| 规格驱动开发 | `spec-first-development` | `~/.claude/skills/spec-first-development/SKILL.md` |

---

## 3. 自动调用流程

```
用户发送请求
       ↓
┌─────────────────────────────────────────┐
│ 1. 扫描请求内容，匹配触发词              │
│ 2. 找到匹配的 skill(s)                  │
│ 3. 读取对应 SKILL.md                    │
│ 4. 按照 skill 指令执行                  │
└─────────────────────────────────────────┘
```

---

## 4. 禁止的心理合理化

| ❌ 错误想法 | ✅ 正确做法 |
|:---|:---|
| "这只是个简单问题" | 问题 = 任务，必须检查 skills |
| "我需要先了解上下文" | 先加载 skill，再了解上下文 |
| "这个 skill 太繁琐了" | 简单事会变复杂，必须使用 |
| "我记得这个 skill" | skill 会演化，必须读最新版 |
| "让我先快速做一件事" | 必须先检查 skills |

---

## 5. 优先级规则

当多个 skills 可能适用时：

1. **流程 skills 优先**（brainstorming, debugging）— 决定 HOW
2. **领域 skills 其次**（frontend-expert, backend-expert）— 指导 WHAT

---

## 6. 自进化

每次会话结束时，Antigravity 应检查：
- 是否有新的触发词需要添加？
- 是否有 skill 需要更新？
- 是否踩了坑需要记录？

更新此文档或对应的 SKILL.md。

---

## 进化日志

| 日期 | 更新内容 | 来源 |
|:---|:---|:---|
| 2025-12-27 | 初始版本 | 用户需求 |

# Agent 自进化 (Agent Evolution) 文档集

本目录包含 Agent 自进化系统的设计思想与实现方案。

## 📁 文档清单

| 文件 | 内容 |
|:---|:---|
| [GEMINI.md](./GEMINI.md) | Agent 行为宪法（核心理念、开发工作流、技能自进化规则） |
| [AGENT_EVOLUTION_DESIGN.md](./AGENT_EVOLUTION_DESIGN.md) | 自进化系统设计方案（理论基础、实现机制、首次实践记录） |

## 🔗 相关文件

- [specs/intelligence/skill_evolution.md](../specs/intelligence/skill_evolution.md) - 在 ContentRSS 中的具体落地规范
- `~/.claude/skills/` - Skills 技能库（在本地，非项目内）

## 💡 核心理念

> **"用 Agent 迭代 Skills"** = 让 AI 自己分析自己的表现，然后自动优化自己的"工作说明书"，从而在没有人工干预的情况下变得越来越专业。

## 📊 进化闭环

```
Agent 执行任务 → 发现更优实践/踩坑 → 更新 Skills/GEMINI.md
        ↑                                          ↓
        └───────── 下次任务自动应用新规则 ─────────┘
```

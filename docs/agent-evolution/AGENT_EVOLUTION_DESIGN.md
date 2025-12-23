# Agent 自进化系统设计方案

## 1. 核心理念

**"用 Agent 迭代 Skills"** = 让 AI 自己分析自己的表现，然后自动优化自己的"工作说明书"，从而在没有人工干预的情况下变得越来越专业。

## 2. 问题背景

传统 AI Agent 的能力提升路径：
- 等模型厂商发布新版本
- 手工编写更多 Prompt
- 依赖人类总结经验

**问题**：知识存在对话中，过期就丢失；每次会话从零开始。

## 3. 设计目标

建立一个**持续学习的闭环系统**：

```
Agent 执行任务 → 发现更优实践/踩坑 → 更新 Skills/GEMINI.md
        ↑                                          ↓
        └───────── 下次任务自动应用新规则 ─────────┘
```

## 4. 实现机制

### 4.1 行为规则 (写入 GEMINI.md)

```markdown
**技能自进化 (Skill Evolution)**

> **持续沉淀**：每次会话结束前，主动反思是否有值得沉淀的经验
> **优先内化**：如果某类错误反复出现，必须将修正逻辑写入 Skills
> **反思清单**：会话结束前自查——①踩坑？②更优实践？③用户纠正？
```

### 4.2 进化日志 (Evolution Log)

| 日期 | 更新内容 | 来源 | 影响范围 |
|:---|:---|:---|:---|
| 2025-12-24 | Playwright `:has()` 选择器用法 | 踩坑 | webapp-testing |
| 2025-12-24 | 背景色检测应查容器而非 body | 踩坑 | webapp-testing |

### 4.3 Skills 文件结构

```
~/.claude/skills/
├── webapp-testing/
│   └── SKILL.md  ← 包含"进化记录"章节
├── frontend-expert/
│   └── SKILL.md  ← 包含"进化记录"章节
└── ...
```

## 5. 触发场景

| 场景 | 应更新的内容 |
|:---|:---|
| 发现更好的组件写法 | → 更新 `frontend-expert` Skill |
| 测试时踩了 Playwright 坑 | → 更新 `webapp-testing` Skill |
| 发现 gemini.md 缺失的规则 | → 直接补充 `GEMINI.md` |
| 用户多次纠正输出格式 | → 更新 `chinese-output` Skill |

## 6. 理论基础

### 6.1 RLHF (Reinforcement Learning from Human Feedback)
用户的正向反馈（LGTM/纠正）等同于 RLHF 中的"人类标注"。

### 6.2 知识管理 SECI 模型
```
隐性知识（踩坑） → 显性化（写入Skills） → 组合化（整合体系） → 内化（自动应用）
```

## 7. 与 ContentRSS 的关联

在 ContentRSS V2 中，我们建立了类似的闭环：
- 用户的 Ask AI 追问 → 反馈信号
- 用户的 Note 笔记 → 显性知识
- Feed 的侧滑忽略 → 隐性反馈
- `SkillMetadata.refinement_score` → 量化进化程度

详见 [specs/intelligence/skill_evolution.md](../specs/intelligence/skill_evolution.md)

## 8. 首次实践记录

**2025-12-24 本次会话的进化成果**：

1. 在 `GEMINI.md` 中新增"技能自进化"规则
2. 在 `GEMINI.md` 中建立"进化日志"记录表
3. 在 `webapp-testing/SKILL.md` 中新增 Playwright 踩坑经验
4. 在 `frontend-expert/SKILL.md` 中新增组件可测试性规则

---

> 这是一个**元系统**——它定义了 Agent 如何定义自己。

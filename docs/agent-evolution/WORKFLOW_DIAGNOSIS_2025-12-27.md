# ContentRSS 工作流诊断报告

> **诊断日期**: 2025-12-27
> **诊断范围**: 全局配置 + 项目配置 + Skills 系统
> **诊断结论**: 多重工作流重叠，需要标准化

---

## 📊 当前工作流全景图

### 1. 已安装的系统/框架

**全局配置层 (~/.claude/)**:

```yaml
SuperClaude Framework:
  位置: ~/.claude/CLAUDE.md (及 COMMANDS.md, FLAGS.md 等)
  命令: /sc:analyze, /sc:implement, /sc:spawn 等 17 个命令
  定位: 重型工作流框架，多角色协作

Skills (35个):
  领域专家: senior-analyst, frontend-expert, backend-expert...
  流程工具: spec-first-development, superclaude-framework...
  文档工具: docx, pptx, pdf...
```

**项目配置层 (contentrss/)**:

```yaml
CLAUDE.md: 项目入口，触发器映射表
docs/workflows/:
  - BRAINSTORMING_WORKFLOW.md: 新功能流程
  - ANTIGRAVITY_AUTO_SKILLS.md: 1% 规则

新安装:
  ✅ Superpowers: 2025-12-27 安装
```

---

### 2. 功能重叠矩阵

| 功能 | SuperClaude | Spec-Kit | 自定义工作流 | Superpowers |
|:---|:---|:---|:---|:---|
| **Brainstorming** | /sc:design | - | BRAINSTORMING_WORKFLOW.md | /superpowers:brainstorm |
| **计划编写** | /sc:workflow | plan.md | - | /superpowers:write-plan |
| **任务执行** | /sc:implement, /sc:spawn | Phase execution | - | /superpowers:execute-plan |
| **代码审查** | - | - | - | /superpowers:code-review |
| **TDD** | /sc:test | - | - | TDD skill |
| **Git 操作** | /sc:git | - | - | git-worktrees |

---

### 3. 混乱根源分析

**问题 1 - 多重入口**:
```yaml
用户说 "我想做 XX" 时:
  - CLAUDE.md 说: 触发 brainstorming 工作流
  - SuperClaude 说: 可以用 /sc:design
  - Superpowers 说: 用 /superpowers:brainstorm

影响: Claude 不知道该用哪个，导致行为不一致
```

**问题 2 - 规则冲突**:
```yaml
Spec-Kit: "必须先有 specs/{feature_id}/spec.md"
Brainstorming: "必须输出到 docs/plans/YYYY-MM-DD-*.md"
两者都说是 "强制规则"

影响: 文档散落在两个位置，难以维护
```

**问题 3 - 引用未安装的工具**:
```yaml
BRAINSTORMING_WORKFLOW.md 第 81-89 行提到 Superpowers
但当时 Superpowers 并未安装

影响: 误导性文档，执行时报错
```

**问题 4 - 路径不统一**:
```yaml
GEMINI.md: "Flask + SQLAlchemy" (过时)
CLAUDE.md: "FastAPI + Python" (正确)
ANTIGRAVITY_AUTO_SKILLS.md: 引用 flask-expert (混淆)

影响: 技术栈信息不一致
```

---

## 🎯 决策方案：Option B - 标准化 Superpowers

### 核心策略

**让 Superpowers 接管开发流程，领域专家 Skills 作为补充**

### 保留内容

```yaml
Superpowers 7 阶段工作流:
  1. brainstorming - 设计细化
  2. using-git-worktrees - 工作空间隔离
  3. writing-plans - 任务拆解
  4. executing-plans - 批量执行
  5. test-driven-development - TDD 循环
  6. requesting-code-review - 代码审查
  7. finishing-a-development-branch - 完成验证

领域专家 Skills (作为补充):
  - senior-analyst (行业分析)
  - frontend-expert, react-expert, framer-motion-expert
  - backend-expert, database-expert
  - 其他 32 个专业 skills
```

### 删除/替换内容

```yaml
删除:
  - docs/workflows/BRAINSTORMING_WORKFLOW.md → 用 Superpowers brainstorming
  - docs/workflows/ANTIGRAVITY_AUTO_SKILLS.md → 规则集成到 CLAUDE.md
  - docs/plans/ 目录 → 统一到 specs/{feature_id}/

替换:
  - SuperClaude 重型命令 → 仅保留必要的 /sc:spawn (多代理并发)
  - 自定义 brainstorming → Superpowers brainstorming

保留但简化:
  - Spec-Kit → 继续使用 specs/{feature_id}/ 结构
```

---

## 📋 执行计划

### Phase 1: 统一规范文档位置

```bash
# 目标结构
specs/{feature_id}/
├── spec.md              # 功能需求 (Superpowers brainstorming 产出)
├── data-model.md        # 数据模型
├── contracts/api-spec.json  # OpenAPI 契约
└── plan.md              # 实施计划 (Superpowers write-plan 产出)

# 删除旧位置
rm -rf docs/plans/
```

### Phase 2: 精简 CLAUDE.md

**根据 claude-code-guide 审核建议**:
- Skills 的激活逻辑移到各 Skill 的 description 中
- CLAUDE.md 只保留项目概述、技术栈、常用命令
- 触发器映射表不应该在 CLAUDE.md 中

### Phase 3: 更新关键 Skills

为以下 Skills 增强 description，添加丰富触发词：
- senior-analyst
- frontend-expert
- backend-expert
- product-manager
- senior-architect
- database-expert

### Phase 4: 清理旧文件

归档/删除：
- docs/workflows/BRAINSTORMING_WORKFLOW.md
- docs/workflows/ANTIGRAVITY_AUTO_SKILLS.md
- docs/agent-evolution/GEMINI.md (过时信息)

---

## 🚀 新工作流

### 标准新功能开发流程

```mermaid
graph TD
    A[用户: 我想做 XX] --> B{Superpowers 自动检测}
    B --> C[/superpowers:brainstorm]
    C --> D[交互式设计细化]
    D --> E[输出到 specs/feature-id/spec.md]
    E --> F[/superpowers:write-plan]
    F --> G[创建 specs/feature-id/plan.md]
    G --> H[/superpowers:execute-plan]
    H --> I[分批执行 + TDD + 代码审查]
    I --> J[完成并合并]
```

### 领域专家 Skills 的定位

```yaml
调用时机:
  - Superpowers 执行过程中需要领域专业知识
  - 例如: brainstorming 阶段需要判断技术可行性 → 自动调用 senior-architect
  - 例如: 实施阶段需要分析行业新闻 → 自动调用 senior-analyst

不冲突:
  - Superpowers 管流程 (HOW)
  - Skills 管专业知识 (WHAT)
```

---

## 📊 claude-code-guide 审核要点

### 关键发现

1. **Skills 激活机制**:
   - Claude Code 通过 Skill description 的语义相似度自动激活
   - 无法通过 CLAUDE.md 中的"规则"强制调用
   - 正确做法: 在 Skill 的 description 中包含用户会说的触发词

2. **CLAUDE.md 的职责**:
   - 项目概述和技术栈
   - 代码规范和常用命令
   - 不应包含 Skills 触发逻辑

3. **编排矩阵的实现**:
   - 应该在 workflow-orchestrator Skill 内部实现
   - 不应该在 CLAUDE.md 中声明

4. **禁止的心理合理化**:
   - 对 AI 模型无实际约束效果
   - 应该用正向指令替代

---

## ✅ 验收标准

完成后应达到：

- [ ] 只有一个工作流入口：Superpowers
- [ ] 规范文档统一在 `specs/{feature_id}/`
- [ ] CLAUDE.md 精简到 <100 行
- [ ] 关键 Skills 的 description 包含丰富触发词
- [ ] 没有过时或矛盾的文档
- [ ] 技术栈信息一致（FastAPI + React 19）

---

## 📚 参考资源

- [Superpowers GitHub](https://github.com/obra/superpowers)
- [skill-creator 最佳实践](~/.claude/skills/skill-creator/SKILL.md)
- [claude-code-guide 审核报告](见本次会话)

---

## 进化日志

| 日期 | 更新内容 | 来源 |
|:---|:---|:---|
| 2025-12-27 | 初始诊断，决策 Option B | 工作流混乱分析 |
| 2025-12-27 | 安装 Superpowers，开始重构 | 用户决策 |

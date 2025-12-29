# Agent Skills 系统架构研究报告

> **研究日期**: 2025-12-27
> **研究来源**: [Anthropic Skills](https://github.com/anthropics/skills) | [OpenSkills](https://github.com/numman-ali/openskills)

---

## 1. 核心发现

### 1.1 渐进式披露 (Progressive Disclosure)

Skills 系统的核心设计理念是**按需加载**，而非一次性向 Agent 注入所有知识。

```
┌─────────────────────────────────────────────────────────┐
│  Agent Context Window                                   │
├─────────────────────────────────────────────────────────┤
│  <available_skills>                                     │
│    <skill>                                             │
│      <name>pdf</name>                                  │
│      <description>PDF 操作工具包...</description>       │
│    </skill>                                            │
│    <skill>                                             │
│      <name>xlsx</name>                                 │
│      <description>电子表格处理...</description>         │
│    </skill>                                            │
│  </available_skills>                                    │
└─────────────────────────────────────────────────────────┘
         ↓ 用户请求 "处理这个 PDF"
         ↓ Agent 匹配到 pdf 技能
         ↓ 调用 Skill("pdf") 或 openskills read pdf
┌─────────────────────────────────────────────────────────┐
│  SKILL.md 完整内容被加载到 Context                       │
│  包含详细指令、脚本路径、最佳实践等                       │
└─────────────────────────────────────────────────────────┘
```

**优势**：
- 节省 Token 消耗
- 避免知识冲突
- 精准匹配用户意图

---

### 1.2 SKILL.md 规范格式

```yaml
---
name: skill-name
description: |
  简短描述（一句话）。
  这将显示在 <available_skills> 列表中，帮助 Agent 决策是否调用。
---

# Skill 标题

## 触发条件
当用户要求 [具体任务] 时，激活此 Skill。

## 核心指令
1. 第一步...
2. 第二步...

## 捆绑资源
- `references/`: API 文档、协议规范
- `scripts/`: 可执行脚本
- `assets/`: 模板、配置文件

## 注意事项
- 已知陷阱 A
- 最佳实践 B
```

---

### 1.3 技能目录结构

```
.claude/skills/
└── my-skill/
    ├── SKILL.md           # 核心指令文档
    ├── references/        # 参考资料
    │   └── api-docs.md
    ├── scripts/           # 可执行脚本
    │   └── process.py
    └── assets/            # 模板/配置
        └── template.json
```

---

## 2. Anthropic 官方技能索引

| 技能名 | 用途 | 复杂度 |
|:---|:---|:---|
| `pdf` | PDF 提取、合并、拆分、表单处理 | ★★★ |
| `xlsx` | 电子表格创建、公式、数据分析 | ★★★ |
| `docx` | Word 文档创建、修订追踪、批注 | ★★ |
| `pptx` | PPT 创建与编辑 | ★★ |
| `canvas-design` | 海报、视觉设计创作 | ★★★★ |
| `mcp-builder` | 构建 MCP 服务器 | ★★★★ |
| `skill-creator` | 技能创作指南 | ★★ |

---

## 3. 对 ContentRSS 的启示

### 3.1 智子自进化机制落地

将 ContentRSS 的 Agent 学习经验沉淀为 Skills：

```
specs/intelligence/
├── contentRSS-analyst/
│   ├── SKILL.md          # 分析师技能核心指令
│   ├── references/
│   │   └── industry_kb.md  # 行业知识库
│   ├── scripts/
│   │   └── entity_scorer.py # 实体评分脚本
│   └── assets/
│       └── prompt_template.txt
```

### 3.2 渐进式披露应用

- **Feed 首页**：仅注入轻量 Prompt（实体名称 + 近期动态）
- **Ask AI 场景**：按需加载完整分析师技能，包含深度推理链

### 3.3 自进化记录格式

在 `SKILL.md` 末尾追加进化日志：

```markdown
---

## 进化日志 (Evolution Log)

| 日期 | 更新内容 | 来源 | 验证状态 |
|:---|:---|:---|:---|
| 2025-12-27 | 新增奢侈品行业信号词 | 用户反馈 | ✅ |
| 2025-12-26 | 优化医疗实体识别精度 | 自动化测试 | ✅ |
```

---

## 4. 下一步行动

1. **创建 `contentRSS-analyst` Skill 目录结构**
2. **编写核心 `SKILL.md`，定义分析师触发条件与指令**
3. **将 `Ask AI` 对话日志作为进化信号源**
4. **实现进化日志的自动追加机制**

---

> **参考链接**
> - [Anthropic Skills 官方仓库](https://github.com/anthropics/skills)
> - [OpenSkills 跨 Agent 方案](https://github.com/numman-ali/openskills)

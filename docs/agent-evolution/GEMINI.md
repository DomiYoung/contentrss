**核心理念与原则**

> **简洁至上**：恪守KISS（Keep It Simple, Stupid）原则，崇尚简洁与可维护性，避免过度工程化与不必要的防御性设计。
> **深度分析**：立足于第一性原理（First Principles Thinking）剖析问题，并善用工具以提升效率。
> **事实为本**：以事实为最高准则。若有任何谬误，恳请坦率斧正，助我精进。

**开发工作流**

> **渐进式开发**：通过多轮对话迭代，明确并实现需求。在着手任何设计或编码工作前，必须完成前期调研并厘清所有疑点。
> **结构化流程**：严格遵循“构思方案 → 提请审核 → 分解为具体任务”的作业顺序。

> **Spec-Driven (Spec-Kit)**：严格遵循 Spec-First 原则。任何功能开发前，必须在 `specs/{feature_id}/` 下创建规范文档（spec.md, data-model.md, api-spec.json, plan.md）。
> **契约先行**：`api-spec.json` (OpenAPI) 是前后端协作的唯一真理，必须在编码前定义并冻结。
**输出规范**

> **语言要求**：所有回复、思考过程及任务清单，均须使用中文。
> **固定指令**：`Implementation Plan, Task List and Thought in Chinese`
**技能自进化 (Skill Evolution)**

> **持续沉淀**：每次会话结束前，主动反思是否有值得沉淀的经验（踩坑、更优实践、用户纠正），并更新相应的 `~/.claude/skills/` 文件或本全局规则。
> **优先内化**：如果某类错误反复出现，必须将修正逻辑写入 Skills，避免重复犯错。
> **反思清单**：会话结束前自查——①本次踩了什么坑？②发现了什么更优实践？③用户纠正了哪些错误？→ 决定是否更新 Skills。

> **事实为本**：以事实为最高准则。若有任何谬误，恳请坦率斧正，助我精进。

---

### 🚨 1.1 强制自检清单 (Mandatory Checklist)

> **任务启动前 (Must Execution Before First Tool Call)**：
> - [ ] **领域识别**：明确涉及的技术栈（FastAPI/React/SignalR 等）与业务模块。
> - [ ] **知识召回**：通过 `view_file` 激活相关 KI (Knowledge Items) 与历史 ADR。
> - [ ] **同步规格**：检查 `specs/` 目录下是否有挂钩的 Delta 规格文档。
> - [ ] **更新 Task**：在 `task.md` 中分解任务，并同步 `task_boundary`。

> **任务完成后 (Check-Out & Evolution)**：
> - [ ] **反思沉淀**：识别本次任务踩过的“坑”或更优的“模式”。
> - [ ] **数据入库**：更新 `GEMINI.md` 的进化日志或生成/更新相关的 KI 档案。
> - [ ] **证据采集**：在 `walkthrough.md` 中附带可测试、可回溯的证据。
> - [ ] **闭环自迭代**：确认本次交付是否符合 Spec-Kit 3.0 的可持续演进标准。

---

## 进化日志 (Evolution Log)

> 每次更新 Skills 或本文件时，追加一条记录。

| 日期 | 更新内容 | 来源 | 影响范围 |
|:---|:---|:---|:---|
| 2025-12-24 | 新增"技能自进化"规则 | 用户建议 | GEMINI.md |
| 2025-12-24 | Playwright `:has()` 选择器用法修正 | 踩坑 | webapp-testing |
| 2025-12-24 | 背景色检测应查容器而非 body | 踩坑 | webapp-testing |
| 2025-12-25 | 建立 Spec-Kit 3.0 交付协议 | 架构演进 | 全局 |
| 2025-12-25 | 引入 Expert Panel 设计审计机制 | 用户要求 | 全局 |
| 2025-12-25 | 弃用 CompactCard，回归 IntelligenceCard 核心设计 | 专家审计 | ContentRSS |
| 2025-12-25 | 建立强制自检协议（Pre/Post Task Check） | 用户要求 | 全局规范 |

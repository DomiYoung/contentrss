# ContentRSS 项目 Skills

> 此文件包含项目专用 skills + 引用全局 skills。
> 项目级 skills 提供本项目特定的上下文知识。

<skills_system priority="1">

## Available Skills

<!-- SKILLS_TABLE_START -->
<usage>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively. Skills provide specialized capabilities and domain knowledge.

**1% 原则**：如果有 1% 的可能性某个 skill 适用，必须调用它。

Usage notes:
- Only use skills listed in <available_skills> below
- Do not invoke a skill that is already loaded in your context
- Each skill invocation is stateless
- 项目级 skills (location=project) 优先于全局同名 skills
</usage>

<!-- ==================== 项目专用 Skills ==================== -->

<project_skills>

<!-- Flask 项目专用专家 (覆盖全局 flask-expert) -->
<skill>
<name>flask-expert</name>
<description>"Flask Web 框架专家 (ContentRSS 项目专用)。本项目后端使用 Flask + Python。当用户需要：(1) 设计/修改 API 接口 (2) 处理请求/响应 (3) 配置 CORS/中间件 (4) 数据库操作 (5) 错误处理时触发。"</description>
<trigger>Flask、API、接口、路由、请求、响应、后端、Python</trigger>
<location>project</location>
<knowledge-base>
## Flask 项目知识库 (ContentRSS 专用)

### 1. 项目后端架构

```
backend/
├── main.py              # 主应用（所有路由定义）
├── utils/
│   └── response.py      # 统一响应格式 success()/error()
├── requirements.txt     # Python 依赖
└── data/
    └── contentrss.db    # SQLite 数据库（开发环境）
```

### 2. 统一响应格式 (backend-expert 规范)

```python
from utils.response import success, error

# 成功响应
return success(
    data={"key": "value"},          # 业务数据
    meta={"count": 10}              # 元数据（分页等）
)

# 错误响应
return error(
    code="INVALID_PARAM",           # 错误码
    message="参数错误",              # 错误信息
    status_code=400                 # HTTP 状态码
)
```

**响应结构**:
```json
{
    "success": true,
    "data": {...},
    "meta": {"count": 10, "timestamp": "..."},
    "request_id": "uuid"
}
```

### 3. 本项目现有 API

| 端点 | 方法 | 说明 | 参数 |
|------|------|------|------|
| `/api/raw-data` | GET | 获取原始公众号数据 | category, date(可选) |
| `/api/intelligence` | GET | 获取 AI 分析后的情报卡片 | limit, skip_ai, category |
| `/api/feed` | GET | 兼容旧前端的 Feed 接口 | limit, category |
| `/api/article/<id>` | GET | 获取文章详情 | - |
| `/api/sync-status` | GET | 获取数据同步状态 | - |

### 4. 数据库连接模式

```python
def get_db():
    """获取数据库连接"""
    db_url = os.getenv('DATABASE_URL')
    if db_url and db_url.startswith('postgres'):
        import psycopg2
        return psycopg2.connect(db_url)  # PostgreSQL 生产环境
    else:
        return sqlite3.connect('data/contentrss.db')  # SQLite 开发

def get_placeholder():
    """SQLite 用 ?，PostgreSQL 用 %s"""
    return '%s' if is_postgres() else '?'
```

### 5. 开发命令

```bash
cd backend && python main.py          # 启动后端
cd backend && pip install -r requirements.txt  # 安装依赖
```
</knowledge-base>
</skill>

<!-- 前后端响应检查专家 (新增) -->
<skill>
<name>api-contract-validator</name>
<description>"API 契约验证专家。当用户需要：(1) 检查前后端响应结构是否匹配 (2) 验证字段名/类型一致性 (3) 排查 undefined/null 问题 (4) 调试数据解析错误时触发。确保前后端数据流畅通。"</description>
<trigger>响应、契约、验证、字段、undefined、解析错误、前后端不匹配</trigger>
<location>project</location>
<knowledge-base>
## API 契约验证知识库

### 1. 常见问题模式

| 症状 | 可能原因 | 排查方法 |
|------|---------|---------|
| 前端显示 "Untitled" | 字段名不匹配 | 对比后端响应 vs 前端解析代码 |
| 数据显示 undefined | 嵌套字段未解析 | 检查是否需要 JSON.parse() |
| 列表为空 | 响应结构变化 | 检查 data.items vs data.cards 等 |
| 类型错误 | 后端返回字符串，前端期望对象 | 检查是否需要类型转换 |

### 2. 本项目数据结构对照

**后端 /api/raw-data 响应**:
```json
{
    "success": true,
    "data": {
        "category": "ai",
        "label": "AI",
        "items": [
            {
                "record_id": "recXXX",
                "ingested_at": "2025-12-27T08:39:59",
                "fields": {
                    "文章信息": "{\"摘要\":\"...\",\"文章标题\":\"...\"}", // ⚠️ JSON 字符串!
                    "文章标题-moss用": "直接可用的标题"
                }
            }
        ],
        "date_filter": null
    },
    "meta": {"count": 40}
}
```

**前端期望字段**:
```typescript
interface ArticleItem {
    id: string;           // ← record_id
    title: string;        // ← fields["文章标题-moss用"] 或解析 fields["文章信息"].文章标题
    description: string;  // ← 需解析 fields["文章信息"].摘要
    category: string;
    imageUrl: string;
    date: string;
}
```

### 3. 验证检查清单

**后端检查**:
- [ ] 响应是否使用 `success(data=..., meta=...)` 格式
- [ ] 字段名是否与文档/契约一致
- [ ] 日期格式是否为 ISO 8601
- [ ] 嵌套 JSON 是否正确序列化

**前端检查**:
- [ ] 访问路径是否正确 (`json.data?.items` vs `json.items`)
- [ ] 嵌套 JSON 字符串是否调用 `JSON.parse()`
- [ ] 是否处理了 null/undefined 情况
- [ ] TypeScript 类型是否与实际数据匹配

### 4. 调试技巧

```typescript
// 前端：打印实际响应结构
const response = await fetch(url);
const json = await response.json();
console.log('Response structure:', JSON.stringify(json, null, 2));
console.log('First item fields:', json.data?.items?.[0]?.fields);
```

```python
# 后端：打印返回数据
import json
print(json.dumps(data, ensure_ascii=False, indent=2))
```

### 5. 快速修复模板

**前端解析嵌套 JSON**:
```typescript
function parseArticle(item: Record<string, unknown>) {
    const fields = item.fields as Record<string, unknown> || {};
    let title = fields["文章标题-moss用"] as string;

    // 解析嵌套 JSON
    const infoStr = fields["文章信息"] as string;
    if (infoStr && typeof infoStr === 'string') {
        try {
            const info = JSON.parse(infoStr);
            title = title || info.文章标题;
        } catch (e) {
            console.warn("JSON parse failed:", e);
        }
    }
    return { title: title || "Untitled", ... };
}
```
</knowledge-base>
</skill>

<!-- 数据解析专家 -->
<skill>
<name>data-parser-expert</name>
<description>"数据解析专家。处理本项目中的嵌套 JSON 解析、字段映射、数据转换。当用户需要：(1) 解析 `文章信息` JSON 字符串 (2) 处理飞书多维表格数据 (3) 数据格式转换时触发。"</description>
<trigger>JSON、解析、字段、数据转换、文章信息、飞书</trigger>
<location>project</location>
<knowledge-base>
## 数据解析知识库

### 1. 飞书多维表格数据结构

```json
{
    "record_id": "recXXX",
    "ingested_at": "2025-12-27T08:39:59.178586",
    "fields": {
        "文章信息": "{\"摘要\":\"...\",\"作者名称\":\"...\",\"文章标题\":\"...\",\"文章URL\":\"...\"}",
        "文章标题-moss用": "直接可用的标题",
        "raw_url": "https://..."
    }
}
```

**⚠️ 关键点**：`文章信息` 是一个 **JSON 字符串**，需要二次解析！

### 2. 字段映射表

| 原始字段 | 解析后字段 | 来源 |
|---------|-----------|------|
| `文章标题-moss用` | title | 直接使用 |
| `文章信息.文章标题` | title (备选) | JSON 解析 |
| `文章信息.摘要` | description | JSON 解析 |
| `文章信息.作者名称` | author | JSON 解析 |
| `文章信息.文章URL` | url | JSON 解析 |
| `raw_url` | url (备选) | 直接使用 |
| `record_id` | id | 直接使用 |
| `ingested_at` | date | 直接使用 |

### 3. 前端解析示例

```typescript
interface ParsedArticleInfo {
    摘要: string;
    作者名称: string;
    文章标题: string;
    文章URL: string;
}

function parseArticleItem(item: Record<string, unknown>): ArticleItem {
    const fields = item.fields as Record<string, unknown> || {};

    // 方式 1: 使用直接字段
    let title = fields["文章标题-moss用"] as string;
    let description = "";

    // 方式 2: 解析嵌套 JSON
    const articleInfoStr = fields["文章信息"] as string;
    if (articleInfoStr && typeof articleInfoStr === 'string') {
        try {
            const info: ParsedArticleInfo = JSON.parse(articleInfoStr);
            title = title || info.文章标题;
            description = info.摘要;
        } catch (e) {
            console.warn("解析文章信息失败:", e);
        }
    }

    return {
        id: item.record_id as string,
        title: title || "Untitled",
        description: description || "No description",
    };
}
```
</knowledge-base>
</skill>

<!-- 数据库专家 (项目特定增强) -->
<skill>
<name>contentrss-database-expert</name>
<description>"ContentRSS 数据库专家。本项目使用 SQLite (开发) / PostgreSQL (生产)。当用户需要：(1) 设计表结构 (2) 编写 SQL 查询 (3) 优化查询性能 (4) 处理跨数据库兼容时触发。"</description>
<trigger>数据库、SQL、表、索引、查询、SQLite、PostgreSQL</trigger>
<location>project</location>
<knowledge-base>
## ContentRSS 数据库知识库

### 1. 现有表结构

```sql
CREATE TABLE IF NOT EXISTS raw_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id TEXT UNIQUE,           -- 飞书记录 ID
    category TEXT NOT NULL,          -- 分类 key
    fields TEXT,                     -- JSON 字段数据
    ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_raw_articles_category ON raw_articles(category);
CREATE INDEX IF NOT EXISTS idx_raw_articles_ingested ON raw_articles(ingested_at);
```

### 2. 跨数据库兼容

```python
def get_placeholder():
    """SQLite 用 ?，PostgreSQL 用 %s"""
    return '%s' if is_postgres() else '?'

# 使用示例
ph = get_placeholder()
sql = f"SELECT * FROM raw_articles WHERE category = {ph}"
cursor.execute(sql, (category,))
```

### 3. 常用查询

```sql
-- 按日期筛选
SELECT * FROM raw_articles
WHERE category = ?
  AND DATE(ingested_at) = ?
ORDER BY ingested_at DESC;

-- 获取每个分类最新同步时间
SELECT category, MAX(ingested_at) as last_sync
FROM raw_articles
GROUP BY category;
```
</knowledge-base>
</skill>

</project_skills>

<!-- ==================== 全局 Skills (引用) ==================== -->

<available_skills>

<skill>
<name>algorithmic-art</name>
<description>Creating algorithmic art using p5.js with seeded randomness and interactive parameter exploration. Use this when users request creating art using code, generative art, algorithmic art, flow fields, or particle systems. Create original algorithmic art rather than copying existing artists' work to avoid copyright violations.</description>
<location>global</location>
</skill>

<skill>
<name>apple-ui-scientist</name>
<description>"Apple UI 科学家。当用户需要：(1) 设计 iOS/H5 手势交互 (2) 添加触觉反馈 Haptic (3) 实现弹簧动画 (4) 应用 HIG 设计规范 (5) 创建毛玻璃/暗色模式效果时触发。用于打造极致的移动端用户体验。"</description>
<location>global</location>
</skill>

<skill>
<name>architecture-review</name>
<description>"系统架构审查 - SOLID 原则与长期可维护性"</description>
<location>global</location>
</skill>

<skill>
<name>backend-expert</name>
<description>"后端专家 - 可靠性优先、API 设计、数据完整性"</description>
<location>global</location>
</skill>

<skill>
<name>brand-guidelines</name>
<description>Applies Anthropic's official brand colors and typography to any sort of artifact that may benefit from having Anthropic's look-and-feel. Use it when brand colors or style guidelines, visual formatting, or company design standards apply.</description>
<location>global</location>
</skill>

<skill>
<name>canvas-design</name>
<description>Create beautiful visual art in .png and .pdf documents using design philosophy. You should use this skill when the user asks to create a poster, piece of art, design, or other static piece. Create original visual designs, never copying existing artists' work to avoid copyright violations.</description>
<location>global</location>
</skill>

<skill>
<name>chinese-output</name>
<description>"中文输出规范 - 确保所有输出使用中文"</description>
<location>global</location>
</skill>

<skill>
<name>code-quality-gates</name>
<description>"代码质量门禁 - 确保代码变更符合质量标准"</description>
<location>global</location>
</skill>

<skill>
<name>database-expert</name>
<description>"数据库专家。当用户需要：(1) 设计数据库 Schema (2) 优化 SQL 查询性能 (3) 规划数据迁移策略 (4) 设计索引策略 (5) 处理事务和并发 (6) 规范化与反规范化决策时触发。确保数据完整性、查询性能和可扩展性。"</description>
<location>global</location>
</skill>

<skill>
<name>doc-coauthoring</name>
<description>Guide users through a structured workflow for co-authoring documentation. Use when user wants to write documentation, proposals, technical specs, decision docs, or similar structured content. This workflow helps users efficiently transfer context, refine content through iteration, and verify the doc works for readers. Trigger when user mentions writing docs, creating proposals, drafting specs, or similar documentation tasks.</description>
<location>global</location>
</skill>

<skill>
<name>docx</name>
<description>"Comprehensive document creation, editing, and analysis with support for tracked changes, comments, formatting preservation, and text extraction. When Claude needs to work with professional documents (.docx files) for: (1) Creating new documents, (2) Modifying or editing content, (3) Working with tracked changes, (4) Adding comments, or any other document tasks"</description>
<location>global</location>
</skill>

<skill>
<name>flask-expert</name>
<description>"Flask 框架专家。当用户需要：(1) 构建 Flask API (2) 配置蓝图和路由 (3) 处理请求和响应 (4) 集成数据库 ORM (5) 部署 Flask 应用时触发。确保 API 设计符合 RESTful 规范。"</description>
<location>global</location>
</skill>

<skill>
<name>framer-motion-expert</name>
<description>"Framer Motion 专家。当用户需要：(1) 实现 React 动画 (2) 添加手势交互 drag/tap (3) 使用 Variants 编排 (4) 创建页面过渡 (5) 实现布局动画时触发。"</description>
<location>global</location>
</skill>

<skill>
<name>frontend-design</name>
<description>Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.</description>
<location>global</location>
</skill>

<skill>
<name>frontend-expert</name>
<description>"前端专家 - UX 优先、无障碍、性能导向"</description>
<location>global</location>
</skill>

<skill>
<name>internal-comms</name>
<description>A set of resources to help me write all kinds of internal communications, using the formats that my company likes to use. Claude should use this skill whenever asked to write some sort of internal communications (status reports, leadership updates, 3P updates, company newsletters, FAQs, incident reports, project updates, etc.).</description>
<location>global</location>
</skill>

<skill>
<name>lark-expert</name>
<description>"飞书/Lark 专家。当用户需要：(1) 开发飞书机器人 (2) 发送消息卡片 Interactive (3) 操作多维表格 Bitable (4) 创建审批流 (5) 订阅 Webhook 事件时触发。"</description>
<location>global</location>
</skill>

<skill>
<name>mcp-builder</name>
<description>Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Use when building MCP servers to integrate external APIs or services, whether in Python (FastMCP) or Node/TypeScript (MCP SDK).</description>
<location>global</location>
</skill>

<skill>
<name>pdf</name>
<description>Comprehensive PDF manipulation toolkit for extracting text and tables, creating new PDFs, merging/splitting documents, and handling forms. When Claude needs to fill in a PDF form or programmatically process, generate, or analyze PDF documents at scale.</description>
<location>global</location>
</skill>

<skill>
<name>pptx</name>
<description>"Presentation creation, editing, and analysis. When Claude needs to work with presentations (.pptx files) for: (1) Creating new presentations, (2) Modifying or editing content, (3) Working with layouts, (4) Adding comments or speaker notes, or any other presentation tasks"</description>
<location>global</location>
</skill>

<skill>
<name>product-manager</name>
<description>"产品经理专家。当用户需要：(1) 撰写 PRD 产品需求文档 (2) 定义用户故事和验收标准 (3) 规划产品路线图 (4) 分析竞品和市场 (5) 优先级排序和范围界定时触发。确保需求清晰、可执行、可验证。"</description>
<location>global</location>
</skill>

<skill>
<name>react-expert</name>
<description>"现代 React 开发专家。当用户需要：(1) 构建 React 组件 (2) 管理状态 useState/useReducer/Context/Zustand (3) 优化性能 memo/useMemo/useCallback (4) 使用 Hooks 模式 (5) 集成 TanStack Query/React Hook Form 时触发。"</description>
<location>global</location>
</skill>

<skill>
<name>senior-analyst</name>
<description>"高级行业分析师。当用户需要：(1) 分析行业情报/新闻 (2) 提取核心事实 (3) 判断极性 Bullish/Bearish (4) 推演影响链 (5) 生成情报卡片内容时触发。用于 contentrss 项目的 Intelligence Card 数据生成。"</description>
<location>global</location>
</skill>

<skill>
<name>senior-architect</name>
<description>"高级系统架构师。当用户需要：(1) 系统整体设计 (2) 技术选型决策 (3) 模块边界划分 (4) 架构文档编写 (5) 架构评审 (6) 性能与可扩展性规划时触发。确保系统可维护、可扩展、可演进。"</description>
<location>global</location>
</skill>

<skill>
<name>skill-creator</name>
<description>Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.</description>
<location>global</location>
</skill>

<skill>
<name>slack-gif-creator</name>
<description>Knowledge and utilities for creating animated GIFs optimized for Slack. Provides constraints, validation tools, and animation concepts. Use when users request animated GIFs for Slack like "make me a GIF of X doing Y for Slack."</description>
<location>global</location>
</skill>

<skill>
<name>spec-first-development</name>
<description>"Spec-First (Spec-Kit) 开发方法论 - 规范驱动的开发流程，确保所有功能有完整规范后再编码"</description>
<location>global</location>
</skill>

<skill>
<name>superclaude-framework</name>
<description>"SuperClaude Agent Framework。当用户需要：(1) 多角色协作开发 (2) 结构化工作流 (3) 质量门禁检查 (4) 系统化代码变更时触发。提供 11 个专业角色和规范化的开发流程。"</description>
<location>global</location>
</skill>

<skill>
<name>tailwindcss-expert</name>
<description>"TailwindCSS 专家。当用户需要：(1) 配置设计系统 (2) 实现响应式布局 (3) 创建暗色模式 (4) 使用动画/过渡 (5) 抽象组件样式时触发。"</description>
<location>global</location>
</skill>

<skill>
<name>theme-factory</name>
<description>Toolkit for styling artifacts with a theme. These artifacts can be slides, docs, reportings, HTML landing pages, etc. There are 10 pre-set themes with colors/fonts that you can apply to any artifact that has been creating, or can generate a new theme on-the-fly.</description>
<location>global</location>
</skill>

<skill>
<name>typescript-expert</name>
<description>"TypeScript 专家。当用户需要：(1) 设计类型系统 (2) 使用泛型/工具类型 (3) 类型收窄/类型守卫 (4) 配置 strict 模式 (5) 解决类型错误时触发。"</description>
<location>global</location>
</skill>

<skill>
<name>web-artifacts-builder</name>
<description>Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or shadcn/ui components - not for simple single-file HTML/JSX artifacts.</description>
<location>global</location>
</skill>

<skill>
<name>webapp-testing</name>
<description>Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs.</description>
<location>global</location>
</skill>

<skill>
<name>workflow-orchestrator</name>
<description>"工作流编排专家。当用户提出复杂需求时自动激活：(1) 分析需求，决定调用哪些 skills (2) 编排 skills 调用顺序 (3) 验证每个 skill 输出结果 (4) 确保端到端交付质量。作为 skills 系统的元协调器。"</description>
<location>global</location>
</skill>

<skill>
<name>xlsx</name>
<description>"Comprehensive spreadsheet creation, editing, and analysis with support for formulas, formatting, data analysis, and visualization. When Claude needs to work with spreadsheets (.xlsx, .xlsm, .csv, .tsv, etc) for: (1) Creating new spreadsheets with formulas and formatting, (2) Reading or analyzing data, (3) Modify existing spreadsheets while preserving formulas, (4) Data analysis and visualization in spreadsheets, or (5) Recalculating formulas"</description>
<location>global</location>
</skill>

</available_skills>
<!-- SKILLS_TABLE_END -->

</skills_system>

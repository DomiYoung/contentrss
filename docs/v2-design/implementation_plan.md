# V2 系统自动化测试规范与执行计划 (Test Spec)

## 1. 测试目标 (Test Objectives)
验证 ContentRSS V2 的视觉重构与关键交互逻辑是否符合预期，特别是新上线的 "Ask AI" 和 "Note" 功能。

## 2. 环境准备 (Environment Setup)
- **后端服务**：FastAPI (Port 8000)
- **前端服务**：Vite (Port 5173)
- **测试框架**：Playwright Python (Headless)
- **管理工具**：`scripts/with_server.py` (用于生命周期管理)

## 3. 测试用例定义 (Test Cases)

### TC-001: 基础 UI 校验 (UI Consistency)
- **步骤**：打开首页，检查背景色是否为 `#FAF9F6`（Paper Cream）。
- **预期**：符合 V2 视觉标准。

### TC-002: 侧滑忽略交互 (Swipe to Ignore)
- **步骤**：在 Intelligence Card 上模拟向左滑动。
- **预期**：卡片从 DOM 中移除。

### TC-003: 实体雷达订阅联动 (Radar Linkage)
- **步骤**：在 Radar 页切换一个实体的订阅状态，回到 Feed 页观察过滤效果。
- **预期**：后端 `get_feed` 过滤逻辑正确应用。

### TC-004: 详情页交互 - NotePad (Local Persistence)
- **步骤**：进入详情页 -> 点击 Note -> 输入文字 -> 保存 -> 刷新 -> 再次打开 Note。
- **预期**：文字持久化在 `localStorage` 中。

### TC-005: 详情页交互 - Ask AI (Agent Response)
- **步骤**：进入详情页 -> 点击 Ask AI -> 发送问题 -> 等待模拟回复。
- **预期**：消息列表中出现 AI 的回复。

## 4. 执行脚本规划
我们将编写一个名为 `v2_regression_test.py` 的脚本，通过 Playwright 自动化执行上述用例。

## 5. 验证标准 (Success Criteria)
- 所有测试用例状态为 PASS。
- 截图记录关键交互状态。

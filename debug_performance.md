# ContentRSS 性能诊断数据收集

## 📊 收集时间
2025-12-29

---

## 1️⃣ 浏览器网络耗时分析

**操作步骤**:
1. 打开前端页面
2. 按 `F12` 打开开发者工具
3. 切换到 `Network` 标签
4. 勾选 `Preserve log`
5. 刷新页面，触发慢接口
6. 找到耗时20秒的请求，右键 → `Copy` → `Copy as cURL`

**请粘贴以下信息**:

### 慢接口URL
```
[请填写，例如: http://localhost:5000/api/feeds]
```

### Network Timing (请截图或记录)
```
Timing 标签页显示的各阶段耗时：
- Queueing: ___ms
- Stalled: ___ms
- DNS Lookup: ___ms
- Initial Connection: ___ms
- SSL: ___ms
- Request sent: ___ms
- Waiting (TTFB): ___ms    ← 这个最关键！
- Content Download: ___ms
```

### Response Headers
```
[请粘贴 Response Headers]
```

---

## 2️⃣ 后端日志检查

**操作步骤**:
```bash
# 如果后端在本地运行
cd /Users/jinjia/Desktop/2508code/contentrss/backend
tail -f logs/app.log  # 或查看终端输出

# 如果在Railway，查看部署日志
```

**请粘贴**:
```
[后端处理该请求的日志]
例如：
[2025-12-29 10:30:15] INFO: GET /api/feeds - Start
[2025-12-29 10:30:35] INFO: GET /api/feeds - End (20.5s)
```

---

## 3️⃣ 数据库慢查询检查

**操作步骤**:
```bash
# 连接到Railway数据库
psql $DATABASE_URL

# 执行慢查询检测
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

# 如果没有pg_stat_statements，手动测试：
EXPLAIN ANALYZE SELECT * FROM feeds LIMIT 100;
```

**请粘贴结果**:
```sql
[慢查询SQL和执行时间]
```

---

## 4️⃣ Railway冷启动检查

**问题**:
- Railway免费版会在15分钟无请求后休眠
- 唤醒需要15-30秒

**测试方法**:
1. 等待15分钟不访问后端
2. 第一次请求记录耗时: ___秒
3. 立即第二次请求记录耗时: ___秒

**如果第一次20秒，第二次<1秒 → 就是冷启动问题**

---

## 5️⃣ 当前部署架构

**请确认**:
```yaml
前端部署位置:
  - [ ] 本地 localhost:5173
  - [ ] Vercel/其他云服务

后端部署位置:
  - [ ] 本地 localhost:5000
  - [ ] Railway (哪个地区? 美国/欧洲/亚洲)

数据库位置:
  - [ ] Railway PostgreSQL
  - [ ] 本地SQLite
  - [ ] 其他

网络路径:
  前端 → 后端 → 数据库
  [请填写实际IP/域名]
```

---

## 📋 初步判断矩阵

| Waiting (TTFB) | 可能原因 | 下一步 |
|:---|:---|:---|
| > 15秒 | Railway冷启动/数据库慢查询 | 检查Railway日志 + SQL优化 |
| 5-15秒 | 跨云网络延迟 | 检查部署地域 |
| < 5秒 | 前端处理/渲染慢 | 检查React组件性能 |

**Waiting (TTFB)** = Time To First Byte，是最关键的指标！
- 如果 TTFB > 15秒 → 问题在后端/数据库
- 如果 TTFB < 1秒，但总耗时20秒 → 问题在前端渲染

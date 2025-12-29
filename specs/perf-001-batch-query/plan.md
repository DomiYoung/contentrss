# 📋 实施计划 - API批量查询性能优化

> **功能ID**: perf-001-batch-query
> **基于**: spec.md + 架构师审核建议
> **预计工作量**: 45分钟
> **风险等级**: 低

---

## 🎯 实施目标

将 `/api/feed` 和 `/api/intelligence` 接口延迟从60秒降低到15-20秒，通过消除N+1查询问题。

---

## 📦 可复用组件清单

**检查结果**: 无需复用现有组件

| 类别 | 检查结果 | 说明 |
|:---|:---|:---|
| **后端函数** | ❌ 不复用 | 需新增批量查询函数 |
| **数据库函数** | ✅ 复用 | 复用 `db_conn()`, `get_placeholder()` |
| **工具函数** | ✅ 复用 | 复用 `json.loads()` 解析逻辑 |

**新增组件**:
1. `_parse_analysis_row()` - 通用数据解析函数
2. `get_cached_analysis_batch()` - 批量查询函数

---

## 🗂️ 文件修改清单

| 文件 | 修改类型 | 说明 |
|:---|:---|:---|
| `backend/main.py` | 修改 | 新增2个函数，修改1个函数 |

---

## 📐 实施步骤

### 步骤1: 提取公共解析逻辑 (10分钟)

**位置**: `backend/main.py` 第370行附近（`get_cached_analysis` 函数之前）

**新增函数**:
```python
def _parse_analysis_row(row) -> Optional[Dict[str, Any]]:
    """
    解析数据库查询结果行为分析数据字典

    Args:
        row: 数据库查询结果行（支持dict或tuple格式）

    Returns:
        解析后的分析数据，如果无有效数据则返回None
        格式: {
            'polarity': str,
            'impacts': List[Dict],
            'opinion': str,
            'tags': List[str]
        }
    """
    # 兼容dict和tuple两种row格式
    if isinstance(row, dict):
        polarity = row.get("ai_polarity")
        impacts_str = row.get("ai_impacts")
        opinion = row.get("ai_opinion", "")
        tags_str = row.get("ai_tags")
    else:
        polarity = row[0] if len(row) > 0 else None
        impacts_str = row[1] if len(row) > 1 else None
        opinion = (row[2] if len(row) > 2 else "") or ""
        tags_str = row[3] if len(row) > 3 else None

    # 验证有效性
    if not polarity:
        return None

    # 解析JSON字段
    try:
        return {
            "polarity": polarity,
            "impacts": json.loads(impacts_str) if impacts_str else [],
            "opinion": opinion,
            "tags": json.loads(tags_str) if tags_str else []
        }
    except json.JSONDecodeError as e:
        print(f"⚠️ JSON解析失败: {e}")
        return None
```

**验收**:
- [ ] 函数能处理dict格式row
- [ ] 函数能处理tuple格式row
- [ ] polarity为空时返回None
- [ ] JSON解析异常时返回None

---

### 步骤2: 重构现有函数使用公共逻辑 (5分钟)

**修改**: `get_cached_analysis` 函数（371-409行）

**当前代码**:
```python
def get_cached_analysis(source_url: str) -> Optional[Dict[str, Any]]:
    """获取缓存的 AI 分析结果"""
    if not source_url:
        return None

    try:
        ph = get_placeholder()
        with db_conn() as conn:
            cur = conn.cursor()
            cur.execute(f"""
                SELECT ai_polarity, ai_impacts, ai_opinion, ai_tags, ai_analyzed_at
                FROM raw_articles
                WHERE source_url = {ph} AND ai_analyzed_at IS NOT NULL
            """, (source_url,))
            row = cur.fetchone()

            if row:
                # ... 20行解析逻辑 ...
                return {...}
    except Exception as e:
        print(f"⚠️ 读取 AI 缓存失败: {e}")

    return None
```

**重构后**:
```python
def get_cached_analysis(source_url: str) -> Optional[Dict[str, Any]]:
    """获取缓存的 AI 分析结果"""
    if not source_url:
        return None

    try:
        ph = get_placeholder()
        with db_conn() as conn:
            cur = conn.cursor()
            cur.execute(f"""
                SELECT ai_polarity, ai_impacts, ai_opinion, ai_tags
                FROM raw_articles
                WHERE source_url = {ph} AND ai_analyzed_at IS NOT NULL
            """, (source_url,))
            row = cur.fetchone()

            if row:
                return _parse_analysis_row(row)  # ✅ 使用公共函数

    except Exception as e:
        print(f"⚠️ 读取 AI 缓存失败: {e}")

    return None
```

**验收**:
- [ ] 函数行数减少约15行
- [ ] 功能保持不变（通过测试验证）

---

### 步骤3: 新增批量查询函数 (15分钟)

**位置**: `backend/main.py` `get_cached_analysis` 函数之后

**新增函数**:
```python
def get_cached_analysis_batch(
    source_urls: List[str],
    batch_size: int = 100
) -> Dict[str, Dict[str, Any]]:
    """
    批量获取AI分析缓存（优化N+1查询）

    Args:
        source_urls: 文章URL列表
        batch_size: 单次查询的最大URL数量，默认100

    Returns:
        URL到分析数据的映射字典
        格式: {
            'url1': {'polarity': 'positive', 'impacts': [...], ...},
            'url2': {'polarity': 'neutral', 'impacts': [...], ...}
        }

    Note:
        - 只返回有缓存的URL，未缓存的不在结果中
        - 自动分批查询，防止单次IN参数过多
    """
    if not source_urls:
        return {}

    all_results = {}

    # 分批处理，防止单次查询参数过多
    for i in range(0, len(source_urls), batch_size):
        batch = source_urls[i:i + batch_size]

        try:
            ph = get_placeholder()
            with db_conn() as conn:
                cur = conn.cursor()

                # 构建IN查询
                placeholders = ','.join([ph] * len(batch))
                query = f"""
                    SELECT source_url, ai_polarity, ai_impacts,
                           ai_opinion, ai_tags
                    FROM raw_articles
                    WHERE source_url IN ({placeholders})
                      AND ai_analyzed_at IS NOT NULL
                """

                cur.execute(query, batch)

                # 解析结果
                for row in cur.fetchall():
                    # 提取source_url
                    source_url = row[0] if isinstance(row, tuple) else row['source_url']

                    # 解析分析数据（跳过第一列source_url）
                    analysis_row = row[1:] if isinstance(row, tuple) else row
                    analysis = _parse_analysis_row(analysis_row)

                    if analysis:
                        all_results[source_url] = analysis

        except Exception as e:
            print(f"⚠️ 批量获取缓存失败 (batch {i//batch_size + 1}): {e}")
            # 继续处理下一批，不中断

    print(f"📦 批量缓存查询: {len(source_urls)}个URL, 命中{len(all_results)}个")
    return all_results
```

**验收**:
- [ ] 能处理空列表输入
- [ ] 能处理超过batch_size的URL列表
- [ ] 返回格式正确: Dict[str, Dict]
- [ ] 异常时返回空字典，不影响主流程
- [ ] 打印有用的调试信息

---

### 步骤4: 修改build_intelligence_cards使用批量查询 (15分钟)

**位置**: `backend/main.py` 第444-525行

**当前逻辑**:
```python
def build_intelligence_cards(...):
    # 1. 收集pending_tasks
    pending_tasks = [...]

    # 2. 多线程处理
    def process_one(task):
        cached = get_cached_analysis(source_url)  # ❌ N+1查询
        ...
```

**优化后逻辑**:
```python
def build_intelligence_cards(...):
    # 1. 收集pending_tasks
    pending_tasks = [...]

    # 2. ✅ 批量查询所有缓存（关键优化点）
    source_urls = [task[0].get("source_url") for task in pending_tasks
                   if task[0].get("source_url")]
    cached_analyses = get_cached_analysis_batch(source_urls) if not skip_ai else {}

    # 3. 多线程处理
    def process_one(task):
        source_url = normalized.get("source_url")

        if skip_ai:
            analysis = {...}
        else:
            # ✅ 从字典查找，不查数据库
            cached = cached_analyses.get(source_url)
            if cached:
                analysis = cached
                print(f"📦 使用缓存: {normalized['title'][:30]}...")
            else:
                print(f"🤖 AI 分析中: {normalized['title'][:30]}...")
                analysis = analyze_article(...)
                if source_url and analysis.get("polarity"):
                    save_analysis_cache(source_url, analysis)
        ...
```

**具体修改位置**:
1. 在第465行（`pending_tasks = pending_tasks[:limit]`）之后插入批量查询
2. 修改第481行（`cached = get_cached_analysis(source_url)`）为字典查找

**验收**:
- [ ] 批量查询在多线程外执行（确保只查1次）
- [ ] process_one函数从字典查找缓存
- [ ] 保持原有并发逻辑不变
- [ ] 日志输出清晰（显示缓存命中情况）

---

## ✅ 验证清单

### 功能验证
- [ ] `/api/feed` 返回数据格式正确
- [ ] `/api/intelligence` 返回数据格式正确
- [ ] 缓存命中时不调用AI
- [ ] 缓存未命中时正常调用AI并保存

### 性能验证
- [ ] `/api/feed` TTFB < 20秒
- [ ] `/api/intelligence` TTFB < 20秒
- [ ] 数据库查询日志显示仅1次批量查询
- [ ] 批量查询100个URL耗时 < 300ms

### 代码质量
- [ ] 无PEP8警告
- [ ] 类型提示完整
- [ ] 函数文档完整
- [ ] 无代码重复

---

## 🔄 回滚计划

如果优化后出现问题，回滚步骤：

1. **保留新增函数** - `_parse_analysis_row` 和 `get_cached_analysis_batch` 保留，不影响系统
2. **恢复build_intelligence_cards** - 将批量查询改回单个查询
3. **验证回滚** - 确认接口返回正常

**回滚难度**: 低（仅需恢复1个函数的调用方式）

---

## 📊 预期效果

| 指标 | 优化前 | 优化后 | 改进 |
|:---|:---|:---|:---|
| 数据库查询次数 | 20次 | 1次 | 95% ✅ |
| 数据库查询耗时 | 4秒 | 0.2秒 | 95% ✅ |
| `/api/feed` TTFB | 60秒 | 15-20秒 | 67-75% ✅ |
| 代码重复 | 高 | 低 | 消除 ✅ |

---

## 📝 实施备注

**注意事项**:
1. 确保 `get_placeholder()` 函数正确返回PostgreSQL占位符 `%s`
2. 批量查询的SELECT字段顺序必须与解析逻辑一致
3. 测试时注意观察后端日志中的缓存命中信息
4. 如果遇到问题，先检查批量查询是否在多线程外执行

**下一步**:
完成本次优化后，评估是否需要进行阶段2（缓存预热）优化。

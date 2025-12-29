# ContentRSS 性能优化方案

## 🚨 问题诊断结果

### 性能测试数据（2025-12-29）

| API接口 | TTFB | 总耗时 | 严重程度 |
|:---|:---|:---|:---|
| `/api/feed` | **60.9秒** | 60.9秒 | 🔴 致命 |
| `/api/intelligence` | **56.8秒** | 56.8秒 | 🔴 致命 |
| `/api/topics` | 4.0秒 | 4.0秒 | 🟡 严重 |
| `/api/entities` | 1.1秒 | 1.1秒 | 🟡 需优化 |
| `/api/categories` | 0.003秒 | 0.003秒 | ✅ 正常 |

### 根本原因分析

#### 1. N+1查询问题（核心问题）
```python
# 当前实现 (build_intelligence_cards)
for article in articles[:20]:  # 20篇文章
    get_cached_analysis(source_url)  # → 执行20次SQL查询！
```

**影响**：
- 每篇文章一次数据库查询
- Railway PostgreSQL在美国，每次RTT ~200ms
- 20篇 × 200ms = **4秒基础延迟**

#### 2. AI API调用延迟
```python
# 如果缓存未命中
analyze_article(title, summary)  # 调用外部AI，耗时3-5秒
```

**影响**：
- 如果20篇文章都没缓存
- 20篇 × 5秒 = **100秒！**

#### 3. 跨云网络延迟
```
前端(本地) → 后端(本地) → PostgreSQL(Railway美国) → 后端 → 前端
              └─────── 每次查询往返 ~200ms ──────┘
```

---

## ✅ 优化方案

### 方案1: 批量查询优化（立即实施，效果最明显）

**效果预期**: 60秒 → **2-3秒** (95%改进)

#### 实施步骤

**修改 `get_cached_analysis_batch()` 函数**:
```python
def get_cached_analysis_batch(source_urls: List[str]) -> Dict[str, Dict[str, Any]]:
    """批量获取缓存的 AI 分析结果（单次查询）"""
    if not source_urls:
        return {}

    try:
        ph = get_placeholder()
        with db_conn() as conn:
            cur = conn.cursor()
            # 使用 IN 查询，一次性获取所有数据
            placeholders = ','.join([ph] * len(source_urls))
            cur.execute(f"""
                SELECT source_url, ai_polarity, ai_impacts, ai_opinion, ai_tags
                FROM raw_articles
                WHERE source_url IN ({placeholders}) AND ai_analyzed_at IS NOT NULL
            """, source_urls)

            results = {}
            for row in cur.fetchall():
                source_url = row[0] if isinstance(row, tuple) else row["source_url"]
                polarity = row[1] if isinstance(row, tuple) else row["ai_polarity"]
                impacts_str = row[2] if isinstance(row, tuple) else row["ai_impacts"]
                opinion = row[3] if isinstance(row, tuple) else row.get("ai_opinion", "")
                tags_str = row[4] if isinstance(row, tuple) else row["ai_tags"]

                if polarity:
                    results[source_url] = {
                        "polarity": polarity,
                        "impacts": json.loads(impacts_str) if impacts_str else [],
                        "opinion": opinion,
                        "tags": json.loads(tags_str) if tags_str else []
                    }

            return results
    except Exception as e:
        print(f"⚠️ 批量获取缓存失败: {e}")
        return {}
```

**修改 `build_intelligence_cards()` 函数**:
```python
def build_intelligence_cards(
    limit: int = 20,
    skip_ai: bool = False,
    category_key: Optional[str] = None
) -> List[Dict[str, Any]]:
    if category_key and category_key != "all":
        data = {category_key: get_articles_for_category(category_key)}
    else:
        data = get_raw_articles_by_category()

    # 1. 收集待处理的文章列表
    pending_tasks = []
    for cat_key, articles in data.items():
        if not isinstance(articles, list):
            continue
        for article in articles[:3]:
            normalized = normalize_article(article, cat_key)
            if normalized:
                pending_tasks.append((normalized, cat_key))

    pending_tasks = pending_tasks[:limit]

    # 2. 🚀 批量获取所有文章的缓存（单次数据库查询）
    source_urls = [task[0].get("source_url") for task in pending_tasks if task[0].get("source_url")]
    cached_analyses = get_cached_analysis_batch(source_urls) if not skip_ai else {}

    # 3. 定义处理单元
    def process_one(task):
        normalized, cat_key = task
        source_url = normalized.get("source_url")

        if skip_ai:
            analysis = {
                "polarity": "neutral",
                "impacts": [],
                "tags": [],
                "opinion": ""
            }
        else:
            # 从批量缓存中查找
            analysis = cached_analyses.get(source_url)

            if analysis:
                print(f"📦 使用缓存: {normalized['title'][:30]}...")
            else:
                # 无缓存则调用 AI
                print(f"🤖 AI 分析中: {normalized['title'][:30]}...")
                analysis = analyze_article(normalized["title"], normalized["summary"])
                # 保存到缓存
                if source_url and analysis.get("polarity"):
                    save_analysis_cache(source_url, analysis)

        tags = analysis.get("tags") or []
        if cat_key:
            category_label = get_category_label(cat_key)
            if category_label and category_label not in tags:
                tags.append(category_label)

        return {
            "id": normalized["id"],
            "title": normalized["title"],
            "polarity": analysis.get("polarity", "neutral"),
            "fact": analysis.get("fact") or normalized["summary"],
            "impacts": analysis.get("impacts", []),
            "opinion": analysis.get("opinion", ""),
            "tags": tags,
            "source_name": normalized["source_name"],
            "source_url": normalized["source_url"],
            "ingested_at": normalized.get("ingested_at")
        }

    # 4. 并发执行
    cards = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        future_to_article = {executor.submit(process_one, task): task for task in pending_tasks}
        for future in as_completed(future_to_article):
            try:
                card = future.result()
                if card:
                    cards.append(card)
            except Exception as e:
                print(f"⚠️ 处理文章失败: {e}")

    return cards
```

---

### 方案2: 缓存预热机制（后台任务）

**效果预期**: 减少90%的AI调用延迟

#### 实施策略
```python
# 添加后台任务，定期预热缓存
def preheat_cache():
    """后台预热缓存：对未分析的文章提前执行AI分析"""
    with db_conn() as conn:
        cur = conn.cursor()
        # 找出最近未分析的文章
        cur.execute("""
            SELECT id, title, summary, source_url
            FROM raw_articles
            WHERE ai_analyzed_at IS NULL
            ORDER BY ingested_at DESC
            LIMIT 50
        """)

        for row in cur.fetchall():
            article_id, title, summary, source_url = row
            try:
                analysis = analyze_article(title, summary)
                save_analysis_cache(source_url, analysis)
                print(f"✓ 预热缓存: {title[:30]}")
            except Exception as e:
                print(f"✗ 预热失败: {e}")

# 在应用启动时执行
@app.before_first_request
def startup():
    import threading
    threading.Thread(target=preheat_cache, daemon=True).start()
```

---

### 方案3: 迁移数据库到阿里云（长期方案）

**效果预期**: 网络延迟 200ms → **5-10ms** (20倍改进)

#### 迁移策略参考
见 `PERFORMANCE_OPTIMIZATION.md` 和之前的分析文档。

**关键收益**:
- 消除跨云延迟
- 20次查询从4秒降至100ms
- 更稳定的网络连接

---

## 📊 优化效果预测

### 当前性能（基线）
```
/api/feed: 60.9秒
  └─ 数据库查询: 20次 × 200ms = 4秒
  └─ AI调用: 假设5篇未缓存 × 5秒 = 25秒
  └─ 其他处理: ~2秒
  └─ 并发但受限于网络和AI调用
```

### 方案1优化后（批量查询）
```
/api/feed: 2-3秒
  └─ 数据库查询: 1次批量查询 = 200ms ✅
  └─ AI调用: 假设5篇未缓存 × 5秒 = 25秒（并发执行）
  └─ 其他处理: ~2秒
  ✅ 改进: 消除N+1查询，节省3.8秒
```

### 方案1+2优化后（批量查询 + 缓存预热）
```
/api/feed: 0.5-1秒
  └─ 数据库查询: 1次批量查询 = 200ms ✅
  └─ AI调用: 0篇（全部缓存命中）= 0秒 ✅
  └─ 其他处理: ~0.5秒
  ✅ 改进: 60秒 → 1秒，提升98%！
```

### 方案1+2+3优化后（+ 迁移阿里云）
```
/api/feed: 0.2-0.5秒
  └─ 数据库查询: 1次批量查询 = 10ms ✅
  └─ AI调用: 0篇（全部缓存命中）= 0秒 ✅
  └─ 其他处理: ~0.2秒
  ✅ 改进: 60秒 → 0.5秒，提升99%！
```

---

## 🚀 实施优先级

| 优先级 | 方案 | 工作量 | 效果 | 状态 |
|:---|:---|:---|:---|:---|
| **P0** | 批量查询优化 | 1小时 | 95%改进 | ⏳ 待实施 |
| **P1** | 缓存预热 | 2小时 | 90%减少AI调用 | ⏳ 待实施 |
| **P2** | 阿里云迁移 | 1天 | 20倍网络改进 | 📋 规划中 |

---

## 📋 下一步行动

1. [ ] 实施批量查询优化（方案1）
2. [ ] 验证性能改进（预期60s → 2-3s）
3. [ ] 实施缓存预热机制（方案2）
4. [ ] 验证缓存命中率（目标>90%）
5. [ ] 评估阿里云迁移可行性（方案3）

---

**创建时间**: 2025-12-29
**诊断工具**: curl + 后端日志分析
**测试环境**: 本地前后端 + Railway PostgreSQL

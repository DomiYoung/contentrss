#!/usr/bin/env python3
"""
从 Railway PostgreSQL 同步数据到本地 SQLite

功能：
1. 导出 Railway 数据库的所有表数据
2. 更新本地 SQLite 表结构（添加 AI 缓存列）
3. 导入数据到本地 SQLite
"""

import psycopg2
import sqlite3
import json
import os
from psycopg2.extras import RealDictCursor

# Railway PostgreSQL 连接信息
RAILWAY_DB_URL = "postgresql://postgres:KtsFYITokollebsiWPjTixchVgCbSOGl@switchback.proxy.rlwy.net:59903/railway"

# 本地 SQLite 路径
LOCAL_DB_PATH = os.path.join(os.path.dirname(__file__), 'local.db')

def export_from_railway():
    """从 Railway 导出数据"""
    print("🔍 连接到 Railway PostgreSQL...")
    pg_conn = psycopg2.connect(RAILWAY_DB_URL, sslmode='require', cursor_factory=RealDictCursor)
    pg_cur = pg_conn.cursor()

    # 导出 raw_articles（包含 AI 缓存数据）
    print("📦 导出 raw_articles 数据...")
    pg_cur.execute("""
        SELECT source_name, source_url, title, summary, content, category_key,
               raw_payload, published_at, ingested_at,
               ai_polarity, ai_impacts, ai_opinion, ai_tags, ai_analyzed_at
        FROM raw_articles
        ORDER BY ingested_at DESC
    """)
    raw_articles = pg_cur.fetchall()
    print(f"   ✅ 导出 {len(raw_articles)} 条文章")

    # 导出 topics
    print("📦 导出 topics 数据...")
    pg_cur.execute("SELECT * FROM topics")
    topics = pg_cur.fetchall()
    print(f"   ✅ 导出 {len(topics)} 个话题")

    # 导出 tags
    print("📦 导出 tags 数据...")
    pg_cur.execute("SELECT * FROM tags")
    tags = pg_cur.fetchall()
    print(f"   ✅ 导出 {len(tags)} 个标签")

    pg_conn.close()

    return {
        'raw_articles': raw_articles,
        'topics': topics,
        'tags': tags
    }

def update_sqlite_schema():
    """更新本地 SQLite 表结构"""
    print("\n🔧 更新本地 SQLite 表结构...")
    conn = sqlite3.connect(LOCAL_DB_PATH)
    cur = conn.cursor()

    # 检查是否已有 AI 缓存列
    cur.execute("PRAGMA table_info(raw_articles)")
    columns = [row[1] for row in cur.fetchall()]

    if 'ai_polarity' not in columns:
        print("   📝 添加 AI 缓存列...")
        cur.execute("ALTER TABLE raw_articles ADD COLUMN ai_polarity TEXT")
        cur.execute("ALTER TABLE raw_articles ADD COLUMN ai_impacts TEXT")
        cur.execute("ALTER TABLE raw_articles ADD COLUMN ai_opinion TEXT")
        cur.execute("ALTER TABLE raw_articles ADD COLUMN ai_tags TEXT")
        cur.execute("ALTER TABLE raw_articles ADD COLUMN ai_analyzed_at TEXT")
        conn.commit()
        print("   ✅ 表结构已更新")
    else:
        print("   ✅ 表结构已是最新")

    conn.close()

def import_to_sqlite(data):
    """导入数据到本地 SQLite"""
    print("\n📥 导入数据到本地 SQLite...")
    conn = sqlite3.connect(LOCAL_DB_PATH)
    cur = conn.cursor()

    # 清空现有数据（可选）
    print("   🗑️ 清空现有数据...")
    cur.execute("DELETE FROM raw_articles")
    cur.execute("DELETE FROM topics WHERE id > 2")  # 保留初始的2个演示topics
    conn.commit()

    # 导入 topics
    print(f"   📦 导入 {len(data['topics'])} 个话题...")
    for topic in data['topics']:
        cur.execute("""
            INSERT OR REPLACE INTO topics
            (id, title, description, status, current_version, channel_key, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            topic['id'], topic['title'], topic['description'], topic['status'],
            topic['current_version'], topic['channel_key'], topic['created_at'], topic['updated_at']
        ))

    # 导入 tags
    print(f"   📦 导入 {len(data['tags'])} 个标签...")
    for tag in data['tags']:
        cur.execute("""
            INSERT OR REPLACE INTO tags
            (id, tag_key, name, level, icon, color, usage_count, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            tag['id'], tag['tag_key'], tag['name'], tag['level'], tag['icon'],
            tag['color'], tag['usage_count'], tag['created_by'], tag['created_at']
        ))

    # 导入 raw_articles（包含 AI 缓存）
    print(f"   📦 导入 {len(data['raw_articles'])} 条文章...")
    imported_count = 0
    for article in data['raw_articles']:
        try:
            cur.execute("""
                INSERT OR REPLACE INTO raw_articles
                (source_name, source_url, title, summary, content, category_key,
                 raw_payload, published_at, ingested_at,
                 ai_polarity, ai_impacts, ai_opinion, ai_tags, ai_analyzed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                article['source_name'], article['source_url'], article['title'],
                article['summary'], article['content'], article['category_key'],
                json.dumps(article['raw_payload']) if article['raw_payload'] else None,
                article['published_at'], article['ingested_at'],
                article['ai_polarity'], article['ai_impacts'], article['ai_opinion'],
                article['ai_tags'], article['ai_analyzed_at']
            ))
            imported_count += 1
        except Exception as e:
            print(f"   ⚠️ 导入失败: {article.get('title', 'Unknown')[:30]}... - {e}")

    conn.commit()
    conn.close()

    print(f"   ✅ 成功导入 {imported_count} 条文章")

def verify_data():
    """验证数据完整性"""
    print("\n✅ 验证数据...")
    conn = sqlite3.connect(LOCAL_DB_PATH)
    cur = conn.cursor()

    # 检查文章数量
    cur.execute("SELECT COUNT(*) FROM raw_articles")
    article_count = cur.fetchone()[0]
    print(f"   📊 文章总数: {article_count}")

    # 检查 AI 缓存数量
    cur.execute("SELECT COUNT(*) FROM raw_articles WHERE ai_analyzed_at IS NOT NULL")
    cached_count = cur.fetchone()[0]
    print(f"   📦 AI 缓存数量: {cached_count}")
    print(f"   📈 缓存命中率: {(cached_count / article_count * 100):.1f}%")

    conn.close()

if __name__ == '__main__':
    try:
        print("🚀 开始同步 Railway → 本地SQLite\n")

        # 1. 导出数据
        data = export_from_railway()

        # 2. 更新表结构
        update_sqlite_schema()

        # 3. 导入数据
        import_to_sqlite(data)

        # 4. 验证
        verify_data()

        print("\n🎉 同步完成！")

    except Exception as e:
        print(f"\n❌ 同步失败: {e}")
        import traceback
        traceback.print_exc()

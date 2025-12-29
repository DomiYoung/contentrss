#!/usr/bin/env python3
"""检查数据库实际表结构"""
import os
import sys
from database import db_conn

def check_raw_articles_schema():
    """检查 raw_articles 表的实际结构"""
    with db_conn() as conn:
        cur = conn.cursor()

        # 检查表结构
        print("=== raw_articles 表结构 ===\n")
        cur.execute("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'raw_articles'
            ORDER BY ordinal_position;
        """)

        for row in cur.fetchall():
            if isinstance(row, dict):
                col_name = row['column_name']
                data_type = row['data_type']
                nullable = row['is_nullable']
                default = row['column_default']
            else:
                col_name = row[0]
                data_type = row[1]
                nullable = row[2]
                default = row[3]
            print(f"{col_name:20} {data_type:15} NULL:{nullable:3} DEFAULT:{default}")

        # 检查索引
        print("\n=== raw_articles 索引 ===\n")
        cur.execute("""
            SELECT
                i.relname AS index_name,
                a.attname AS column_name,
                am.amname AS index_type,
                ix.indisunique AS is_unique,
                ix.indisprimary AS is_primary
            FROM pg_class t
            JOIN pg_index ix ON t.oid = ix.indrelid
            JOIN pg_class i ON i.oid = ix.indexrelid
            JOIN pg_am am ON i.relam = am.oid
            JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
            WHERE t.relname = 'raw_articles'
            ORDER BY i.relname;
        """)

        for row in cur.fetchall():
            if isinstance(row, dict):
                print(f"{row['index_name']:40} {row['column_name']:20} {row['index_type']:8} UNIQUE:{row['is_unique']} PRIMARY:{row['is_primary']}")
            else:
                print(f"{row[0]:40} {row[1]:20} {row[2]:8} UNIQUE:{row[3]} PRIMARY:{row[4]}")

        # 检查表统计信息
        print("\n=== 表统计信息 ===\n")
        cur.execute("""
            SELECT
                COUNT(*) as total_rows,
                COUNT(CASE WHEN ai_analyzed_at IS NOT NULL THEN 1 END) as cached_rows,
                COUNT(CASE WHEN ai_analyzed_at IS NULL THEN 1 END) as uncached_rows,
                ROUND(100.0 * COUNT(CASE WHEN ai_analyzed_at IS NOT NULL THEN 1 END) / NULLIF(COUNT(*), 0), 2) as cache_hit_rate
            FROM raw_articles;
        """)

        row = cur.fetchone()
        if isinstance(row, dict):
            print(f"总记录数: {row.get('total_rows', 0)}")
            print(f"已缓存: {row.get('cached_rows', 0)}")
            print(f"未缓存: {row.get('uncached_rows', 0)}")
            print(f"缓存命中率: {row.get('cache_hit_rate', 0)}%")
        else:
            print(f"总记录数: {row[0]}")
            print(f"已缓存: {row[1]}")
            print(f"未缓存: {row[2]}")
            print(f"缓存命中率: {row[3]}%")

if __name__ == "__main__":
    try:
        check_raw_articles_schema()
    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()

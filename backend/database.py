import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# 确保环境变量加载（无论从哪个入口导入）
load_dotenv()

# 仅支持 Supabase / PostgreSQL
DB_URL = os.getenv('DATABASE_URL')
if not DB_URL:
    raise RuntimeError("缺少 DATABASE_URL 配置（仅支持 Supabase/PostgreSQL）")
if not (DB_URL.startswith('postgres://') or DB_URL.startswith('postgresql://')):
    raise RuntimeError("DATABASE_URL 必须是 postgres:// 或 postgresql://")

print("📦 Database: PostgreSQL (Supabase)")

def get_db_connection():
    # Supabase 需要 SSL 连接
    return psycopg2.connect(DB_URL, cursor_factory=RealDictCursor, sslmode='require')

def get_placeholder():
    """返回 PostgreSQL 占位符"""
    return "%s"

# PostgreSQL 兼容的 Schema 定义（运行时最小集合）
PG_SCHEMA = """
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    tag_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('category', 'ai', 'user')),
    icon VARCHAR(10),
    color VARCHAR(20) DEFAULT '#71717A',
    usage_count INT DEFAULT 0,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO tags (tag_key, name, level, icon, color) VALUES
('legal', '法律法规', 'category', '⚖️', '#6366F1'),
('digital', '数字化', 'category', '💻', '#0EA5E9'),
('brand', '品牌', 'category', '💎', '#EC4899'),
('rd', '新品研发', 'category', '🧪', '#8B5CF6'),
('global', '国际形势', 'category', '🌍', '#14B8A6'),
('insight', '行业洞察', 'category', '📊', '#F59E0B'),
('ai', 'AI', 'category', '🤖', '#10B981'),
('management', '企业管理', 'category', '📋', '#64748B')
ON CONFLICT (tag_key) DO NOTHING;

INSERT INTO tags (tag_key, name, level, icon, color) VALUES
('important', '重要', 'user', '⭐', '#F59E0B'),
('follow_up', '待跟进', 'user', '📌', '#EF4444'),
('archived', '已归档', 'user', '📁', '#94A3B8')
ON CONFLICT (tag_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    current_version TEXT DEFAULT '0.1',
    channel_key TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topic_evidences (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    highlight_text TEXT,
    note TEXT,
    source_title TEXT,
    source_url TEXT,
    confidence TEXT DEFAULT 'high',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topic_updates (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    content TEXT,
    change_log TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS raw_articles (
    id BIGSERIAL PRIMARY KEY,
    source_name TEXT,
    source_url TEXT UNIQUE,
    title TEXT,
    summary TEXT,
    content TEXT,
    category_key TEXT,
    raw_payload JSONB,
    published_at TIMESTAMP,
    ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

def init_db():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(PG_SCHEMA)
        conn.commit()
        
        # 插入演示数据 (如果表为空)
        cur.execute("SELECT count(*) as cnt FROM topics")
        row = cur.fetchone()
        count = row['cnt'] if isinstance(row, dict) else row[0]
        if count == 0:
            placeholder = get_placeholder()
            cur.execute(f"INSERT INTO topics (title, description, channel_key) VALUES ({placeholder}, {placeholder}, {placeholder})", 
                       ('玻色因国产化进程', '追踪玻色因原料成本下降后的市场格局变化', 'beauty_alpha'))
            cur.execute(f"INSERT INTO topics (title, description, channel_key) VALUES ({placeholder}, {placeholder}, {placeholder})", 
                       ('李佳琦直播间选品逻辑', '分析头部主播对新锐品牌的选品偏好变化', 'beauty_alpha'))
            conn.commit()
            print("✓ Database initialized with demo data.")
        else:
            print(f"✓ Database connected. Topics count: {count}")
        conn.close()
    except Exception as e:
        print(f"❌ Database initialization failed: {type(e).__name__}: {e}")


if __name__ == '__main__':
    init_db()

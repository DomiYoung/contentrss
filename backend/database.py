import os
import sqlite3
from dotenv import load_dotenv

# 确保环境变量加载（无论从哪个入口导入）
load_dotenv()

# 数据库模式：检测 DATABASE_URL 决定使用 PostgreSQL 还是 SQLite
DB_URL = os.getenv('DATABASE_URL', '')
USE_POSTGRES = DB_URL.startswith('postgres://') or DB_URL.startswith('postgresql://')

# SQLite 本地路径
SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), 'local.db')

if USE_POSTGRES:
    print("📦 Database: PostgreSQL (Railway)")
    import psycopg2
    from psycopg2.extras import RealDictCursor
else:
    print(f"📦 Database: SQLite ({SQLITE_DB_PATH})")


from contextlib import contextmanager
import os

def is_postgres():
    """返回当前是否使用 PostgreSQL"""
    return USE_POSTGRES

# --- 数据库连接池管理 ---
_db_pool = None

def get_pool():
    global _db_pool
    if USE_POSTGRES:
        if _db_pool is None:
            import psycopg2.pool
            print("💡 初始化 PostgreSQL 连接池...")
            # Railway PostgreSQL 需要 SSL 连接
            _db_pool = psycopg2.pool.ThreadedConnectionPool(1, 10, DB_URL, sslmode='require')
        return _db_pool
    return None

@contextmanager
def db_conn():
    """统一的数据库连接上下文管理器"""
    if USE_POSTGRES:
        pool = get_pool()
        from psycopg2.extras import RealDictCursor
        conn = pool.getconn()
        conn.cursor_factory = RealDictCursor
        try:
            yield conn
        finally:
            pool.putconn(conn)
    else:
        # SQLite 模式：每次请求新建连接
        conn = get_db_connection()
        try:
            yield conn
        finally:
            conn.close()

def get_db_connection():
    """获取基础数据库连接 (备用)"""
    if USE_POSTGRES:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        return psycopg2.connect(DB_URL, cursor_factory=RealDictCursor, sslmode='require')
    else:
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

def get_placeholder():
    """返回 SQL 占位符"""
    return "%s" if USE_POSTGRES else "?"


# SQLite 兼容的 Schema 定义
SQLITE_SCHEMA = """
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('category', 'ai', 'user')),
    icon TEXT,
    color TEXT DEFAULT '#71717A',
    usage_count INTEGER DEFAULT 0,
    created_by INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    current_version TEXT DEFAULT '0.1',
    channel_key TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topic_evidences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    highlight_text TEXT,
    note TEXT,
    source_title TEXT,
    source_url TEXT,
    confidence TEXT DEFAULT 'high',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topic_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    content TEXT,
    change_log TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS raw_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_name TEXT,
    source_url TEXT UNIQUE,
    title TEXT,
    summary TEXT,
    content TEXT,
    category_key TEXT,
    raw_payload TEXT,
    published_at TEXT,
    ingested_at TEXT DEFAULT CURRENT_TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    read_time INTEGER DEFAULT 0,
    popularity_score INTEGER DEFAULT 0,
    sentiment TEXT DEFAULT 'neutral',
    impact_score INTEGER DEFAULT 0,
    freshness TEXT DEFAULT 'recent',
    -- AI 分析结果缓存
    ai_polarity TEXT,
    ai_impacts TEXT,
    ai_opinion TEXT,
    ai_tags TEXT,
    ai_analyzed_at TEXT
);

CREATE TABLE IF NOT EXISTS reading_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    started_at TEXT DEFAULT CURRENT_TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reading_records_article ON reading_records(article_id);
CREATE INDEX IF NOT EXISTS idx_reading_records_device ON reading_records(device_id);
"""

# PostgreSQL 兼容的 Schema 定义
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
    ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    read_time INTEGER DEFAULT 0,
    popularity_score INTEGER DEFAULT 0,
    sentiment TEXT DEFAULT 'neutral',
    impact_score INTEGER DEFAULT 0,
    freshness TEXT DEFAULT 'recent',
    -- AI 分析结果缓存
    ai_polarity TEXT,
    ai_impacts TEXT,
    ai_opinion TEXT,
    ai_tags TEXT,
    ai_analyzed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reading_records (
    id SERIAL PRIMARY KEY,
    article_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reading_records_article ON reading_records(article_id);
CREATE INDEX IF NOT EXISTS idx_reading_records_device ON reading_records(device_id);
"""


def init_db():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if USE_POSTGRES:
            cur.execute(PG_SCHEMA)
        else:
            # SQLite 需要分开执行 CREATE TABLE
            cur.executescript(SQLITE_SCHEMA)
            # 插入 tags 初始数据
            tags_data = [
                ('legal', '法律法规', 'category', '⚖️', '#6366F1'),
                ('digital', '数字化', 'category', '💻', '#0EA5E9'),
                ('brand', '品牌', 'category', '💎', '#EC4899'),
                ('rd', '新品研发', 'category', '🧪', '#8B5CF6'),
                ('global', '国际形势', 'category', '🌍', '#14B8A6'),
                ('insight', '行业洞察', 'category', '📊', '#F59E0B'),
                ('ai', 'AI', 'category', '🤖', '#10B981'),
                ('management', '企业管理', 'category', '📋', '#64748B'),
                ('important', '重要', 'user', '⭐', '#F59E0B'),
                ('follow_up', '待跟进', 'user', '📌', '#EF4444'),
                ('archived', '已归档', 'user', '📁', '#94A3B8'),
            ]
            cur.executemany("INSERT OR IGNORE INTO tags (tag_key, name, level, icon, color) VALUES (?, ?, ?, ?, ?)", tags_data)
        
        conn.commit()
        
        # 检查 topics 数量
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

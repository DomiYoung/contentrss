import sqlite3
import os
import psycopg2
from psycopg2.extras import RealDictCursor

# 使用绝对路径，确保在不同运行环境下都能找到数据库文件
# 优先从环境变量读取，否则回退到项目根目录
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_URL = os.getenv('DATABASE_URL', os.path.join(BASE_DIR, 'contentrss.db'))

def is_postgres():
    return DB_URL.startswith('postgres://') or DB_URL.startswith('postgresql://')

def get_db_connection():
    if is_postgres():
        conn = psycopg2.connect(DB_URL, cursor_factory=RealDictCursor)
        # PostgreSQL 不需要显式设置 row_factory，RealDictCursor 已经处理了
        return conn
    else:
        # 兼容 SQLite
        sqlite_path = DB_URL
        if sqlite_path.startswith('sqlite:///'):
            sqlite_path = sqlite_path.replace('sqlite:///', '')
        
        conn = sqlite3.connect(sqlite_path)
        conn.row_factory = sqlite3.Row
        return conn

def get_placeholder():
    """返回当前数据库引擎对应的占位符"""
    return "%s" if is_postgres() else "?"

# PostgreSQL 兼容的 Schema 定义
PG_SCHEMA = """
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

SQLITE_SCHEMA = """
CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    current_version TEXT DEFAULT '0.1',
    channel_key TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topic_evidences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    highlight_text TEXT,
    note TEXT,
    source_title TEXT,
    source_url TEXT,
    confidence TEXT DEFAULT 'high',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id)
);

CREATE TABLE IF NOT EXISTS topic_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    version TEXT NOT NULL,
    content TEXT,
    change_log TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id)
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
    published_at TIMESTAMP,
    ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

def init_db():
    schema = PG_SCHEMA if is_postgres() else SQLITE_SCHEMA
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        if is_postgres():
            cur.execute(schema)
        else:
            cur.executescript(schema)
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

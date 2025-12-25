import sqlite3
import os

# Use absolute path relative to this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'contentrss.db')
SCHEMA_PATH = os.path.join(BASE_DIR, 'schema.sql')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    if os.path.exists(DB_PATH):
        return
        
    print(f"Initializing database from {SCHEMA_PATH}...")
    with get_db_connection() as conn:
        with open(SCHEMA_PATH, 'r') as f:
            # Simple SQL splitting might fail on complex schemas (like triggers or functions)
            # But for this schema it should be fine if we handle comments and semicolons carefully.
            # Assuming schema.sql is SQLite compatible (removed AUTO_INCREMENT, MySQL specific syntax if any)
            
            # The schema.sql has MySQL syntax (AUTO_INCREMENT, COMMENT). 
            # We need to adapt it slightly for SQLite or write a converter.
            # For MVP speed, I will use a simplified SQLite schema initialization logic here.
            pass

# SQLite compatible schema definition strings for the purpose of this script
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
"""

def init_sqlite_db():
    with get_db_connection() as conn:
        conn.executescript(SQLITE_SCHEMA)
        
        # Insert demo topics if empty
        cur = conn.cursor()
        cur.execute("SELECT count(*) FROM topics")
        if cur.fetchone()[0] == 0:
            cur.execute("""
                INSERT INTO topics (title, description, channel_key) 
                VALUES ('玻色因国产化进程', '追踪玻色因原料成本下降后的市场格局变化', 'beauty_alpha')
            """)
            cur.execute("""
                INSERT INTO topics (title, description, channel_key) 
                VALUES ('李佳琦直播间选品逻辑', '分析头部主播对新锐品牌的选品偏好变化', 'beauty_alpha')
            """)
            conn.commit()
            print("Initialized demo topics.")

if __name__ == '__main__':
    init_sqlite_db()

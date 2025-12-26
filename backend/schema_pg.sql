-- ContentRSS PostgreSQL Schema
-- 版本: 2.0 | 日期: 2025-12-25
-- 数据库: PostgreSQL (Supabase 兼容)

-- ============================================================
-- 0. 清理旧表（可选，用于重置数据库）
-- ============================================================
-- DROP TABLE IF EXISTS topic_evidences CASCADE;
-- DROP TABLE IF EXISTS topic_updates CASCADE;
-- DROP TABLE IF EXISTS topics CASCADE;
-- DROP TABLE IF EXISTS article_impacts CASCADE;
-- DROP TABLE IF EXISTS article_tags CASCADE;
-- DROP TABLE IF EXISTS articles CASCADE;
-- DROP TABLE IF EXISTS tags CASCADE;

-- ============================================================
-- 1. 标签表（统一标签体系）
-- ============================================================

CREATE TABLE IF NOT EXISTS tags (
    id              SERIAL PRIMARY KEY,
    tag_key         VARCHAR(50) UNIQUE NOT NULL,
    name            VARCHAR(100) NOT NULL,
    level           VARCHAR(20) NOT NULL CHECK (level IN ('category', 'ai', 'user')),
    icon            VARCHAR(10),
    color           VARCHAR(20) DEFAULT '#71717A',
    usage_count     INT DEFAULT 0,
    created_by      INT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 预置分类标签
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

-- 预置用户级标签
INSERT INTO tags (tag_key, name, level, icon, color) VALUES
('important', '重要', 'user', '⭐', '#F59E0B'),
('follow_up', '待跟进', 'user', '📌', '#EF4444'),
('archived', '已归档', 'user', '📁', '#94A3B8')
ON CONFLICT (tag_key) DO NOTHING;

-- ============================================================
-- 2. 文章/情报表
-- ============================================================

CREATE TABLE IF NOT EXISTS articles (
    id              SERIAL PRIMARY KEY,
    external_id     BIGINT,
    title           VARCHAR(500) NOT NULL,
    summary         TEXT,
    content         TEXT,
    source_name     VARCHAR(200),
    source_url      VARCHAR(1000),
    
    -- AI 分析结果
    polarity        VARCHAR(20) DEFAULT 'neutral' CHECK (polarity IN ('positive', 'negative', 'neutral')),
    core_insight    VARCHAR(200),
    catalyst        VARCHAR(500),
    root_cause      VARCHAR(500),
    alpha_opportunity TEXT,
    confidence      VARCHAR(20) DEFAULT 'medium' CHECK (confidence IN ('high', 'medium', 'low')),
    
    -- 元数据
    category_key    VARCHAR(50),
    analyzed_at     TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_articles_external_id ON articles(external_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_key);
CREATE INDEX IF NOT EXISTS idx_articles_polarity ON articles(polarity);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);

-- ============================================================
-- 3. 文章-标签关联表
-- ============================================================

CREATE TABLE IF NOT EXISTS article_tags (
    id              SERIAL PRIMARY KEY,
    article_id      INT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    tag_id          INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (article_id, tag_id)
);

-- ============================================================
-- 4. AI 分析影响链表
-- ============================================================

CREATE TABLE IF NOT EXISTS article_impacts (
    id              SERIAL PRIMARY KEY,
    article_id      INT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    entity          VARCHAR(200) NOT NULL,
    trend           VARCHAR(10) NOT NULL CHECK (trend IN ('up', 'down')),
    reason          TEXT,
    sort_order      INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_impacts_article ON article_impacts(article_id);

-- ============================================================
-- 5. 堡垒主题表 (Topics/Research)
-- ============================================================

CREATE TABLE IF NOT EXISTS topics (
    id              SERIAL PRIMARY KEY,
    title           TEXT NOT NULL,
    description     TEXT,
    status          VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
    current_version VARCHAR(20) DEFAULT '0.1',
    channel_key     VARCHAR(50),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 6. 主题证据关联表
-- ============================================================

CREATE TABLE IF NOT EXISTS topic_evidences (
    id              SERIAL PRIMARY KEY,
    topic_id        INT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    highlight_text  TEXT,
    note            TEXT,
    source_title    TEXT,
    source_url      TEXT,
    confidence      VARCHAR(20) DEFAULT 'high' CHECK (confidence IN ('high', 'medium', 'low')),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 7. 主题版本更新表
-- ============================================================

CREATE TABLE IF NOT EXISTS topic_updates (
    id              SERIAL PRIMARY KEY,
    topic_id        INT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    version         VARCHAR(20) NOT NULL,
    content         TEXT,
    change_log      TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 8. 原始文章表（Special 同步落库）
-- ============================================================

CREATE TABLE IF NOT EXISTS raw_articles (
    id              BIGSERIAL PRIMARY KEY,
    source_name     TEXT,
    source_url      TEXT UNIQUE,
    title           TEXT,
    summary         TEXT,
    content         TEXT,
    category_key    TEXT,
    raw_payload     JSONB,
    published_at    TIMESTAMP,
    ingested_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 演示数据（可选）
-- ============================================================

INSERT INTO topics (title, description, channel_key) VALUES
('玻色因国产化进程', '追踪玻色因原料成本下降后的市场格局变化', 'beauty_alpha'),
('李佳琦直播间选品逻辑', '分析头部主播对新锐品牌的选品偏好变化', 'beauty_alpha')
ON CONFLICT DO NOTHING;

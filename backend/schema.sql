-- ContentRSS 数据库设计
-- 版本: 1.0 | 日期: 2024-12-24
-- 数据库: PostgreSQL / MySQL 兼容

-- ============================================================
-- 1. 用户表
-- ============================================================

CREATE TABLE users (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    uid             VARCHAR(64) UNIQUE NOT NULL COMMENT '外部用户ID（SSO）',
    username        VARCHAR(100) NOT NULL,
    email           VARCHAR(255),
    avatar_url      VARCHAR(500),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at   TIMESTAMP,
    INDEX idx_uid (uid)
);

-- ============================================================
-- 2. 标签表（统一标签体系）
-- ============================================================

CREATE TABLE tags (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    tag_key         VARCHAR(50) UNIQUE NOT NULL COMMENT '唯一标识 key',
    name            VARCHAR(100) NOT NULL COMMENT '中文名称',
    level           ENUM('category', 'ai', 'user') NOT NULL COMMENT '标签层级',
    icon            VARCHAR(10) COMMENT 'Emoji 图标',
    color           VARCHAR(20) DEFAULT '#71717A' COMMENT '颜色',
    usage_count     INT DEFAULT 0 COMMENT '使用次数',
    created_by      BIGINT COMMENT '创建者ID（user 级别标签）',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_level (level),
    INDEX idx_key (tag_key),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
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
('management', '企业管理', 'category', '📋', '#64748B');

-- 预置系统标签（用户级）
INSERT INTO tags (tag_key, name, level, icon, color) VALUES
('important', '重要', 'user', '⭐', '#F59E0B'),
('follow_up', '待跟进', 'user', '📌', '#EF4444'),
('archived', '已归档', 'user', '📁', '#94A3B8');

-- ============================================================
-- 3. 文章/情报表
-- ============================================================

CREATE TABLE articles (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    external_id     BIGINT COMMENT '外部ID（飞书自增ID）',
    title           VARCHAR(500) NOT NULL,
    summary         TEXT COMMENT '摘要',
    content         LONGTEXT COMMENT '正文内容',
    source_name     VARCHAR(200) COMMENT '来源名称',
    source_url      VARCHAR(1000) COMMENT '原文链接',
    
    -- AI 分析结果
    polarity        ENUM('positive', 'negative', 'neutral') DEFAULT 'neutral',
    core_insight    VARCHAR(200) COMMENT '核心洞察',
    catalyst        VARCHAR(500) COMMENT '催化剂',
    root_cause      VARCHAR(500) COMMENT '根本原因',
    alpha_opportunity TEXT COMMENT 'Alpha 机会',
    confidence      ENUM('high', 'medium', 'low') DEFAULT 'medium',
    
    -- 元数据
    category_key    VARCHAR(50) COMMENT '一级分类 key',
    analyzed_at     TIMESTAMP COMMENT 'AI 分析时间',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_external_id (external_id),
    INDEX idx_category (category_key),
    INDEX idx_polarity (polarity),
    INDEX idx_created_at (created_at)
);

-- ============================================================
-- 4. 文章-标签关联表
-- ============================================================

CREATE TABLE article_tags (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    article_id      BIGINT NOT NULL,
    tag_id          BIGINT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_article_tag (article_id, tag_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- ============================================================
-- 5. AI 分析影响链表
-- ============================================================

CREATE TABLE article_impacts (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    article_id      BIGINT NOT NULL,
    entity          VARCHAR(200) NOT NULL COMMENT '受影响实体',
    trend           ENUM('up', 'down') NOT NULL COMMENT '趋势',
    reason          TEXT COMMENT '原因',
    sort_order      INT DEFAULT 0,
    
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    INDEX idx_article (article_id)
);

-- ============================================================
-- 6. 笔记表
-- ============================================================

CREATE TABLE notes (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL,
    article_id      BIGINT COMMENT '关联文章ID（可选）',
    content         TEXT NOT NULL COMMENT '笔记正文',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_article (article_id)
);

-- ============================================================
-- 7. 笔记-标签关联表
-- ============================================================

CREATE TABLE note_tags (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    note_id         BIGINT NOT NULL,
    tag_id          BIGINT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_note_tag (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- ============================================================
-- 8. 高亮标记表
-- ============================================================

CREATE TABLE highlights (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL,
    article_id      BIGINT NOT NULL,
    text            TEXT NOT NULL COMMENT '选中的原文',
    start_offset    INT NOT NULL COMMENT '起始位置',
    end_offset      INT NOT NULL COMMENT '结束位置',
    style           ENUM('highlight', 'strikethrough') DEFAULT 'highlight',
    color           VARCHAR(20) DEFAULT '#FEF08A',
    note_id         BIGINT COMMENT '关联笔记ID',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE SET NULL,
    INDEX idx_user_article (user_id, article_id)
);

-- ============================================================
-- 9. 草稿/文章发布表（创作工作台）
-- ============================================================

CREATE TABLE drafts (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL,
    source_note_id  BIGINT COMMENT '来源笔记ID',
    source_article_id BIGINT COMMENT '来源情报ID',
    
    title           VARCHAR(500) NOT NULL,
    content         LONGTEXT COMMENT 'Markdown 正文',
    status          ENUM('draft', 'pending', 'published', 'archived') DEFAULT 'draft',
    
    -- 发布信息
    published_platforms JSON COMMENT '已发布平台 ["wechat", "zhihu", "juejin"]',
    publish_stats   JSON COMMENT '发布统计 {"views": 100, "likes": 10}',
    
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at    TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (source_note_id) REFERENCES notes(id) ON DELETE SET NULL,
    FOREIGN KEY (source_article_id) REFERENCES articles(id) ON DELETE SET NULL,
    INDEX idx_user_status (user_id, status)
);

-- ============================================================
-- 10. 草稿-标签关联表
-- ============================================================

CREATE TABLE draft_tags (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    draft_id        BIGINT NOT NULL,
    tag_id          BIGINT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_draft_tag (draft_id, tag_id),
    FOREIGN KEY (draft_id) REFERENCES drafts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- ============================================================
-- 11. 用户订阅实体表（实体雷达）
-- ============================================================

CREATE TABLE user_subscriptions (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL,
    entity_type     ENUM('company', 'industry', 'topic') NOT NULL,
    entity_name     VARCHAR(200) NOT NULL,
    entity_key      VARCHAR(100),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_user_entity (user_id, entity_type, entity_name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
);

-- ============================================================
-- 12. 阅读记录表
-- ============================================================

CREATE TABLE reading_history (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL,
    article_id      BIGINT NOT NULL,
    read_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_duration   INT COMMENT '阅读时长（秒）',
    is_finished     BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, read_at)
);

-- ============================================================
-- 13. 堡垒主题表 (Fortress / Research Topics)
-- ============================================================

CREATE TABLE topics (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL,
    title           VARCHAR(200) NOT NULL COMMENT '课题名称，如：玻色因国产化进程',
    description     TEXT COMMENT '课题描述/初始假设',
    status          ENUM('active', 'archived', 'completed') DEFAULT 'active',
    current_version VARCHAR(20) DEFAULT '0.1' COMMENT '当前版本号',
    
    -- 关联的大类 (Channel)
    channel_key     VARCHAR(50) COMMENT '所属频道 key，如 beauty_alpha',
    
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_channel (user_id, channel_key)
);

-- ============================================================
-- 14. 主题版本更新表 (Topic Versioning)
-- ============================================================

CREATE TABLE topic_updates (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    topic_id        BIGINT NOT NULL,
    version         VARCHAR(20) NOT NULL COMMENT '版本号，如 1.0',
    content         LONGTEXT COMMENT '本版本的结论/报告内容',
    change_log      TEXT COMMENT '与上版本的差异摘要',
    
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    INDEX idx_topic (topic_id)
);

-- ============================================================
-- 15. 主题-证据关联表 (Evidence Links)
-- ============================================================

CREATE TABLE topic_evidences (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    topic_id        BIGINT NOT NULL,
    
    -- 证据源可以是高亮片段，也可以是整篇文章
    highlight_id    BIGINT COMMENT '如果是基于片段的证据',
    article_id      BIGINT COMMENT '如果是整篇推文',
    
    note            VARCHAR(500) COMMENT '证据说明/从推文中提取的那些事',
    confidence      ENUM('high', 'medium', 'low') DEFAULT 'high',
    
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    FOREIGN KEY (highlight_id) REFERENCES highlights(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    INDEX idx_topic_evidence (topic_id)
);

-- ============================================================
-- ER 关系图（Mermaid）
-- ============================================================
/*
erDiagram
    users ||--o{ notes : creates
    users ||--o{ highlights : creates
    users ||--o{ drafts : creates
    users ||--o{ user_subscriptions : has
    users ||--o{ reading_history : has
    
    articles ||--o{ article_tags : has
    articles ||--o{ article_impacts : has
    articles ||--o{ notes : referenced_by
    articles ||--o{ highlights : has
    articles ||--o{ reading_history : tracked_in
    
    notes ||--o{ note_tags : has
    notes ||--o{ highlights : linked_to
    notes ||--o{ drafts : source_of
    
    drafts ||--o{ draft_tags : has
    
    tags ||--o{ article_tags : used_in
    tags ||--o{ note_tags : used_in
    tags ||--o{ draft_tags : used_in
*/

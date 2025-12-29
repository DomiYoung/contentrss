# 数据库跨设备同步指南

> **适用场景**：演示环境，本地SQLite数据库在家和公司两台机器间同步

---

## 📦 当前配置

**数据库类型**: SQLite
**数据库文件**: `backend/local.db`
**Git跟踪**: ✅ 已启用（通过 `.gitignore` 例外规则）

---

## 🔄 日常同步操作

### 在家里的机器（更新数据后）

```bash
cd ~/Desktop/2508code/contentrss

# 1. 查看数据库文件变化
git status

# 2. 提交数据库更新
git add backend/local.db
git commit -m "chore: 更新演示数据库 $(date +%Y-%m-%d)"

# 3. 推送到远程
git push
```

### 在公司的机器（获取最新数据）

```bash
cd ~/工作目录/contentrss

# 1. 拉取最新代码和数据
git pull

# 2. 确认数据库已更新
ls -lh backend/local.db

# 3. 启动后端验证
cd backend
source venv/bin/activate
python main.py
```

---

## ⚠️ 注意事项

### 1. 避免同时修改
- ❌ **禁止**在两台机器同时运行后端并修改数据库
- ✅ **正确做法**：确保只在一台机器上操作，完成后推送，再在另一台机器拉取

### 2. 冲突处理
如果出现Git冲突：
```bash
# 选择保留本地版本
git checkout --ours backend/local.db
git add backend/local.db

# 或选择保留远程版本
git checkout --theirs backend/local.db
git add backend/local.db

# 完成合并
git commit
```

### 3. 数据备份
每周执行一次完整备份：
```bash
# 导出SQL脚本
sqlite3 backend/local.db .dump > backup_$(date +%Y%m%d).sql

# 保存到安全位置
mv backup_*.sql ~/备份目录/
```

---

## 🚀 首次在新机器设置

```bash
# 1. 克隆仓库
git clone <仓库地址> contentrss
cd contentrss

# 2. 安装依赖
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env，确保 DATABASE_URL=sqlite:///local.db

# 4. 启动后端
python main.py
```

---

## 📊 数据库文件信息

| 属性 | 值 |
|:---|:---|
| 文件路径 | `backend/local.db` |
| 典型大小 | ~300KB |
| 更新频率 | 演示时手动更新 |
| Git跟踪 | ✅ 已启用 |
| 云端备份 | Git远程仓库 |

---

## 🔧 故障排查

### 问题1：Git提示数据库文件被忽略
```bash
# 强制添加
git add -f backend/local.db
```

### 问题2：数据库文件过大导致推送失败
```bash
# 检查文件大小
ls -lh backend/local.db

# 如果超过10MB，考虑清理历史数据
sqlite3 backend/local.db "DELETE FROM raw_articles WHERE ingested_at < date('now', '-30 days')"
```

### 问题3：拉取后数据库无法打开
```bash
# 验证文件完整性
sqlite3 backend/local.db "PRAGMA integrity_check;"

# 如果损坏，从备份恢复
sqlite3 backend/local.db < backup_latest.sql
```

---

## 💡 高级选项（可选）

### 使用云盘自动同步
```bash
# 移动到云盘并创建软链接
mv backend/local.db ~/坚果云/contentrss_db/local.db
ln -s ~/坚果云/contentrss_db/local.db backend/local.db
```

### 定期自动备份脚本
```bash
#!/bin/bash
# backup_db.sh
DATE=$(date +%Y%m%d)
sqlite3 backend/local.db .dump > ~/备份/contentrss_$DATE.sql
echo "✅ 数据库已备份: contentrss_$DATE.sql"
```

---

**创建时间**: 2025-12-29
**更新频率**: 按需更新
**负责人**: 演示环境维护者

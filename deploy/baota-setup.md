# 宝塔面板部署指南 - ContentRSS

## 1. 服务器要求

- Python 3.10+
- PostgreSQL 14+ (或使用现有 Railway 数据库)
- Nginx

---

## 2. 宝塔面板安装软件

在「软件商店」安装：
- [x] Python 项目管理器
- [x] Nginx
- [x] PostgreSQL（可选，如使用本地数据库）

---

## 3. 后端部署

### 3.1 上传代码

将 `backend/` 目录上传到服务器，例如：
```
/www/wwwroot/contentrss/backend/
```

### 3.2 创建 Python 项目

1. 打开「Python 项目管理器」
2. 点击「添加项目」
3. 配置：
   - 项目路径：`/www/wwwroot/contentrss/backend`
   - Python 版本：`3.10+`
   - 启动方式：`gunicorn`
   - 启动文件：`main:app`
   - 端口：`8000`
   - 启动参数：`-c gunicorn_config.py`

### 3.3 配置环境变量

在项目目录创建 `.env` 文件：

```bash
# AI 服务配置
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DEFAULT_MODEL=qwen-max

# 数据库配置（二选一）
# 方案 A: 继续用 Railway PostgreSQL
DATABASE_URL=postgresql://postgres:xxx@switchback.proxy.rlwy.net:59903/railway

# 方案 B: 使用本地 PostgreSQL
# DATABASE_URL=postgresql://user:password@localhost:5432/contentrss

# 特殊接口
SPECIAL_API_URL=https://gate.shjinjia.com.cn/api/databrain/Chat/http/special
SPECIAL_CHAIN_ID=1036
ACCESS_TOKEN=your_token

# CORS 配置（填写你的前端域名）
ALLOWED_ORIGINS=https://your-domain.com,http://localhost:5173
```

### 3.4 安装依赖

在「Python 项目管理器」中点击「模块」，安装：
```
flask>=3.0.0
flask-cors>=4.0.0
python-dotenv>=1.0.0
openai>=1.0.0
requests>=2.31.0
gunicorn>=21.2.0
psycopg2-binary>=2.9.0
```

或使用命令行：
```bash
cd /www/wwwroot/contentrss/backend
/www/server/pyproject_manager/versions/3.10.x/bin/pip install -r requirements.txt
```

---

## 4. Nginx 反向代理

### 4.1 后端 API

在宝塔「网站」中添加站点，例如 `api.your-domain.com`

修改 Nginx 配置：

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    # SSL（推荐）
    # listen 443 ssl;
    # ssl_certificate /path/to/cert.pem;
    # ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS 预检
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,Content-Type,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
```

### 4.2 前端静态文件

```bash
# 本地构建
cd frontend
npm run build
# 将 dist/ 目录上传到服务器
```

Nginx 配置：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /www/wwwroot/contentrss/frontend/dist;
    index index.html;

    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 5. 前端环境变量

构建前修改 `.env.production`：

```bash
VITE_API_URL=https://api.your-domain.com
```

---

## 6. 验证部署

```bash
# 测试后端
curl https://api.your-domain.com/api/health

# 期望返回
# {"success":true,"data":{"status":"ok","model":"qwen-max"}}
```

---

## 7. 常见问题

### Q: 502 Bad Gateway
- 检查 Python 项目是否正常运行
- 检查端口 8000 是否被占用

### Q: CORS 错误
- 检查 `.env` 中的 `ALLOWED_ORIGINS` 是否包含前端域名
- 检查 Nginx CORS 配置

### Q: 数据库连接失败
- 如使用 Railway，确保服务器能访问外网
- 如使用本地 PostgreSQL，检查连接参数

---

## 8. 性能预期

| 指标 | Railway | 宝塔（国内） |
|------|---------|-------------|
| API 延迟 | ~2000ms | ~50ms |
| 首屏加载 | ~5s | ~1s |
| 二次访问 | ~20ms (IndexedDB) | ~20ms (IndexedDB) |

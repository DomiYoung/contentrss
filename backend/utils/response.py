"""
统一 API 响应工具
基于 flask-expert 和 backend-expert Skills 最佳实践

响应格式规范:
- success: 请求是否成功
- data: 业务数据 (成功时)
- error: 错误信息 (失败时)
- meta: 元信息 (count, timestamp 等)
- request_id: 请求追踪 ID (用于日志关联)
"""

from flask import jsonify, request, g
from typing import Any, Optional, Dict
from functools import wraps
from datetime import datetime
import uuid


def get_request_id() -> str:
    """获取或生成请求追踪 ID"""
    if not hasattr(g, 'request_id'):
        # 优先使用客户端传入的 X-Request-ID
        g.request_id = request.headers.get('X-Request-ID') or str(uuid.uuid4())[:8]
    return g.request_id


def success(data: Any = None, meta: Optional[Dict[str, Any]] = None):
    """
    构建成功响应
    
    格式:
    {
        "success": true,
        "data": {...},
        "meta": {"count": 10, "timestamp": "...", ...},
        "request_id": "abc123"
    }
    """
    response = {
        "success": True,
        "request_id": get_request_id(),
    }
    if data is not None:
        response["data"] = data
    
    # 合并 meta，自动添加 timestamp
    response["meta"] = {
        "timestamp": datetime.now().isoformat(),
        **(meta or {})
    }
    
    return jsonify(response)


def error(code: str, message: str, status: int = 400, details: Optional[list] = None):
    """
    构建错误响应
    
    格式:
    {
        "success": false,
        "error": {
            "code": "VALIDATION_ERROR",
            "message": "用户可读的错误信息",
            "details": []
        },
        "meta": {"timestamp": "..."},
        "request_id": "abc123"
    }
    """
    error_obj = {
        "code": code,
        "message": message
    }
    if details:
        error_obj["details"] = details
    
    return jsonify({
        "success": False,
        "error": error_obj,
        "meta": {"timestamp": datetime.now().isoformat()},
        "request_id": get_request_id()
    }), status


# 常用错误快捷方法
def not_found(message: str = "Resource not found"):
    return error("NOT_FOUND", message, 404)


def bad_request(message: str = "Bad request"):
    return error("BAD_REQUEST", message, 400)


def unauthorized(message: str = "Unauthorized"):
    return error("UNAUTHORIZED", message, 401)


def internal_error(message: str = "Internal server error"):
    return error("INTERNAL_ERROR", message, 500)


def validation_error(message: str, details: Optional[list] = None):
    return error("VALIDATION_ERROR", message, 400, details)


def register_error_handlers(app):
    """
    注册全局错误处理器
    使用方式: register_error_handlers(app)
    """
    
    @app.errorhandler(400)
    def handle_bad_request(e):
        return error("BAD_REQUEST", str(e.description) if hasattr(e, 'description') else str(e), 400)
    
    @app.errorhandler(404)
    def handle_not_found(e):
        return error("NOT_FOUND", "Resource not found", 404)
    
    @app.errorhandler(401)
    def handle_unauthorized(e):
        return error("UNAUTHORIZED", "Unauthorized", 401)
    
    @app.errorhandler(500)
    def handle_internal(e):
        return error("INTERNAL_ERROR", "Internal server error", 500)
    
    @app.errorhandler(Exception)
    def handle_exception(e):
        # 记录异常（包含 request_id 便于追踪）
        req_id = get_request_id()
        print(f"❌ [{req_id}] Unhandled exception: {type(e).__name__}: {e}")
        return error("INTERNAL_ERROR", str(e), 500)


def validate_json(*required_fields):
    """
    请求 JSON 验证装饰器
    
    使用方式:
    @validate_json('article_id', 'device_id')
    def my_route():
        ...
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            data = request.get_json()
            if not data:
                return validation_error("JSON body required")
            missing = [field for field in required_fields if field not in data]
            if missing:
                return validation_error(f"Missing required fields: {missing}", missing)
            return f(*args, **kwargs)
        return wrapper
    return decorator

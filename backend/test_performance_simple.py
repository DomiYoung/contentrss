#!/usr/bin/env python3
"""
性能测试脚本 - /api/raw-data 接口 (简化版)

测试场景：
1. 缓存命中场景（数据已存在）
2. 日期筛选性能
3. 多分类连续请求
"""

import time
import statistics
from datetime import datetime
from typing import List, Dict, Any
import sys
import urllib.request
import urllib.error
import json

# 测试配置
BASE_URL = "http://localhost:5001"
API_ENDPOINT = f"{BASE_URL}/api/raw-data"
CATEGORIES = ["ai", "digital", "legal", "finance", "vc"]


class PerformanceMetrics:
    """性能指标收集器"""

    def __init__(self):
        self.response_times: List[float] = []
        self.success_count = 0
        self.error_count = 0
        self.total_items = 0

    def add_response(self, duration: float, success: bool, item_count: int = 0):
        self.response_times.append(duration)
        if success:
            self.success_count += 1
            self.total_items += item_count
        else:
            self.error_count += 1

    def get_summary(self) -> Dict[str, Any]:
        if not self.response_times:
            return {"error": "No data collected"}

        return {
            "total_requests": len(self.response_times),
            "success_count": self.success_count,
            "error_count": self.error_count,
            "total_items": self.total_items,
            "avg_response_time_ms": round(statistics.mean(self.response_times) * 1000, 2),
            "median_response_time_ms": round(statistics.median(self.response_times) * 1000, 2),
            "min_response_time_ms": round(min(self.response_times) * 1000, 2),
            "max_response_time_ms": round(max(self.response_times) * 1000, 2),
        }


def make_request(url: str, timeout: int = 5) -> tuple[float, bool, Dict]:
    """发起 HTTP 请求"""
    start_time = time.time()
    try:
        with urllib.request.urlopen(url, timeout=timeout) as response:
            duration = time.time() - start_time
            data = json.loads(response.read().decode('utf-8'))
            success = response.status == 200 and data.get("code") == "SUCCESS"
            return duration, success, data
    except Exception as e:
        duration = time.time() - start_time
        return duration, False, {"error": str(e)}


def test_cache_hit_scenario():
    """测试场景1: 缓存命中（多次访问同一分类）"""
    print("\n" + "="*70)
    print("📊 测试场景 1: 缓存命中性能（连续访问同一分类）")
    print("="*70)

    metrics = PerformanceMetrics()
    category = "legal"

    # 第一次请求（可能触发同步）
    print(f"\n🔄 预热请求...")
    duration, success, data = make_request(f"{API_ENDPOINT}?category={category}", timeout=30)
    if success:
        print(f"   预热完成，耗时: {duration*1000:.2f}ms")
    else:
        print(f"   ❌ 预热失败: {data.get('error')}")
        return

    # 连续 10 次请求（应该都是缓存命中）
    print(f"\n🚀 开始连续 10 次请求测试...")
    for i in range(10):
        duration, success, data = make_request(f"{API_ENDPOINT}?category={category}")

        item_count = 0
        if success:
            item_count = len(data.get("data", {}).get("items", []))
            metrics.add_response(duration, success, item_count)
            print(f"   第 {i+1:2d} 次: {duration*1000:6.2f}ms | 数据条数: {item_count:2d} | ✅")
        else:
            metrics.add_response(duration, False)
            print(f"   第 {i+1:2d} 次: {duration*1000:6.2f}ms | ❌ {data.get('error')}")

        # 稍微延迟避免瞬时压力
        time.sleep(0.1)

    # 输出统计
    summary = metrics.get_summary()
    print("\n" + "-"*70)
    print("📈 统计结果:")
    print(f"   总请求数: {summary['total_requests']}")
    print(f"   成功数: {summary['success_count']}")
    print(f"   失败数: {summary['error_count']}")
    print(f"   平均响应时间: {summary['avg_response_time_ms']:.2f}ms")
    print(f"   中位数响应时间: {summary['median_response_time_ms']:.2f}ms")
    print(f"   最小响应时间: {summary['min_response_time_ms']:.2f}ms")
    print(f"   最大响应时间: {summary['max_response_time_ms']:.2f}ms")
    print(f"   平均数据条数: {summary['total_items'] / summary['success_count']:.1f}" if summary['success_count'] > 0 else "   N/A")
    print("-"*70)

    # 性能评估
    avg_time = summary['avg_response_time_ms']
    if avg_time < 50:
        print("✅ 性能评级: 优秀 (< 50ms)")
    elif avg_time < 100:
        print("✅ 性能评级: 良好 (< 100ms)")
    elif avg_time < 200:
        print("⚠️  性能评级: 一般 (< 200ms)")
    else:
        print("❌ 性能评级: 需优化 (>= 200ms)")

    return summary


def test_date_filter_performance():
    """测试场景2: 日期筛选性能"""
    print("\n" + "="*70)
    print("📊 测试场景 2: 日期筛选性能")
    print("="*70)

    category = "legal"
    today = datetime.now().strftime("%Y-%m-%d")

    # 无筛选
    print(f"\n🔍 测试无日期筛选...")
    duration_no_filter, success, data = make_request(f"{API_ENDPOINT}?category={category}")
    if success:
        count_no_filter = len(data.get("data", {}).get("items", []))
        print(f"   耗时: {duration_no_filter*1000:.2f}ms | 数据条数: {count_no_filter}")
    else:
        print(f"   ❌ 失败: {data.get('error')}")
        return

    time.sleep(0.1)

    # 有筛选
    print(f"\n🔍 测试日期筛选 (date={today})...")
    duration_with_filter, success, data = make_request(f"{API_ENDPOINT}?category={category}&date={today}")
    if success:
        count_with_filter = len(data.get("data", {}).get("items", []))
        print(f"   耗时: {duration_with_filter*1000:.2f}ms | 数据条数: {count_with_filter}")
    else:
        print(f"   ❌ 失败: {data.get('error')}")
        return

    print("\n" + "-"*70)
    print("📈 对比结果:")
    print(f"   无筛选: {duration_no_filter*1000:.2f}ms ({count_no_filter} 条)")
    print(f"   有筛选: {duration_with_filter*1000:.2f}ms ({count_with_filter} 条)")

    overhead = duration_with_filter - duration_no_filter
    overhead_pct = (overhead / duration_no_filter) * 100 if duration_no_filter > 0 else 0
    print(f"   筛选开销: {overhead*1000:.2f}ms ({overhead_pct:+.1f}%)")
    print("-"*70)


def test_multi_category():
    """测试场景3: 多分类连续请求"""
    print("\n" + "="*70)
    print(f"📊 测试场景 3: 多分类连续请求（5个分类）")
    print("="*70)

    metrics = PerformanceMetrics()

    print(f"\n🚀 依次请求 5 个分类...")
    for i, category in enumerate(CATEGORIES):
        duration, success, data = make_request(f"{API_ENDPOINT}?category={category}")

        if success:
            item_count = len(data.get("data", {}).get("items", []))
            label = data.get("data", {}).get("label", category)
            metrics.add_response(duration, success, item_count)
            print(f"   {i+1}. {label:8s}: {duration*1000:6.2f}ms | 数据条数: {item_count:2d} | ✅")
        else:
            metrics.add_response(duration, False)
            print(f"   {i+1}. {category:8s}: {duration*1000:6.2f}ms | ❌ {data.get('error')}")

        time.sleep(0.1)

    # 输出统计
    summary = metrics.get_summary()
    print("\n" + "-"*70)
    print("📈 统计结果:")
    print(f"   总请求数: {summary['total_requests']}")
    print(f"   成功数: {summary['success_count']}")
    print(f"   失败数: {summary['error_count']}")
    print(f"   总数据条数: {summary['total_items']}")
    print(f"   平均响应时间: {summary['avg_response_time_ms']:.2f}ms")
    print(f"   最小响应时间: {summary['min_response_time_ms']:.2f}ms")
    print(f"   最大响应时间: {summary['max_response_time_ms']:.2f}ms")
    print("-"*70)


def main():
    """主测试流程"""
    print("\n" + "="*70)
    print(" 🚀 ContentRSS API 性能测试")
    print("="*70)
    print(f" 测试目标: {API_ENDPOINT}")
    print(f" 测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)

    # 检查服务是否可用
    try:
        duration, success, data = make_request(f"{BASE_URL}/health", timeout=3)
        if success or duration < 5:  # 即使没有 /health 端点，只要有响应就算可用
            print(f"\n✅ 服务可访问（响应时间: {duration*1000:.2f}ms）")
        else:
            raise Exception("服务不可用")
    except Exception as e:
        print(f"\n❌ 服务不可用: {e}")
        print("\n请先启动后端服务:")
        print("   cd backend && python3 main.py")
        sys.exit(1)

    # 执行测试场景
    try:
        summary1 = test_cache_hit_scenario()
        test_date_filter_performance()
        test_multi_category()

        # 总结
        print("\n" + "="*70)
        print(" 📋 测试总结")
        print("="*70)
        if summary1:
            print(f" 缓存命中场景平均响应时间: {summary1['avg_response_time_ms']:.2f}ms")
            print(f" 测试结论: ", end="")
            if summary1['avg_response_time_ms'] < 100:
                print("✅ 性能表现良好")
            else:
                print("⚠️  可能需要优化")
        print("="*70 + "\n")

    except KeyboardInterrupt:
        print("\n\n⚠️  测试被中断")
        sys.exit(0)


if __name__ == "__main__":
    main()

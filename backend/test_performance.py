#!/usr/bin/env python3
"""
性能测试脚本 - /api/raw-data 接口

测试场景：
1. 缓存命中场景（数据已存在）
2. 缓存未命中场景（触发同步）
3. 并发请求性能
4. 数据库查询性能分析
"""

import time
import asyncio
import aiohttp
import statistics
from datetime import datetime
from typing import List, Dict, Any
import sys

# 测试配置
BASE_URL = "http://localhost:5001"
API_ENDPOINT = f"{BASE_URL}/api/raw-data"
CATEGORIES = ["ai", "digital", "legal", "finance", "vc"]
CONCURRENT_REQUESTS = 10


class PerformanceMetrics:
    """性能指标收集器"""

    def __init__(self):
        self.response_times: List[float] = []
        self.success_count = 0
        self.error_count = 0
        self.cache_hit_count = 0
        self.cache_miss_count = 0

    def add_response(self, duration: float, success: bool, cache_hit: bool = None):
        self.response_times.append(duration)
        if success:
            self.success_count += 1
        else:
            self.error_count += 1

        if cache_hit is True:
            self.cache_hit_count += 1
        elif cache_hit is False:
            self.cache_miss_count += 1

    def get_summary(self) -> Dict[str, Any]:
        if not self.response_times:
            return {"error": "No data collected"}

        return {
            "total_requests": len(self.response_times),
            "success_count": self.success_count,
            "error_count": self.error_count,
            "avg_response_time_ms": round(statistics.mean(self.response_times) * 1000, 2),
            "median_response_time_ms": round(statistics.median(self.response_times) * 1000, 2),
            "p95_response_time_ms": round(statistics.quantiles(self.response_times, n=20)[18] * 1000, 2) if len(self.response_times) >= 20 else None,
            "p99_response_time_ms": round(statistics.quantiles(self.response_times, n=100)[98] * 1000, 2) if len(self.response_times) >= 100 else None,
            "min_response_time_ms": round(min(self.response_times) * 1000, 2),
            "max_response_time_ms": round(max(self.response_times) * 1000, 2),
            "cache_hit_count": self.cache_hit_count,
            "cache_miss_count": self.cache_miss_count,
        }


async def test_single_request(session: aiohttp.ClientSession, category: str) -> tuple[float, bool, int]:
    """测试单次请求"""
    start_time = time.time()
    try:
        async with session.get(f"{API_ENDPOINT}?category={category}") as response:
            data = await response.json()
            duration = time.time() - start_time

            success = response.status == 200 and data.get("code") == "SUCCESS"
            item_count = len(data.get("data", {}).get("items", []))

            return duration, success, item_count
    except Exception as e:
        duration = time.time() - start_time
        print(f"❌ 请求失败: {e}")
        return duration, False, 0


async def test_concurrent_requests(num_requests: int = 10) -> PerformanceMetrics:
    """测试并发请求性能"""
    metrics = PerformanceMetrics()

    async with aiohttp.ClientSession() as session:
        tasks = []
        for i in range(num_requests):
            category = CATEGORIES[i % len(CATEGORIES)]
            tasks.append(test_single_request(session, category))

        results = await asyncio.gather(*tasks)

        for duration, success, item_count in results:
            # 假设如果返回数据很快且有数据，则是缓存命中
            cache_hit = duration < 0.5 and item_count > 0
            metrics.add_response(duration, success, cache_hit)

    return metrics


def test_cache_hit_scenario():
    """测试场景1: 缓存命中（多次访问同一分类）"""
    print("\n" + "="*70)
    print("📊 测试场景 1: 缓存命中性能（连续访问同一分类）")
    print("="*70)

    metrics = PerformanceMetrics()

    import requests
    category = "legal"

    # 第一次请求（可能触发同步）
    print(f"\n🔄 预热请求...")
    start = time.time()
    try:
        response = requests.get(f"{API_ENDPOINT}?category={category}")
        duration = time.time() - start
        print(f"   预热完成，耗时: {duration*1000:.2f}ms")
    except Exception as e:
        print(f"   ❌ 预热失败: {e}")
        return

    # 连续 10 次请求（应该都是缓存命中）
    print(f"\n🚀 开始连续 10 次请求测试...")
    for i in range(10):
        start = time.time()
        try:
            response = requests.get(f"{API_ENDPOINT}?category={category}")
            duration = time.time() - start
            data = response.json()

            success = response.status_code == 200 and data.get("code") == "SUCCESS"
            item_count = len(data.get("data", {}).get("items", []))

            metrics.add_response(duration, success, cache_hit=True)

            print(f"   第 {i+1:2d} 次: {duration*1000:6.2f}ms | 数据条数: {item_count:2d} | ✅")
        except Exception as e:
            duration = time.time() - start
            metrics.add_response(duration, False, cache_hit=True)
            print(f"   第 {i+1:2d} 次: {duration*1000:6.2f}ms | ❌ {e}")

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


def test_concurrent_scenario():
    """测试场景2: 并发请求性能"""
    print("\n" + "="*70)
    print(f"📊 测试场景 2: 并发性能（{CONCURRENT_REQUESTS} 个并发请求）")
    print("="*70)

    print(f"\n🚀 发起 {CONCURRENT_REQUESTS} 个并发请求...")
    start_time = time.time()

    metrics = asyncio.run(test_concurrent_requests(CONCURRENT_REQUESTS))

    total_duration = time.time() - start_time

    summary = metrics.get_summary()
    print("\n" + "-"*70)
    print("📈 统计结果:")
    print(f"   总耗时: {total_duration*1000:.2f}ms")
    print(f"   总请求数: {summary['total_requests']}")
    print(f"   成功数: {summary['success_count']}")
    print(f"   失败数: {summary['error_count']}")
    print(f"   平均响应时间: {summary['avg_response_time_ms']:.2f}ms")
    print(f"   中位数响应时间: {summary['median_response_time_ms']:.2f}ms")
    print(f"   最小响应时间: {summary['min_response_time_ms']:.2f}ms")
    print(f"   最大响应时间: {summary['max_response_time_ms']:.2f}ms")
    print(f"   吞吐量: {summary['total_requests'] / total_duration:.2f} req/s")
    print("-"*70)


def test_date_filter_performance():
    """测试场景3: 日期筛选性能"""
    print("\n" + "="*70)
    print("📊 测试场景 3: 日期筛选性能")
    print("="*70)

    import requests

    category = "legal"
    today = datetime.now().strftime("%Y-%m-%d")

    # 无筛选
    print(f"\n🔍 测试无日期筛选...")
    start = time.time()
    try:
        response = requests.get(f"{API_ENDPOINT}?category={category}")
        duration_no_filter = time.time() - start
        data = response.json()
        count_no_filter = len(data.get("data", {}).get("items", []))
        print(f"   耗时: {duration_no_filter*1000:.2f}ms | 数据条数: {count_no_filter}")
    except Exception as e:
        print(f"   ❌ 失败: {e}")
        return

    # 有筛选
    print(f"\n🔍 测试日期筛选 (date={today})...")
    start = time.time()
    try:
        response = requests.get(f"{API_ENDPOINT}?category={category}&date={today}")
        duration_with_filter = time.time() - start
        data = response.json()
        count_with_filter = len(data.get("data", {}).get("items", []))
        print(f"   耗时: {duration_with_filter*1000:.2f}ms | 数据条数: {count_with_filter}")
    except Exception as e:
        print(f"   ❌ 失败: {e}")
        return

    print("\n" + "-"*70)
    print("📈 对比结果:")
    print(f"   无筛选: {duration_no_filter*1000:.2f}ms ({count_no_filter} 条)")
    print(f"   有筛选: {duration_with_filter*1000:.2f}ms ({count_with_filter} 条)")

    overhead = duration_with_filter - duration_no_filter
    overhead_pct = (overhead / duration_no_filter) * 100 if duration_no_filter > 0 else 0
    print(f"   筛选开销: {overhead*1000:.2f}ms ({overhead_pct:+.1f}%)")
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
    import requests
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=3)
        print(f"\n✅ 服务状态: {response.status_code}")
    except Exception as e:
        print(f"\n❌ 服务不可用: {e}")
        print("\n请先启动后端服务:")
        print("   cd backend && python main.py")
        sys.exit(1)

    # 执行测试场景
    try:
        test_cache_hit_scenario()
        test_concurrent_scenario()
        test_date_filter_performance()
    except KeyboardInterrupt:
        print("\n\n⚠️  测试被中断")
        sys.exit(0)

    print("\n" + "="*70)
    print(" ✅ 测试完成")
    print("="*70 + "\n")


if __name__ == "__main__":
    main()

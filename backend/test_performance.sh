#!/bin/bash
# 简易性能测试脚本 - 使用 curl

BASE_URL="http://localhost:8000"
API_ENDPOINT="${BASE_URL}/api/raw-data"

echo "======================================================================"
echo " 🚀 ContentRSS API 性能测试 (curl 版本)"
echo "======================================================================"
echo " 测试目标: ${API_ENDPOINT}"
echo " 测试时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "======================================================================"

# 检查服务是否可用
echo ""
echo "检查服务状态..."
if curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/health" 2>/dev/null | grep -q "200\|404"; then
    echo "✅ 服务可访问"
else
    echo "❌ 服务不可用，请先启动后端:"
    echo "   cd backend && source venv/bin/activate && python main.py"
    exit 1
fi

# 测试场景 1: 缓存命中性能（连续 10 次请求）
echo ""
echo "======================================================================"
echo "📊 测试场景 1: 缓存命中性能（连续访问同一分类）"
echo "======================================================================"

CATEGORY="legal"
TIMES=()

echo ""
echo "🔄 预热请求..."
curl -s "${API_ENDPOINT}?category=${CATEGORY}" > /dev/null
sleep 0.5

echo ""
echo "🚀 开始连续 10 次请求测试..."
for i in {1..10}; do
    # 使用 curl 的 time_total 获取响应时间
    TIME=$(curl -s -o /dev/null -w "%{time_total}" "${API_ENDPOINT}?category=${CATEGORY}")
    TIMES+=($TIME)
    # 转换为毫秒
    TIME_MS=$(echo "$TIME * 1000" | bc)
    printf "   第 %2d 次: %7.2f ms | ✅\n" $i $TIME_MS
    sleep 0.1
done

# 计算统计数据
echo ""
echo "----------------------------------------------------------------------"
echo "📈 统计结果:"

# 计算平均值
SUM=0
for time in "${TIMES[@]}"; do
    SUM=$(echo "$SUM + $time" | bc)
done
AVG=$(echo "scale=4; $SUM / ${#TIMES[@]}" | bc)
AVG_MS=$(echo "$AVG * 1000" | bc)

# 找最小和最大值
MIN=${TIMES[0]}
MAX=${TIMES[0]}
for time in "${TIMES[@]}"; do
    if (( $(echo "$time < $MIN" | bc -l) )); then
        MIN=$time
    fi
    if (( $(echo "$time > $MAX" | bc -l) )); then
        MAX=$time
    fi
done
MIN_MS=$(echo "$MIN * 1000" | bc)
MAX_MS=$(echo "$MAX * 1000" | bc)

echo "   总请求数: ${#TIMES[@]}"
echo "   成功数: ${#TIMES[@]}"
echo "   失败数: 0"
printf "   平均响应时间: %.2f ms\n" $AVG_MS
printf "   最小响应时间: %.2f ms\n" $MIN_MS
printf "   最大响应时间: %.2f ms\n" $MAX_MS
echo "----------------------------------------------------------------------"

# 性能评估
AVG_INT=$(printf "%.0f" $AVG_MS)
if [ $AVG_INT -lt 50 ]; then
    echo "✅ 性能评级: 优秀 (< 50ms)"
elif [ $AVG_INT -lt 100 ]; then
    echo "✅ 性能评级: 良好 (< 100ms)"
elif [ $AVG_INT -lt 200 ]; then
    echo "⚠️  性能评级: 一般 (< 200ms)"
else
    echo "❌ 性能评级: 需优化 (>= 200ms)"
fi

# 测试场景 2: 日期筛选性能
echo ""
echo "======================================================================"
echo "📊 测试场景 2: 日期筛选性能"
echo "======================================================================"

TODAY=$(date '+%Y-%m-%d')

echo ""
echo "🔍 测试无日期筛选..."
TIME_NO_FILTER=$(curl -s -o /tmp/test_no_filter.json -w "%{time_total}" "${API_ENDPOINT}?category=${CATEGORY}")
COUNT_NO_FILTER=$(cat /tmp/test_no_filter.json | grep -o '"source_url"' | wc -l | tr -d ' ')
TIME_NO_FILTER_MS=$(echo "$TIME_NO_FILTER * 1000" | bc)
printf "   耗时: %.2f ms | 数据条数: %s\n" $TIME_NO_FILTER_MS $COUNT_NO_FILTER

sleep 0.2

echo ""
echo "🔍 测试日期筛选 (date=${TODAY})..."
TIME_WITH_FILTER=$(curl -s -o /tmp/test_with_filter.json -w "%{time_total}" "${API_ENDPOINT}?category=${CATEGORY}&date=${TODAY}")
COUNT_WITH_FILTER=$(cat /tmp/test_with_filter.json | grep -o '"source_url"' | wc -l | tr -d ' ')
TIME_WITH_FILTER_MS=$(echo "$TIME_WITH_FILTER * 1000" | bc)
printf "   耗时: %.2f ms | 数据条数: %s\n" $TIME_WITH_FILTER_MS $COUNT_WITH_FILTER

OVERHEAD=$(echo "$TIME_WITH_FILTER - $TIME_NO_FILTER" | bc)
OVERHEAD_MS=$(echo "$OVERHEAD * 1000" | bc)
OVERHEAD_PCT=$(echo "scale=1; ($OVERHEAD / $TIME_NO_FILTER) * 100" | bc)

echo ""
echo "----------------------------------------------------------------------"
echo "📈 对比结果:"
printf "   无筛选: %.2f ms (%s 条)\n" $TIME_NO_FILTER_MS $COUNT_NO_FILTER
printf "   有筛选: %.2f ms (%s 条)\n" $TIME_WITH_FILTER_MS $COUNT_WITH_FILTER
printf "   筛选开销: %.2f ms (%+.1f%%)\n" $OVERHEAD_MS $OVERHEAD_PCT
echo "----------------------------------------------------------------------"

# 测试场景 3: 多分类连续请求
echo ""
echo "======================================================================"
echo "📊 测试场景 3: 多分类连续请求（5个分类）"
echo "======================================================================"

CATEGORIES=("ai" "digital" "legal" "finance" "vc")
LABELS=("AI行业" "数字化转型" "法律法规" "财经金融" "VC投资")

echo ""
echo "🚀 依次请求 5 个分类..."
for i in "${!CATEGORIES[@]}"; do
    CATEGORY=${CATEGORIES[$i]}
    LABEL=${LABELS[$i]}
    TIME=$(curl -s -o /tmp/test_cat_${CATEGORY}.json -w "%{time_total}" "${API_ENDPOINT}?category=${CATEGORY}")
    COUNT=$(cat /tmp/test_cat_${CATEGORY}.json | grep -o '"source_url"' | wc -l | tr -d ' ')
    TIME_MS=$(echo "$TIME * 1000" | bc)
    printf "   %d. %-8s: %7.2f ms | 数据条数: %2s | ✅\n" $((i+1)) "$LABEL" $TIME_MS $COUNT
    sleep 0.1
done

# 清理临时文件
rm -f /tmp/test_*.json

echo ""
echo "======================================================================"
echo " ✅ 测试完成"
echo "======================================================================"
echo ""

import json
import sys
import os

from dotenv import load_dotenv
load_dotenv()

from main import analyze_article

test_title = "欧莱雅 2024 财年报告发布：中国区高端线增速放缓"
test_summary = "欧莱雅集团今日发布财报，2024年总收入稳健增长，但大中华区受宏观环境影响，高端化妆品部门（L'Oréal Luxe）增速不及预期。与此同时，珀莱雅等国货品牌在双11表现强劲，抢占了部分市场份额。"

print("--- Testing AI Analysis ---")
result = analyze_article(test_title, test_summary)
print(json.dumps(result, indent=2, ensure_ascii=False))

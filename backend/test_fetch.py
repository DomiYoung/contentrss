import requests
import os
from dotenv import load_dotenv

load_dotenv()

SPECIAL_API_URL = os.getenv('SPECIAL_API_URL')
SPECIAL_CHAIN_ID = int(os.getenv('SPECIAL_CHAIN_ID', '1036'))
ACCESS_TOKEN = os.getenv('ACCESS_TOKEN')

print(f"URL: {SPECIAL_API_URL}")
print(f"ID: {SPECIAL_CHAIN_ID}")

headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {ACCESS_TOKEN}'
}
payload = {
    "content": "内容",
    "chainId": SPECIAL_CHAIN_ID,
    "sync": True
}

try:
    resp = requests.post(SPECIAL_API_URL, json=payload, headers=headers, timeout=10)
    print(f"Status: {resp.status_code}")
    print(f"Body: {resp.text[:500]}...")
except Exception as e:
    print(f"Error: {e}")

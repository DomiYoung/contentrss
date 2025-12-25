# Data View 飞书多维表格 API 配置

> **Version**: 1.0 | **Created**: 2024-12-24
> **API Endpoint**: `POST https://gate.shjinjia.com.cn/api/databrain/Component/feishu-bitable`

---

## 1. API 规格

### 1.1 Request

```bash
curl --location --request POST 'https://gate.shjinjia.com.cn/api/databrain/Component/feishu-bitable' \
--header 'Content-Type: application/json' \
--data-raw '{
  "url": "<feishu_bitable_url>"
}'
```

### 1.2 Base Table (共用)

```
Table ID: tblhLWzHm8GiU8Gg
Wiki URL: https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f
```

---

## 2. 分类视图配置

| 分类 | View ID | 完整 URL | Icon |
|:---|:---|:---|:---|
| **法律法规** | `vewZFBbw0U` | `https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?from=space_search&table=tblhLWzHm8GiU8Gg&view=vewZFBbw0U` | ⚖️ |
| **数字化** | `vew8Csw1Hy` | `https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?from=space_search&table=tblhLWzHm8GiU8Gg&view=vew8Csw1Hy` | 💻 |
| **品牌** | `vewStcRQN1` | `https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?table=tblhLWzHm8GiU8Gg&view=vewStcRQN1` | 🏷️ |
| **新品研发** | `vewUfRT8TF` | `https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?table=tblhLWzHm8GiU8Gg&view=vewUfRT8TF` | 🧪 |
| **国际形势** | `vewoJhF5lw` | `https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?table=tblhLWzHm8GiU8Gg&view=vewoJhF5lw` | 🌍 |
| **行业洞察** | `vewT0pFYJl` | `https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?table=tblhLWzHm8GiU8Gg&view=vewT0pFYJl` | 📊 |
| **AI** | `vewqkJUW4I` | `https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?table=tblhLWzHm8GiU8Gg&view=vewqkJUW4I` | 🤖 |
| **企业管理** | `vewxoauaTX` | `https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?table=tblhLWzHm8GiU8Gg&view=vewxoauaTX` | 🏢 |

---

## 3. 前端配置常量

```typescript
// frontend/src/lib/data-categories.ts

export const DATA_API_ENDPOINT = 'https://gate.shjinjia.com.cn/api/databrain/Component/feishu-bitable';

export const DATA_CATEGORIES = [
  {
    id: 'legal',
    label: '法律法规',
    icon: '⚖️',
    viewId: 'vewZFBbw0U',
    url: 'https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?from=space_search&table=tblhLWzHm8GiU8Gg&view=vewZFBbw0U',
    color: '#6366F1', // Indigo
  },
  {
    id: 'digital',
    label: '数字化',
    icon: '💻',
    viewId: 'vew8Csw1Hy',
    url: 'https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?from=space_search&table=tblhLWzHm8GiU8Gg&view=vew8Csw1Hy',
    color: '#0EA5E9', // Sky
  },
  {
    id: 'brand',
    label: '品牌',
    icon: '🏷️',
    viewId: 'vewStcRQN1',
    url: 'https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?table=tblhLWzHm8GiU8Gg&view=vewStcRQN1',
    color: '#EC4899', // Pink
  },
  {
    id: 'rnd',
    label: '新品研发',
    icon: '🧪',
    viewId: 'vewUfRT8TF',
    url: 'https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?table=tblhLWzHm8GiU8Gg&view=vewUfRT8TF',
    color: '#8B5CF6', // Violet
  },
  {
    id: 'global',
    label: '国际形势',
    icon: '🌍',
    viewId: 'vewoJhF5lw',
    url: 'https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?table=tblhLWzHm8GiU8Gg&view=vewoJhF5lw',
    color: '#14B8A6', // Teal
  },
  {
    id: 'industry',
    label: '行业洞察',
    icon: '📊',
    viewId: 'vewT0pFYJl',
    url: 'https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?table=tblhLWzHm8GiU8Gg&view=vewT0pFYJl',
    color: '#F59E0B', // Amber
  },
  {
    id: 'ai',
    label: 'AI',
    icon: '🤖',
    viewId: 'vewqkJUW4I',
    url: 'https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?table=tblhLWzHm8GiU8Gg&view=vewqkJUW4I',
    color: '#10B981', // Emerald
  },
  {
    id: 'management',
    label: '企业管理',
    icon: '🏢',
    viewId: 'vewxoauaTX',
    url: 'https://fk5i1eajro.feishu.cn/wiki/RtuNwGXBUiMRzXkE3sQcHFhvn1f?table=tblhLWzHm8GiU8Gg&view=vewxoauaTX',
    color: '#64748B', // Slate
  },
] as const;

export type DataCategoryId = typeof DATA_CATEGORIES[number]['id'];
```

---

## 4. API 调用示例

```typescript
// frontend/src/lib/api.ts

import { DATA_API_ENDPOINT, DATA_CATEGORIES, DataCategoryId } from './data-categories';

export async function fetchBitableData(categoryId: DataCategoryId) {
  const category = DATA_CATEGORIES.find(c => c.id === categoryId);
  if (!category) throw new Error(`Unknown category: ${categoryId}`);

  const response = await fetch(DATA_API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: category.url }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
```

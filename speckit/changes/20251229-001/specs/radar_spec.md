# Spec: Entity Radar Data Model

## ADDED [EntityService](file:///Users/domiyoung___/Desktop/2508code/contentrss/backend/services/entities.py)
```python
class EntityService:
    def get_radar_data(self):
        # 1. Fetch recent raw_articles with ai_impacts
        # 2. Parse JSON impacts
        # 3. Aggregate metrics per entity:
        #    - Sentiment: [-1, 1] mapped to [0, 100]
        #    - Volume: Count normalized
        #    - Momentum: Time-decayed frequency
        #    - Volatility: Variance of sentiment
        #    - Scope: Unique category_key count
        # 4. Return top 10-20 entities
```

## ADDED [api.ts](file:///Users/domiyoung___/Desktop/2508code/contentrss/frontend/src/lib/api.ts)
```typescript
export interface EntityRadarData {
    name: string;
    dimensions: {
        sentiment: number; // 0-100
        volume: number;
        momentum: number;
        volatility: number;
        scope: number;
    };
}

export const fetchEntityRadar = async (): Promise<EntityRadarData[]> => { ... }
```

# Data Model: Intelligence Engine

## Entities

### `Polarity` (Enum)
- `positive`: Good news, bullish.
- `negative`: Bad news, bearish.
- `neutral`: Neutral, watch-list.

### `Impact` (Struct)
- `entity`: String (The company/person affected, e.g., "LVMH").
- `trend`: Enum ["up", "down"] (Direction of impact).
- `reason`: String (Short explanation, e.g., "Gained strategic control").

### `IntelligenceCard` (Aggregate)
- `id`: Integer (Unique ID).
- `title`: String (Headline).
- `polarity`: `Polarity`.
- `fact`: String (The core event).
- `impacts`: List<`Impact`>.
- `opinion`: String (Curator/AI Insight).
- `tags`: List<String> (e.g., ["#Luxury", "#M&A"]).
- `source_name`: String (e.g., "Bloomberg").
- `source_url`: String (URL to original).
- `created_at`: Datetime.

## Relationships
- One `IntelligenceCard` has Many `Impacts`.
- One `IntelligenceCard` has Many `Tags`.

# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview

ContentRSS is an "Industry Intelligence OS" that ingests raw articles, runs AI analysis to produce structured intelligence cards, and exposes them via a mobile-first H5 frontend.

- **Frontend**: React 19 + Vite 7 + TypeScript + TailwindCSS + framer-motion
- **Backend**: Flask (Python) with an OpenAI-compatible client and SQLite/PostgreSQL
- **Data**: Raw articles and AI analysis cached in `raw_articles`, with tags/topics for higher-level structures
- **Specs-first**: Major features are specified in `specs/**` (including OpenAPI contracts) and reflected in backend models and frontend types.

Key project docs (used by other AI agents but also useful reference):

- `CLAUDE.md` / `AGENTS.md`: describe the OpenSkills-based workflow (e.g. `frontend-expert`, `backend-expert`, `webapp-testing`, `senior-analyst`) and the requirement to auto-load relevant skills.
- `docs/workflows/ANTIGRAVITY_AUTO_SKILLS.md`: enforces “if a skill might apply, load it” for complex work.
- `docs/agent-evolution/GEMINI.md` and `docs/agent-evolution/AGENT_EVOLUTION_DESIGN.md`: spec-first development, evolution logs, and self-improvement rules for agents.
- `specs/intelligence/skill_evolution.md`: design of the intelligence/feedback loop that ties UI interactions (Ask AI, NotePad, swipe-to-ignore) back into model/skill evolution.

When adding or changing non-trivial behaviour, prefer to align with the relevant spec under `specs/**` before touching code.

## Commands & workflows

All commands are relative to the repo root unless noted.

### Environment & backend setup

Backend lives in `backend/` and uses `.env` (via `python-dotenv`) for configuration.

Essential environment variables:

- `OPENAI_API_KEY`, `OPENAI_BASE_URL` – required for AI analysis in `backend/main.py`.
- `DEFAULT_MODEL` – optional, defaults to `qwen-max`.
- `SPECIAL_API_URL`, `SPECIAL_CHAIN_ID`, `ACCESS_TOKEN` – required for the **Special** data ingestion API.
- `DATABASE_URL` – optional; if unset the backend uses local SQLite (`backend/local.db`). If set to `postgres://...`/`postgresql://...`, it connects to Postgres/Supabase.

Typical one-time backend setup:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv/Scripts/activate on Windows
pip install -r requirements.txt
```

To initialize the local database schema explicitly (SQLite or Postgres):

```bash
cd backend
python database.py  # runs init_db()
```

> Note: running `python main.py` or starting the app under Gunicorn will also call `init_db()` on startup.

### Frontend setup

Frontend lives in `frontend/` and uses pnpm (preferred) with a Vite + React + Tailwind toolchain.

Install dependencies:

```bash
cd frontend
pnpm install
```

### Running the app locally

#### Option 1: Full-stack helper script (recommended)

```bash
./start-app.sh
```

This script:

- Activates `backend/venv` and runs `python3 main.py` (Flask dev server on `http://localhost:8000`).
- Starts the Vite dev server via `pnpm dev` in `frontend/`.

> The script’s log mentions port 5173, but the current `vite.config.ts` sets `server.port = 16888`. Expect the frontend at `http://localhost:16888` unless you override the port.

#### Option 2: Run backend and frontend manually

Backend (Flask dev server, auto DB init):

```bash
cd backend
source venv/bin/activate
python main.py  # http://localhost:8000
```

Production-style backend (Gunicorn, e.g. for local prod parity):

```bash
cd backend
source venv/bin/activate
gunicorn -c gunicorn_config.py main:app
```

Frontend dev server (honouring `vite.config.ts`):

```bash
cd frontend
pnpm dev  # default: http://localhost:16888
```

If you need the app on `http://localhost:5173` (e.g. to match the Playwright regression test), you can override the port:

```bash
cd frontend
pnpm dev --port 5173
```

### Build, lint, preview (frontend)

From `frontend/`:

- Build production bundle:

  ```bash
  pnpm build
  ```

- Run ESLint:

  ```bash
  pnpm lint
  ```

- Preview built app:

  ```bash
  pnpm preview
  ```

### Backend utilities & quick tests

From `backend/` with the virtualenv activated:

- Smoke-test AI analysis pipeline against the configured model:

  ```bash
  python test_ai.py
  ```

- Smoke-test the external Special API & credentials:

  ```bash
  python test_fetch.py
  ```

These are simple scripts, not pytest suites; they print diagnostics to stdout.

### Playwright V2 regression test

End-to-end regression is defined in `tests/v2_regression_test.py` using Python Playwright.

Requirements:

- Python Playwright installed in some environment with access to the running frontend:

  ```bash
  pip install playwright
  playwright install
  ```

- Vite dev server reachable at `http://localhost:5173` (either by starting with `pnpm dev --port 5173` or by updating the test).

To run the regression suite from the repo root:

```bash
python tests/v2_regression_test.py
```

This script will:

- Open the app in a Chromium viewport approximating an iPhone 13.
- Verify V2 visual and interaction behaviour (background colour, swipe-to-ignore, NotePad persistence, Ask AI overlay).

### Running a single targeted test

Examples:

- Run only the backend AI analysis smoke test:

  ```bash
  cd backend
  source venv/bin/activate
  python test_ai.py
  ```

- Run only the Playwright regression (with the app already running):

  ```bash
  cd /path/to/contentrss
  python tests/v2_regression_test.py
  ```

## High-level architecture

### Backend (Flask intelligence API)

Main entrypoint: `backend/main.py`.

- **App & config**
  - Creates a Flask app with CORS origins from `ALLOWED_ORIGINS` (defaults include local dev hosts).
  - Initializes an OpenAI-compatible `OpenAI` client from `OPENAI_API_KEY`/`OPENAI_BASE_URL`.
  - Uses `DEFAULT_MODEL` (default `qwen-max`) for AI calls and `SPECIAL_API_URL`/`SPECIAL_CHAIN_ID`/`ACCESS_TOKEN` for the external "Special" data source.

- **Database layer** (`backend/database.py`)
  - Chooses SQLite vs. Postgres based on `DATABASE_URL`.
  - Provides `get_db_connection()` and `get_placeholder()` to hide driver differences.
  - Defines full DDL for `tags`, `topics`, `topic_evidences`, `topic_updates`, `raw_articles`, and `reading_records` for both SQLite and Postgres.
  - `init_db()` applies schema and seeds demo data (tags + two starter topics) and logs topic count.

- **Tag system**
  - `backend/services/tag_service.py` reads category tags from the `tags` table and exposes:
    - `get_category_mapping()` → `{tag_key: name}` map, used throughout `main.py` for category labels.
    - Cached lookup by key/id.
  - `backend/tags.py` defines an in-memory `Tag` dataclass and `CATEGORY_TAGS` / `CATEGORY_MAP` used primarily by `/api/tags` to return a unified tag taxonomy.

- **Raw article ingestion & caching**
  - `fetch_special_data()` calls the external Special API using `SPECIAL_API_URL`/`ACCESS_TOKEN` and returns raw JSON.
  - `parse_special_response()` flattens nested responses to a usable dict.
  - `_coerce_special_payload()` normalizes variations in payload structure into a `{category_key: [items...]}` map.
  - `normalize_article()` converts noisy article payloads into a normalized record with deterministic `id`, `title`, `summary`, `content`, `source_name`, `source_url`, and `category_key`.
  - `persist_raw_items()` writes normalized items + raw payload into `raw_articles`, using `INSERT OR REPLACE` for SQLite and `ON CONFLICT` upserts for Postgres.
  - `fetch_all_raw_articles_with_metadata()` is the core read path: a window-function query per category that returns the latest N articles and their `ingested_at` timestamps, used to drive both the UI and caching logic.
  - `get_raw_articles_by_category()` fetches all categories in a single query, determines which categories need fresh sync (by comparing last `ingested_at` to today), and optionally re-calls the Special API and re-populates `raw_articles` before returning a `{category_key: [payloads...]}` dict.

- **AI analysis & intelligence cards**
  - `analyze_article()` loads a system prompt from `backend/prompts/analyst_v1.md` (fallback to a simple English system string) and calls the model to produce a JSON analysis payload. It un-wraps Markdown code fences if present and normalizes older fields (e.g. `actionable_insight` → `opinion`).
  - `get_cached_analysis()` / `save_analysis_cache()` implement a lightweight cache of AI results in `raw_articles` (`ai_polarity`, `ai_impacts`, `ai_opinion`, `ai_tags`, `ai_analyzed_at`), avoiding repeated calls when the same `source_url` is seen again.
  - `build_intelligence_cards()` is the main engine behind `/api/intelligence` and `/api/feed`:
    - Iterates over normalized articles (optionally filtered by category).
    - Applies cached or fresh AI analysis per article.
    - Attaches human-readable category labels via `get_category_label()`.
    - Produces a list of flat intelligence card dicts compatible with the OpenAPI specs in `specs/001-intelligence-engine` and `specs/002-detail-and-viral`.
  - `build_summary_payload()` converts the analysis into a compact JSON summary (`thesis`, `facts`, `sentiment`), stored in the `summary` field for the detail view.

- **Entities, channels, topics**
  - `backend/services/entities.py` defines an `Entity` Pydantic model and a mock `EntityService` with in-memory `MOCK_ENTITIES` and `USER_SUBSCRIPTIONS` for the Entity Radar feature. It powers:
    - `GET /api/entities` – list of entities with `is_subscribed` tailored to `USER_SUBSCRIPTIONS`.
    - `POST /api/entities/toggle/<entity_id>` – toggles subscription in memory.
  - `backend/services/analyst.py` defines Pydantic models (`Polarity`, `Impact`, `IntelligenceCard`, `ArticleDetail`, `DailyBriefing`, etc.) and a mock `AnalystService` with high-fidelity example data. This mirrors the contracts under `specs/001` and `specs/002` and is useful as a reference for how responses should look.
  - `backend/channels.py` defines `Channel` and `ChannelService` for domain-specific "channels" (e.g. `beauty_alpha`, `tech_edge`) with expert knowledge bases and prompt templates; currently not wired into public routes but used conceptually for future channelized analysis.
  - `backend/topics.py` (`TopicService`) provides a small data-access layer for the "Fortress" topics system: `topics`, `topic_evidences`, and `topic_updates` tables. It centralizes placeholder substitution and returns plain dicts, and exposes routes under `/api/topics` (list/create, detail, add evidence, add version updates).

- **Unified API responses & error handling**
  - `backend/utils/response.py` defines helpers:
    - `success(data, meta)` – wraps responses as `{success, data, meta, request_id}` and auto-adds a timestamp and a per-request `request_id` (from `X-Request-ID` or a random UUID).
    - `error(...)` and shortcuts like `bad_request`, `not_found`, `internal_error` – return standardized error envelopes.
    - `register_error_handlers(app)` – installs global Flask error handlers that always return the unified envelope and log unhandled exceptions with `request_id`.
    - `validate_json(*fields)` – decorator to enforce required JSON fields for POST endpoints (used by `/api/reading-record`).

- **Key routes** (non-exhaustive but important for understanding flows):
  - `GET /api/health` – simple health check with current `DEFAULT_MODEL`.
  - `POST /api/sync/trigger` – triggers a full sync of raw data (guarded by optional `X-Cron-Key` header / `CRON_SECRET`).
  - `GET /api/sync/status` – per-category last-sync timestamps.
  - `GET /api/raw-data` – raw ingested items by `category` key; backing the Data Center view.
  - `GET /api/intelligence` – unified intelligence feed for the main home view (wrapped in the `success()` envelope).
  - `GET /api/feed` – legacy, array-only feed, kept for backward compatibility.
  - `GET /api/article/<id>` – detail view payload including `summary` (The Brain TL;DR), `content`, and metadata.
  - `GET /api/categories` / `GET /api/tags` / `GET /api/tags/article/<id>` – category & tag metadata (with some mock data for article tags).
  - `POST /api/reading-record` / `GET /api/reading-stats` – reading telemetry endpoints used by the frontend hook `useReadingTracker`.
  - `GET /api/entities` / `POST /api/entities/toggle/<id>` – Entity Radar.
  - `GET /api/briefing/daily` – Daily Briefing payload consumed by the `DailyBriefing` view.

### Frontend (mobile-first H5 UI)

The frontend is a single-page React app with view switching handled inside `frontend/src/App.tsx`.

- **Entry & layout**
  - `src/main.tsx` mounts `<App />` into `#root`.
  - `src/App.tsx` manages:
    - Current bottom-nav tab (`home`, `subscribe`, `briefing`, `data`, `profile`, plus `my-notes`).
    - A lightweight view state (`feed` vs. `detail` vs. `briefing`) for the article detail flow.
    - Composition of the header (`Header`) and bottom nav (`BottomNav`).

- **Views** (`src/views`)
  - `IntelligenceView.tsx` – home feed of intelligence cards backed by `fetchIntelligence()`.
  - `ArticleDetail.tsx` – detail page integrating:
    - AI summary (The Brain card),
    - Long-form article content,
    - Bottom action bar (`BottomBar`) with "Share Poster", "NotePad", and "Ask AI" overlays,
    - Swipe-to-go-back gesture using `framer-motion`.
  - `DailyBriefing.tsx` – Lenny-style daily briefing UI consuming `/api/briefing/daily`.
  - `EntityRadar.tsx` – subscription management UI for entities, mapping `Entity` types to icons/colours and calling `/api/entities` and `/api/entities/toggle/<id>`.
  - `DataView.tsx` – raw data / Master Ledger view (backed by `/api/raw-data` and the data-categories definitions).
  - `MyNotes.tsx` & `ProfilePage.tsx` – user notes and profile/dashboard experiences.

- **Components** (`src/components`)
  - `IntelligenceCard.tsx`, `CompactCard.tsx`, `IntelligenceSkeleton.tsx` – card-level primitives for the feed.
  - `article/*` – detail-page overlays and supporting components: `AskAIOverlay`, `NotePad`, `BottomBar`, `FrameworkVisual`, etc.
  - `layout/*` – `Header`, `BottomNav`, `RadarPulse` and other layout primitives.
  - `viral/PosterOverlay.tsx` – share poster overlay implementation for viral growth.

- **API client & caching** (`src/lib`)
  - `api.ts` encapsulates all HTTP calls:
    - Uses a fixed `BACKEND_BASE_URL` pointing at the production Railway deployment for most calls (`/api/intelligence`, `/api/feed`, `/api/article`, `/api/entities`, `/api/briefing/daily`, etc.).
    - Exposes higher-level helpers: `fetchIntelligence`, `fetchArticle`, `fetchEntities`, `toggleSubscription`, `fetchDailyBriefing`, `fetchRawData`, and a Special Chat helper `fetchSpecialChat`.
    - Defines TypeScript interfaces (`IntelligenceResponse`, `IntelligenceCard`, `SpecialChatResponse`), aligned with the backend Pydantic models and OpenAPI specs.
    - Uses `fetchWithCache` from `cache.ts` for selected endpoints, leveraging IndexedDB and `ingested_at`-aware expiry (refreshes when the backend data is not from "today").
  - `cache.ts` implements a small IndexedDB-based cache keyed by API call, with smart invalidation based on `ingested_at` dates.
  - `data-categories.ts` provides a catalog of Bitable data sources for the Data Center, used by `fetchBitableData`.
  - `haptic.ts` wraps `navigator.vibrate` into semantic haptic patterns (`light`, `medium`, `heavy`, `success`, etc.), used liberally in UI interactions.

- **Reading telemetry**
  - `hooks/useReadingTracker.ts` maintains per-article reading time per device:
    - Generates a stable `device_id` in `localStorage`.
    - Tracks active reading time across visibility changes and page unload.
    - Calls `/api/reading-record` on unmount or completion.
    - Offers `getCurrentDuration()` and formatted duration strings for UI.

- **Styling & theming**
  - TailwindCSS is configured via `tailwind.config.js` and `index.css`.
  - The design system emphasises a "paper cream" aesthetic and Apple-style microinteractions, as detailed in `docs/design-system/*` and `docs/v2-design/*`.

### Specifications & contracts

The `specs/` directory encodes the spec-first workflow referenced in `GEMINI.md`:

- `specs/001-intelligence-engine/` – defines the Intelligence Engine and feed:
  - `spec.md` – background, goals, and user stories for intelligence cards and the feed.
  - `contracts/api-spec.json` – OpenAPI definition for `/api/feed` and the `IntelligenceCard` schema.
- `specs/002-detail-and-viral/` – detail view and viral poster mechanics:
  - `spec.md` – requirements for The Brain, the detail page, and viral poster overlay.
  - `contracts/api-spec.json` – OpenAPI for `/api/feed` and `/api/article/{id}` with `ArticleDetail` extending `IntelligenceCard`.
- `specs/003-entity-radar/`, `specs/004-editorial-briefing/`, `specs/005-lenny-style/` – specs for Entity Radar, Daily Briefing, and editorial style, which map to the corresponding backend endpoints and frontend views.
- `specs/intelligence/skill_evolution.md` – overall intelligence/skill evolution loop.

When evolving backend response shapes or adding new endpoints, align them with the existing contracts (or update the contracts first) and keep `services/analyst.py` / frontend types in sync.

### Testing & automation

- `tests/v2_regression_test.py` is the main UI regression harness and encodes class-name-level expectations for the frontend (e.g. `.intelligence-card`, NotePad and Ask AI selectors). UI refactors should keep these selectors stable or update the test accordingly.
- Backend smoke tests (`backend/test_ai.py`, `backend/test_fetch.py`) are useful for quickly verifying environment variables and external dependencies.

## AI/agent-specific notes

- This repo assumes agents that support OpenSkills and the Antigravity auto-skills workflow:
  - For **backend** work, consider loading `backend-expert`, `flask-expert`, `database-expert`.
  - For **frontend/UI** work, consider `frontend-expert`, `frontend-design`, `framer-motion-expert`, `tailwindcss-expert`.
  - For **testing**, `webapp-testing` is the canonical Playwright/testing skill.
- Spec-first development is expected: check `specs/**` and related design docs under `docs/**` before large changes, and update them when APIs or behaviours shift.

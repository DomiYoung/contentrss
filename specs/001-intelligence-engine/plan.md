# Implementation Plan: Intelligence Engine

## Tech Stack
- **Backend**: Python (FastAPI).
- **Frontend**: Vite + React (TypeScript).
- **Styling**: TailwindCSS (v3).
- **Data Exchange**: REST API (JSON).

## Steps
1. **API Contract**: Define OpenAPI spec (Done: `contracts/api-spec.json`).
2. **Backend**:
   - Initialize FastAPI.
   - Implement `AnalystService` returning data matching the Schema.
   - Serve at `http://localhost:8000`.
3. **Frontend**:
   - Generate TypeScript types from Schema.
   - Implement `api.ts` fetcher.
   - Connect `App.tsx` to `useFeed` hook.
4. **Verification**:
   - Verify `GET /api/feed` returns valid JSON.
   - Verify Frontend renders cards correctly.

# T019 — Localhost-only Read-only API over Projection

## Objective

Add a localhost-only read-only HTTP API over the T018 projection so developers/operators can inspect metadata-only runtime views locally.

## Scope checklist

- [x] Add API contract doc `docs/runtime/LOCALHOST_READ_ONLY_API.md`
- [x] Add API server module `src/local-api/read-only-api-server.mjs`
- [x] Add local API runtime test `scripts/runtime/test-localhost-read-only-api.mjs`
- [x] Add package script `runtime:test:localhost-api`
- [x] Include localhost API test in runtime smoke
- [x] Update runtime/project docs and inventory/changelog
- [x] Create T019 work-item docs (`TASK.md`, `DECISIONS.md`, `VALIDATION.md`, `FINAL_REPORT.md`)

## Boundaries respected

- local-only and read-only
- default bind host `127.0.0.1`
- reject `0.0.0.0` unless explicit unsafe override
- no Supabase writes
- no Worker deploy
- no hosted/live ingestion
- no scheduler/cron
- no external network calls
- no secrets/raw prompts/customer raw data

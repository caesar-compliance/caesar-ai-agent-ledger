# T018 Validation — Read-only Local Event Projection

## Date

22 May 2026

## Baseline

Passed after restoring generated readiness report churn in `reports/runtime-services-readiness.latest.json`.

## Final validation commands and results

- `git diff --check` — pass (no output).
- `npm run runtime:validate:event-model` — pass.
- `npm run runtime:test:event-buffer` — pass.
- `npm run runtime:test:event-export-import` — pass.
- `npm run runtime:test:event-projection` — pass.
- `node scripts/runtime/validate-supabase-schema.mjs` — pass (`agent_runs`, `agent_events`, `runtime_events`).
- `node scripts/test-cloudflare-worker-local.mjs` — pass (`POST /events` disabled by default; enabled path remains non-persistent stub).
- `node scripts/runtime/check-service-credentials.mjs` — pass (metadata-only readiness output written).
- `npm run runtime:ingestion:dry-run` — pass (`live_ingestion: false`; no network; no Supabase writes).
- `npm run runtime:smoke` — pass (includes event model, buffer, export/import, projection, schema, credentials).
- `git ls-files .env.runtime.local .env.cloudflare.local .env .env.local` — pass (no output).
- `git ls-files .tmp` — pass (no output).

## Generated report churn handling

- `reports/runtime-services-readiness.latest.json` changed during validation.
- File restored with `git restore reports/runtime-services-readiness.latest.json`.

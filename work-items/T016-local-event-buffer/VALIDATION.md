# T016 Validation

## Baseline checks before edits

- `git diff --check` - passed.
- `npm run runtime:validate:event-model` - passed.
- `node scripts/runtime/validate-supabase-schema.mjs` - passed.
- `node scripts/test-cloudflare-worker-local.mjs` - passed.
- `node scripts/runtime/check-service-credentials.mjs` - passed.
- `npm run runtime:ingestion:dry-run` - passed.
- `npm run runtime:smoke` - passed.
- `git ls-files .env.runtime.local .env.cloudflare.local .env .env.local` - returned no tracked local secret files.

## Final validation

- `git diff --check` - passed with no output.
- `npm run runtime:validate:event-model` - passed.
  - `PASS: schema parseable JSON`
  - `PASS: valid-tool-call-requested validated`
  - `PASS: valid-approval-granted validated`
  - `PASS: invalid-raw-secret rejected for forbidden raw content`
- `npm run runtime:test:event-buffer` - passed.
  - `PASS: valid-tool-call-requested appended`
  - `PASS: valid-approval-granted appended`
  - `PASS: duplicate append skipped`
  - `PASS: invalid raw-secret event rejected`
  - `PASS: buffer stores exactly 2 events after skip and rejection`
  - `PASS: summary {"total_events":2,"counts_by_event_type":{"tool_call_requested":1,"approval_granted":1},"counts_by_risk_level":{"medium":1,"high":1},"unique_run_id_count":1,"earliest_occurred_at":"2026-05-22T12:00:00.000Z","latest_occurred_at":"2026-05-22T12:01:00.000Z"}`
  - `PASS: buffer validation passes`
- `node scripts/runtime/validate-supabase-schema.mjs` - passed with `PASS: table agent_runs`, `PASS: table agent_events`, and `PASS: table runtime_events`.
- `node scripts/test-cloudflare-worker-local.mjs` - passed with `/healthz`, `/readyz without Supabase env returns 503 and ready=false`, `/readyz with Supabase env returns 200`, `/version`, `POST /events disabled by default`, and `POST /events returns stubbed non-persistent response when enabled locally`.
- `node scripts/runtime/check-service-credentials.mjs` - passed and wrote `reports/runtime-services-readiness.latest.json`.
- `npm run runtime:ingestion:dry-run` - passed and reported `live_ingestion: false` with no network and no Supabase writes.
- `npm run runtime:smoke` - passed and re-ran the schema, event-model, and credential checks successfully.
- `git ls-files .env.runtime.local .env.cloudflare.local .env .env.local` - returned no tracked local secret files.
- `git ls-files .tmp` - returned no tracked `.tmp` entries.
- `git status --short` - showed the expected modified and untracked implementation files before commit, with no secret files tracked.

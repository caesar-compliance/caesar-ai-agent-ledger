# T015 Validation

## Baseline checks before edits

- `git ls-files .env.runtime.local .env.cloudflare.local .env .env.local` - passed with no tracked local secret files.
- `node scripts/runtime/validate-supabase-schema.mjs` - passed.
- `node scripts/test-cloudflare-worker-local.mjs` - passed.
- `node scripts/runtime/check-service-credentials.mjs` - passed.
- `npm run runtime:ingestion:dry-run` - passed.
- `npm run runtime:smoke` - passed.

## Final validation commands

- `git diff --check` - passed.
- `node scripts/runtime/validate-supabase-schema.mjs` - passed with `PASS: table agent_runs`, `PASS: table agent_events`, `PASS: table runtime_events`.
- `npm run runtime:validate:event-model` - passed with `PASS: schema parseable JSON`, `PASS: valid-tool-call-requested validated`, `PASS: valid-approval-granted validated`, and `PASS: invalid-raw-secret rejected for forbidden raw content`.
- `node scripts/test-cloudflare-worker-local.mjs` - passed with `PASS: /healthz`, `PASS: /readyz without Supabase env returns 503 and ready=false`, `PASS: /readyz with Supabase env returns 200`, `PASS: /version`, `PASS: POST /events disabled by default`, and `PASS: POST /events returns stubbed non-persistent response when enabled locally`.
- `node scripts/runtime/check-service-credentials.mjs` - passed and wrote `reports/runtime-services-readiness.latest.json`.
- `npm run runtime:ingestion:dry-run` - passed.
- `npm run runtime:smoke` - passed and enforced child exit codes while running schema, event-model, and credential checks.
- `git ls-files .env.runtime.local .env.cloudflare.local .env .env.local` - returned no tracked local secret files.
- `git status --short` - showed the expected working tree changes before commit, with no secret files staged.

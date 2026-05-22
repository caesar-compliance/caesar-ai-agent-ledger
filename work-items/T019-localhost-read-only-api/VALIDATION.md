# T019 Validation

## Commands

- `git diff --check`
- `npm run runtime:validate:event-model`
- `npm run runtime:test:event-buffer`
- `npm run runtime:test:event-export-import`
- `npm run runtime:test:event-projection`
- `npm run runtime:test:localhost-api`
- `node scripts/runtime/validate-supabase-schema.mjs`
- `node scripts/test-cloudflare-worker-local.mjs`
- `node scripts/runtime/check-service-credentials.mjs`
- `npm run runtime:ingestion:dry-run`
- `npm run runtime:smoke`
- `git ls-files .env.runtime.local .env.cloudflare.local .env .env.local`
- `git ls-files .tmp`

## Result

All listed commands passed locally on 22 May 2026. Any generated churn in `reports/runtime-services-readiness.latest.json` was restored before final status checks.

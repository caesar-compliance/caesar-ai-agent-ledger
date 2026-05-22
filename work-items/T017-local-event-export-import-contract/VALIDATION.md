# T017 Validation

**Date:** 22 May 2026

All commands executed locally and passed:

1. `git diff --check` -> PASS
2. `npm run runtime:validate:event-model` -> PASS
3. `npm run runtime:test:event-buffer` -> PASS
4. `npm run runtime:test:event-export-import` -> PASS
5. `node scripts/runtime/validate-supabase-schema.mjs` -> PASS
6. `node scripts/test-cloudflare-worker-local.mjs` -> PASS
7. `node scripts/runtime/check-service-credentials.mjs` -> PASS
8. `npm run runtime:ingestion:dry-run` -> PASS
9. `npm run runtime:smoke` -> PASS
10. `git ls-files .env.runtime.local .env.cloudflare.local .env .env.local` -> PASS (no output)
11. `git ls-files .tmp` -> PASS (no output)

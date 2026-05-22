# Dev runtime activation — Agent Ledger

Workflow: `.github/workflows/dev-runtime-activate.yml`
Worker: `agent-ledger-runtime-dev`
Supabase: `caesar-agent-ledger-dev` (schema `agent_ledger`)

## Supported capabilities

| Capability | Status |
|------------|--------|
| Schema SQL | Yes — `ops/supabase/001_agent_ledger_runtime_schema.sql` |
| Schema apply (gated) | Yes — `APPLY_SUPABASE_SCHEMA=true npm run runtime:supabase:apply` |
| Schema validate | Yes — `npm run runtime:validate:schema` |
| Event model validate | Yes — `npm run runtime:validate:event-model` |
| Local event buffer | Yes — `npm run runtime:test:event-buffer` |
| Local event export/import dry-run | Yes — `npm run runtime:test:event-export-import` |
| Read-only local event projection | Yes — `npm run runtime:test:event-projection` |
| Localhost read-only projection API | Yes — `npm run runtime:test:localhost-api` |
| Static/private local dashboard validate | Yes — `npm run runtime:validate:static-dashboard` |
| Static/private local dashboard localhost test | Yes — `npm run runtime:test:static-dashboard` |
| Backend runtime readiness boundary validate | Yes — `npm run runtime:validate:boundary` |
| Local Supabase migration rehearsal validate | Yes — `npm run runtime:validate:supabase-rehearsal` |
| DB health | Yes — `npm run runtime:db:health` |
| Worker deploy | Yes — `ops/cloudflare-workers/agent-ledger-runtime` |
| `/healthz` `/readyz` `/version` | Yes |
| Dry-run ingestion | Yes — `npm run runtime:ingestion:dry-run` |
| Dev seed | Yes — `ENABLE_DEV_SEED=true` |
| POST `/events` | Disabled by default (`ENABLE_AGENT_EVENTS=false`) |

## Unsupported

- One-shot live ingestion (workflow fails)
- Cron (workflow fails)
- Production deploy

## First safe activation

1. `npm install` && `npm run runtime:validate:schema`
2. `npm run runtime:validate:event-model`
3. `npm run runtime:test:event-buffer`
4. `npm run runtime:test:event-export-import`
5. `npm run runtime:test:event-projection`
6. `npm run runtime:test:localhost-api`
7. `npm run runtime:validate:static-dashboard`
8. `npm run runtime:test:static-dashboard`
9. `npm run runtime:validate:boundary`
10. `npm run runtime:validate:supabase-rehearsal`
11. `node scripts/runtime/check-service-credentials.mjs`
12. `npm run test:worker:local`
13. CI: validation only, then `apply_schema=YES`, then `deploy_worker=YES`

## Rollback

Worker rollback in Cloudflare; schema manual in Supabase.

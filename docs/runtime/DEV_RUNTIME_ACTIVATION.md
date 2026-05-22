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
3. `node scripts/runtime/check-service-credentials.mjs`
4. `npm run test:worker:local`
5. CI: validation only, then `apply_schema=YES`, then `deploy_worker=YES`

## Rollback

Worker rollback in Cloudflare; schema manual in Supabase.

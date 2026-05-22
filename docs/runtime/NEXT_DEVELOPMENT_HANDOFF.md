# Agent Ledger — Next development handoff

**Frozen:** 22 May 2026 (T022 local Supabase migration rehearsal compile gate)
**Branch:** `main`
**Status:** Runtime scaffold includes local-only JSONL buffering, deterministic export/import dry-run, read-only projection/API/dashboard, and machine-checkable runtime boundary validation; runtime remains **not** activated (no CI schema apply, no Worker deploy, no hosted ingestion).

## 1. Current state

| Item | Status |
|------|--------|
| GitHub `dev-runtime` environment | Prepared (per T012) |
| Supabase schema applied (dev via CI) | **No** |
| Cloudflare Worker deployed | **No** |
| UptimeRobot Worker monitor | **Disabled** |
| `POST /events` | **Disabled by default** (`ENABLE_AGENT_EVENTS=false`) |
| Local credential / Worker tests | **Pass** (T014/T015 local validation) |
| Local event model schema validation | **Pass** (T015) |
| Local event buffer append/read/summarize/validate | **Pass** (T016) |
| Local export/import bundle and dry-run mapping | **Pass** (T017) |
| Read-only local projection over buffer/export bundle | **Pass** (T018) |
| Localhost-only read-only projection API | **Pass** (T019) |
| Static/private local dashboard | **Pass** (T020) |
| Backend runtime readiness boundary validator | **Pass** (T021/T022) |
| Local Supabase migration rehearsal validator | **Pass** (T022) |

**Note:** This is an **internal audit/runtime ledger**, not a public watcher site.

## 2. Runtime infrastructure

| Resource | Value |
|----------|--------|
| Supabase project | `caesar-agent-ledger-dev` |
| Schema | `agent_ledger` |
| Cloudflare Worker | `agent-ledger-runtime-dev` |
| GitHub environment | `dev-runtime` |
| UptimeRobot | No public site monitors; Worker monitor disabled |

## 3. Exact next steps

### Step 0 — Keep the event model contract and buffer local-only

Maintain:

- metadata-first event records
- `run_id`, `event_id`, `idempotency_key`, `correlation_id`
- local JSONL append/read/summarize/validate only
- `POST /events` disabled by default
- no raw secrets, no raw customer data, no raw full prompts by default

### Step 1 — Local validation

```bash
npm install
node scripts/runtime/check-service-credentials.mjs
node scripts/runtime/validate-supabase-schema.mjs
npm run runtime:validate:event-model
npm run runtime:test:event-buffer
npm run runtime:test:event-export-import
npm run runtime:test:event-projection
npm run runtime:test:localhost-api
node scripts/test-cloudflare-worker-local.mjs
npm run runtime:smoke
```

### Step 2 — Local static Supabase rehearsal validation (no DB run/apply)

```bash
npm run runtime:validate:supabase-rehearsal
node scripts/runtime/validate-supabase-schema.mjs
```

### Step 3 — CI validation-only (future controlled step)

```bash
gh workflow run dev-runtime-activate.yml \
  --repo caesar-compliance/caesar-ai-agent-ledger \
  -f confirm=ACTIVATE_DEV_RUNTIME \
  -f apply_schema=NO \
  -f deploy_worker=NO \
  -f set_worker_secrets=NO \
  -f enable_cron=NO \
  -f run_dry_ingestion=YES \
  -f enable_network=NO \
  -f run_live_ingestion_once=NO \
  -f post_deploy_smoke=NO
```

### Step 4 — Schema apply (pooler URL in GitHub secret; only after explicit approval)

```bash
gh workflow run dev-runtime-activate.yml ... -f apply_schema=YES -f deploy_worker=NO ...
```

### Step 5 — Worker deploy

```bash
gh workflow run dev-runtime-activate.yml ... -f deploy_worker=YES -f set_worker_secrets=YES -f post_deploy_smoke=YES ...
```

### Step 6 — Protected event persistence

Implement gated `POST /events` only after:

- `ENABLE_AGENT_EVENTS=true` in env (never default in CI)
- Auth token / RUN_TOKEN pattern documented
- Schema + Worker smoke pass

## 4. What must remain gated

| Gate | Rule |
|------|------|
| Schema apply | CI gated only |
| Cron | Workflow fails on `enable_cron=YES` |
| Live ingestion | Workflow fails on `run_live_ingestion_once=YES` |
| Public exposure | No public ingestion endpoints without review |
| Agent events | `ENABLE_AGENT_EVENTS=false` until explicit approval |

## 5. Product direction

Internal **AI agent audit ledger**: tasks, runs, events, runtime_events for governance and debugging. Not user-facing content.

## 6. AI agent instructions

1. Work from `main` @ `5d7458c` or later.
2. Read `docs/runtime/DEV_RUNTIME_ACTIVATION.md` and this file.
3. Do not commit secrets or `.env.*.local`.
4. Event model and local buffer doc changes are safe to commit; infrastructure changes need Control Tower.
5. Final report required.
6. Next likely product step after T022: local compile harness design (disabled by default) or controlled private runtime setup preparation only after explicit approval.

## References

- `docs/runtime/DEV_RUNTIME_ACTIVATION.md`
- `ops/supabase/001_agent_ledger_runtime_schema.sql`

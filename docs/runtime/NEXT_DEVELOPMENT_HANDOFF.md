# Agent Ledger — Next development handoff

**Frozen:** 22 May 2026 (T015 contract hardening)
**Branch:** `task/T015-agent-event-model-validation-hardening`
**Status:** Runtime scaffold ready — event model contract added, local validation hardened, still **not** activated (no CI schema apply, no Worker deploy).

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

### Step 0 — Keep the event model contract local-only

Maintain:

- metadata-first event records
- `run_id`, `event_id`, `idempotency_key`, `correlation_id`
- `POST /events` disabled by default
- no raw secrets, no raw customer data, no raw full prompts by default

### Step 1 — Local validation

```bash
npm install
node scripts/runtime/check-service-credentials.mjs
node scripts/runtime/validate-supabase-schema.mjs
npm run runtime:validate:event-model
node scripts/test-cloudflare-worker-local.mjs
npm run runtime:smoke
```

### Step 2 — CI validation-only

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

### Step 3 — Schema apply (pooler URL in GitHub secret)

```bash
gh workflow run dev-runtime-activate.yml ... -f apply_schema=YES -f deploy_worker=NO ...
```

### Step 4 — Worker deploy

```bash
gh workflow run dev-runtime-activate.yml ... -f deploy_worker=YES -f set_worker_secrets=YES -f post_deploy_smoke=YES ...
```

### Step 5 — Protected event persistence

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
4. Event model doc changes are safe to commit; infrastructure changes need Control Tower.
5. Final report required.

## References

- `docs/runtime/DEV_RUNTIME_ACTIVATION.md`
- `ops/supabase/001_agent_ledger_runtime_schema.sql`

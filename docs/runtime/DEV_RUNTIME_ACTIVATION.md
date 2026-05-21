# Dev runtime activation (GitHub Actions)

Workflow: `.github/workflows/dev-runtime-activate.yml`  
Environment: `dev-runtime`

## What it does

**Validation / schema-plan mode** for Agent Ledger:

1. Materializes ephemeral `.env.runtime.local` / `.env.cloudflare.local` from GitHub env (not committed)  
2. Runs `node scripts/runtime/check-service-credentials.mjs`  
3. Reports missing Worker scaffold and schema apply script when dangerous inputs are requested

## Trigger commands

Default readiness check:

```bash
gh workflow run dev-runtime-activate.yml -f confirm=ACTIVATE_DEV_RUNTIME
```

Validation only (no deploy flags):

```bash
gh workflow run dev-runtime-activate.yml \
  -f confirm=ACTIVATE_DEV_RUNTIME \
  -f deploy_worker=NO \
  -f set_worker_secrets=NO \
  -f run_dry_ingestion=NO
```

`apply_schema=YES`, `run_live_ingestion_once=YES`, and `enable_cron=YES` **fail** until scaffold scripts exist.

## Gaps

- **Cloudflare Worker scaffold:** missing  
- **Supabase schema apply script:** missing  
- **Dry-run / live ingestion scripts:** missing  
- See `docs/runtime/EXTERNAL_SERVICE_ONBOARDING_CHECKLIST.md` for manual setup

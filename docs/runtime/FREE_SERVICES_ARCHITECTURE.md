# Free services architecture — Agent Ledger runtime

**Date:** 21 May 2026  
**Policy:** Caesar AI Governance Hub — `docs/operations/EXTERNAL_SERVICES_ACCOUNT_POLICY.md`

## Account allocation

Caesar Agent Ledger uses **Account B** (isolated from Account A Regulation/Vendor Watch):

- **Supabase project (dev):** `caesar-agent-ledger-dev`
- **Schema:** `agent_ledger`
- **Cloudflare worker:** `agent-ledger-runtime-dev`
- **GitHub:** secondary Account B GitHub (see hub local map)

## Free-tier services map

| Service | Role | Agent Ledger usage |
| :--- | :--- | :--- |
| **Supabase Free** | Runtime Postgres | Future agent run ledger persistence (scaffold only in T001) |
| **Cloudflare Free** | Workers runtime | Future controlled runtime hooks — **not deployed in T001** |

## Secret handling

- Account B email and credentials: hub `.local/` + `.env.runtime.local`, `.env.cloudflare.local`
- Tracked docs: labels and project names only

## Safety defaults

All `ENABLE_*`, `APPLY_SUPABASE_SCHEMA`, and Cloudflare deploy/cron flags must remain **false** until Control Tower approves.

## Operator command

```bash
node scripts/runtime/check-service-credentials.mjs
```

Output: `reports/runtime-services-readiness.latest.json`

# External service onboarding checklist — Agent Ledger

**Account:** Account B  
**Supabase project:** `caesar-agent-ledger-dev`  
**Cloudflare worker:** `agent-ledger-runtime-dev`  

Do **not** paste emails, tokens, or keys into tracked files.

---

## 1. Supabase Free

1. Log in to **Account B** (hub `.local/EXTERNAL_SERVICES_ACCOUNT_MAP.local.md`).
2. Create or select **`caesar-agent-ledger-dev`**.
3. `cp .env.runtime.example .env.runtime.local` and fill locally.
4. Keep all safety flags **false**.
5. `node scripts/runtime/check-service-credentials.mjs` — presence only.

---

## 2. Cloudflare Free

1. Account B Cloudflare — narrow API token.
2. `cp .env.cloudflare.example .env.cloudflare.local`
3. Worker name default: `agent-ledger-runtime-dev`
4. Keep deploy and cron **disabled**.

---

## Out of scope (T001)

- Schema apply, migrations, Worker deploy
- Live ingestion, scheduled jobs, network execution

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
4. Set **new Supabase API keys** (Dashboard → API → API Keys):
   - `SUPABASE_API_KEY_MODE=new`
   - `SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`)
   - `SUPABASE_SECRET_KEY` (`sb_secret_...`) — never commit; server/local scripts only
5. Legacy `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` are **optional fallback only**.
6. Keep all safety flags **false**.
7. `node scripts/runtime/check-service-credentials.mjs` — presence and prefix type only (values never printed).

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

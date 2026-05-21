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

## GitHub Actions environment (`dev-runtime`)

Runtime deploy credentials for AI agents and GitHub Actions are stored in the repository environment **`dev-runtime`** (`caesar-compliance/caesar-ai-agent-ledger`), not in tracked files.

- **Secrets (names only):** `CLOUDFLARE_API_TOKEN`, `SUPABASE_SECRET_KEY`, `SUPABASE_DB_URL`
- **Variables:** Supabase/Cloudflare identifiers, `RUNTIME_ENV=dev`, and safety flags (`ENABLE_LIVE_INGESTION=false`, `ENABLE_SCHEDULED_MONITORING=false`, `ENABLE_NETWORK_EXECUTION=false`, `APPLY_SUPABASE_SCHEMA=false`, `CLOUDFLARE_ENABLE_CRON_TRIGGER=false`, `CLOUDFLARE_ENABLE_WORKER_DEPLOY=true`)
- After local validation passes, an agent may trigger controlled dev Worker deploy workflows; cron, live ingestion, and schema apply remain off unless explicitly approved.
- Do not copy secret values into docs, issues, or chat.

---

## Out of scope (T001)

- Schema apply, migrations, Worker deploy
- Live ingestion, scheduled jobs, network execution

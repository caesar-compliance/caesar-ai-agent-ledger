# Agent Ledger Supabase schema (dev)

File: `001_agent_ledger_runtime_schema.sql`  
Project: `caesar-agent-ledger-dev`  
Schema: `agent_ledger`

Apply via gated script only:

```bash
APPLY_SUPABASE_SCHEMA=true npm run runtime:supabase:apply
```

No automatic production apply. Metadata-only — no raw prompts or secrets in columns.

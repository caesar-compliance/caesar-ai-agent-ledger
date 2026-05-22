-- Caesar AI Agent Ledger — dev runtime schema (metadata-only audit events)
-- Apply manually or via gated script. Schema: agent_ledger

CREATE SCHEMA IF NOT EXISTS agent_ledger;

CREATE TABLE IF NOT EXISTS agent_ledger.agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id TEXT NOT NULL UNIQUE,
  agent_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'started',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_ledger.agent_runs (status);
CREATE INDEX IF NOT EXISTS idx_agent_runs_started_at ON agent_ledger.agent_runs (started_at DESC);

CREATE TABLE IF NOT EXISTS agent_ledger.agent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id TEXT NOT NULL REFERENCES agent_ledger.agent_runs (run_id),
  event_type TEXT NOT NULL,
  tool_name TEXT,
  risk_level TEXT,
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_events_run_id ON agent_ledger.agent_events (run_id);
CREATE INDEX IF NOT EXISTS idx_agent_events_recorded_at ON agent_ledger.agent_events (recorded_at DESC);

CREATE TABLE IF NOT EXISTS agent_ledger.runtime_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  run_id TEXT,
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_runtime_events_created_at ON agent_ledger.runtime_events (created_at DESC);

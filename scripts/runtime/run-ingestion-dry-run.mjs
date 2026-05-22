#!/usr/bin/env node
console.log(JSON.stringify({
  mode: "dry-run",
  live_ingestion: false,
  note: "Agent Ledger ingestion dry-run — no network, no Supabase writes",
  sample_event: { event_type: "tool_call", tool_name: "example", metadata_only: true },
}, null, 2));
console.log("PASS: run-ingestion-dry-run");

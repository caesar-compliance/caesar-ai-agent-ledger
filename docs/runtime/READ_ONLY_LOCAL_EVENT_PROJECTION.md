# Read-only Local Event Projection (T018)

## Purpose

Define a local-only, read-only projection model that turns validated Agent Ledger events into inspectable product-style views without any backend service.

This projection:

- reads local metadata-only event sources
- applies deterministic filtering, sorting, and deduplication
- outputs sanitized read models for local inspection and testing

## Non-goals

- no persistence writes
- no Supabase connection
- no Cloudflare Worker dependency
- no deployment behavior
- no network calls
- no ingestion scheduling or cron
- no raw prompt/customer-data/secret capture

## Relation to prior tasks

- **T015 (event model):** Projection accepts only events that validate against `schemas/agent-ledger-event.schema.json` and preserves metadata-first boundaries.
- **T016 (local buffer):** Projection can read events from local JSONL buffer files produced by the local buffer module.
- **T017 (export/import contract):** Projection can read events from local export bundles (`events.jsonl`) and remains dry-run/local-only.

## Input sources

Exactly one source is used per projection call:

1. `events` array (in-memory)
2. `bufferFile` path to local JSONL buffer
3. `bundleDir` path to local export bundle directory

## Output shape

`buildReadOnlyEventProjection(options)` returns:

- `generated_at`
- `source_type`
- `source_ref`
- `summary`
- `runs`
- `events`
- `approvals`
- `tool_calls`
- `risks`
- `errors`

## Projection entities

- `summary`: totals, counts, and temporal range
- `runs`: one row per `run_id`
- `events`: sorted metadata-only event list
- `approvals`: `approval_requested`, `approval_granted`, `approval_denied`
- `tool_calls`: `tool_call_requested`, `tool_call_completed`
- `risks`: high/critical events
- `errors`: `event_type = error`

## Sorting rules

- `events`: by `occurred_at` ascending, then `event_id` ascending
- `runs`: by `run_id` ascending
- `approvals`, `tool_calls`, `risks`, `errors`: follow sorted event order

## Filtering rules

Optional exact-match filters:

- `run_id`
- `event_type`
- `risk_level`

Filters are applied after validation and deduplication.

## Redaction rules

Projection output is metadata-only and excludes raw payload fields by construction.

Allowed event-level output fields are limited to:

- identifiers (`task_id`, `run_id`, `event_id`, `parent_event_id`, `idempotency_key`, `correlation_id`)
- classification (`event_type`, `risk_level`)
- timing (`occurred_at`)
- source metadata (`source_kind`, `source_name`, `source_version`, `source_environment`)
- redaction metadata (`redaction_policy`, `redaction_applied`, capture flags, `fields_redacted_count`)
- payload metadata summary (`metadata_kind`, `metadata_summary`, label/reference counts, `contains_sensitive_data`)

Any event containing forbidden secret-like raw content is rejected.

## Idempotency and deduplication rules

- Deduplication key: `idempotency_key`
- If duplicates exist, the first event in sorted order is kept and later duplicates are skipped.
- Projection remains deterministic for identical input.

## Safety boundaries

- read-only local processing only
- no DB writes/connections
- no Worker deploy/use requirement
- no deployment behavior
- no network execution
- no secrets/customer data/raw prompts in output

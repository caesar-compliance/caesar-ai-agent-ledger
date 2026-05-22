# Local Event Export/Import Contract

**Date:** 22 May 2026

## Purpose

Define a local-only, deterministic bundle contract for exporting buffered Agent Ledger events and validating a future-ready import plan without performing any network activity or persistence.

## Non-goals

- No Supabase writes.
- No schema apply.
- No Cloudflare Worker deploy.
- No GitHub Actions execution.
- No cron or scheduler activation.
- No live ingestion.
- No hosted ingestion.
- No network execution.

## Relation to T015 and T016

- **T015** defines the metadata-first event schema and forbidden raw-content boundary.
- **T016** defines local JSONL buffering with append/read/summarize/validate behavior.
- **T017** packages validated buffered events into a deterministic export bundle and produces an import dry-run plan.

## Export bundle layout

Bundle directory:

- `manifest.json`
- `events.jsonl`
- `summary.json`
- `validation-report.json`

## Manifest fields

`manifest.json` includes:

- `schema_version`
- `bundle_id`
- `generated_at`
- `source_buffer_file`
- `event_count`
- `events_file`
- `summary_file`
- `validation_report_file`
- `contract_doc`

## Events JSONL rules

- One event JSON object per line.
- Every event must pass T015 schema validation and forbidden-content checks before bundle export.
- Empty lines are ignored on read.
- Malformed lines fail bundle validation.

## Summary rules

`summary.json` must be consistent with `events.jsonl`:

- `total_events`
- `counts_by_event_type`
- `counts_by_risk_level`
- `unique_run_id_count`
- `unique_run_ids`
- `earliest_occurred_at`
- `latest_occurred_at`

## Validation report rules

`validation-report.json` is generated locally from bundle validation and contains:

- required-file checks
- manifest parse checks
- events JSONL parse checks
- summary consistency checks
- duplicate idempotency-key counts
- forbidden raw-content checks

## Import dry-run behavior

Import is **dry-run only**:

- Reads only a validated local bundle.
- Produces a plan object only.
- Uses no Supabase connection.
- Uses no network.
- Contains only metadata-level counts and ids.

Plan fields include:

- `would_insert_runs_count`
- `would_insert_events_count`
- `idempotency_keys_count`
- `duplicate_idempotency_keys_count`
- `blocked_events_count`
- `warnings`

## Future Supabase mapping

The dry-run maps intended future writes to:

- `agent_runs`
- `agent_events`
- `runtime_events` (runtime-side validation/processing metadata)

No table write is performed in T017.

## Idempotency behavior

- Idempotency key uniqueness is preserved from T016.
- Duplicate idempotency keys are reported.
- Duplicate events are marked blocked in dry-run planning.

## Redaction and secret-safety rules

- No raw secrets.
- No raw customer data.
- No raw full prompts.
- No credentials in bundle files.
- Forbidden token-like keys/values are rejected before export.

## Explicit safety boundaries

- No Supabase writes
- No schema apply
- No Cloudflare deploy
- No GitHub Actions run
- No cron/scheduler
- No live ingestion
- No hosted ingestion
- No network execution
- No raw secrets/customer data/full prompts

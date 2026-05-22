# Local Event Buffer

**Date:** 22 May 2026

## Purpose

The local event buffer stores Caesar AI Agent Ledger events as local-only JSONL so the event model can be appended, read, summarized, and validated without network access.

It exists to support offline development and local safety checks for the T015 event model contract and the T016 buffer layer.

## Non-goals

- It is not hosted ingestion.
- It is not a Supabase writer.
- It is not a Cloudflare deploy target.
- It is not a scheduler or cron service.
- It is not a GitHub Actions workflow.
- It is not a replacement for future gated persistence.

## File format

- Format: JSONL, one JSON object per line.
- Empty lines are ignored when reading.
- Malformed JSON lines fail clearly during read and validation.
- The buffer never rewrites prior lines.

## Recommended local path

Use a gitignored path under `.tmp/agent-ledger/` for local runs.

Recommended pattern:

```text
.tmp/agent-ledger/<task-name>/events.jsonl
```

The T016 test harness uses:

```text
.tmp/agent-ledger/local-event-buffer-test/events.jsonl
```

## Idempotency behavior

- Each event is keyed by `idempotency_key`.
- If the same `idempotency_key` already exists in the same buffer, `appendEventToBuffer()` skips the duplicate instead of appending a second copy.
- The append result reports the duplicate as `skipped`.

## Validation behavior

- Events are validated against `schemas/agent-ledger-event.schema.json`.
- Required fields must exist.
- `event_type` must be one of the T015 allowed event types.
- `risk_level` must be one of the T015 allowed risk levels.
- `occurred_at` must be ISO-like and parseable as a date-time.
- `payload_metadata_json` must be object-like metadata, not raw text.
- Raw secret-like keys and values are rejected, including at minimum:
  - `secret`
  - `password`
  - `token`
  - `api_key`
  - `private_key`

The validation helpers are shared with the event-model validator script so the contract stays consistent.

## Relation to T015

T015 defined the metadata-first event contract and schema. T016 adds the local buffer layer on top of that contract without changing the disabled-by-default ingestion boundary.

## Relation to future Supabase ingestion

This buffer can support a future gated import/export path, but it does not write to Supabase today. Any Supabase ingestion remains a separate Control Tower-approved step.

## Safety boundary

- Local-only.
- No Supabase writes.
- No Worker deploy.
- No hosted ingestion.
- No scheduler.
- No GitHub Actions run.
- No live ingestion.

## Test command

Run the local buffer test with:

```bash
npm run runtime:test:event-buffer
```

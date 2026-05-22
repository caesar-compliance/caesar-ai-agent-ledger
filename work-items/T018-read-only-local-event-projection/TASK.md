# T018 Task — Read-only Local Event Projection

## Mode

Direct Execution Mode.

## Objective

Implement a local-only read-only projection over validated Agent Ledger events from local buffer JSONL and local export bundle sources.

## Scope checklist

- [x] Create projection contract doc (`docs/runtime/READ_ONLY_LOCAL_EVENT_PROJECTION.md`).
- [x] Implement `buildReadOnlyEventProjection(options)` in `src/projection/read-only-event-projection.mjs`.
- [x] Add projection test script (`scripts/runtime/test-read-only-event-projection.mjs`).
- [x] Add package script `runtime:test:event-projection`.
- [x] Update runtime smoke to include projection test.
- [x] Sync project/runtime docs and repository inventory.
- [x] Create T018 work-item closeout files.
- [x] Run final validation commands and record exact results.
- [x] Prepare final report and complete merge/push flow.

## Constraints

- Local-only, read-only, deterministic behavior.
- No Supabase writes, no schema apply, no Worker deploy.
- No hosted ingestion, no scheduler/cron, no network execution.
- No secrets or customer data in tracked outputs.

# T016 - Local Event Buffer v1

## Scope

- Add a local-only JSONL event buffer for Agent Ledger events.
- Reuse the T015 event model contract and validation rules.
- Support append, read, summarize, and validate flows without network access.
- Add a fixture-driven local test that proves duplicate idempotency skip and raw-secret rejection.
- Update repository documentation and work-item tracking to reflect the local buffer boundary.

## Boundaries

- Do not apply Supabase schema migrations.
- Do not write to Supabase.
- Do not deploy the Cloudflare Worker.
- Do not enable cron, live ingestion, hosted ingestion, or customer-data ingestion.
- Do not edit `.env.runtime.local` or `.env.cloudflare.local`.
- Do not add npm dependencies.
- Do not change `POST /events` from its disabled-by-default state.

## Checklist

- [x] Read hub and repository context.
- [x] Confirm baseline validation passed before editing.
- [x] Implement the reusable event validation helper.
- [x] Implement the local JSONL event buffer module.
- [x] Add the local buffer fixture test and npm script entry.
- [x] Update runtime and repository documentation for T016.
- [x] Run final validation commands and record exact outputs.
- [x] Prepare the final report and close out the work item.

# T015 - Agent Event Model Validation Hardening

## Scope

- Define a local, metadata-first agent event model contract.
- Add a JSON Schema draft 2020-12 file for the event model.
- Add valid and invalid fixtures for local validation.
- Add a self-contained validator with no network access and no new dependencies.
- Harden worker-local and smoke validation so failures are visible.
- Sync repository docs to the runtime scaffold / event model contract stage.

## Boundaries

- Do not apply Supabase schema migrations.
- Do not deploy the Cloudflare Worker.
- Do not enable cron, live ingestion, hosted ingestion, or customer-data ingestion.
- Do not edit `.env.runtime.local` or `.env.cloudflare.local`.
- Do not add npm dependencies.
- Do not enable `POST /events` persistence by default.

## Checklist

- [x] Read hub and repository context.
- [x] Capture baseline validation results before editing.
- [x] Add the event model contract documentation.
- [x] Add the local JSON Schema and fixtures.
- [x] Add the local validator script and npm script entry.
- [x] Harden worker-local and smoke validation.
- [x] Sync repository docs and runtime handoff notes.
- [x] Run final validation commands and record exact outputs.
- [x] Prepare final report and close out the work item.

# Changelog

All notable changes to the Caesar AI Agent Ledger project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 22 May 2026

### Added
- **Local Supabase migration rehearsal compile gate (T022):** Added [docs/runtime/LOCAL_SUPABASE_MIGRATION_REHEARSAL.md](docs/runtime/LOCAL_SUPABASE_MIGRATION_REHEARSAL.md), [config/local-supabase-migration-rehearsal.json](config/local-supabase-migration-rehearsal.json), `scripts/runtime/validate-local-supabase-migration-rehearsal.mjs`, `runtime:validate:supabase-rehearsal`, and optional deterministic sample manifest `reports/samples/local-supabase-migration-rehearsal.sample.json` for static SQL checks only (no SQL execution, no Supabase CLI, no Docker, no DB writes).
- **Backend runtime readiness boundary hardening (T021):** Added [docs/runtime/BACKEND_RUNTIME_READINESS_BOUNDARY.md](docs/runtime/BACKEND_RUNTIME_READINESS_BOUNDARY.md), [config/runtime-readiness-boundary.json](config/runtime-readiness-boundary.json), `scripts/runtime/validate-runtime-readiness-boundary.mjs`, `runtime:validate:boundary`, and smoke-sequence enforcement for local-only runtime boundaries, workflow/manual-gate checks, worker/api/dashboard safety assertions, and generated-report churn awareness with no deploy/apply/activation.
- **Static/private local dashboard (T020):** Added [docs/runtime/STATIC_LOCAL_DASHBOARD.md](docs/runtime/STATIC_LOCAL_DASHBOARD.md), `site/local-dashboard/` static UI files, deterministic sample projection data, `runtime:validate:static-dashboard`, and localhost-only static dashboard test coverage with no CDN/fonts/analytics/external network resources.
- **Localhost read-only API (T019):** Added [docs/runtime/LOCALHOST_READ_ONLY_API.md](docs/runtime/LOCALHOST_READ_ONLY_API.md), `src/local-api/read-only-api-server.mjs`, and `runtime:test:localhost-api` to expose metadata-only projection views through local `GET` endpoints bound to `127.0.0.1` by default, with `POST` rejected (`405`) and unknown routes returning `404`.
- **Read-only local event projection (T018):** Added [docs/runtime/READ_ONLY_LOCAL_EVENT_PROJECTION.md](docs/runtime/READ_ONLY_LOCAL_EVENT_PROJECTION.md), `src/projection/read-only-event-projection.mjs`, and `runtime:test:event-projection` for deterministic metadata-only projections from local buffer or export bundles.
- **Local event export/import contract (T017):** Added [docs/runtime/LOCAL_EVENT_EXPORT_IMPORT_CONTRACT.md](docs/runtime/LOCAL_EVENT_EXPORT_IMPORT_CONTRACT.md), local bundle tooling in `src/export-import/local-event-export-bundle.mjs`, and a fixture-driven dry-run test command `runtime:test:event-export-import`.
- **Local event buffer v1:** Added a local-only JSONL buffer with append, read, summarize, and validate helpers, plus fixture-driven test coverage for duplicate idempotency skipping and raw-secret rejection.
- **Agent event model contract:** Added [docs/runtime/AGENT_EVENT_MODEL.md](docs/runtime/AGENT_EVENT_MODEL.md) to define the metadata-first task/run/event relationship, IDs, event types, risk levels, approval model, retention rules, and the disabled-by-default `POST /events` boundary.
- **Local event schema and fixtures:** Added [schemas/agent-ledger-event.schema.json](schemas/agent-ledger-event.schema.json) plus fixture examples for valid tool-call and approval events and one invalid raw-secret case.
- **Local validator and smoke hardening:** Added `runtime:validate:event-model` and made smoke validation fail on child-script exit codes while keeping all checks no-network and no-deploy.
- **Worker local test hardening:** Strengthened [scripts/test-cloudflare-worker-local.mjs](scripts/test-cloudflare-worker-local.mjs) to confirm disabled-by-default `POST /events`, the stubbed non-persistent enabled path, and local-readyz behavior without Supabase configuration.
- **Initialized professional repository foundation:** Established the core directory layout, strategic specifications, and architecture maps aligning the codebase with parent standards.
- **System Specifications:** Created [SPEC.md](SPEC.md) detailing inputs, outputs, non-goals, and SDK boundaries.
- **Architectural Scaffolding:** Added [ARCHITECTURE.md](ARCHITECTURE.md) outlining data collector boundaries and cryptographic signing.
- **Milestones Plan:** Created [ROADMAP.md](ROADMAP.md) plotting the roadmap toward stable release.
- **Workspace Inventory:** Added [REPO_INVENTORY.md](REPO_INVENTORY.md) cataloging tracked file roles.
- **Ecosystem Context Beacons:** Integrated [PROJECT_STATE.md](PROJECT_STATE.md), [NEXT_ACTIONS.md](NEXT_ACTIONS.md), and [docs/DECISION_LOG.md](docs/DECISION_LOG.md) to facilitate agent alignment.

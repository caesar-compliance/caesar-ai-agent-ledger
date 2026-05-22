# Decision Log — caesar-ai-agent-ledger

This document maps all high-level technical, strategic, and governance decisions made for the `caesar-ai-agent-ledger` repository.

---

## 🏛️ Decision History

### [DEC-001] — 19 May 2026 — Repository Standardization & Governance

*   **Status:** Approved
*   **Decisions:**
    1. **Ecosystem Standards Alignment:** Resolved that this repository will strictly follow the standards, layouts, and style guides defined in the central [Caesar AI Governance Hub](https://github.com/caesar-compliance/caesar-ai-governance-hub).
    2. **Execution Framework:** Established that Artem and ChatGPT act as the planning/review Control Tower (high-level design and approval), while AI coding agents serve as the executors (implementation and validation).
    3. **Competitor Code Policy:** Adopted a strict policy that no restricted competitor code or proprietary structures may be copied into this codebase. All designs must be built from original specifications or open-source community standards.
*   **Rationale:** Maintains structural coherence across all Caesar AI tools, preserves legal safety, and establishes a highly disciplined workflow for agent-driven development.

### [DEC-002] — 22 May 2026 — Local Export/Import Dry-Run Contract

*   **Status:** Approved
*   **Decisions:**
    1. Keep export/import work local-only and deterministic by bundling validated JSONL buffer events into `manifest.json`, `events.jsonl`, `summary.json`, and `validation-report.json`.
    2. Keep import behavior dry-run only, mapping intended future operations to `agent_runs`, `agent_events`, and `runtime_events` without opening any Supabase connection.
    3. Preserve strict redaction and forbidden-content checks so no raw secrets, raw customer data, or raw full prompts are exported.
*   **Rationale:** Prepares backend ingestion boundaries while preserving offline safety and disabled-by-default persistence.

### [DEC-003] — 22 May 2026 — Read-only Local Event Projection

*   **Status:** Approved
*   **Decisions:**
    1. Add a local-only read-only projection layer that accepts exactly one source (`events`, `bufferFile`, or `bundleDir`) and emits deterministic metadata-only entities.
    2. Enforce schema validation, forbidden-content checks, and idempotency-key deduplication before applying optional filters (`run_id`, `event_type`, `risk_level`).
    3. Keep projection strictly offline and non-persistent: no Supabase writes, no Worker deploy/use requirement, no network, and no change to disabled-by-default `POST /events`.
*   **Rationale:** Improves local product-data inspection quality while preserving current runtime safety gates and no-ingestion boundaries.

### [DEC-004] — 22 May 2026 — Localhost-only Read-only API over Projection

*   **Status:** Approved
*   **Decisions:**
    1. Add a Node built-in localhost-only HTTP API layer exposing projection views via read-only `GET` endpoints only.
    2. Keep the API bound to `127.0.0.1` by default and reject `0.0.0.0` unless an explicit unsafe override is passed in code.
    3. Keep route responses metadata-only and JSON-only, with stable error envelopes and no write operations.
*   **Rationale:** Enables local operator inspection tooling while preserving offline/no-write safety boundaries and existing disabled ingestion defaults.

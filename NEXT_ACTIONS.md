# Next Actions — caesar-ai-agent-ledger

This document prioritizes upcoming development tasks and establishes execution boundaries for autonomous agents in the `caesar-ai-agent-ledger` repository.

---

## 🚦 Execution Boundaries

### 1. Prioritized Next Steps
*   **Read-only API hardening:** Keep localhost API behavior deterministic, metadata-only, and read-only across supported projection sources.
*   **Next product view:** Build a static/private local dashboard over projection output and the localhost read-only API.

### 2. Safe Autonomous Tasks
*   Adding comments and documentation files inside the planned SDK module structures.
*   Improving code formatting and compliance with the `standards/` style guides.
*   Preparing test datasets containing sample execution logs for validation rules tests.
*   Extending local validators, buffer helpers, and fixtures without enabling live persistence.

### 3. Tasks Requiring Control Tower (Artem / ChatGPT) Approval
*   Adding third-party dependencies (e.g., cryptography packages, framework libraries).
*   Altering public-facing SDK entry points, decorators, or module signatures.
*   Enabling `POST /events` persistence or changing its default disabled state.
*   Applying Supabase schema migrations or enabling live ingestion.

### 4. Blocked Tasks
*   None.

### 5. Cross-Repository Coordination Notes
*   Verify that any event model changes correspond exactly to the `agent-run` JSON schemas hosted in `caesar-ai-evidence` to prevent schema parsing failures downstream.
*   Keep runtime validation local-only until the next Control Tower-approved task explicitly turns on persistence.

# Specification — caesar-ai-agent-ledger

This document outlines the technical specification, SDK scope, and input/output interfaces for `caesar-ai-agent-ledger`.

---

## 📖 Product Specification

### 1. Purpose
`caesar-ai-agent-ledger` is an SDK and lightweight runtime library that provides metadata-first audit logs of autonomous agent behaviors, tool executions, policy checks, and approvals.

### 2. Target Users
*   **AI Developers:** Embedding audit logging into LLM agent flows.
*   **Security Engineers:** Auditing writes, mutations, or API calls made by automated agents.

### 3. Problem Solved
Autonomous agents make decisions dynamically that can include writing to files, executing transactions, or mutating databases. Traditional logs do not cryptographically verify state or document human-in-the-loop approvals, creating compliance gaps. `caesar-ai-agent-ledger` builds an immutable timeline of agent actions.

### 4. MVP Scope
*   **Event Logging Core:** Formulate a standard JSONL event model capturing:
    *   Required event IDs and correlation fields (`run_id`, `event_id`, `idempotency_key`, `correlation_id`).
    *   Event type and risk level classification.
    *   Human approval states and policy checks.
    *   Metadata-only payload summaries and redaction markers.
*   **Local Validation:** Parse and validate fixtures against the event schema without network access.
*   **Local Event Buffering:** Local-only JSONL append/read/summarize/validate buffer for redacted metadata. It stays offline and does not imply hosted persistence.
*   **Local Export/Import Dry-Run:** Deterministic local export bundles (`manifest.json`, `events.jsonl`, `summary.json`, `validation-report.json`) and import dry-run planning mapped to runtime tables without Supabase writes.
*   **Read-only Local Projection:** Local read model over in-memory events, local buffer JSONL, or local export bundles that produces metadata-only runs/events/approvals/tool-calls/risk/error views.
*   **Localhost Read-only API:** Local-only HTTP API exposing projection metadata via read-only routes (`GET` only) on `127.0.0.1`.
*   **Local Supabase Migration Rehearsal:** Static-only local rehearsal validation over `ops/supabase/001_agent_ledger_runtime_schema.sql` with forbidden-action boundaries and no SQL execution.

### 5. Future Scope
*   **Cryptographic Signing:** Local key pair verification signing every transaction record to ensure proof-of-state.
*   **Popular Framework Adapters:** Standard hooks for LangChain, LlamaIndex, CrewAI.
*   **WebSocket Stream:** Live streaming of events directly to `caesar-ai-governance-os`.
*   **Raw prompt capture:** Disabled by default and only eligible for a later explicitly configured task.

### 6. Non-Goals
*   A runtime guardrail agent (this tool does not intercept/block calls itself; it records what was requested and approved).
*   Central identity provider (not an auth platform for users).
*   AI Model hosting or orchestration.
*   Live ingestion or public event persistence in the current task.

---

## ⚙️ Expected Inputs & Outputs

### Expected Inputs
*   **SDK Configurations:** Private key paths, local buffer storage directories.
*   **Developer telemetry hooks:** Function decorators or middle-wares capturing run metadata, event metadata, and redaction state.

### Expected Outputs
*   **Verifiable Log Stream:** Structured JSONL files validating against the local agent event schema and future `caesar-ai-evidence` mappings.
*   **Timeline Report:** Summary Markdown file showing the chronological event path.

---

## 🔗 Relation to Caesar AI Governance Hub
`caesar-ai-agent-ledger` acts as the runtime evidence compiler. While scanners verify static repository states, this SDK captures runtime activities, proving that live systems respect the compliance policies established in the Caesar AI Governance Hub.

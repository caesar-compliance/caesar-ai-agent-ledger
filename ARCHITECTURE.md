# Architecture — caesar-ai-agent-ledger

This document outlines the high-level architecture, module layers, and metadata-first logging pipeline for `caesar-ai-agent-ledger`.

---

## 🏗️ Planned Structure

The SDK is structured into four core module boundaries:

```
┌────────────────────────────────────────────────────────┐
│                   Framework Adapters                   │
│   (Hooks/interceptors for LangChain, LlamaIndex, etc)  │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│                   Telemetry Collector                  │
│   (Captures prompts, tool arguments, risk flags)       │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│                    Signing Registry                    │
│   (Signs entries cryptographically using private keys) │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│                    Buffer & Exporter                   │
│   (Buffers logs locally in JSONL; exports stay gated)  │
└────────────────────────────────────────────────────────┘
```

1.  **Framework Adapters:** Out-of-the-box hooks and decorators that automatically capture agent tool executions and prompt lifecycle events.
2.  **Telemetry Collector:** Extracts metadata, system context, approvals, and risk markers while avoiding raw sensitive payloads by default.
3.  **Event Contract Validator:** Validates required IDs, event types, redaction state, and metadata-only payload fixtures before any future persistence work.
4.  **Signing Registry:** Integrates cryptographic signing. Using local private keys, it signs each log block in future gated phases.
5.  **Buffer & Exporter:** Handles low-latency local buffering through the local JSONL event buffer, writing redacted streams to disk and keeping WebSocket streaming future gated.
6.  **Export/Import Dry-Run Contract:** Packages validated buffered events into deterministic local bundles and computes local-only import plans for `agent_runs`, `agent_events`, and `runtime_events` without network or persistence.
7.  **Read-only Projection Layer:** Builds deterministic local read models (`runs`, `events`, `approvals`, `tool_calls`, `risks`, `errors`, `summary`) from validated local buffer or export-bundle events.

---

## 🔄 Data Flow

The runtime transaction logging flow progresses as follows:

```
[Agent Trigger] ──> (Collector Interceptor) ──> [Payload Ingestion]
                                                        │
                                                        ▼
[Local JSONL Log] <── (Buffer Exporter) <── (Signing Registry)
                                │
                                ▼
                     [Secure WebSockets Stream]
```

1.  **Intercepting:** As the agent executes a step, the interceptor captures inputs, tool calls, and human approvals.
2.  **Validation:** The telemetry collector structures findings according to ecosystem guidelines and local schema checks.
3.  **Signing:** The cryptographic engine signs the payload using the host key in later gated phases only.
4.  **Flushing:** The validated packet is flushed to local storage or pushed via WebSockets to the SaaS layer only after explicit approval.

---

## 🔗 Integration with `caesar-ai-evidence`

`caesar-ai-agent-ledger` writes metadata-first records that can be mapped to the `agent-run` JSON schemas maintained in `caesar-ai-evidence`. The structured logging block includes the:
- `generator` detail tracing the SDK package and version.
- Relational mapping connecting run, event, and approval metadata to future evidence-item definitions.

The local contract also maps to the repository runtime tables:

- `agent_runs` for run lifecycle rows.
- `agent_events` for one row per event.
- `runtime_events` for runtime and validation events.

---

## 📊 Future UI, Reporting & API Expectations

*   **Timeline Report Visualizer:** Local scripts will compile JSONL histories into interactive HTML timeline graphs.
*   **WebSockets dashboard:** Live streaming integration connects directly to the dashboard interface of `caesar-ai-governance-os`, allowing team managers to monitor active agent choices in real-time.

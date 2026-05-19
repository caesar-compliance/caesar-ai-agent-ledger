# Architecture — caesar-ai-agent-ledger

This document outlines the high-level architecture, module layers, and cryptographic logging pipeline for `caesar-ai-agent-ledger`.

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
│   (Buffers logs locally; exports JSONL / WebSocket)    │
└────────────────────────────────────────────────────────┘
```

1.  **Framework Adapters:** Out-of-the-box hooks and decorators that automatically capture agent tool executions and prompt sequences.
2.  **Telemetry Collector:** Extracts metadata, system context, user inputs, outputs, and maps them to control points.
3.  **Signing Registry:** Integrates cryptographic signing. Using local private keys, it signs each log block, producing a secure validation signature.
4.  **Buffer & Exporter:** Handles low-latency local buffering, writing streams to disk as JSONL, and streaming over secure WebSockets.

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
2.  **Validation:** The telemetry collector structures findings according to ecosystem guidelines.
3.  **Signing:** The cryptographic engine signs the payload using the host key.
4.  **Flushing:** The signed packet is flushed to local storage or pushed via WebSockets to the SaaS layer.

---

## 🔗 Integration with `caesar-ai-evidence`

`caesar-ai-agent-ledger` writes records conforming strictly to the `agent-run` JSON schemas maintained in `caesar-ai-evidence`. The structured logging block includes the:
- `generator` detail tracing the SDK package and version.
- Relational mapping connecting tool calls directly to `evidence-item` definitions.

---

## 📊 Future UI, Reporting & API Expectations

*   **Timeline Report Visualizer:** Local scripts will compile JSONL histories into interactive HTML timeline graphs.
*   **WebSockets dashboard:** Live streaming integration connects directly to the dashboard interface of `caesar-ai-governance-os`, allowing team managers to monitor active agent choices in real-time.

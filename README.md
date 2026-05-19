# Caesar AI Agent Ledger (`caesar-ai-agent-ledger`)

> Client-side SDK and runtime logging system for autonomous AI agent actions, part of the [Caesar AI Governance Hub](https://github.com/caesar-compliance/caesar-ai-governance-hub) ecosystem.

---

## 📖 Overview

**`caesar-ai-agent-ledger`** is a runtime logging library and client-side SDK. It serves as a cryptographically signed execution ledger that tracks autonomous AI agent actions, prompt templates, tool executions, API endpoints, risk categories, and human-in-the-loop approvals.

This SDK is part of the Caesar AI Governance Hub ecosystem at [caesar.no](https://caesar.no), providing a verifiable timeline of agent behavior.

### 🚦 Project Status
> [!NOTE]
> This repository is currently in the **repository foundation** stage. SDK implementation, middleware development, and cryptographic signing libraries are slated for future development phases.

---

## 👥 Who It Is For

*   **AI Engineers & Framework Developers:** Integrating continuous audit logging into agents built with LangChain, LlamaIndex, CrewAI, AutoGen, or custom runtimes.
*   **CTOs & Product Owners:** Maintaining a reliable, tamper-resistant trail of autonomous decisions, database mutations, and transactions.
*   **Compliance & Risk Officers:** Verifying that AI agents respect operating parameters and documented human-in-the-loop approvals.

---

## 🛠️ How It Connects

### 1. Caesar AI Governance Hub Connection
`caesar-ai-agent-ledger` is the runtime auditing arm of the ecosystem. It records the operational choices made by active agents, validating that real-time runtime flows respect the organizational policies monitored by the parent hub.

### 2. Connection to `caesar-ai-evidence`
All runtime logs and transaction records produced by the SDK conform strictly to the `agent-run` and related schemas defined in [caesar-ai-evidence](https://github.com/caesar-compliance/caesar-ai-evidence).

---

## ⚖️ Important Disclaimer

> [!IMPORTANT]
> **No Compliance Guarantees:** `caesar-ai-agent-ledger` is a logging utility and SDK designed to capture, sign, and document AI agent execution trails. It **does not guarantee regulatory compliance**, legal clearance, or audit approvals. Regulatory compliance remains a holistic legal, operational, and organizational state determined by accredited auditors, legal experts, and competent authorities.

---

## 📂 Repository Directory

*   **[SPEC.md](SPEC.md)** — SDK configuration guidelines, JSON log formats, and API scopes.
*   **[ARCHITECTURE.md](ARCHITECTURE.md)** — Core SDK layout, cryptographic state signing, and execution flow.
*   **[ROADMAP.md](ROADMAP.md)** — Multi-phase project development roadmap.
*   **[CHANGELOG.md](CHANGELOG.md)** — Chronological release history.
*   **[REPO_INVENTORY.md](REPO_INVENTORY.md)** — Structural file index of this codebase.
*   **[PROJECT_STATE.md](PROJECT_STATE.md)** — Project phase, metadata tracker, and boundaries.
*   **[NEXT_ACTIONS.md](NEXT_ACTIONS.md)** — Task execution lists and autonomous boundaries.
*   **[docs/RESEARCH_CONTEXT.md](docs/RESEARCH_CONTEXT.md)** — Functional domain research and strategic context.
*   **[docs/DECISION_LOG.md](docs/DECISION_LOG.md)** — Architectural decision log history.

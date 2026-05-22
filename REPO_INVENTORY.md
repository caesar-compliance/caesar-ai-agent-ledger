# Repository Inventory — caesar-ai-agent-ledger

This is a living registry of all files currently tracked in the `caesar-ai-agent-ledger` repository. It provides developers and automated agents with a reference mapping each file to its exact role in the codebase structure.

---

## 📂 File Directory

| File Path | Primary Role | Description |
| :--- | :--- | :--- |
| 🛡️ **`README.md`** | Main Introduction | Summarizes the project vision, functional SDK workflows, target audience, ecosystem alignment with [caesar-ai-governance-hub](https://github.com/caesar-compliance/caesar-ai-governance-hub), and legal disclaimers. |
| 📋 **`SPEC.md`** | Technical Specification | Defines core SDK scope, inputs, outputs, non-goals, and CLI boundaries. |
| 🏗️ **`ARCHITECTURE.md`** | System Architecture | Visualizes codebase modular layers, cryptographic signing pipelines, and adapter connections. |
| 🚦 **`ROADMAP.md`** | Project Roadmap | Lists development phases transitioning the SDK from planning stages through stable release. |
| 📝 **`CHANGELOG.md`** | Historical Log | Contains a semver-compliant, chronological history of all updates and releases. |
| 🗃️ **`REPO_INVENTORY.md`** | Workspace Registry | This file; provides a continuous, machine-readable index mapping files to functional roles. |
| 🚦 **`PROJECT_STATE.md`** | Project State | Tracks active developmental phase, metadata, boundaries, active tasks, and milestones. |
| 🤖 **`NEXT_ACTIONS.md`** | Next Actions | Prioritizes upcoming tasks and establishes boundaries for autonomous agent executions. |
| 📚 **`docs/runtime/AGENT_EVENT_MODEL.md`** | Event Contract | Defines the metadata-first task/run/event contract, IDs, risk levels, retention rules, and disabled-by-default event ingestion boundary. |
| 📚 **`docs/runtime/LOCAL_EVENT_EXPORT_IMPORT_CONTRACT.md`** | Export/Import Contract | Defines local-only bundle layout, validation rules, import dry-run behavior, and strict safety boundaries for T017. |
| 🔬 **`docs/RESEARCH_CONTEXT.md`** | Domain Research | Ingests strategic requirements, user personas, and target scopes compiled from the ecosystem. |
| ⚖️ **`docs/DECISION_LOG.md`** | Decision Log | Records chronological technical, strategic, and governance decisions. |
| 🧪 **`schemas/agent-ledger-event.schema.json`** | Event Schema | Local JSON Schema draft 2020-12 contract for metadata-first agent events. |
| 🧪 **`src/event-buffer/agent-event-validator.mjs`** | Validation Helper | Shared local-only event schema and raw-secret validation helpers for fixtures and buffer flows. |
| 🧪 **`src/event-buffer/local-event-buffer.mjs`** | Local Buffer | Local JSONL event buffer with append, read, summarize, and validate operations. |
| 🧪 **`src/export-import/local-event-export-bundle.mjs`** | Export/Import Module | Builds and validates deterministic local export bundles and creates local-only import dry-run plans. |
| 🧪 **`fixtures/events/valid-tool-call-requested.json`** | Event Fixture | Valid metadata-only tool-call request example used by local validation. |
| 🧪 **`fixtures/events/valid-approval-granted.json`** | Event Fixture | Valid approval-granted example with parent-event linkage and no raw payloads. |
| 🧪 **`fixtures/events/invalid-raw-secret.json`** | Event Fixture | Negative test fixture that intentionally includes forbidden raw secret content. |
| 🧪 **`scripts/runtime/validate-agent-event-schema.mjs`** | Local Validator | Self-contained schema/fixture validator for the agent event model. |
| 🧪 **`scripts/runtime/test-local-event-buffer.mjs`** | Local Buffer Test | Fixture-driven append/read/summarize/validate test for the local JSONL event buffer. |
| 🧪 **`scripts/runtime/test-local-event-export-import.mjs`** | Export/Import Test | Local-only test for bundle build, bundle validation, import dry-run mapping, and invalid-event rejection. |
| 🧪 **`scripts/runtime/runtime-smoke.mjs`** | Smoke Validation | Runs local schema, event-model, and credential checks with exit-code enforcement. |
| 🧪 **`scripts/test-cloudflare-worker-local.mjs`** | Worker Local Test | Verifies the disabled-by-default event route and stubbed local readiness behavior. |
| 🧪 **`docs/runtime/LOCAL_EVENT_BUFFER.md`** | Buffer Guide | Local-only JSONL buffer purpose, safety boundary, idempotency, and test instructions. |
| 🧪 **`work-items/T015-agent-event-model-validation-hardening/TASK.md`** | Work Item Task | Task scope, boundaries, and checklist for the T015 event-model hardening work. |
| 🧪 **`work-items/T015-agent-event-model-validation-hardening/DECISIONS.md`** | Work Item Decisions | Captures local implementation assumptions and tradeoffs for T015. |
| 🧪 **`work-items/T015-agent-event-model-validation-hardening/VALIDATION.md`** | Work Item Validation | Records exact local validation commands and results for T015. |
| 🧪 **`work-items/T015-agent-event-model-validation-hardening/FINAL_REPORT.md`** | Work Item Report | Final closeout report for T015, including validation and merge state. |
| 🧪 **`work-items/T016-local-event-buffer/TASK.md`** | Work Item Task | Task scope, boundaries, and checklist for the T016 local buffer implementation. |
| 🧪 **`work-items/T016-local-event-buffer/DECISIONS.md`** | Work Item Decisions | Captures local implementation assumptions and tradeoffs for T016. |
| 🧪 **`work-items/T016-local-event-buffer/VALIDATION.md`** | Work Item Validation | Records exact local validation commands and results for T016. |
| 🧪 **`work-items/T016-local-event-buffer/FINAL_REPORT.md`** | Work Item Report | Final closeout report for T016, including validation and merge state. |
| 🧪 **`work-items/T017-local-event-export-import-contract/TASK.md`** | Work Item Task | Task scope, boundaries, and checklist for the T017 local export/import contract implementation. |
| 🧪 **`work-items/T017-local-event-export-import-contract/DECISIONS.md`** | Work Item Decisions | Captures local implementation assumptions and tradeoffs for T017. |
| 🧪 **`work-items/T017-local-event-export-import-contract/VALIDATION.md`** | Work Item Validation | Records exact local validation commands and results for T017. |
| 🧪 **`work-items/T017-local-event-export-import-contract/FINAL_REPORT.md`** | Work Item Report | Final closeout report for T017, including validation and merge state. |
| 🗂️ **`reports/runtime-services-readiness.latest.json`** | Runtime Readiness Report | Generated readiness snapshot from local credential validation; contains metadata only. |
| ⚙️ **`work-items/.gitkeep`** | Work Sandbox | Directory placeholder preserving workspace sandboxes for active task executions. |

---

## 🛠️ Update Guidelines

When modifying this repository:
1. Ensure any new SDK specs or adapters are correctly documented inside `SPEC.md`.
2. Add any newly introduced folders or core file assets to this registry table.
3. Update `CHANGELOG.md` reflecting the appropriate semver version bump.

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
| 📚 **`docs/runtime/READ_ONLY_LOCAL_EVENT_PROJECTION.md`** | Projection Contract | Defines local-only read-only projection input sources, output entities, sorting/filtering rules, deduplication, and safety boundaries for T018. |
| 📚 **`docs/runtime/LOCALHOST_READ_ONLY_API.md`** | Local API Contract | Defines localhost-only read-only API endpoints, filters, response/error shapes, and safety boundaries for T019. |
| 📚 **`docs/runtime/STATIC_LOCAL_DASHBOARD.md`** | Dashboard Contract | Defines static/private local dashboard purpose, non-goals, data-source model, sections, filters, and explicit safety boundaries for T020. |
| 📚 **`docs/runtime/BACKEND_RUNTIME_READINESS_BOUNDARY.md`** | Runtime Boundary Contract | Defines backend runtime readiness purpose, non-goals, allowed local validation commands, forbidden activation actions, and readiness gates for future approved runtime work (T021). |
| 📚 **`docs/runtime/LOCAL_SUPABASE_MIGRATION_REHEARSAL.md`** | Supabase Rehearsal Contract | Defines T022 local-only static migration rehearsal purpose, forbidden actions, future compile-gate requirements, and explicit no-DB/no-apply boundary. |
| 🔬 **`docs/RESEARCH_CONTEXT.md`** | Domain Research | Ingests strategic requirements, user personas, and target scopes compiled from the ecosystem. |
| ⚖️ **`docs/DECISION_LOG.md`** | Decision Log | Records chronological technical, strategic, and governance decisions. |
| 🧪 **`schemas/agent-ledger-event.schema.json`** | Event Schema | Local JSON Schema draft 2020-12 contract for metadata-first agent events. |
| 🧪 **`src/event-buffer/agent-event-validator.mjs`** | Validation Helper | Shared local-only event schema and raw-secret validation helpers for fixtures and buffer flows. |
| 🧪 **`src/event-buffer/local-event-buffer.mjs`** | Local Buffer | Local JSONL event buffer with append, read, summarize, and validate operations. |
| 🧪 **`src/export-import/local-event-export-bundle.mjs`** | Export/Import Module | Builds and validates deterministic local export bundles and creates local-only import dry-run plans. |
| 🧪 **`src/projection/read-only-event-projection.mjs`** | Projection Module | Builds a deterministic metadata-only read model (`runs`, `events`, `approvals`, `tool_calls`, `risks`, `errors`, `summary`) from local buffer, bundle, or event-array inputs. |
| 🧪 **`src/local-api/read-only-api-server.mjs`** | Local API Server | Node built-in localhost-only read-only HTTP API over projection outputs with JSON responses and stable errors. |
| 🧪 **`fixtures/events/valid-tool-call-requested.json`** | Event Fixture | Valid metadata-only tool-call request example used by local validation. |
| 🧪 **`fixtures/events/valid-approval-granted.json`** | Event Fixture | Valid approval-granted example with parent-event linkage and no raw payloads. |
| 🧪 **`fixtures/events/invalid-raw-secret.json`** | Event Fixture | Negative test fixture that intentionally includes forbidden raw secret content. |
| 🧪 **`scripts/runtime/validate-agent-event-schema.mjs`** | Local Validator | Self-contained schema/fixture validator for the agent event model. |
| 🧪 **`scripts/runtime/test-local-event-buffer.mjs`** | Local Buffer Test | Fixture-driven append/read/summarize/validate test for the local JSONL event buffer. |
| 🧪 **`scripts/runtime/test-local-event-export-import.mjs`** | Export/Import Test | Local-only test for bundle build, bundle validation, import dry-run mapping, and invalid-event rejection. |
| 🧪 **`scripts/runtime/test-read-only-event-projection.mjs`** | Projection Test | Local-only fixture test that validates projection behavior for local buffer and local export-bundle sources with filter and redaction checks. |
| 🧪 **`scripts/runtime/test-localhost-read-only-api.mjs`** | Local API Test | Localhost-only test that starts the read-only API on `127.0.0.1` ephemeral port and validates routes, filters, `405`, `404`, and secret-safety checks. |
| 🧪 **`scripts/runtime/validate-static-local-dashboard.mjs`** | Dashboard Validator | Static validator for dashboard files, external-resource bans, secret-like scan checks, and deterministic sample summary assertions. |
| 🧪 **`scripts/runtime/test-static-local-dashboard.mjs`** | Dashboard Localhost Test | Starts a localhost-only static file server (`127.0.0.1`, port `0`) and verifies key dashboard asset routes return `200`. |
| 🧪 **`scripts/runtime/validate-runtime-readiness-boundary.mjs`** | Runtime Boundary Validator | Node built-in validator that checks boundary config/doc existence, required scripts/files, workflow/manual-gate protections, worker/api/dashboard safety boundaries, and tracked secret-file constraints (T021). |
| 🧪 **`scripts/runtime/validate-local-supabase-migration-rehearsal.mjs`** | Supabase Rehearsal Validator | Node built-in validator for T022 static schema-table checks, forbidden-pattern scans, tracked env/tmp guardrails, and workflow cron/schedule checks with no SQL execution. |
| 🧪 **`scripts/runtime/runtime-smoke.mjs`** | Smoke Validation | Runs local event/runtime validations, boundary checks, Supabase rehearsal checks, schema static checks, and credential checks with exit-code enforcement. |
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
| 🧪 **`work-items/T018-read-only-local-event-projection/TASK.md`** | Work Item Task | Task scope, boundaries, and checklist for the T018 read-only local event projection implementation. |
| 🧪 **`work-items/T018-read-only-local-event-projection/DECISIONS.md`** | Work Item Decisions | Captures local implementation assumptions and tradeoffs for T018. |
| 🧪 **`work-items/T018-read-only-local-event-projection/VALIDATION.md`** | Work Item Validation | Records exact local validation commands and results for T018. |
| 🧪 **`work-items/T018-read-only-local-event-projection/FINAL_REPORT.md`** | Work Item Report | Final closeout report for T018, including validation and merge state. |
| 🧪 **`work-items/T019-localhost-read-only-api/TASK.md`** | Work Item Task | Task scope, boundaries, and checklist for T019 localhost read-only API implementation. |
| 🧪 **`work-items/T019-localhost-read-only-api/DECISIONS.md`** | Work Item Decisions | Captures implementation tradeoffs and localhost/read-only boundary decisions for T019. |
| 🧪 **`work-items/T019-localhost-read-only-api/VALIDATION.md`** | Work Item Validation | Records required validation commands and outcomes for T019. |
| 🧪 **`work-items/T019-localhost-read-only-api/FINAL_REPORT.md`** | Work Item Report | Final closeout report for T019 localhost read-only API implementation. |
| 🗂️ **`reports/runtime-services-readiness.latest.json`** | Runtime Readiness Report | Generated readiness snapshot from local credential validation; contains metadata only. |
| 🧭 **`site/local-dashboard/index.html`** | Dashboard Entry | Static local dashboard shell for metadata-only runtime inspection sections. |
| 🧭 **`site/local-dashboard/assets/dashboard.css`** | Dashboard Styles | Local-only CSS styling for cards, tables, filters, badges, and responsive desktop/laptop layout. |
| 🧭 **`site/local-dashboard/assets/dashboard.js`** | Dashboard Renderer | Client-side local renderer for sample projection loading, summary cards, section tables, and filters. |
| 🧭 **`site/local-dashboard/data/sample-projection.json`** | Dashboard Sample Data | Deterministic metadata-only projection sample aligned to T018/T019 summary values. |
| ⚙️ **`config/runtime-readiness-boundary.json`** | Runtime Boundary Policy | Machine-checkable policy config for local runtime readiness boundaries, required scripts/docs/files, and forbidden tracked files (T021). |
| ⚙️ **`config/local-supabase-migration-rehearsal.json`** | Supabase Rehearsal Policy | Machine-checkable T022 policy config for local static migration rehearsal mode, expected migration structure, and forbidden actions. |
| 🗂️ **`reports/samples/local-supabase-migration-rehearsal.sample.json`** | Rehearsal Sample Manifest | Deterministic/sanitized static sample output for local Supabase migration rehearsal scans. |
| 🧪 **`work-items/T020-static-local-dashboard/TASK.md`** | Work Item Task | Task scope, boundaries, and checklist for T020 static/private local dashboard implementation. |
| 🧪 **`work-items/T020-static-local-dashboard/DECISIONS.md`** | Work Item Decisions | Captures implementation assumptions and local-only dashboard safety tradeoffs for T020. |
| 🧪 **`work-items/T020-static-local-dashboard/VALIDATION.md`** | Work Item Validation | Records required validation commands and outcomes for T020. |
| 🧪 **`work-items/T020-static-local-dashboard/FINAL_REPORT.md`** | Work Item Report | Final closeout report for T020 static/private local dashboard implementation. |
| 🧪 **`work-items/T021-backend-runtime-readiness-boundary/TASK.md`** | Work Item Task | Task scope, boundaries, and deliverables for T021 backend runtime readiness boundary hardening. |
| 🧪 **`work-items/T021-backend-runtime-readiness-boundary/DECISIONS.md`** | Work Item Decisions | Captures implementation choices and machine-check boundary tradeoffs for T021. |
| 🧪 **`work-items/T021-backend-runtime-readiness-boundary/VALIDATION.md`** | Work Item Validation | Records required validation command execution outcomes for T021. |
| 🧪 **`work-items/T021-backend-runtime-readiness-boundary/FINAL_REPORT.md`** | Work Item Report | Final closeout report for T021 backend runtime readiness boundary hardening. |
| 🧪 **`work-items/T022-local-supabase-migration-rehearsal/TASK.md`** | Work Item Task | Task scope, boundaries, and deliverables for T022 local Supabase migration rehearsal/compile gate implementation. |
| 🧪 **`work-items/T022-local-supabase-migration-rehearsal/DECISIONS.md`** | Work Item Decisions | Captures T022 static-only design choices and validator safety assumptions. |
| 🧪 **`work-items/T022-local-supabase-migration-rehearsal/VALIDATION.md`** | Work Item Validation | Records required cleanup, baseline, and final validation command outcomes for T022. |
| 🧪 **`work-items/T022-local-supabase-migration-rehearsal/FINAL_REPORT.md`** | Work Item Report | Final closeout report for T022 including safety confirmations and merge status. |
| ⚙️ **`work-items/.gitkeep`** | Work Sandbox | Directory placeholder preserving workspace sandboxes for active task executions. |

---

## 🛠️ Update Guidelines

When modifying this repository:
1. Ensure any new SDK specs or adapters are correctly documented inside `SPEC.md`.
2. Add any newly introduced folders or core file assets to this registry table.
3. Update `CHANGELOG.md` reflecting the appropriate semver version bump.

# T017 Task — Local Export/Import Contract for Buffered Agent Events

## Scope

Implement a local-only export/import contract for buffered Agent Ledger events with:

- deterministic export bundle build
- bundle validation
- import dry-run planning mapped to runtime tables
- strict local/offline safety boundaries

## Checklist

- [x] Add contract doc `docs/runtime/LOCAL_EVENT_EXPORT_IMPORT_CONTRACT.md`
- [x] Add module `src/export-import/local-event-export-bundle.mjs`
- [x] Add test `scripts/runtime/test-local-event-export-import.mjs`
- [x] Wire package script and runtime smoke
- [x] Sync project/runtime docs
- [x] Run full required validation gates

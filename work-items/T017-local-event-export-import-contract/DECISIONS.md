# T017 Decisions

## 22 May 2026

1. Bundle shape is fixed to `manifest.json`, `events.jsonl`, `summary.json`, `validation-report.json` for deterministic tooling and easy local inspection.
2. Import remains dry-run only and returns counts/warnings without any Supabase connection.
3. Secret-safety is enforced by reusing forbidden-content scanning from the T015 validator path.
4. Test workspace is limited to `.tmp/agent-ledger/local-event-export-import-test/` and cleaned after test completion.

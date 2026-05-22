# T016 Decisions

## 22 May 2026

- Chose a shared local validation helper in `src/event-buffer/agent-event-validator.mjs` so the schema validator script and buffer module use the same rules.
- Kept the buffer local-only and dependency-free by using Node built-ins only.
- Used JSONL append-only writes to preserve a simple offline audit trail and avoid overwriting prior buffer history.
- Added `.tmp/` to `.gitignore` so the test harness can use a local scratch path without polluting the worktree.
- Rejected obvious raw secret-like keys and values conservatively to keep the buffer metadata-first.

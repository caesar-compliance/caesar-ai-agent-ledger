# T022 Decisions

Date: 22 May 2026

1. Kept the rehearsal gate strictly static/local-only and machine-checkable to align with T021 boundaries.
2. Added table detection via SQL text inspection for `agent_runs`, `agent_events`, and `runtime_events` without executing SQL.
3. Added forbidden-pattern scanning (`supabase db push`, remote connection strings, `psql postgres://`, `drop database`, `drop schema`, secret-like tokens).
4. Added tracked-file checks for `.env*` and `.tmp` through `git ls-files`.
5. Added workflow cron/schedule scan to ensure no schedule-triggered automation was introduced.
6. Included T022 artifacts as required dependencies in boundary validator and runtime smoke sequence.

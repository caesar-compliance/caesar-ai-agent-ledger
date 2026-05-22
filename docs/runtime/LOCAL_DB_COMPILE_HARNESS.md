# Local DB Compile Harness (T023)

## Purpose

Define a safe contract for a future local database compile harness in Caesar AI Agent Ledger.

## Non-goals

- No SQL execution in T023.
- No local DB start in T023.
- No remote DB access in T023.
- No Supabase CLI, Docker, or psql usage in T023.

## Relation to T021 boundary

T021 introduced backend/runtime readiness boundaries and machine-checkable local safety gates.  
T023 extends those boundaries with a compile-harness stub that is disabled by default.

## Relation to T022 rehearsal

T022 introduced local static Supabase migration rehearsal checks over:

- `ops/supabase/001_agent_ledger_runtime_schema.sql`

T023 does not replace T022. It adds a separate, explicit harness contract for future local compile execution gates while remaining disabled.

## Future harness intent (not enabled in T023)

When explicitly approved in a future Control Tower task, the harness may:

- create a local-only database target,
- apply schema locally,
- run compile and rollback checks,
- verify expected tables, constraints, and indexes.

## What T023 does now

- Adds documentation, config, a disabled stub runner, and a validator.
- Ensures harness mode is disabled-by-default.
- Proves the stub reports `disabled` and `not executed`.
- Integrates checks into runtime boundary and smoke validation.

## Required future approval before enablement

Actual local DB compile execution requires a separate explicit Control Tower-approved task.

## Required future safety prerequisites

- Local-only database URL.
- No secrets committed.
- No remote database URL.
- Explicit Control Tower approval.
- Clean git status before execution.
- Defined rollback and teardown plan.

## Explicit rule

T023 is documentation/config/stub/validation only.

T023 does not execute SQL, does not invoke Docker, does not invoke psql, does not invoke Supabase CLI, and does not connect to any database.

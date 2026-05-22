# Local Supabase Migration Rehearsal

Last updated: 22 May 2026
Task: T022

## Purpose

Define a local-only, static rehearsal gate for the existing Supabase schema scaffold so future migration compile work can be prepared safely without applying schema changes.

## Non-goals

- Running a database.
- Executing SQL.
- Applying schema locally or remotely.
- Enabling runtime persistence.
- Enabling deployment, cron, scheduler, or ingestion.

## Relation to T021 Runtime Boundary

T021 established backend runtime readiness boundaries and machine-check validation for local-safe runtime checks. T022 extends that boundary with a Supabase migration rehearsal gate that remains static and disabled-by-default for any compile/apply execution path.

## Current Supabase Schema Scaffold

- `ops/supabase/001_agent_ledger_runtime_schema.sql`

This file is treated as a static artifact for inspection and structural checks only.

## Local-only Rehearsal Concept

Rehearsal means validating migration readiness through deterministic static checks:

- Presence and parseability of local rehearsal config.
- Presence of the runtime boundary prerequisites.
- Static SQL inspection for expected table definitions.
- Static forbidden-pattern scans.

No database is started and no mutation target is contacted.

## Allowed Now

- Static SQL inspection.
- Deterministic migration manifest generation.
- Dry-run plan creation.
- Local-only compile harness design (design only, disabled by default).

## Forbidden Now

- Live Supabase apply.
- Remote Supabase CLI execution.
- `psql` against remote databases.
- Docker/Supabase local start unless explicitly approved in a future task.
- Writes to any database.
- Secrets usage in tracked files, docs, or reports.

## Future Local Compile Gate Requirements

- Explicit Control Tower approval before enabling any local database execution path.
- Dedicated local-only harness script with disabled-by-default switches.
- Deterministic SQL compile checks with no remote connectivity.
- Explicit rollback simulation notes before any activation.

## Rollback Expectations for Future Live Setup

Before any future live apply, rollback must be pre-defined with:

- Reversible migration strategy per migration.
- Verified backup/restore procedure.
- Explicit downgrade/disable procedure for ingestion and write paths.

## Safety Checklist Before Any Future Live Apply

- Control Tower approval recorded.
- Runtime boundary validation passes.
- Supabase rehearsal validation passes.
- Credentials audit passes with no secret leakage in tracked files.
- Dry-run plan reviewed and signed off.
- Rollback procedure documented and testable.
- No cron/scheduler/live ingestion enabled by default.

## Explicit T022 Safety Statement

T022 does not run a database and does not apply schema.

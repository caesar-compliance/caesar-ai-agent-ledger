# Backend Runtime Readiness Boundary

Date: 22 May 2026
Task: T021 — Backend Runtime Readiness Boundary Hardening

## Purpose

Define and enforce a machine-checkable boundary for backend runtime readiness work so local scaffolding and validation can progress without activating live infrastructure.

## Non-goals

- No Supabase schema apply and no Supabase write operations.
- No Cloudflare Worker deployment.
- No GitHub Actions runtime activation runs.
- No cron/scheduler enablement.
- No hosted ingestion or live agent telemetry ingestion.
- No customer data ingestion.
- No public dashboard deployment.

## Current runtime layers

1. Local event model.
2. Local buffer.
3. Export/import dry-run.
4. Read-only projection.
5. Localhost API.
6. Static local dashboard.
7. Supabase schema scaffold.
8. Cloudflare Worker scaffold.

## Safe-by-default invariants

- Local API binds to `127.0.0.1` by default.
- `0.0.0.0` is treated as unsafe unless explicitly overridden in code for controlled local testing.
- Worker `POST /events` remains disabled by default (`ENABLE_AGENT_EVENTS` must not be enabled by default).
- Runtime checks are local validation-only and dry-run where ingestion behavior is exercised.
- No raw secrets, raw full prompts, or raw customer payloads are committed.
- Generated readiness report churn file (`reports/runtime-services-readiness.latest.json`) is non-authoritative output and should not be committed as functional code change.

## Allowed local-only commands

- `npm run runtime:validate:event-model`
- `npm run runtime:test:event-buffer`
- `npm run runtime:test:event-export-import`
- `npm run runtime:test:event-projection`
- `npm run runtime:test:localhost-api`
- `npm run runtime:validate:static-dashboard`
- `npm run runtime:test:static-dashboard`
- `npm run runtime:validate:boundary`
- `node scripts/runtime/validate-supabase-schema.mjs`
- `node scripts/test-cloudflare-worker-local.mjs`
- `node scripts/runtime/check-service-credentials.mjs`
- `npm run runtime:ingestion:dry-run`
- `npm run runtime:smoke`

## Forbidden actions without future Control Tower approval

- Supabase apply/write.
- Cloudflare deploy.
- GitHub Actions runtime activation.
- Cron/scheduler activation.
- Hosted ingestion.
- Live agent telemetry ingestion.
- Customer data ingestion.
- Public dashboard deployment.

## Readiness checklist for future local Supabase rehearsal

- Validate schema file compiles via `node scripts/runtime/validate-supabase-schema.mjs`.
- Keep apply flag disabled by default in local runtime configuration.
- Verify runtime boundary validator passes.
- Confirm tracked file scan excludes `.env.runtime.local`, `.env.cloudflare.local`, `.env`, and `.env.local`.
- Confirm dry-run ingestion completes without network writes.

## Readiness checklist for future controlled private runtime setup

- Keep workflow activation manually gated with explicit confirmation string.
- Keep deploy/apply flags opt-in and disabled by default.
- Keep Worker POST ingestion disabled by default and non-persistent in local tests.
- Keep local dashboard static/private with no external URL dependencies.
- Receive explicit Control Tower approval before any deploy/apply/activation change.

## Explicit rule

T021 must not deploy, apply, or activate anything.

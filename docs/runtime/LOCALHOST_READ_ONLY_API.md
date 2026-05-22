# Localhost Read-only API over Projection (T019)

## Purpose

Provide a local-only HTTP API for developer/operator inspection of metadata-only Agent Ledger projection data.

The API reads validated local event sources and exposes read-only JSON endpoints for inspection and testing.

## Non-goals

- no write/persist endpoints
- no Supabase connection or writes
- no Cloudflare Worker deploy behavior
- no hosted or live ingestion
- no scheduler/cron
- no external network execution
- no raw prompts, secrets, or raw customer data

## Relation to earlier tasks

- **T015 event model:** API depends on schema-valid, metadata-first event objects.
- **T016 local buffer:** API can source projection input from local JSONL buffer files.
- **T017 export/import contract:** API can source projection input from local export bundle directories.
- **T018 read-only projection:** API is a thin HTTP layer over the projection output.

## Localhost security boundary

- Default host is `127.0.0.1`.
- The server must never bind `0.0.0.0` by default.
- `0.0.0.0` is rejected unless an explicit unsafe override is passed in code.
- T019 docs and tests do not use unsafe override.

Recommended usage is local developer runtime only.

## Input sources

Exactly one input source is allowed:

- `bufferFile`
- `bundleDir`
- `events` (in-memory testing)

## Endpoints

- `GET /healthz`
- `GET /version`
- `GET /projection`
- `GET /runs`
- `GET /runs/:run_id`
- `GET /events`
- `GET /approvals`
- `GET /tool-calls`
- `GET /risks`
- `GET /errors`

## Query filters

Supported exact-match filters:

- `run_id`
- `event_type`
- `risk_level`

Primary filtered route is `GET /events`, while `run_id` is also supported through `GET /runs/:run_id`.

## Response shape

Successful responses are JSON and include `ok: true`.

Examples:

- `/healthz`: `{ ok, service, local_only }`
- `/version`: `{ ok, package_name, package_version, api_mode }`
- Collection routes: `{ ok, count, data }`
- `/projection`: `{ ok, data }` where `data` is full projection object

## Error shape

All errors are JSON with a stable shape:

- `ok: false`
- `error: string`
- `code: string`

Typical status/code pairs:

- `404` + `not_found`
- `405` + `method_not_allowed`
- `500` + `internal_error`

## Redaction and metadata-only rules

API responses expose projection output only and must stay metadata-only:

- no raw prompt text
- no secret fields/values
- no raw customer payload
- no tool argument payload dumps

## Explicit safety boundaries

- no DB connections
- no Worker deploy
- no Supabase writes
- no GitHub Actions execution
- no scheduler/cron
- no live/hosted ingestion
- no external network calls
- no secrets/customer data/raw prompts in responses

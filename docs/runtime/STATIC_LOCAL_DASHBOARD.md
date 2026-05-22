# Static Local Dashboard (T020)

**Date:** 22 May 2026

## Purpose

Provide a static, private, local-only operator dashboard for inspecting metadata-only Agent Ledger projection output.

The dashboard is for local runtime inspection and validation. It must remain read-only.

## Non-goals

- No hosted/public deployment.
- No external network data loading.
- No Supabase writes.
- No Cloudflare deploy behavior.
- No scheduler/cron/live ingestion.
- No customer-data ingestion.
- No raw prompt rendering.

## Relation to prior tasks

- **T015 event model:** Dashboard expects metadata-first records and preserves forbidden raw-content boundaries.
- **T016 local event buffer:** Dashboard can represent projection built from local buffer-backed events.
- **T017 export/import contract:** Dashboard can represent projection built from bundle-backed events.
- **T018 read-only projection:** Dashboard visual model aligns to projection entities (`summary`, `runs`, `events`, `approvals`, `tool_calls`, `risks`, `errors`).
- **T019 localhost API:** Dashboard can consume equivalent JSON returned by localhost read-only API when manually served.

## Local/private-only boundary

- Static files under `site/local-dashboard/` are intended for local inspection only.
- No GitHub Pages workflow is created.
- No public Pages deployment is enabled.
- No remote script/font/CDN analytics resources are allowed.

## Supported data source

Two safe local source patterns are supported:

1. `site/local-dashboard/data/sample-projection.json` (default deterministic sample)
2. Localhost read-only API JSON from T019, only when a developer manually serves and points a local loader path in a controlled local run

T020 ships with the static sample projection file and no live fetch to external sources.

## Dashboard sections

- Overview
- Runs
- Events
- Approvals
- Tool calls
- Risks
- Errors

## Filtering behavior

The dashboard supports local client-side filtering by:

- `event_type` exact match
- `risk_level` exact match
- `run_id`/search text match

Filtering updates summary and section tables deterministically.

## Redaction and metadata-only rules

- Render metadata-only projection fields.
- Do not render raw prompts.
- Do not render secret values or key-like payloads.
- Do not render customer content payloads.

## Explicit safety boundaries

- No raw prompts.
- No secrets.
- No customer data.
- No DB writes.
- No deploy behavior.
- No external network.
- No public Pages/GitHub Actions workflow for this dashboard.

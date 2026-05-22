# T020 — Static/private local dashboard

Date: 22 May 2026

## Scope

- Add static/private local dashboard contract doc.
- Add static dashboard UI and deterministic metadata-only sample projection.
- Add static dashboard validation script and localhost-only static test script.
- Wire package/runtime smoke scripts.
- Sync runtime/project/work-item docs.

## Boundaries

- Local-only, read-only, metadata-only.
- No CDN, no external scripts/fonts/analytics.
- No Supabase writes, no Cloudflare deploy, no GitHub Actions run.
- No hosted/live ingestion.

## Checklist

- [x] `docs/runtime/STATIC_LOCAL_DASHBOARD.md`
- [x] `site/local-dashboard/` files
- [x] deterministic `sample-projection.json`
- [x] `scripts/runtime/validate-static-local-dashboard.mjs`
- [x] `scripts/runtime/test-static-local-dashboard.mjs`
- [x] package scripts + runtime smoke update
- [x] docs sync
- [x] full validation run
- [x] commit/merge/push

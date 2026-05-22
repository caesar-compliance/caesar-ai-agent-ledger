# T020 Decisions

Date: 22 May 2026

1. Chose static files (`index.html`, plain CSS/JS) with no build tool to keep local/private execution simple and deterministic.
2. Added fixed-timestamp deterministic `sample-projection.json` aligned to T018/T019 summary expectations (`2 events`, `1 run`).
3. Added both a static validator and localhost-only server test to enforce no external resources and `127.0.0.1` binding behavior.
4. Kept package version at `0.1.0` because repository policy did not require version bump for this internal runtime increment.

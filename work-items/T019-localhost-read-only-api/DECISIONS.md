# T019 Decisions

## 22 May 2026

1. Implement API as a thin Node built-in `http` layer over `buildReadOnlyEventProjection` to avoid dependency growth and preserve deterministic behavior.
2. Enforce localhost boundary in server constructor: reject `0.0.0.0` unless `allowUnsafeHost: true` is explicitly set in code; tests/docs keep safe defaults only.
3. Keep endpoints JSON-only with stable error shape (`ok`, `error`, `code`) for predictable operator tooling.
4. Keep API strictly read-only: non-`GET` requests return `405 method_not_allowed`.

# T018 Decisions — Read-only Local Event Projection

## Decision 1 — Single-source input contract

`buildReadOnlyEventProjection(options)` accepts exactly one source per call (`events`, `bufferFile`, or `bundleDir`) to keep source lineage explicit and deterministic.

## Decision 2 — Strict metadata-only projection rows

Projection output is built from an allowlist of metadata fields only; raw prompt/customer/secret payload fields are never emitted.

## Decision 3 — Validation and deduplication order

Events are schema-validated and forbidden-content scanned before deterministic sorting and idempotency-key deduplication, then optional filters are applied.

## Decision 4 — Runtime safety continuity

Projection remains local-only and read-only with no persistence or network behavior, preserving the disabled-by-default `POST /events` boundary.

# T021 Decisions — Backend Runtime Readiness Boundary Hardening

Date: 22 May 2026

1. Boundary policy is encoded in both docs and JSON config to make it human-readable and machine-checkable.
2. Validator uses Node built-ins only and inspects repository files without executing deploy/apply flows.
3. Workflow boundary check is static and enforces manual `workflow_dispatch` confirmation semantics and no schedule/cron trigger.
4. Generated readiness report churn file is treated as known generated output and not a functional source artifact.

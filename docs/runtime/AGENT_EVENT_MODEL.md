# Agent Event Model

**Date:** 22 May 2026

## Purpose

This document defines the local, metadata-first event contract for `caesar-ai-agent-ledger`.
It exists to make agent activity traceable without enabling live ingestion, public persistence, or raw sensitive-data capture by default.

## Non-goals

- It is not a live ingestion API design.
- It is not a guarantee of compliance, audit approval, or legal sufficiency.
- It does not authorize storing raw prompts, raw customer data, raw secrets, or full payload dumps by default.
- It does not enable `POST /events`; that route stays disabled until a later Control Tower-approved task.

## Event model principles

- One task may produce many runs.
- One run may produce many events.
- One event belongs to exactly one run.
- Event records are metadata-first: capture structure, not raw content.
- High-risk actions require explicit approval context.
- Every event should be idempotent and correlation-friendly.

## IDs and relationships

- `task_id` is optional and identifies the higher-level work item or objective.
- `run_id` identifies one execution attempt for a task.
- `event_id` identifies one event record.
- `idempotency_key` prevents duplicate writes for the same logical event.
- `correlation_id` links related events across prompts, tool calls, approvals, and errors.
- `parent_event_id` is optional and links derived events to the event that caused them.

Relationship summary:

- Task -> runs: one-to-many.
- Run -> events: one-to-many.
- Event -> parent_event_id: optional one-to-one reference to the preceding event.

## Required event fields

Every event record must include:

- `schema_version`
- `event_id`
- `run_id`
- `idempotency_key`
- `correlation_id`
- `event_type`
- `risk_level`
- `occurred_at`
- `source`
- `payload_metadata_json`
- `redaction`

`parent_event_id` and `task_id` are optional but supported for traceability.

## Event types

At minimum, the contract supports:

- `run_started`
- `run_completed`
- `prompt_received`
- `tool_call_requested`
- `tool_call_completed`
- `approval_requested`
- `approval_granted`
- `approval_denied`
- `policy_check`
- `file_write`
- `command_execution`
- `external_request_planned`
- `external_request_executed`
- `error`

## Risk levels

- `low`
- `medium`
- `high`
- `critical`

Risk is a routing hint, not a compliance verdict.

## Approval model

- `approval_requested` records the request, scope, and risk context.
- `approval_granted` records that a human approved the action.
- `approval_denied` records that a human rejected the action.
- Approval events should reference the triggering event with `parent_event_id` when available.
- High and critical risk actions should not be treated as auto-approved by default.

## Retention and redaction

- Keep records metadata-first.
- Store summaries, not raw prompts, raw customer data, or raw secrets.
- Redact tokens, keys, passwords, and private keys before any future persistence path is enabled.
- The local SDK and local buffer write JSONL locally, and any hosted persistence must remain explicitly approved later.
- Do not store raw full prompts by default unless a future task explicitly turns that on and documents the risk boundary.

## Writer rules

- The Cloudflare Worker may write only when explicitly enabled.
- The local SDK and local buffer may write local JSONL for offline validation and review.
- No raw secrets.
- No raw customer data.
- No raw full prompts by default.
- No network execution is implied by this document.

## Supabase table mapping

Existing tables map to this contract as follows:

- `agent_runs` stores run-level lifecycle metadata.
- `agent_events` stores one row per event, linked by `run_id`.
- `runtime_events` stores runtime and operational events that support validation, readiness, and lifecycle auditing.

This task only defines the contract and local validation. It does not apply schema changes or enable persistence.

## Explicit boundary

`POST /events` remains disabled by default until a later Control Tower-approved task authorizes persistence and any required schema/runtime migration.

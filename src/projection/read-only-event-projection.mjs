import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readBufferedEvents } from "../event-buffer/local-event-buffer.mjs";
import {
  readJsonFile,
  scanForForbiddenContent,
  validateEventAgainstSchema,
} from "../event-buffer/agent-event-validator.mjs";
import { validateLocalEventExportBundle } from "../export-import/local-event-export-bundle.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DEFAULT_SCHEMA_FILE = path.join(ROOT, "schemas/agent-ledger-event.schema.json");
const APPROVAL_EVENT_TYPES = new Set(["approval_requested", "approval_granted", "approval_denied"]);
const TOOL_CALL_EVENT_TYPES = new Set(["tool_call_requested", "tool_call_completed"]);
const RISK_EVENT_TYPES = new Set(["high", "critical"]);
const RISK_ORDER = { low: 1, medium: 2, high: 3, critical: 4 };

function assertNonEmptyString(value, field) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${field} must be a non-empty string`);
  }
}

function toAbsolute(p) {
  return path.isAbsolute(p) ? p : path.resolve(ROOT, p);
}

function sortEvents(events) {
  return [...events].sort((a, b) => {
    if (a.occurred_at !== b.occurred_at) return a.occurred_at.localeCompare(b.occurred_at);
    return String(a.event_id).localeCompare(String(b.event_id));
  });
}

function loadBundleEvents(bundleDir) {
  validateLocalEventExportBundle({ bundleDir });
  const absoluteBundleDir = toAbsolute(bundleDir);
  const eventsFile = path.join(absoluteBundleDir, "events.jsonl");
  const lines = fs
    .readFileSync(eventsFile, "utf8")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);
  return lines.map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new Error(`events.jsonl line ${index + 1} invalid JSON: ${error.message}`);
    }
  });
}

function loadEventsFromOptions(options) {
  const hasEvents = Array.isArray(options.events);
  const hasBufferFile = typeof options.bufferFile === "string";
  const hasBundleDir = typeof options.bundleDir === "string";
  const sourceCount = [hasEvents, hasBufferFile, hasBundleDir].filter(Boolean).length;

  if (sourceCount !== 1) {
    throw new Error("provide exactly one source: events array OR bufferFile OR bundleDir");
  }

  if (hasEvents) {
    return {
      source_type: "events_array",
      source_ref: "in-memory-events",
      events: options.events,
    };
  }

  if (hasBufferFile) {
    assertNonEmptyString(options.bufferFile, "bufferFile");
    const absoluteBufferFile = toAbsolute(options.bufferFile);
    return {
      source_type: "buffer_file",
      source_ref: absoluteBufferFile,
      events: readBufferedEvents({ bufferFile: absoluteBufferFile }),
    };
  }

  assertNonEmptyString(options.bundleDir, "bundleDir");
  const absoluteBundleDir = toAbsolute(options.bundleDir);
  return {
    source_type: "bundle_dir",
    source_ref: absoluteBundleDir,
    events: loadBundleEvents(absoluteBundleDir),
  };
}

function validateEvents(events, schemaFile) {
  const schema = readJsonFile(schemaFile ?? DEFAULT_SCHEMA_FILE);

  for (const event of events) {
    const validation = validateEventAgainstSchema(event, schema);
    if (!validation.valid) {
      throw new Error(
        `invalid event ${event?.event_id ?? "unknown"}: ${validation.errors[0] ?? "validation failed"}`,
      );
    }

    const extraForbidden = scanForForbiddenContent(event.payload_metadata_json ?? {}, "$payload");
    if (extraForbidden.length > 0) {
      throw new Error(`forbidden raw content in event ${event?.event_id ?? "unknown"}`);
    }
  }
}

function deduplicateByIdempotency(events) {
  const seen = new Set();
  const deduped = [];

  for (const event of events) {
    const key = event.idempotency_key;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(event);
  }

  return deduped;
}

function applyFilters(events, filters = {}) {
  return events.filter((event) => {
    if (filters.run_id && event.run_id !== filters.run_id) return false;
    if (filters.event_type && event.event_type !== filters.event_type) return false;
    if (filters.risk_level && event.risk_level !== filters.risk_level) return false;
    return true;
  });
}

function toEventProjection(event) {
  const payload = event.payload_metadata_json ?? {};
  const redaction = event.redaction ?? {};

  return {
    task_id: event.task_id,
    run_id: event.run_id,
    event_id: event.event_id,
    parent_event_id: event.parent_event_id ?? null,
    idempotency_key: event.idempotency_key,
    correlation_id: event.correlation_id,
    event_type: event.event_type,
    risk_level: event.risk_level,
    occurred_at: event.occurred_at,
    source_kind: event.source?.kind ?? null,
    source_name: event.source?.name ?? null,
    source_version: event.source?.version ?? null,
    source_environment: event.source?.environment ?? null,
    metadata_kind: payload.kind ?? null,
    metadata_summary: payload.summary ?? null,
    metadata_labels_count: Array.isArray(payload.labels) ? payload.labels.length : 0,
    metadata_references_count: Array.isArray(payload.references) ? payload.references.length : 0,
    metadata_contains_sensitive_data: Boolean(payload.contains_sensitive_data),
    redaction_policy: redaction.policy ?? null,
    redaction_applied: Boolean(redaction.applied),
    raw_prompt_captured: Boolean(redaction.raw_prompt_captured),
    raw_customer_data_captured: Boolean(redaction.raw_customer_data_captured),
    raw_secret_captured: Boolean(redaction.raw_secret_captured),
    fields_redacted_count: Array.isArray(redaction.fields_redacted)
      ? redaction.fields_redacted.length
      : 0,
  };
}

function summarize(events) {
  const countsByEventType = {};
  const countsByRiskLevel = {};
  const runIds = new Set();
  let earliest = null;
  let latest = null;

  for (const event of events) {
    countsByEventType[event.event_type] = (countsByEventType[event.event_type] ?? 0) + 1;
    countsByRiskLevel[event.risk_level] = (countsByRiskLevel[event.risk_level] ?? 0) + 1;
    runIds.add(event.run_id);
    if (earliest === null || event.occurred_at < earliest) earliest = event.occurred_at;
    if (latest === null || event.occurred_at > latest) latest = event.occurred_at;
  }

  return {
    total_events: events.length,
    total_runs: runIds.size,
    total_approvals: events.filter((event) => APPROVAL_EVENT_TYPES.has(event.event_type)).length,
    total_tool_calls: events.filter((event) => TOOL_CALL_EVENT_TYPES.has(event.event_type)).length,
    total_errors: events.filter((event) => event.event_type === "error").length,
    counts_by_event_type: Object.fromEntries(
      Object.entries(countsByEventType).sort(([a], [b]) => a.localeCompare(b)),
    ),
    counts_by_risk_level: Object.fromEntries(
      Object.entries(countsByRiskLevel).sort(([a], [b]) => a.localeCompare(b)),
    ),
    earliest_occurred_at: earliest,
    latest_occurred_at: latest,
  };
}

function buildRuns(events) {
  const byRun = new Map();

  for (const event of events) {
    if (!byRun.has(event.run_id)) {
      byRun.set(event.run_id, {
        run_id: event.run_id,
        event_count: 0,
        first_event_at: event.occurred_at,
        last_event_at: event.occurred_at,
        highest_risk_level: event.risk_level,
        event_types: new Set(),
        approval_count: 0,
        error_count: 0,
      });
    }

    const row = byRun.get(event.run_id);
    row.event_count += 1;
    if (event.occurred_at < row.first_event_at) row.first_event_at = event.occurred_at;
    if (event.occurred_at > row.last_event_at) row.last_event_at = event.occurred_at;
    if ((RISK_ORDER[event.risk_level] ?? 0) > (RISK_ORDER[row.highest_risk_level] ?? 0)) {
      row.highest_risk_level = event.risk_level;
    }
    row.event_types.add(event.event_type);
    if (APPROVAL_EVENT_TYPES.has(event.event_type)) row.approval_count += 1;
    if (event.event_type === "error") row.error_count += 1;
  }

  return Array.from(byRun.values())
    .map((row) => ({
      run_id: row.run_id,
      event_count: row.event_count,
      first_event_at: row.first_event_at,
      last_event_at: row.last_event_at,
      highest_risk_level: row.highest_risk_level,
      event_types: Array.from(row.event_types).sort(),
      approval_count: row.approval_count,
      error_count: row.error_count,
    }))
    .sort((a, b) => a.run_id.localeCompare(b.run_id));
}

export function buildReadOnlyEventProjection(options = {}) {
  const { source_type, source_ref, events: sourceEvents } = loadEventsFromOptions(options);
  validateEvents(sourceEvents, options.schemaFile);

  const sorted = sortEvents(sourceEvents);
  const deduped = deduplicateByIdempotency(sorted);
  const filtered = applyFilters(deduped, options.filters ?? {});
  const projectedEvents = filtered.map(toEventProjection);

  const approvals = projectedEvents.filter((event) => APPROVAL_EVENT_TYPES.has(event.event_type));
  const toolCalls = projectedEvents.filter((event) => TOOL_CALL_EVENT_TYPES.has(event.event_type));
  const risks = projectedEvents.filter((event) => RISK_EVENT_TYPES.has(event.risk_level));
  const errors = projectedEvents.filter((event) => event.event_type === "error");

  return {
    generated_at: new Date().toISOString(),
    source_type,
    source_ref,
    summary: summarize(filtered),
    runs: buildRuns(filtered),
    events: projectedEvents,
    approvals,
    tool_calls: toolCalls,
    risks,
    errors,
  };
}

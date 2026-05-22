import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  readBufferedEvents,
  summarizeBufferedEvents,
  validateBufferedEvents,
} from "../event-buffer/local-event-buffer.mjs";
import { scanForForbiddenContent } from "../event-buffer/agent-event-validator.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function assertNonEmptyString(value, field) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${field} must be a non-empty string`);
  }
}

function toAbsolute(p) {
  return path.isAbsolute(p) ? p : path.resolve(ROOT, p);
}

function assertWithin(parentDir, childPath, fieldName) {
  const rel = path.relative(parentDir, childPath);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`${fieldName} must stay within ${parentDir}`);
  }
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function sortedCounts(input = {}) {
  return Object.fromEntries(
    Object.entries(input).sort(([a], [b]) => a.localeCompare(b)),
  );
}

function buildSummary(events, sourceSummary) {
  const runIds = new Set(events.map((event) => event.run_id).filter(Boolean));
  return {
    total_events: sourceSummary.total_events,
    counts_by_event_type: sortedCounts(sourceSummary.counts_by_event_type),
    counts_by_risk_level: sortedCounts(sourceSummary.counts_by_risk_level),
    unique_run_id_count: runIds.size,
    unique_run_ids: Array.from(runIds).sort(),
    earliest_occurred_at: sourceSummary.earliest_occurred_at,
    latest_occurred_at: sourceSummary.latest_occurred_at,
  };
}

function safeManifestForReport(manifest) {
  return {
    schema_version: manifest.schema_version,
    bundle_id: manifest.bundle_id,
    generated_at: manifest.generated_at,
    source_buffer_file: manifest.source_buffer_file,
    event_count: manifest.event_count,
    summary_file: manifest.summary_file,
    events_file: manifest.events_file,
    validation_report_file: manifest.validation_report_file,
  };
}

export function buildLocalEventExportBundle({
  bufferFile,
  outputDir,
  bundleId,
}) {
  assertNonEmptyString(bufferFile, "bufferFile");
  assertNonEmptyString(outputDir, "outputDir");

  const absoluteBufferFile = toAbsolute(bufferFile);
  const absoluteOutputDir = toAbsolute(outputDir);
  const bufferValidation = validateBufferedEvents({ bufferFile: absoluteBufferFile });
  if (!bufferValidation.valid) {
    const firstIssue = bufferValidation.issues[0];
    throw new Error(
      `buffer validation failed before export: ${firstIssue?.errors?.[0] ?? "unknown issue"}`,
    );
  }

  const events = readBufferedEvents({ bufferFile: absoluteBufferFile });
  const baseSummary = summarizeBufferedEvents({ bufferFile: absoluteBufferFile });
  const summary = buildSummary(events, baseSummary);
  const hash = crypto
    .createHash("sha256")
    .update(stableStringify(events))
    .digest("hex")
    .slice(0, 16);
  const resolvedBundleId = bundleId ?? `bundle-${summary.total_events}-${hash}`;

  assertNonEmptyString(resolvedBundleId, "bundleId");
  const bundleDir = path.join(absoluteOutputDir, resolvedBundleId);
  assertWithin(absoluteOutputDir, bundleDir, "bundle directory");
  if (fs.existsSync(bundleDir)) {
    throw new Error(`bundle already exists: ${bundleDir}`);
  }

  fs.mkdirSync(bundleDir, { recursive: true });

  const manifest = {
    schema_version: "1.0.0",
    bundle_id: resolvedBundleId,
    generated_at: new Date().toISOString(),
    source_buffer_file: path.relative(ROOT, absoluteBufferFile),
    event_count: summary.total_events,
    events_file: "events.jsonl",
    summary_file: "summary.json",
    validation_report_file: "validation-report.json",
    contract_doc: "docs/runtime/LOCAL_EVENT_EXPORT_IMPORT_CONTRACT.md",
  };

  const eventsJsonl = events.map((event) => JSON.stringify(event)).join("\n");
  fs.writeFileSync(path.join(bundleDir, "events.jsonl"), `${eventsJsonl}\n`, "utf8");
  fs.writeFileSync(
    path.join(bundleDir, "summary.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
    "utf8",
  );
  fs.writeFileSync(
    path.join(bundleDir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  const validationResult = validateLocalEventExportBundle({
    bundleDir,
    allowMissingValidationReport: true,
  });
  fs.writeFileSync(
    path.join(bundleDir, "validation-report.json"),
    `${JSON.stringify(validationResult, null, 2)}\n`,
    "utf8",
  );

  return {
    ok: true,
    bundle_id: resolvedBundleId,
    bundle_dir: bundleDir,
    manifest: safeManifestForReport(manifest),
    summary,
  };
}

export function validateLocalEventExportBundle({
  bundleDir,
  allowMissingValidationReport = false,
}) {
  assertNonEmptyString(bundleDir, "bundleDir");
  const absoluteBundleDir = toAbsolute(bundleDir);
  const requiredFiles = ["manifest.json", "events.jsonl", "summary.json"];
  if (!allowMissingValidationReport) {
    requiredFiles.push("validation-report.json");
  }

  const missingFiles = requiredFiles.filter(
    (name) => !fs.existsSync(path.join(absoluteBundleDir, name)),
  );
  if (missingFiles.length > 0) {
    throw new Error(`bundle missing required files: ${missingFiles.join(", ")}`);
  }

  let manifest;
  let summary;
  try {
    manifest = JSON.parse(fs.readFileSync(path.join(absoluteBundleDir, "manifest.json"), "utf8"));
    summary = JSON.parse(fs.readFileSync(path.join(absoluteBundleDir, "summary.json"), "utf8"));
  } catch (error) {
    throw new Error(`bundle JSON parse failure: ${error.message}`);
  }

  const rawEvents = fs.readFileSync(path.join(absoluteBundleDir, "events.jsonl"), "utf8");
  const parsedEvents = rawEvents
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`events.jsonl line ${index + 1} invalid JSON: ${error.message}`);
      }
    });

  const countsByEventType = {};
  const countsByRiskLevel = {};
  const runIds = new Set();
  const seenIdempotency = new Set();
  const duplicateIdempotency = new Set();
  const forbiddenIssues = [];

  parsedEvents.forEach((event, index) => {
    countsByEventType[event.event_type] = (countsByEventType[event.event_type] ?? 0) + 1;
    countsByRiskLevel[event.risk_level] = (countsByRiskLevel[event.risk_level] ?? 0) + 1;
    if (typeof event.run_id === "string" && event.run_id.length > 0) {
      runIds.add(event.run_id);
    }
    if (typeof event.idempotency_key === "string" && event.idempotency_key.length > 0) {
      if (seenIdempotency.has(event.idempotency_key)) {
        duplicateIdempotency.add(event.idempotency_key);
      } else {
        seenIdempotency.add(event.idempotency_key);
      }
    }
    const issues = scanForForbiddenContent(event, `events[${index}]`);
    forbiddenIssues.push(...issues);
  });

  const expectedSummary = {
    total_events: parsedEvents.length,
    counts_by_event_type: sortedCounts(countsByEventType),
    counts_by_risk_level: sortedCounts(countsByRiskLevel),
    unique_run_id_count: runIds.size,
  };

  if (manifest.event_count !== parsedEvents.length) {
    throw new Error(
      `manifest event_count mismatch: ${manifest.event_count} !== ${parsedEvents.length}`,
    );
  }
  if (summary.total_events !== expectedSummary.total_events) {
    throw new Error(
      `summary total_events mismatch: ${summary.total_events} !== ${expectedSummary.total_events}`,
    );
  }
  if (
    stableStringify(sortedCounts(summary.counts_by_event_type ?? {})) !==
    stableStringify(expectedSummary.counts_by_event_type)
  ) {
    throw new Error("summary counts_by_event_type mismatch");
  }
  if (
    stableStringify(sortedCounts(summary.counts_by_risk_level ?? {})) !==
    stableStringify(expectedSummary.counts_by_risk_level)
  ) {
    throw new Error("summary counts_by_risk_level mismatch");
  }
  if (summary.unique_run_id_count !== expectedSummary.unique_run_id_count) {
    throw new Error("summary unique_run_id_count mismatch");
  }
  if (forbiddenIssues.length > 0) {
    throw new Error(`forbidden raw content detected: ${forbiddenIssues[0]}`);
  }

  return {
    ok: true,
    bundle_dir: absoluteBundleDir,
    manifest: safeManifestForReport(manifest),
    events: {
      total_events: parsedEvents.length,
      unique_run_id_count: runIds.size,
      idempotency_keys_count: seenIdempotency.size,
      duplicate_idempotency_keys_count: duplicateIdempotency.size,
    },
    summary_consistent: true,
    forbidden_content_issues: [],
  };
}

export function createImportDryRunPlan({ bundleDir }) {
  const validation = validateLocalEventExportBundle({ bundleDir });
  const absoluteBundleDir = toAbsolute(bundleDir);
  const events = fs
    .readFileSync(path.join(absoluteBundleDir, "events.jsonl"), "utf8")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line));

  const runIds = new Set();
  const idempotencySeen = new Set();
  const duplicateIdempotency = new Set();
  const blockedEventIds = [];

  events.forEach((event) => {
    if (event.run_id) runIds.add(event.run_id);
    if (idempotencySeen.has(event.idempotency_key)) {
      duplicateIdempotency.add(event.idempotency_key);
      blockedEventIds.push(event.event_id);
    } else {
      idempotencySeen.add(event.idempotency_key);
    }
  });

  return {
    ok: true,
    mode: "local-import-dry-run",
    no_network: true,
    no_supabase_connection: true,
    bundle_id: validation.manifest.bundle_id,
    source_bundle_dir: absoluteBundleDir,
    intended_tables: ["agent_runs", "agent_events", "runtime_events"],
    would_insert_runs_count: runIds.size,
    would_insert_events_count: events.length - blockedEventIds.length,
    idempotency_keys_count: idempotencySeen.size,
    duplicate_idempotency_keys_count: duplicateIdempotency.size,
    blocked_events_count: blockedEventIds.length,
    blocked_event_ids: blockedEventIds,
    warnings:
      duplicateIdempotency.size > 0
        ? ["Duplicate idempotency keys would be blocked during future import."]
        : [],
    redaction_policy: "metadata-only; no raw secrets or full prompts",
  };
}

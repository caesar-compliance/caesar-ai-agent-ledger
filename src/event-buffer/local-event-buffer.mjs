import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  readJsonFile,
  validateEventAgainstSchema,
} from "./agent-event-validator.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DEFAULT_SCHEMA_FILE = path.join(ROOT, "schemas/agent-ledger-event.schema.json");

function assertBufferFile(bufferFile) {
  if (typeof bufferFile !== "string" || bufferFile.trim().length === 0) {
    throw new TypeError("bufferFile must be a non-empty string path");
  }
}

function loadSchema(schemaFile = DEFAULT_SCHEMA_FILE) {
  return readJsonFile(schemaFile);
}

function ensureParentDirectory(bufferFile) {
  fs.mkdirSync(path.dirname(bufferFile), { recursive: true });
}

function formatBufferPath(bufferFile) {
  return bufferFile.startsWith(ROOT) ? path.relative(ROOT, bufferFile) : bufferFile;
}

export function readBufferedEvents({ bufferFile }) {
  assertBufferFile(bufferFile);

  if (!fs.existsSync(bufferFile)) {
    return [];
  }

  const stat = fs.statSync(bufferFile);
  if (!stat.isFile()) {
    throw new Error(`${formatBufferPath(bufferFile)} is not a file`);
  }

  const raw = fs.readFileSync(bufferFile, "utf8");
  if (raw.trim().length === 0) {
    return [];
  }

  const events = [];
  const lines = raw.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    if (line.trim().length === 0) continue;
    try {
      events.push(JSON.parse(line));
    } catch (err) {
      throw new Error(
        `${formatBufferPath(bufferFile)} line ${index + 1} is not valid JSON: ${err.message}`,
      );
    }
  }

  return events;
}

export function validateBufferedEvents({ bufferFile, schemaFile = DEFAULT_SCHEMA_FILE }) {
  assertBufferFile(bufferFile);

  try {
    const events = readBufferedEvents({ bufferFile });
    const schema = loadSchema(schemaFile);
    const issues = [];
    const seenIdempotencyKeys = new Set();

    events.forEach((event, index) => {
      const validation = validateEventAgainstSchema(event, schema);
      if (!validation.valid) {
        issues.push({
          index,
          event_id: event?.event_id ?? null,
          idempotency_key: event?.idempotency_key ?? null,
          errors: validation.errors,
          schema_errors: validation.schema_errors,
          forbidden_issues: validation.forbidden_issues,
        });
      }

      const idempotencyKey = event?.idempotency_key;
      if (typeof idempotencyKey === "string" && idempotencyKey.length > 0) {
        if (seenIdempotencyKeys.has(idempotencyKey)) {
          issues.push({
            index,
            event_id: event?.event_id ?? null,
            idempotency_key: idempotencyKey,
            errors: [`duplicate idempotency_key ${idempotencyKey}`],
            schema_errors: [],
            forbidden_issues: [],
          });
        } else {
          seenIdempotencyKeys.add(idempotencyKey);
        }
      }
    });

    return {
      valid: issues.length === 0,
      total_events: events.length,
      invalid_event_count: issues.length,
      issues,
    };
  } catch (error) {
    return {
      valid: false,
      total_events: 0,
      invalid_event_count: 1,
      issues: [
        {
          index: null,
          event_id: null,
          idempotency_key: null,
          errors: [error.message],
          schema_errors: [],
          forbidden_issues: [],
        },
      ],
    };
  }
}

export function summarizeBufferedEvents({ bufferFile, schemaFile = DEFAULT_SCHEMA_FILE }) {
  const validation = validateBufferedEvents({ bufferFile, schemaFile });
  if (!validation.valid) {
    const firstIssue = validation.issues[0];
    const message = firstIssue?.errors?.[0] ?? "buffer is not valid";
    throw new Error(`cannot summarize invalid buffer: ${message}`);
  }

  const events = readBufferedEvents({ bufferFile });
  const countsByEventType = {};
  const countsByRiskLevel = {};
  const runIds = new Set();
  let earliestOccurredAt = null;
  let latestOccurredAt = null;

  for (const event of events) {
    const eventType = event.event_type;
    const riskLevel = event.risk_level;
    const occurredAt = event.occurred_at;

    countsByEventType[eventType] = (countsByEventType[eventType] ?? 0) + 1;
    countsByRiskLevel[riskLevel] = (countsByRiskLevel[riskLevel] ?? 0) + 1;
    if (typeof event.run_id === "string" && event.run_id.length > 0) {
      runIds.add(event.run_id);
    }

    if (earliestOccurredAt === null || occurredAt < earliestOccurredAt) {
      earliestOccurredAt = occurredAt;
    }
    if (latestOccurredAt === null || occurredAt > latestOccurredAt) {
      latestOccurredAt = occurredAt;
    }
  }

  return {
    total_events: events.length,
    counts_by_event_type: countsByEventType,
    counts_by_risk_level: countsByRiskLevel,
    unique_run_id_count: runIds.size,
    earliest_occurred_at: earliestOccurredAt,
    latest_occurred_at: latestOccurredAt,
  };
}

export function appendEventToBuffer({ event, bufferFile, schemaFile = DEFAULT_SCHEMA_FILE }) {
  assertBufferFile(bufferFile);

  const schema = loadSchema(schemaFile);
  const validation = validateEventAgainstSchema(event, schema);
  if (!validation.valid) {
    return {
      status: "rejected",
      appended: false,
      skipped: false,
      duplicate: false,
      reason: "validation_failed",
      errors: validation.errors,
      schema_errors: validation.schema_errors,
      forbidden_issues: validation.forbidden_issues,
    };
  }

  const bufferedEvents = readBufferedEvents({ bufferFile });
  const duplicate = bufferedEvents.find(
    (existing) => existing?.idempotency_key === event.idempotency_key,
  );
  if (duplicate) {
    return {
      status: "skipped",
      appended: false,
      skipped: true,
      duplicate: true,
      reason: "duplicate_idempotency_key",
      event_id: event.event_id,
      idempotency_key: event.idempotency_key,
      buffer_file: bufferFile,
    };
  }

  ensureParentDirectory(bufferFile);
  fs.appendFileSync(bufferFile, `${JSON.stringify(event)}\n`, "utf8");

  return {
    status: "appended",
    appended: true,
    skipped: false,
    duplicate: false,
    event_id: event.event_id,
    idempotency_key: event.idempotency_key,
    buffer_file: bufferFile,
  };
}

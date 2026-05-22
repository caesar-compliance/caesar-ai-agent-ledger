#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  appendEventToBuffer,
  readBufferedEvents,
  summarizeBufferedEvents,
  validateBufferedEvents,
} from "../../src/event-buffer/local-event-buffer.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const FIXTURE_DIR = path.join(ROOT, "fixtures/events");
const TEST_ROOT = path.join(ROOT, ".tmp/agent-ledger/local-event-buffer-test");
const BUFFER_FILE = path.join(TEST_ROOT, "events.jsonl");

let failed = 0;

function pass(message) {
  console.log(`PASS: ${message}`);
}

function fail(message) {
  console.log(`FAIL: ${message}`);
  failed += 1;
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  } else {
    pass(message);
  }
}

function readFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, name), "utf8"));
}

function cleanup() {
  fs.rmSync(TEST_ROOT, { recursive: true, force: true });
}

cleanup();

try {
  const toolCallRequested = readFixture("valid-tool-call-requested.json");
  const approvalGranted = readFixture("valid-approval-granted.json");
  const invalidRawSecret = readFixture("invalid-raw-secret.json");

  const firstAppend = appendEventToBuffer({ event: toolCallRequested, bufferFile: BUFFER_FILE });
  assert(firstAppend.status === "appended", "valid-tool-call-requested appended");

  const secondAppend = appendEventToBuffer({ event: approvalGranted, bufferFile: BUFFER_FILE });
  assert(secondAppend.status === "appended", "valid-approval-granted appended");

  const duplicateAppend = appendEventToBuffer({
    event: toolCallRequested,
    bufferFile: BUFFER_FILE,
  });
  assert(duplicateAppend.status === "skipped", "duplicate append skipped");
  assert(duplicateAppend.duplicate === true, "duplicate idempotency protection reported");

  const rejectedAppend = appendEventToBuffer({
    event: invalidRawSecret,
    bufferFile: BUFFER_FILE,
  });
  assert(rejectedAppend.status === "rejected", "invalid raw-secret event rejected");
  assert(
    rejectedAppend.reason === "validation_failed",
    "invalid raw-secret rejection reason is validation_failed",
  );

  const bufferedEvents = readBufferedEvents({ bufferFile: BUFFER_FILE });
  assert(bufferedEvents.length === 2, "buffer stores exactly 2 events after skip and rejection");

  const summary = summarizeBufferedEvents({ bufferFile: BUFFER_FILE });
  console.log(`PASS: summary ${JSON.stringify(summary)}`);
  assert(summary.total_events === 2, "summary total_events is 2");
  assert(summary.counts_by_event_type.tool_call_requested === 1, "summary counts tool_call_requested");
  assert(summary.counts_by_event_type.approval_granted === 1, "summary counts approval_granted");
  assert(summary.counts_by_risk_level.medium === 1, "summary counts medium risk");
  assert(summary.counts_by_risk_level.high === 1, "summary counts high risk");
  assert(summary.unique_run_id_count === 1, "summary unique run_id_count is 1");
  assert(
    summary.earliest_occurred_at === "2026-05-22T12:00:00.000Z",
    "summary earliest occurred_at matches fixture",
  );
  assert(
    summary.latest_occurred_at === "2026-05-22T12:01:00.000Z",
    "summary latest occurred_at matches fixture",
  );

  const validation = validateBufferedEvents({ bufferFile: BUFFER_FILE });
  assert(validation.valid === true, "buffer validation passes");
  assert(validation.total_events === 2, "buffer validation sees 2 events");
  assert(validation.issues.length === 0, "buffer validation reports no issues");
} catch (error) {
  fail(error.message);
} finally {
  cleanup();
}

process.exit(failed > 0 ? 1 : 0);

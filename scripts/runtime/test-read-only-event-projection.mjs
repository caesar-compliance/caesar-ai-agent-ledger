#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { appendEventToBuffer } from "../../src/event-buffer/local-event-buffer.mjs";
import { buildLocalEventExportBundle } from "../../src/export-import/local-event-export-bundle.mjs";
import { buildReadOnlyEventProjection } from "../../src/projection/read-only-event-projection.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const FIXTURE_DIR = path.join(ROOT, "fixtures/events");
const TEST_ROOT = path.join(ROOT, ".tmp/agent-ledger/read-only-event-projection-test");
const BUFFER_FILE = path.join(TEST_ROOT, "events.jsonl");
const BUNDLE_DIR = path.join(TEST_ROOT, "bundles");

let failed = 0;

function pass(message) {
  console.log(`PASS: ${message}`);
}

function fail(message) {
  console.log(`FAIL: ${message}`);
  failed += 1;
}

function assert(condition, message) {
  if (condition) pass(message);
  else fail(message);
}

function readFixture(file) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, file), "utf8"));
}

function hasForbiddenKeys(value) {
  const forbiddenExact = new Set([
    "secret",
    "password",
    "token",
    "api_key",
    "private_key",
    "raw_prompt",
    "prompt",
    "customer_data",
    "raw_customer_data",
    "tool_arguments",
  ]);

  function walk(node) {
    if (Array.isArray(node)) return node.some((item) => walk(item));
    if (!node || typeof node !== "object") return false;
    return Object.entries(node).some(([key, child]) => {
      const normalized = key.toLowerCase().replace(/[^a-z0-9]+/g, "");
      if (forbiddenExact.has(normalized)) return true;
      return walk(child);
    });
  }

  return walk(value);
}

function assertProjection(projection, label) {
  assert(projection.summary.total_events === 2, `${label}: total_events = 2`);
  assert(projection.summary.total_runs === 1, `${label}: total_runs = 1`);
  assert(projection.summary.total_approvals === 1, `${label}: total_approvals = 1`);
  assert(projection.summary.total_tool_calls === 1, `${label}: total_tool_calls = 1`);
  assert(projection.summary.total_errors === 0, `${label}: total_errors = 0`);
  assert((projection.summary.counts_by_risk_level.high ?? 0) >= 1, `${label}: high risk count present`);
  assert(hasForbiddenKeys(projection) === false, `${label}: no forbidden secret-like keys`);
}

function cleanup() {
  fs.rmSync(TEST_ROOT, { recursive: true, force: true });
}

cleanup();
fs.mkdirSync(TEST_ROOT, { recursive: true });

try {
  const toolCallRequested = readFixture("valid-tool-call-requested.json");
  const approvalGranted = readFixture("valid-approval-granted.json");

  const appendA = appendEventToBuffer({ event: toolCallRequested, bufferFile: BUFFER_FILE });
  const appendB = appendEventToBuffer({ event: approvalGranted, bufferFile: BUFFER_FILE });
  assert(appendA.status === "appended", "fixture tool-call appended");
  assert(appendB.status === "appended", "fixture approval appended");

  const built = buildLocalEventExportBundle({
    bufferFile: BUFFER_FILE,
    outputDir: BUNDLE_DIR,
    bundleId: "bundle-read-only-event-projection-fixture",
  });

  const fromBuffer = buildReadOnlyEventProjection({ bufferFile: BUFFER_FILE });
  const fromBundle = buildReadOnlyEventProjection({ bundleDir: built.bundle_dir });

  assertProjection(fromBuffer, "buffer projection");
  assertProjection(fromBundle, "bundle projection");

  const eventTypeFilter = buildReadOnlyEventProjection({
    bufferFile: BUFFER_FILE,
    filters: { event_type: "approval_granted" },
  });
  assert(eventTypeFilter.summary.total_events === 1, "filter event_type returns 1 event");
  assert(eventTypeFilter.events[0].event_type === "approval_granted", "filter event_type matches value");

  const riskFilter = buildReadOnlyEventProjection({
    bufferFile: BUFFER_FILE,
    filters: { risk_level: "high" },
  });
  assert(riskFilter.summary.total_events === 1, "filter risk_level returns 1 event");
  assert(riskFilter.events[0].risk_level === "high", "filter risk_level matches value");

  const runFilter = buildReadOnlyEventProjection({
    bufferFile: BUFFER_FILE,
    filters: { run_id: "run-T015-001" },
  });
  assert(runFilter.summary.total_events === 2, "filter run_id returns 2 events");
  assert(runFilter.summary.total_runs === 1, "filter run_id keeps one run");
} catch (error) {
  fail(error.message);
} finally {
  cleanup();
}

process.exit(failed > 0 ? 1 : 0);

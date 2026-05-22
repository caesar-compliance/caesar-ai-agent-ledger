#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { appendEventToBuffer } from "../../src/event-buffer/local-event-buffer.mjs";
import {
  buildLocalEventExportBundle,
  createImportDryRunPlan,
  validateLocalEventExportBundle,
} from "../../src/export-import/local-event-export-bundle.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const FIXTURE_DIR = path.join(ROOT, "fixtures/events");
const TEST_ROOT = path.join(ROOT, ".tmp/agent-ledger/local-event-export-import-test");
const BUFFER_FILE = path.join(TEST_ROOT, "events.jsonl");
const OUTPUT_DIR = path.join(TEST_ROOT, "bundles");

let failed = 0;

function pass(message) {
  console.log(`PASS: ${message}`);
}

function fail(message) {
  console.log(`FAIL: ${message}`);
  failed += 1;
}

function assert(condition, message) {
  if (condition) {
    pass(message);
  } else {
    fail(message);
  }
}

function readFixture(file) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, file), "utf8"));
}

function resetTestDirectory() {
  fs.rmSync(TEST_ROOT, { recursive: true, force: true });
  fs.mkdirSync(TEST_ROOT, { recursive: true });
}

resetTestDirectory();

try {
  const eventA = readFixture("valid-tool-call-requested.json");
  const eventB = readFixture("valid-approval-granted.json");
  const invalidEvent = readFixture("invalid-raw-secret.json");

  const appendA = appendEventToBuffer({ event: eventA, bufferFile: BUFFER_FILE });
  const appendB = appendEventToBuffer({ event: eventB, bufferFile: BUFFER_FILE });
  assert(appendA.status === "appended", "valid tool-call event appended to local buffer");
  assert(appendB.status === "appended", "valid approval event appended to local buffer");

  const rejected = appendEventToBuffer({ event: invalidEvent, bufferFile: BUFFER_FILE });
  assert(rejected.status === "rejected", "invalid/secret event rejected before export");

  const built = buildLocalEventExportBundle({
    bufferFile: BUFFER_FILE,
    outputDir: OUTPUT_DIR,
    bundleId: "bundle-fixture-two-events",
  });

  const bundleDir = built.bundle_dir;
  assert(fs.existsSync(path.join(bundleDir, "manifest.json")), "bundle has manifest.json");
  assert(fs.existsSync(path.join(bundleDir, "events.jsonl")), "bundle has events.jsonl");
  assert(fs.existsSync(path.join(bundleDir, "summary.json")), "bundle has summary.json");
  assert(
    fs.existsSync(path.join(bundleDir, "validation-report.json")),
    "bundle has validation-report.json",
  );

  const validated = validateLocalEventExportBundle({ bundleDir });
  assert(validated.ok === true, "export bundle validates");

  const plan = createImportDryRunPlan({ bundleDir });
  assert(plan.no_network === true, "no network");
  assert(plan.no_supabase_connection === true, "no Supabase writes");
  assert(plan.would_insert_runs_count === 1, "would process exactly 1 run");
  assert(plan.would_insert_events_count === 2, "would process exactly 2 events");
  assert(plan.blocked_events_count === 0, "no blocked events");

  const summary = JSON.parse(fs.readFileSync(path.join(bundleDir, "summary.json"), "utf8"));
  assert(summary.total_events === 2, "event count is 2");
} catch (error) {
  fail(error.message);
} finally {
  fs.rmSync(TEST_ROOT, { recursive: true, force: true });
}

process.exit(failed > 0 ? 1 : 0);

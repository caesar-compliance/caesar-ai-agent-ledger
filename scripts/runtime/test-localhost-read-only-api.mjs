#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { appendEventToBuffer } from "../../src/event-buffer/local-event-buffer.mjs";
import { buildLocalEventExportBundle } from "../../src/export-import/local-event-export-bundle.mjs";
import { createReadOnlyApiServer } from "../../src/local-api/read-only-api-server.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const FIXTURE_DIR = path.join(ROOT, "fixtures/events");
const TEST_ROOT = path.join(ROOT, ".tmp/agent-ledger/localhost-read-only-api-test");
const BUFFER_FILE = path.join(TEST_ROOT, "events.jsonl");
const BUNDLE_DIR = path.join(TEST_ROOT, "bundles");
const BUNDLE_ID = "bundle-localhost-api-fixture";
const PACKAGE_JSON = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));

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

function cleanup() {
  fs.rmSync(TEST_ROOT, { recursive: true, force: true });
}

function hasForbiddenContent(value) {
  const forbiddenFragments = [
    "sb_secret_",
    "sb_publishable_",
    "service_role_key",
    "secret_key",
    "api_key",
    "password=",
    "\"password\"",
    "begin private key",
    "authorization: bearer ",
  ];

  const serialized = JSON.stringify(value).toLowerCase();
  return forbiddenFragments.some((fragment) => serialized.includes(fragment));
}

async function requestJson(port, method, pathname) {
  const response = await fetch(`http://127.0.0.1:${port}${pathname}`, {
    method,
    headers: { accept: "application/json" },
  });
  const body = await response.json();
  return { status: response.status, body };
}

cleanup();
fs.mkdirSync(TEST_ROOT, { recursive: true });

const toolCall = readFixture("valid-tool-call-requested.json");
const approval = readFixture("valid-approval-granted.json");

const appendA = appendEventToBuffer({ event: toolCall, bufferFile: BUFFER_FILE });
const appendB = appendEventToBuffer({ event: approval, bufferFile: BUFFER_FILE });
assert(appendA.status === "appended", "fixture tool call appended");
assert(appendB.status === "appended", "fixture approval appended");

buildLocalEventExportBundle({
  bufferFile: BUFFER_FILE,
  outputDir: BUNDLE_DIR,
  bundleId: BUNDLE_ID,
});

const api = createReadOnlyApiServer({
  host: "127.0.0.1",
  port: 0,
  bufferFile: BUFFER_FILE,
  packageName: PACKAGE_JSON.name,
  packageVersion: PACKAGE_JSON.version,
});

let boundPort = 0;

try {
  const started = await api.start();
  boundPort = started.port;

  const healthz = await requestJson(boundPort, "GET", "/healthz");
  assert(healthz.status === 200, "GET /healthz status 200");
  assert(healthz.body.local_only === true, "GET /healthz local_only true");

  const version = await requestJson(boundPort, "GET", "/version");
  assert(version.status === 200, "GET /version status 200");
  assert(version.body.package_name === PACKAGE_JSON.name, "GET /version package name");
  assert(version.body.package_version === PACKAGE_JSON.version, "GET /version package version");
  assert(version.body.api_mode === "read_only_localhost", "GET /version mode read_only_localhost");

  const projection = await requestJson(boundPort, "GET", "/projection");
  assert(projection.status === 200, "GET /projection status 200");
  assert(projection.body.data.summary.total_events === 2, "GET /projection summary total_events=2");
  assert(projection.body.data.summary.total_runs === 1, "GET /projection summary total_runs=1");

  const runs = await requestJson(boundPort, "GET", "/runs");
  assert(runs.status === 200, "GET /runs status 200");
  assert(runs.body.count === 1, "GET /runs returns 1 run");

  const runId = runs.body.data[0]?.run_id;
  const runById = await requestJson(boundPort, "GET", `/runs/${encodeURIComponent(runId)}`);
  assert(runById.status === 200, "GET /runs/:run_id status 200");
  assert(runById.body.data?.run_id === runId, "GET /runs/:run_id returns correct run");

  const events = await requestJson(boundPort, "GET", "/events");
  assert(events.status === 200, "GET /events status 200");
  assert(events.body.count === 2, "GET /events returns 2 events");

  const eventsByType = await requestJson(boundPort, "GET", "/events?event_type=tool_call_requested");
  assert(eventsByType.status === 200, "GET /events?event_type status 200");
  assert(eventsByType.body.count === 1, "GET /events?event_type=tool_call_requested returns 1 event");

  const eventsByRisk = await requestJson(boundPort, "GET", "/events?risk_level=high");
  assert(eventsByRisk.status === 200, "GET /events?risk_level status 200");
  assert(eventsByRisk.body.count === 1, "GET /events?risk_level=high returns 1 event");

  const approvals = await requestJson(boundPort, "GET", "/approvals");
  assert(approvals.status === 200, "GET /approvals status 200");
  assert(approvals.body.count === 1, "GET /approvals returns 1 approval");

  const toolCalls = await requestJson(boundPort, "GET", "/tool-calls");
  assert(toolCalls.status === 200, "GET /tool-calls status 200");
  assert(toolCalls.body.count === 1, "GET /tool-calls returns 1 tool call");

  const risks = await requestJson(boundPort, "GET", "/risks");
  assert(risks.status === 200, "GET /risks status 200");
  assert(risks.body.count >= 1, "GET /risks returns high-risk entries");

  const errors = await requestJson(boundPort, "GET", "/errors");
  assert(errors.status === 200, "GET /errors status 200");
  assert(errors.body.count === 0, "GET /errors returns 0 errors");

  const postEvents = await requestJson(boundPort, "POST", "/events");
  assert(postEvents.status === 405, "POST /events returns 405");

  const missing = await requestJson(boundPort, "GET", "/missing-route");
  assert(missing.status === 404, "unknown route returns 404");

  const allBodies = [
    healthz.body,
    version.body,
    projection.body,
    runs.body,
    runById.body,
    events.body,
    eventsByType.body,
    eventsByRisk.body,
    approvals.body,
    toolCalls.body,
    risks.body,
    errors.body,
    postEvents.body,
    missing.body,
  ];
  assert(hasForbiddenContent(allBodies) === false, "no forbidden secret-like keys/values in responses");
} catch (error) {
  fail(error.message);
} finally {
  await api.stop().catch(() => {});
  cleanup();
}

process.exit(failed > 0 ? 1 : 0);

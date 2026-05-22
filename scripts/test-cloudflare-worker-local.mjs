#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WORKER = path.join(ROOT, "ops/cloudflare-workers/agent-ledger-runtime/src/index.js");

class MockRequest {
  constructor(url, { method = "GET" } = {}) {
    this.url = url;
    this.method = method;
  }
}
class MockResponse {
  constructor(body, { status = 200 } = {}) {
    this._body = body;
    this.status = status;
    this.ok = status >= 200 && status < 300;
  }
  async json() {
    return JSON.parse(this._body);
  }
}
global.Request = MockRequest;
global.Response = MockResponse;

const { default: worker } = await import(WORKER);
let failed = 0;

function fail(message) {
  console.log(`FAIL: ${message}`);
  failed += 1;
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

async function requestJson(pathname, env = {}, method = "GET") {
  return worker.fetch(new MockRequest(`https://t${pathname}`, { method }), env);
}

const health = await requestJson("/healthz", { WORKER_NAME: "agent-ledger-runtime-dev" });
if (health.status !== 200 || !health.ok) fail("/healthz should return 200");
else pass("/healthz");

const readyWithoutSupabase = await requestJson("/readyz", {
  WORKER_NAME: "agent-ledger-runtime-dev",
});
if (readyWithoutSupabase.status !== 503 || readyWithoutSupabase.ok) {
  fail("/readyz without Supabase env should return 503 in local dev");
} else {
  const body = await readyWithoutSupabase.json();
  if (body.ready !== false) fail("/readyz without Supabase env should report ready=false");
  else pass("/readyz without Supabase env returns 503 and ready=false");
}

const readyWithSupabase = await requestJson("/readyz", {
  WORKER_NAME: "agent-ledger-runtime-dev",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "sb_secret_local_stub",
});
if (readyWithSupabase.status !== 200 || !readyWithSupabase.ok) {
  fail("/readyz with Supabase env should return 200");
} else {
  pass("/readyz with Supabase env returns 200");
}

const version = await requestJson("/version", { WORKER_NAME: "agent-ledger-runtime-dev" });
if (version.status !== 200 || !version.ok) fail("/version should return 200");
else pass("/version");

const disabled = await requestJson("/events", {}, "POST");
const disabledBody = await disabled.json();
if (disabled.status !== 403) {
  fail("POST /events should be disabled by default");
} else if (disabledBody.dry_run_only !== true || disabledBody.error !== "disabled") {
  fail("POST /events disabled response should be explicit and dry-run only");
} else {
  pass("POST /events disabled by default");
}

const enabled = await requestJson("/events", { ENABLE_AGENT_EVENTS: "true" }, "POST");
const enabledBody = await enabled.json();
if (enabled.status !== 202) {
  fail("POST /events with ENABLE_AGENT_EVENTS=true should return stubbed 202");
} else if (enabledBody.status !== "accepted_stub" || enabledBody.persisted !== false) {
  fail("POST /events enabled stub must remain non-persistent");
} else {
  pass("POST /events returns stubbed non-persistent response when enabled locally");
}

process.exit(failed ? 1 : 0);

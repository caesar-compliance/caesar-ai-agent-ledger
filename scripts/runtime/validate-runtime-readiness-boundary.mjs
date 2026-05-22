#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CONFIG_PATH = path.join(ROOT, "config/runtime-readiness-boundary.json");
const DOC_PATH = path.join(ROOT, "docs/runtime/BACKEND_RUNTIME_READINESS_BOUNDARY.md");

const REQUIRED_SCRIPTS = [
  "runtime:validate:event-model",
  "runtime:test:event-buffer",
  "runtime:test:event-export-import",
  "runtime:test:event-projection",
  "runtime:test:localhost-api",
  "runtime:validate:static-dashboard",
  "runtime:test:static-dashboard",
  "runtime:ingestion:dry-run",
  "runtime:smoke",
  "runtime:validate:supabase-rehearsal",
];

const REQUIRED_RUNTIME_FILES = [
  "docs/runtime/AGENT_EVENT_MODEL.md",
  "docs/runtime/LOCAL_EVENT_BUFFER.md",
  "docs/runtime/LOCAL_EVENT_EXPORT_IMPORT_CONTRACT.md",
  "docs/runtime/READ_ONLY_LOCAL_EVENT_PROJECTION.md",
  "docs/runtime/LOCALHOST_READ_ONLY_API.md",
  "docs/runtime/STATIC_LOCAL_DASHBOARD.md",
  "ops/supabase/001_agent_ledger_runtime_schema.sql",
  "docs/runtime/LOCAL_SUPABASE_MIGRATION_REHEARSAL.md",
  "config/local-supabase-migration-rehearsal.json",
  "scripts/runtime/validate-local-supabase-migration-rehearsal.mjs",
  "ops/cloudflare-workers/agent-ledger-runtime/src/index.js",
  "site/local-dashboard/index.html",
];

const FORBIDDEN_TRACKED = [
  ".env.runtime.local",
  ".env.cloudflare.local",
  ".env",
  ".env.local",
];

const summary = {
  ok: true,
  checks: {
    config: false,
    boundary_doc: false,
    package_scripts: false,
    runtime_files: false,
    tracked_secret_files: false,
    workflow_boundary: false,
    worker_boundary: false,
    local_api_boundary: false,
    static_dashboard_boundary: false,
    generated_report_churn: false,
  },
  failures: [],
};

let config = null;
let failed = 0;

function pass(msg) {
  console.log(`PASS: ${msg}`);
}

function fail(msg) {
  console.log(`FAIL: ${msg}`);
  summary.failures.push(msg);
  failed += 1;
}

function assert(condition, msg) {
  if (condition) pass(msg);
  else fail(msg);
}

function readText(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

assert(fs.existsSync(CONFIG_PATH), "config/runtime-readiness-boundary.json exists");
if (fs.existsSync(CONFIG_PATH)) {
  try {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    summary.checks.config = true;
    pass("config/runtime-readiness-boundary.json parses");
    assert(Array.isArray(config.allowed_hosts) && config.allowed_hosts.includes("127.0.0.1"), "allowed_hosts includes 127.0.0.1");
    assert(Array.isArray(config.forbidden_hosts) && config.forbidden_hosts.includes("0.0.0.0"), "forbidden_hosts includes 0.0.0.0");
    assert(config.generated_report_churn_file === "reports/runtime-services-readiness.latest.json", "generated_report_churn_file matches required path");
  } catch (error) {
    fail(`config/runtime-readiness-boundary.json parse failed: ${error.message}`);
  }
}

assert(fs.existsSync(DOC_PATH), "docs/runtime/BACKEND_RUNTIME_READINESS_BOUNDARY.md exists");
if (fs.existsSync(DOC_PATH)) summary.checks.boundary_doc = true;

const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const scripts = packageJson.scripts || {};
const missingScripts = REQUIRED_SCRIPTS.filter((name) => typeof scripts[name] !== "string");
if (missingScripts.length === 0) {
  pass("required package scripts exist");
  summary.checks.package_scripts = true;
} else {
  fail(`missing package scripts: ${missingScripts.join(", ")}`);
}

const missingFiles = REQUIRED_RUNTIME_FILES.filter((relPath) => !fs.existsSync(path.join(ROOT, relPath)));
if (missingFiles.length === 0) {
  pass("required runtime files exist");
  summary.checks.runtime_files = true;
} else {
  fail(`missing runtime files: ${missingFiles.join(", ")}`);
}

const trackedSecretResult = spawnSync("git", ["ls-files", ...FORBIDDEN_TRACKED], {
  cwd: ROOT,
  encoding: "utf8",
});
if (trackedSecretResult.status !== 0) {
  fail(`git ls-files for forbidden tracked files failed: ${trackedSecretResult.stderr.trim()}`);
} else {
  const tracked = trackedSecretResult.stdout.trim();
  if (tracked.length === 0) {
    pass("no forbidden local secret files are tracked");
    summary.checks.tracked_secret_files = true;
  } else {
    fail(`forbidden tracked files found: ${tracked.replace(/\n/g, ", ")}`);
  }
}

const workflowPath = path.join(ROOT, ".github/workflows/dev-runtime-activate.yml");
if (!fs.existsSync(workflowPath)) {
  fail("workflow file .github/workflows/dev-runtime-activate.yml missing");
} else {
  const workflow = fs.readFileSync(workflowPath, "utf8");
  const hasSchedule = /\bon\s*:\s*[\s\S]*\bschedule\s*:/m.test(workflow) || /\bcron\s*:/m.test(workflow);
  const hasDispatch = /workflow_dispatch\s*:/m.test(workflow);
  const hasConfirmInput = /inputs\s*:[\s\S]*confirm\s*:/m.test(workflow);
  const hasConfirmGate = /ACTIVATE_DEV_RUNTIME/.test(workflow);

  assert(!hasSchedule, "workflow has no scheduled cron trigger");
  assert(hasDispatch, "workflow is workflow_dispatch gated");
  assert(hasConfirmInput && hasConfirmGate, "workflow has explicit confirmation semantics");
  if (!hasSchedule && hasDispatch && hasConfirmInput && hasConfirmGate) {
    summary.checks.workflow_boundary = true;
  }
}

const workerSourcePath = "ops/cloudflare-workers/agent-ledger-runtime/src/index.js";
const workerTestPath = "scripts/test-cloudflare-worker-local.mjs";
const workerDocPath = "docs/runtime/AGENT_EVENT_MODEL.md";
if (fs.existsSync(path.join(ROOT, workerSourcePath)) && fs.existsSync(path.join(ROOT, workerTestPath)) && fs.existsSync(path.join(ROOT, workerDocPath))) {
  const workerSource = readText(workerSourcePath).toLowerCase();
  const workerTest = readText(workerTestPath).toLowerCase();
  const workerDoc = readText(workerDocPath).toLowerCase();

  const disabledDefault = workerSource.includes("enable_agent_events") && workerSource.includes("!== \"true\"");
  const workerDocMentionsBoundary = workerDoc.includes("post /events") && workerDoc.includes("disabled");
  const coveredByTestsDocs = workerTest.includes("post /events should be disabled by default") && workerDocMentionsBoundary;
  const noDefaultLive = workerSource.includes("live_ingestion_enabled: false");
  const obviousSecretPatterns = ["sb_secret_", "private key", "api_token", "authorization: bearer "];
  const hasHardcodedSecret = obviousSecretPatterns.some((p) => workerSource.includes(p));

  assert(disabledDefault, "worker POST /events disabled by default in source");
  assert(coveredByTestsDocs, "worker POST /events disabled boundary covered by tests/docs");
  assert(noDefaultLive, "worker default live ingestion disabled");
  assert(!hasHardcodedSecret, "worker has no obvious hardcoded secrets");

  if (disabledDefault && coveredByTestsDocs && noDefaultLive && !hasHardcodedSecret) {
    summary.checks.worker_boundary = true;
  }
} else {
  fail("worker boundary files missing (source/test/doc)");
}

const apiSourcePath = "src/local-api/read-only-api-server.mjs";
const apiTestPath = "scripts/runtime/test-localhost-read-only-api.mjs";
const apiDocPath = "docs/runtime/LOCALHOST_READ_ONLY_API.md";
if (fs.existsSync(path.join(ROOT, apiSourcePath)) && fs.existsSync(path.join(ROOT, apiTestPath)) && fs.existsSync(path.join(ROOT, apiDocPath))) {
  const apiSource = readText(apiSourcePath).toLowerCase();
  const apiTest = readText(apiTestPath).toLowerCase();
  const apiDoc = readText(apiDocPath).toLowerCase();

  const hasLocalhostDefault = apiSource.includes('host = options.host ?? "127.0.0.1"');
  const guardsForbiddenHost = apiSource.includes('host === "0.0.0.0"') && apiSource.includes("unsafe host 0.0.0.0");
  const apiDocMentionsReadOnlyPost = apiDoc.includes("405") || apiDoc.includes("method_not_allowed") || apiDoc.includes("no write/persist endpoints");
  const postEventsCovered = apiTest.includes("post /events returns 405") && apiDocMentionsReadOnlyPost;

  assert(hasLocalhostDefault, "local API default host is 127.0.0.1");
  assert(guardsForbiddenHost, "local API rejects/guards 0.0.0.0");
  assert(postEventsCovered, "local API POST /events read-only behavior covered by tests/docs");

  if (hasLocalhostDefault && guardsForbiddenHost && postEventsCovered) {
    summary.checks.local_api_boundary = true;
  }
} else {
  fail("local API boundary files missing (source/test/doc)");
}

const dashboardFiles = [
  "site/local-dashboard/index.html",
  "site/local-dashboard/assets/dashboard.css",
  "site/local-dashboard/assets/dashboard.js",
  "site/local-dashboard/data/sample-projection.json",
];
const existingDashboardFiles = dashboardFiles.filter((rel) => fs.existsSync(path.join(ROOT, rel)));
if (existingDashboardFiles.length !== dashboardFiles.length) {
  fail("static dashboard boundary files missing");
} else {
  const dashboardJoined = existingDashboardFiles.map((rel) => readText(rel)).join("\n").toLowerCase();
  const forbiddenExternal = ["http://", "https://", "fonts.googleapis", "fonts.gstatic", "google-analytics", "googletagmanager", "cdn"];
  const hitExternal = forbiddenExternal.find((pattern) => dashboardJoined.includes(pattern));
  assert(!hitExternal, "static dashboard has no external URLs/CDN/analytics/external fonts");

  const sampleLower = readText("site/local-dashboard/data/sample-projection.json").toLowerCase();
  const forbiddenSecretLike = ["sb_secret_", "service_role_key", "api_key", "password", "private_key", "authorization: bearer "];
  const hitSecret = forbiddenSecretLike.find((pattern) => sampleLower.includes(pattern));
  assert(!hitSecret, "static dashboard sample data has no forbidden secret-like strings");

  if (!hitExternal && !hitSecret) {
    summary.checks.static_dashboard_boundary = true;
  }
}

const churnPath = path.join(ROOT, "reports/runtime-services-readiness.latest.json");
if (config && config.generated_report_churn_file === "reports/runtime-services-readiness.latest.json" && fs.existsSync(churnPath)) {
  pass("generated report churn file is known and present; validator does not modify it");
  summary.checks.generated_report_churn = true;
} else {
  fail("generated report churn config/path mismatch or file missing");
}

summary.ok = failed === 0;
console.log(JSON.stringify(summary));
process.exit(summary.ok ? 0 : 1);

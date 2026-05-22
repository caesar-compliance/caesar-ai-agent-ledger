#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CONFIG_REL = "config/local-supabase-migration-rehearsal.json";
const DOC_REL = "docs/runtime/LOCAL_SUPABASE_MIGRATION_REHEARSAL.md";
const SQL_REL = "ops/supabase/001_agent_ledger_runtime_schema.sql";
const BOUNDARY_SCRIPT_REL = "scripts/runtime/validate-runtime-readiness-boundary.mjs";
const DB_COMPILE_DOC_REL = "docs/runtime/LOCAL_DB_COMPILE_HARNESS.md";
const DB_COMPILE_CONFIG_REL = "config/local-db-compile-harness.json";
const PACKAGE_JSON_REL = "package.json";
const FORBIDDEN_TRACKED = [".env.runtime.local", ".env.cloudflare.local", ".env", ".env.local"];

let failures = 0;
const summary = {
  ok: true,
  checks: {
    config_parse: false,
    rehearsal_doc: false,
    schema_sql: false,
    required_tables: false,
    forbidden_patterns: false,
    boundary_prereq: false,
    tracked_env_files: false,
    tracked_tmp: false,
    no_workflow_cron: false,
    db_compile_harness_awareness: false,
  },
  details: {
    required_tables: {},
    forbidden_pattern_hits: [],
  },
  failures: [],
};

function pass(message) {
  console.log(`PASS: ${message}`);
}

function fail(message) {
  console.log(`FAIL: ${message}`);
  summary.failures.push(message);
  failures += 1;
}

function assert(condition, message) {
  if (condition) pass(message);
  else fail(message);
}

function readUtf8(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

let config = null;
const configPath = path.join(ROOT, CONFIG_REL);
assert(fs.existsSync(configPath), `${CONFIG_REL} exists`);
if (fs.existsSync(configPath)) {
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    summary.checks.config_parse = true;
    pass(`${CONFIG_REL} parses`);
  } catch (error) {
    fail(`${CONFIG_REL} parse failed: ${error.message}`);
  }
}

const docPath = path.join(ROOT, DOC_REL);
assert(fs.existsSync(docPath), `${DOC_REL} exists`);
if (fs.existsSync(docPath)) summary.checks.rehearsal_doc = true;

const sqlPath = path.join(ROOT, SQL_REL);
assert(fs.existsSync(sqlPath), `${SQL_REL} exists`);
if (fs.existsSync(sqlPath)) summary.checks.schema_sql = true;

let sqlLower = "";
if (fs.existsSync(sqlPath)) {
  sqlLower = readUtf8(SQL_REL).toLowerCase();
}

const requiredTables = ["agent_runs", "agent_events", "runtime_events"];
let tablesOk = true;
for (const table of requiredTables) {
  const hasTable = new RegExp(`create\\s+table\\s+if\\s+not\\s+exists\\s+agent_ledger\\.${table}\\b`, "i").test(sqlLower);
  summary.details.required_tables[table] = hasTable;
  assert(hasTable, `required table detected: ${table}`);
  if (!hasTable) tablesOk = false;
}
summary.checks.required_tables = tablesOk;

const forbiddenPatterns = [
  { label: "obvious hardcoded secret token", regex: /\b(sb_secret_[a-z0-9_-]{6,}|service_role_key|private[_ -]?key|authorization:\s*bearer)\b/i },
  { label: "remote connection string", regex: /\b(postgres(?:ql)?:\/\/|db\.[a-z0-9-]+\.supabase\.co)\b/i },
  { label: "supabase db push", regex: /\bsupabase\s+db\s+push\b/i },
  { label: "psql postgres://", regex: /\bpsql\s+postgres:\/\//i },
  { label: "drop database", regex: /\bdrop\s+database\b/i },
  { label: "drop schema", regex: /\bdrop\s+schema\b/i },
];

let patternFail = false;
for (const pattern of forbiddenPatterns) {
  const hit = pattern.regex.test(sqlLower);
  if (hit) {
    patternFail = true;
    summary.details.forbidden_pattern_hits.push(pattern.label);
    fail(`forbidden pattern detected in schema SQL: ${pattern.label}`);
  } else {
    pass(`forbidden pattern absent in schema SQL: ${pattern.label}`);
  }
}
summary.checks.forbidden_patterns = !patternFail;

const boundaryScriptExists = fs.existsSync(path.join(ROOT, BOUNDARY_SCRIPT_REL));
assert(boundaryScriptExists, `${BOUNDARY_SCRIPT_REL} exists`);

let packageHasScript = false;
const packageJsonPath = path.join(ROOT, PACKAGE_JSON_REL);
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    packageHasScript = typeof packageJson?.scripts?.["runtime:validate:boundary"] === "string";
    assert(packageHasScript, "package.json includes runtime:validate:boundary script");
  } catch (error) {
    fail(`package.json parse failed: ${error.message}`);
  }
} else {
  fail("package.json missing");
}
summary.checks.boundary_prereq = boundaryScriptExists && packageHasScript;

const trackedEnvResult = spawnSync("git", ["ls-files", ...FORBIDDEN_TRACKED], { cwd: ROOT, encoding: "utf8" });
if (trackedEnvResult.status !== 0) {
  fail(`git ls-files forbidden env check failed: ${trackedEnvResult.stderr.trim()}`);
} else {
  const tracked = trackedEnvResult.stdout.trim();
  if (tracked.length === 0) {
    pass("no tracked local env secret files");
    summary.checks.tracked_env_files = true;
  } else {
    fail(`tracked local env secret files found: ${tracked.replace(/\n/g, ", ")}`);
  }
}

const trackedTmpResult = spawnSync("git", ["ls-files", ".tmp"], { cwd: ROOT, encoding: "utf8" });
if (trackedTmpResult.status !== 0) {
  fail(`git ls-files .tmp check failed: ${trackedTmpResult.stderr.trim()}`);
} else {
  const trackedTmp = trackedTmpResult.stdout.trim();
  if (trackedTmp.length === 0) {
    pass("no tracked .tmp files");
    summary.checks.tracked_tmp = true;
  } else {
    fail(`tracked .tmp files found: ${trackedTmp.replace(/\n/g, ", ")}`);
  }
}

const workflowsDir = path.join(ROOT, ".github/workflows");
let hasCron = false;
if (fs.existsSync(workflowsDir)) {
  const workflowFiles = fs.readdirSync(workflowsDir).filter((name) => /\.(yml|yaml)$/i.test(name));
  for (const fileName of workflowFiles) {
    const workflowText = fs.readFileSync(path.join(workflowsDir, fileName), "utf8");
    if (/\bschedule\s*:/im.test(workflowText) || /\bcron\s*:/im.test(workflowText)) {
      hasCron = true;
      fail(`workflow schedule/cron detected in ${fileName}`);
    }
  }
}
if (!hasCron) {
  pass("no workflow schedule/cron detected");
  summary.checks.no_workflow_cron = true;
}

if (config) {
  assert(config.rehearsal_mode === "local_static_rehearsal_only", "rehearsal_mode is local_static_rehearsal_only");
  assert(config.future_local_compile_gate_status?.enabled === false, "future local compile gate remains disabled");
  assert(config.future_local_compile_gate_status?.requires_explicit_control_tower_approval === true, "future local compile gate requires explicit Control Tower approval");
}

let dbCompileAwarenessOk = true;
assert(fs.existsSync(path.join(ROOT, DB_COMPILE_DOC_REL)), `${DB_COMPILE_DOC_REL} exists`);
if (!fs.existsSync(path.join(ROOT, DB_COMPILE_DOC_REL))) dbCompileAwarenessOk = false;

const dbCompileConfigPath = path.join(ROOT, DB_COMPILE_CONFIG_REL);
assert(fs.existsSync(dbCompileConfigPath), `${DB_COMPILE_CONFIG_REL} exists`);
if (!fs.existsSync(dbCompileConfigPath)) {
  dbCompileAwarenessOk = false;
} else {
  try {
    const dbCompileConfig = JSON.parse(fs.readFileSync(dbCompileConfigPath, "utf8"));
    assert(dbCompileConfig.enabled === false, "local DB compile harness enabled=false");
    assert(dbCompileConfig.execution_allowed_now === false, "local DB compile harness execution_allowed_now=false");
    if (dbCompileConfig.enabled !== false || dbCompileConfig.execution_allowed_now !== false) {
      dbCompileAwarenessOk = false;
    }
  } catch (error) {
    fail(`${DB_COMPILE_CONFIG_REL} parse failed: ${error.message}`);
    dbCompileAwarenessOk = false;
  }
}

if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const hasDbCompileValidatorScript = typeof packageJson?.scripts?.["runtime:validate:db-compile-harness"] === "string";
    assert(hasDbCompileValidatorScript, "package.json includes runtime:validate:db-compile-harness script");
    if (!hasDbCompileValidatorScript) dbCompileAwarenessOk = false;
  } catch (error) {
    fail(`package.json parse failed while checking T023 script: ${error.message}`);
    dbCompileAwarenessOk = false;
  }
}

summary.checks.db_compile_harness_awareness = dbCompileAwarenessOk;

summary.ok = failures === 0;
console.log(JSON.stringify(summary));
process.exit(summary.ok ? 0 : 1);

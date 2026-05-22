#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DOC_REL = "docs/runtime/LOCAL_DB_COMPILE_HARNESS.md";
const CONFIG_REL = "config/local-db-compile-harness.json";
const STUB_REL = "scripts/runtime/local-db-compile-harness-stub.mjs";
const FORBIDDEN_TRACKED = [".env.runtime.local", ".env.cloudflare.local", ".env", ".env.local"];

let failures = 0;
const summary = {
  ok: true,
  checks: {
    doc_exists: false,
    config_parse: false,
    stub_exists: false,
    config_flags: false,
    migration_sources: false,
    stub_safety_scan: false,
    stub_output: false,
    tracked_env_files: false,
    tracked_tmp: false,
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

const docPath = path.join(ROOT, DOC_REL);
assert(fs.existsSync(docPath), `${DOC_REL} exists`);
if (fs.existsSync(docPath)) summary.checks.doc_exists = true;

const configPath = path.join(ROOT, CONFIG_REL);
let config = null;
assert(fs.existsSync(configPath), `${CONFIG_REL} exists`);
if (fs.existsSync(configPath)) {
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    pass(`${CONFIG_REL} parses`);
    summary.checks.config_parse = true;
  } catch (error) {
    fail(`${CONFIG_REL} parse failed: ${error.message}`);
  }
}

const stubPath = path.join(ROOT, STUB_REL);
assert(fs.existsSync(stubPath), `${STUB_REL} exists`);
if (fs.existsSync(stubPath)) summary.checks.stub_exists = true;

if (config) {
  const flagsOk =
    config.enabled === false &&
    config.execution_allowed_now === false &&
    config.requires_explicit_control_tower_approval === true &&
    config.harness_mode === "disabled_stub_only";
  assert(config.enabled === false, "config enabled is false");
  assert(config.execution_allowed_now === false, "config execution_allowed_now is false");
  assert(config.requires_explicit_control_tower_approval === true, "config requires explicit Control Tower approval");
  assert(config.harness_mode === "disabled_stub_only", "config harness_mode is disabled_stub_only");
  summary.checks.config_flags = flagsOk;

  const migrations = Array.isArray(config.migration_sources) ? config.migration_sources : [];
  let missingMigration = null;
  for (const relPath of migrations) {
    if (!fs.existsSync(path.join(ROOT, relPath))) {
      missingMigration = relPath;
      break;
    }
  }
  assert(migrations.length > 0, "config migration_sources has entries");
  assert(!missingMigration, "all migration sources exist");
  summary.checks.migration_sources = migrations.length > 0 && !missingMigration;
}

if (fs.existsSync(stubPath)) {
  const stubText = fs.readFileSync(stubPath, "utf8");
  const forbidden = [
    /child_process\s*\.\s*exec\s*\(/i,
    /child_process\s*\.\s*execsync\s*\(/i,
    /child_process\s*\.\s*spawn\s*\(/i,
    /child_process\s*\.\s*spawnsync\s*\(/i,
    /\bdocker\s+(run|compose|build)\b/i,
    /\bpsql\s+postgres:\/\//i,
    /\bsupabase\s+db\b/i,
  ];
  const hit = forbidden.find((pattern) => pattern.test(stubText));
  assert(!hit, "stub has no forbidden execution call patterns");
  summary.checks.stub_safety_scan = !hit;
}

const stubRun = spawnSync("node", [STUB_REL], { cwd: ROOT, encoding: "utf8" });
if (stubRun.status !== 0) {
  fail(`stub run failed with exit ${stubRun.status}: ${stubRun.stderr.trim()}`);
} else {
  try {
    const output = JSON.parse(stubRun.stdout);
    const outputOk =
      output.executed === false &&
      output.sql_executed === false &&
      output.docker_invoked === false &&
      output.psql_invoked === false &&
      output.supabase_cli_invoked === false &&
      output.network_used === false;
    assert(output.executed === false, "stub output executed=false");
    assert(output.sql_executed === false, "stub output sql_executed=false");
    assert(output.docker_invoked === false, "stub output docker_invoked=false");
    assert(output.psql_invoked === false, "stub output psql_invoked=false");
    assert(output.supabase_cli_invoked === false, "stub output supabase_cli_invoked=false");
    assert(output.network_used === false, "stub output network_used=false");
    summary.checks.stub_output = outputOk;
  } catch (error) {
    fail(`stub output parse failed: ${error.message}`);
  }
}

const envTracked = spawnSync("git", ["ls-files", ...FORBIDDEN_TRACKED], { cwd: ROOT, encoding: "utf8" });
if (envTracked.status !== 0) {
  fail(`git ls-files env check failed: ${envTracked.stderr.trim()}`);
} else {
  const tracked = envTracked.stdout.trim();
  assert(tracked.length === 0, "no tracked local env secret files");
  summary.checks.tracked_env_files = tracked.length === 0;
}

const tmpTracked = spawnSync("git", ["ls-files", ".tmp"], { cwd: ROOT, encoding: "utf8" });
if (tmpTracked.status !== 0) {
  fail(`git ls-files .tmp check failed: ${tmpTracked.stderr.trim()}`);
} else {
  const tracked = tmpTracked.stdout.trim();
  assert(tracked.length === 0, "no tracked .tmp files");
  summary.checks.tracked_tmp = tracked.length === 0;
}

summary.ok = failures === 0;
console.log(JSON.stringify(summary));
process.exit(summary.ok ? 0 : 1);

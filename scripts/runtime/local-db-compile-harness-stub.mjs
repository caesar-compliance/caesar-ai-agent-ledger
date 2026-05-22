#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CONFIG_REL = "config/local-db-compile-harness.json";
const CONFIG_PATH = path.join(ROOT, CONFIG_REL);

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(CONFIG_PATH)) {
  fail(`${CONFIG_REL} is missing`);
}

let config;
try {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
} catch (error) {
  fail(`${CONFIG_REL} parse failed: ${error.message}`);
}

if (config.enabled !== false) {
  fail("harness config must keep enabled=false in T023");
}

if (config.execution_allowed_now !== false) {
  fail("harness config must keep execution_allowed_now=false in T023");
}

const migrationSources = Array.isArray(config.migration_sources) ? config.migration_sources : [];
for (const relPath of migrationSources) {
  const absPath = path.join(ROOT, relPath);
  if (!fs.existsSync(absPath)) {
    fail(`migration source missing: ${relPath}`);
  }
}

const result = {
  ok: true,
  status: "disabled",
  executed: false,
  sql_executed: false,
  docker_invoked: false,
  psql_invoked: false,
  supabase_cli_invoked: false,
  network_used: false,
};

console.log(JSON.stringify(result, null, 2));
process.exit(0);

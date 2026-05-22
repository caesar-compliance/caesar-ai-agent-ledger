#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  loadRuntimeEnv,
  getDbUrl,
  envFlagTrue,
  RUNTIME_ROOT,
} from "./lib/load-runtime-env.mjs";
import { assertRuntimeSafetyDisabled } from "./lib/runtime-safety.mjs";
import { withPgClient } from "./lib/pg-client.mjs";

const SCHEMA_FILE = path.join(
  RUNTIME_ROOT,
  "ops/supabase/001_agent_ledger_runtime_schema.sql",
);

async function main() {
  const env = loadRuntimeEnv();
  if (assertRuntimeSafetyDisabled(env, "apply-supabase-schema").length > 0) {
    process.exit(1);
  }
  if (!envFlagTrue(env, "APPLY_SUPABASE_SCHEMA")) {
    console.log("apply-supabase-schema: no-op (set APPLY_SUPABASE_SCHEMA=true)");
    return;
  }
  const dbUrl = getDbUrl(env);
  if (!dbUrl) {
    console.error("apply-supabase-schema: SUPABASE_DB_URL not configured");
    process.exit(1);
  }
  const sql = fs.readFileSync(SCHEMA_FILE, "utf8");
  const usePsql =
    spawnSync("which", ["psql"], { encoding: "utf8" }).status === 0;
  if (usePsql) {
    const r = spawnSync(
      "psql",
      [dbUrl, "-v", "ON_ERROR_STOP=1", "-f", SCHEMA_FILE],
      { encoding: "utf8" },
    );
    if (r.status !== 0) process.exit(1);
  } else {
    await withPgClient(dbUrl, async (c) => c.query(sql));
  }
  console.log("PASS: apply-supabase-schema");
}

main().catch(() => process.exit(1));

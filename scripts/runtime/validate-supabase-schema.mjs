#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { RUNTIME_ROOT } from "./lib/load-runtime-env.mjs";
import { EXPECTED_RUNTIME_TABLES } from "./lib/expected-tables.mjs";

const sql = fs.readFileSync(
  path.join(RUNTIME_ROOT, "ops/supabase/001_agent_ledger_runtime_schema.sql"),
  "utf8",
);
let failed = 0;
for (const table of EXPECTED_RUNTIME_TABLES) {
  const pattern = new RegExp(`create table if not exists agent_ledger\\.${table}`, "i");
  if (!pattern.test(sql)) {
    console.log(`FAIL: missing table ${table}`);
    failed++;
  } else {
    console.log(`PASS: table ${table}`);
  }
}
process.exit(failed > 0 ? 1 : 0);

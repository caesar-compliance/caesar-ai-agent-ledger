#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  loadRuntimeEnv,
  getDbUrl,
  RUNTIME_ROOT,
} from "./lib/load-runtime-env.mjs";
import { assertRuntimeSafetyDisabled, runtimeSafetySnapshot } from "./lib/runtime-safety.mjs";
import { EXPECTED_RUNTIME_TABLES, RUNTIME_SCHEMA_NAME } from "./lib/expected-tables.mjs";
import { withPgClient } from "./lib/pg-client.mjs";

const OUTPUT = path.join(RUNTIME_ROOT, "reports/runtime-db-health.latest.json");

async function main() {
  const env = loadRuntimeEnv();
  const base = {
    checked_at: new Date().toISOString(),
    schema_name: RUNTIME_SCHEMA_NAME,
    ...runtimeSafetySnapshot(env),
  };
  if (assertRuntimeSafetyDisabled(env, "db-health").length > 0) process.exit(1);
  const dbUrl = getDbUrl(env);
  if (!dbUrl) {
    write({ ...base, status: "not_configured" });
    return;
  }
  try {
    const health = await withPgClient(dbUrl, async (client) => {
      const rows = await client.query(
        `SELECT table_name FROM information_schema.tables
         WHERE table_schema = $1 AND table_name = ANY($2::text[])`,
        [RUNTIME_SCHEMA_NAME, EXPECTED_RUNTIME_TABLES],
      );
      const present = new Set(rows.rows.map((r) => r.table_name));
      const missing = EXPECTED_RUNTIME_TABLES.filter((t) => !present.has(t));
      return {
        status: missing.length === 0 ? "connected" : "schema_missing",
        missing_tables: missing,
        expected_tables_present: EXPECTED_RUNTIME_TABLES.filter((t) => present.has(t)),
      };
    });
    write({ ...base, ...health });
    console.log(`PASS: runtime db health (${health.status})`);
  } catch {
    write({ ...base, status: "error" });
  }
}

function write(payload) {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`);
}

main();

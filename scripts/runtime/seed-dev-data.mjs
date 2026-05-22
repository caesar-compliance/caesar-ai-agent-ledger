#!/usr/bin/env node
import { loadRuntimeEnv, getDbUrl, envFlagTrue } from "./lib/load-runtime-env.mjs";
import { assertRuntimeSafetyDisabled } from "./lib/runtime-safety.mjs";
import { withPgClient } from "./lib/pg-client.mjs";

async function main() {
  const env = loadRuntimeEnv();
  if (assertRuntimeSafetyDisabled(env, "seed").length) process.exit(1);
  if (!envFlagTrue(env, "ENABLE_DEV_SEED")) {
    console.log("seed-dev-data: no-op (ENABLE_DEV_SEED not set)");
    return;
  }
  const dbUrl = getDbUrl(env);
  if (!dbUrl) process.exit(1);
  await withPgClient(dbUrl, async (c) => {
    await c.query(
      `INSERT INTO agent_ledger.agent_runs (run_id, agent_name, status, metadata_json)
       VALUES ($1, $2, $3, $4::jsonb) ON CONFLICT (run_id) DO NOTHING`,
      ["dev-seed-run-001", "dev-agent", "completed", JSON.stringify({ note: "dev seed" })],
    );
  });
  console.log("PASS: seed-dev-data");
}

main().catch(() => process.exit(1));

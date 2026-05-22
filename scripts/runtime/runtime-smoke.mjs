#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const COMMANDS = [
  ["node", ["scripts/runtime/validate-supabase-schema.mjs"]],
  ["node", ["scripts/runtime/validate-agent-event-schema.mjs"]],
  ["node", ["scripts/runtime/check-service-credentials.mjs"]],
];

for (const [command, args] of COMMANDS) {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`FAIL: ${args.join(" ")} exited ${result.status ?? "null"}`);
    process.exit(result.status ?? 1);
  }
}

console.log("PASS: runtime smoke");

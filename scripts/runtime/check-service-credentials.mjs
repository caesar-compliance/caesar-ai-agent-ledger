#!/usr/bin/env node
/**
 * Agent Ledger — credential presence check (no secrets printed, no network).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = path.join(ROOT, "reports/runtime-services-readiness.latest.json");

const FILES = { runtime: ".env.runtime.local", cloudflare: ".env.cloudflare.local" };

function parseEnv(content) {
  const out = {};
  for (const line of content.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function load(name) {
  const p = path.join(ROOT, name);
  if (!fs.existsSync(p)) return { exists: false, env: {} };
  return { exists: true, env: parseEnv(fs.readFileSync(p, "utf8")) };
}

function present(env, key) {
  return String(env[key] ?? "").trim().length > 0;
}

function flagTrue(env, key) {
  const v = String(env[key] ?? "").trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

function rows(env, keys) {
  return keys.map((key) => ({ key, present: present(env, key) }));
}

function allPresent(r) {
  return r.length > 0 && r.every((x) => x.present);
}

const SUPABASE_REQ = ["SUPABASE_URL"];
const SUPABASE_OPT = [
  "SUPABASE_PROJECT_NAME",
  "SUPABASE_PROJECT_REF",
  "SUPABASE_DB_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SCHEMA",
];
const CF_REQ = ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_WORKER_NAME"];

function main() {
  const runtimeF = load(FILES.runtime);
  const cfF = load(FILES.cloudflare);
  const runtime = runtimeF.env;
  const cloudflare = cfF.env;

  const safety = {
    apply_supabase_schema: flagTrue(runtime, "APPLY_SUPABASE_SCHEMA"),
    enable_live_ingestion: flagTrue(runtime, "ENABLE_LIVE_INGESTION"),
    enable_scheduled_monitoring: flagTrue(runtime, "ENABLE_SCHEDULED_MONITORING"),
    enable_network_execution: flagTrue(runtime, "ENABLE_NETWORK_EXECUTION"),
    cloudflare_enable_worker_deploy: flagTrue(cloudflare, "CLOUDFLARE_ENABLE_WORKER_DEPLOY"),
    cloudflare_enable_cron_trigger: flagTrue(cloudflare, "CLOUDFLARE_ENABLE_CRON_TRIGGER"),
  };

  const safetyErrors = Object.entries({
    apply_supabase_schema: "APPLY_SUPABASE_SCHEMA",
    enable_live_ingestion: "ENABLE_LIVE_INGESTION",
    enable_scheduled_monitoring: "ENABLE_SCHEDULED_MONITORING",
    enable_network_execution: "ENABLE_NETWORK_EXECUTION",
    cloudflare_enable_worker_deploy: "CLOUDFLARE_ENABLE_WORKER_DEPLOY",
    cloudflare_enable_cron_trigger: "CLOUDFLARE_ENABLE_CRON_TRIGGER",
  })
    .filter(([k]) => safety[k])
    .map(([, label]) => `${label} must be false in local env`);

  const supReq = rows(runtime, SUPABASE_REQ);
  const supOpt = rows(runtime, SUPABASE_OPT);
  const cfRows = rows(cloudflare, CF_REQ);

  const readiness = {
    supabase_required_ready: allPresent(supReq),
    cloudflare_ready: allPresent(cfRows),
  };

  let status = "onboarding_incomplete";
  if (safetyErrors.length) status = "unsafe_local_flags";
  else if (readiness.supabase_required_ready && readiness.cloudflare_ready) {
    status = "local_credentials_ready";
  } else if (readiness.supabase_required_ready || readiness.cloudflare_ready) {
    status = "partial";
  }

  const payload = {
    status,
    checked_at: new Date().toISOString(),
    account_allocation: "account_b",
    readiness,
    services: [
      { service: "supabase", fields: [...supReq, ...supOpt] },
      { service: "cloudflare", fields: cfRows },
    ],
    safety_flags: safety,
    local_env_files: {
      env_runtime_local: runtimeF.exists,
      env_cloudflare_local: cfF.exists,
    },
    next_required_action:
      "Fill .env.runtime.local and .env.cloudflare.local for Account B (caesar-agent-ledger-dev). No deploy.",
    public_note: "Metadata-only. No secrets in export.",
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log("Runtime services credential check (values not shown)");
  for (const [k, f] of Object.entries(FILES)) {
    console.log(`  ${f}: ${(k === "runtime" ? runtimeF : cfF).exists ? "found" : "missing"}`);
  }
  console.log(`Wrote ${OUTPUT}`);

  if (safetyErrors.length) {
    console.error("FAILED — unsafe local flags");
    process.exit(1);
  }
  console.log("PASS: check-service-credentials");
}

main();

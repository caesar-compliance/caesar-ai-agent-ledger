#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const RUNTIME_ENV_FILES = [".env.runtime.local", ".env.runtime"];

function parseEnvFile(content) {
  const out = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

export function loadRuntimeEnv() {
  const merged = {};
  for (const file of RUNTIME_ENV_FILES) {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) continue;
    Object.assign(merged, parseEnvFile(fs.readFileSync(full, "utf8")));
  }
  for (const [key, value] of Object.entries(process.env)) {
    if (
      key.startsWith("SUPABASE_") ||
      key === "DATABASE_URL" ||
      key.startsWith("ENABLE_") ||
      key === "APPLY_SUPABASE_SCHEMA"
    ) {
      if (value !== undefined && value !== "") merged[key] = value;
    }
  }
  return merged;
}

export function getDbUrl(env) {
  return (env.SUPABASE_DB_URL || env.DATABASE_URL || "").trim();
}

export function envFlagTrue(env, key) {
  const v = (env[key] ?? "").toString().trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

export { ROOT as RUNTIME_ROOT };

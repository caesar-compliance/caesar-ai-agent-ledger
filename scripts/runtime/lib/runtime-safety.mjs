#!/usr/bin/env node
import { envFlagTrue } from "./load-runtime-env.mjs";

export function assertRuntimeSafetyDisabled(env, context = "runtime") {
  const errors = [];
  for (const key of [
    "ENABLE_LIVE_INGESTION",
    "ENABLE_SCHEDULED_MONITORING",
    "ENABLE_NETWORK_EXECUTION",
  ]) {
    if (envFlagTrue(env, key)) {
      errors.push(`${context}: ${key} must remain disabled`);
    }
  }
  return errors;
}

export function runtimeSafetySnapshot(env) {
  return {
    live_ingestion_enabled: envFlagTrue(env, "ENABLE_LIVE_INGESTION"),
    scheduled_monitoring_enabled: envFlagTrue(env, "ENABLE_SCHEDULED_MONITORING"),
    network_execution_enabled: envFlagTrue(env, "ENABLE_NETWORK_EXECUTION"),
  };
}

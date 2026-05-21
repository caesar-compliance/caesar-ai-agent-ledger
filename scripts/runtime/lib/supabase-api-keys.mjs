/**
 * Supabase API key presence/format helpers — never log key values.
 */

export function envPresent(env, key) {
  return String(env[key] ?? "").trim().length > 0;
}

export function keyPrefixType(value) {
  const v = String(value ?? "").trim();
  if (!v) return "missing";
  if (v.startsWith("sb_publishable_")) return "sb_publishable";
  if (v.startsWith("sb_secret_")) return "sb_secret";
  if (v.startsWith("eyJ")) return "legacy_jwt";
  return "unknown";
}

export function analyzeSupabaseApiKeys(env) {
  const publishablePresent = envPresent(env, "SUPABASE_PUBLISHABLE_KEY");
  const secretPresent = envPresent(env, "SUPABASE_SECRET_KEY");
  const anonPresent = envPresent(env, "SUPABASE_ANON_KEY");
  const serviceRolePresent = envPresent(env, "SUPABASE_SERVICE_ROLE_KEY");

  const hasNewPair = publishablePresent && secretPresent;
  const hasLegacyPair = anonPresent && serviceRolePresent;
  const partialNew = publishablePresent || secretPresent;
  const partialLegacy = anonPresent || serviceRolePresent;

  const explicitMode = String(env.SUPABASE_API_KEY_MODE ?? "")
    .trim()
    .toLowerCase();

  let supabase_key_mode = "missing";

  if (explicitMode === "new") {
    if (partialNew && partialLegacy) supabase_key_mode = "mixed";
    else if (hasNewPair) supabase_key_mode = "new";
    else if (partialNew) supabase_key_mode = "mixed";
    else supabase_key_mode = "missing";
  } else if (explicitMode === "legacy") {
    if (partialNew && partialLegacy) supabase_key_mode = "mixed";
    else if (hasLegacyPair) supabase_key_mode = "legacy";
    else if (partialLegacy) supabase_key_mode = "mixed";
    else supabase_key_mode = "missing";
  } else if (hasNewPair && hasLegacyPair) {
    supabase_key_mode = "mixed";
  } else if (hasNewPair) {
    supabase_key_mode = "new";
  } else if (hasLegacyPair) {
    supabase_key_mode = "legacy";
  } else if (partialNew && partialLegacy) {
    supabase_key_mode = "mixed";
  } else if (partialNew) {
    supabase_key_mode = "mixed";
  } else if (partialLegacy) {
    supabase_key_mode = "mixed";
  }

  const warnings = [];
  if (
    (explicitMode === "new" || supabase_key_mode === "new") &&
    !secretPresent
  ) {
    warnings.push(
      "SUPABASE_SECRET_KEY is missing (required for new Supabase API key mode)",
    );
  }
  if (secretPresent || partialNew) {
    warnings.push(
      "Never place SUPABASE_SECRET_KEY in browser/client code, tracked docs, or public JSON exports",
    );
  }

  return {
    supabase_key_mode,
    supabase_publishable_key_present: publishablePresent,
    supabase_secret_key_present: secretPresent,
    supabase_legacy_anon_key_present: anonPresent,
    supabase_legacy_service_role_key_present: serviceRolePresent,
    key_prefix_types: {
      SUPABASE_PUBLISHABLE_KEY: keyPrefixType(env.SUPABASE_PUBLISHABLE_KEY),
      SUPABASE_SECRET_KEY: keyPrefixType(env.SUPABASE_SECRET_KEY),
      SUPABASE_ANON_KEY: keyPrefixType(env.SUPABASE_ANON_KEY),
      SUPABASE_SERVICE_ROLE_KEY: keyPrefixType(env.SUPABASE_SERVICE_ROLE_KEY),
    },
    warnings,
    new_keys_ready: hasNewPair,
    legacy_keys_ready: hasLegacyPair,
  };
}

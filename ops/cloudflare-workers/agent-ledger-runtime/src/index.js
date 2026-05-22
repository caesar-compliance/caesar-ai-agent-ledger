/**
 * Agent Ledger runtime worker — dev scaffold.
 * POST /events disabled unless ENABLE_AGENT_EVENTS=true (default off).
 */

const APP_NAME = "caesar-ai-agent-ledger";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function buildHealthPayload(env) {
  return {
    ok: true,
    status: "ok",
    app: APP_NAME,
    runtime_id: env.RUNTIME_ID ?? "agent-ledger-runtime-v1",
    events_ingest_enabled: env.ENABLE_AGENT_EVENTS === "true",
    live_ingestion_enabled: false,
  };
}

function buildReadyPayload(env) {
  const supabaseConfigured = Boolean(
    env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY,
  );
  return {
    ok: supabaseConfigured,
    ready: supabaseConfigured,
    checks: { supabase_configured: supabaseConfigured },
    events_ingest_enabled: env.ENABLE_AGENT_EVENTS === "true",
  };
}

function buildVersionPayload(env) {
  return {
    app: APP_NAME,
    worker: env.WORKER_NAME ?? "agent-ledger-runtime-dev",
    runtime_env: env.RUNTIME_ENV ?? "dev",
    git_sha: env.GIT_SHA ?? null,
    build_time: env.BUILD_TIME ?? null,
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health" || url.pathname === "/healthz") {
      return jsonResponse(buildHealthPayload(env));
    }
    if (url.pathname === "/readyz") {
      const payload = buildReadyPayload(env);
      return jsonResponse(payload, payload.ready ? 200 : 503);
    }
    if (url.pathname === "/version") {
      return jsonResponse(buildVersionPayload(env));
    }

    if (url.pathname === "/events" && request.method === "POST") {
      if (env.ENABLE_AGENT_EVENTS !== "true") {
        return jsonResponse(
          {
            error: "disabled",
            message: "POST /events disabled. Set ENABLE_AGENT_EVENTS=true to enable.",
            dry_run_only: true,
          },
          403,
        );
      }
      return jsonResponse({
        status: "accepted_stub",
        persisted: false,
        note: "Event ingest stub — implement Supabase write when schema applied",
      }, 202);
    }

    return jsonResponse({ error: "not_found" }, 404);
  },
};

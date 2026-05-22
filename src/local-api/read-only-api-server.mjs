import http from "node:http";
import { URL } from "node:url";
import { buildReadOnlyEventProjection } from "../projection/read-only-event-projection.mjs";

const DEFAULT_SERVICE_NAME = "caesar-agent-ledger-read-only-api";

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(`${JSON.stringify(payload)}\n`);
}

function errorJson(res, status, error, code) {
  json(res, status, { ok: false, error, code });
}

function assertLocalhostConfig(host, allowUnsafeHost) {
  if (host === "0.0.0.0" && !allowUnsafeHost) {
    throw new Error("unsafe host 0.0.0.0 is not allowed for localhost read-only API");
  }
}

function toFilters(searchParams) {
  const filters = {};
  for (const key of ["run_id", "event_type", "risk_level"]) {
    const value = searchParams.get(key);
    if (typeof value === "string" && value.length > 0) {
      filters[key] = value;
    }
  }
  return filters;
}

function buildProjection(options, searchParams) {
  const projectionOptions = {
    schemaFile: options.schemaFile,
    filters: toFilters(searchParams),
  };

  if (Array.isArray(options.events)) projectionOptions.events = options.events;
  else if (typeof options.bufferFile === "string") projectionOptions.bufferFile = options.bufferFile;
  else if (typeof options.bundleDir === "string") projectionOptions.bundleDir = options.bundleDir;

  return buildReadOnlyEventProjection(projectionOptions);
}

export function createReadOnlyApiServer(options = {}) {
  const host = options.host ?? "127.0.0.1";
  const port = Number.isInteger(options.port) ? options.port : 0;
  const allowUnsafeHost = options.allowUnsafeHost === true;

  assertLocalhostConfig(host, allowUnsafeHost);

  const serviceName = options.serviceName ?? DEFAULT_SERVICE_NAME;
  const packageName = options.packageName ?? "caesar-ai-agent-ledger";
  const packageVersion = options.packageVersion ?? "0.0.0";

  const hasEvents = Array.isArray(options.events);
  const hasBufferFile = typeof options.bufferFile === "string";
  const hasBundleDir = typeof options.bundleDir === "string";
  const sourceCount = [hasEvents, hasBufferFile, hasBundleDir].filter(Boolean).length;
  if (sourceCount !== 1) {
    throw new Error("createReadOnlyApiServer requires exactly one source: events OR bufferFile OR bundleDir");
  }

  const server = http.createServer((req, res) => {
    try {
      if (req.method !== "GET") {
        return errorJson(res, 405, "method not allowed", "method_not_allowed");
      }

      const target = new URL(req.url ?? "/", `http://${host}`);
      const projection = buildProjection(options, target.searchParams);

      if (target.pathname === "/healthz") {
        return json(res, 200, { ok: true, service: serviceName, local_only: true });
      }
      if (target.pathname === "/version") {
        return json(res, 200, {
          ok: true,
          package_name: packageName,
          package_version: packageVersion,
          api_mode: "read_only_localhost",
        });
      }
      if (target.pathname === "/projection") {
        return json(res, 200, { ok: true, data: projection });
      }
      if (target.pathname === "/runs") {
        return json(res, 200, { ok: true, count: projection.runs.length, data: projection.runs });
      }
      if (target.pathname.startsWith("/runs/")) {
        const runId = decodeURIComponent(target.pathname.slice("/runs/".length));
        const run = projection.runs.find((item) => item.run_id === runId);
        if (!run) return errorJson(res, 404, "run not found", "not_found");
        return json(res, 200, { ok: true, data: run });
      }
      if (target.pathname === "/events") {
        return json(res, 200, { ok: true, count: projection.events.length, data: projection.events });
      }
      if (target.pathname === "/approvals") {
        return json(res, 200, { ok: true, count: projection.approvals.length, data: projection.approvals });
      }
      if (target.pathname === "/tool-calls") {
        return json(res, 200, { ok: true, count: projection.tool_calls.length, data: projection.tool_calls });
      }
      if (target.pathname === "/risks") {
        return json(res, 200, { ok: true, count: projection.risks.length, data: projection.risks });
      }
      if (target.pathname === "/errors") {
        return json(res, 200, { ok: true, count: projection.errors.length, data: projection.errors });
      }

      return errorJson(res, 404, "route not found", "not_found");
    } catch (error) {
      return errorJson(res, 500, error.message, "internal_error");
    }
  });

  return {
    server,
    host,
    port,
    async start() {
      await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen({ host, port }, () => {
          server.off("error", reject);
          resolve();
        });
      });

      const address = server.address();
      return {
        host,
        port: typeof address === "object" && address ? address.port : port,
      };
    },
    async stop() {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    },
  };
}

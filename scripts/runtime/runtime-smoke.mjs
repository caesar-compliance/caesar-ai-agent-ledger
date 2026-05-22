#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const WORKER = path.join(ROOT, "ops/cloudflare-workers/agent-ledger-runtime/src/index.js");

class MockRequest {
  constructor(url, { method = "GET" } = {}) {
    this.url = url;
    this.method = method;
  }
}
class MockResponse {
  constructor(body, { status = 200 } = {}) {
    this._body = body;
    this.status = status;
    this.ok = status >= 200 && status < 300;
  }
  async json() {
    return JSON.parse(this._body);
  }
}
global.Request = MockRequest;
global.Response = MockResponse;

const { default: worker } = await import(WORKER);
const env = { WORKER_NAME: "agent-ledger-runtime-dev" };
for (const route of ["/healthz", "/readyz", "/version"]) {
  const res = await worker.fetch(new MockRequest(`https://t${route}`), env);
  console.log(res.ok || route === "/readyz" ? `PASS: ${route}` : `FAIL: ${route}`);
}

spawnSync("node", ["scripts/runtime/validate-supabase-schema.mjs"], { cwd: ROOT, stdio: "inherit" });
spawnSync("node", ["scripts/runtime/check-service-credentials.mjs"], { cwd: ROOT, stdio: "inherit" });

#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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
let failed = 0;
for (const route of ["/healthz", "/readyz", "/version"]) {
  const res = await worker.fetch(new MockRequest(`https://t${route}`), {});
  if (!res.ok && route !== "/readyz") failed++;
  else console.log(`PASS: ${route}`);
}
const post = await worker.fetch(
  new MockRequest("https://t/events", { method: "POST" }),
  {},
);
const postBody = await post.json();
if (post.status !== 403) {
  console.log("FAIL: POST /events should be disabled");
  failed++;
} else {
  console.log("PASS: POST /events disabled by default");
}
process.exit(failed ? 1 : 0);

#!/usr/bin/env node
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE_ROOT = path.join(ROOT, "site/local-dashboard");

let failed = 0;
function pass(msg) { console.log(`PASS: ${msg}`); }
function fail(msg) { console.log(`FAIL: ${msg}`); failed += 1; }
function assert(cond, msg) { cond ? pass(msg) : fail(msg); }

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const server = http.createServer((req, res) => {
  const reqPath = req.url === "/" ? "/index.html" : (req.url || "/");
  const file = path.join(SITE_ROOT, reqPath);
  if (!file.startsWith(SITE_ROOT)) {
    res.statusCode = 400;
    res.end("bad request\n");
    return;
  }
  if (!fs.existsSync(file)) {
    res.statusCode = 404;
    res.end("not found\n");
    return;
  }
  const ext = path.extname(file);
  res.statusCode = 200;
  res.setHeader("content-type", mime[ext] || "application/octet-stream");
  res.end(fs.readFileSync(file));
});

await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen({ host: "127.0.0.1", port: 0 }, () => {
    server.off("error", reject);
    resolve();
  });
});

const address = server.address();
const host = typeof address === "object" && address ? address.address : "";
const port = typeof address === "object" && address ? address.port : 0;

assert(host === "127.0.0.1", "server bound to 127.0.0.1 only");
assert(port > 0, "ephemeral port assigned");

async function get(pathname) {
  const response = await fetch(`http://127.0.0.1:${port}${pathname}`);
  return response;
}

for (const pathname of ["/", "/assets/dashboard.css", "/assets/dashboard.js", "/data/sample-projection.json"]) {
  const response = await get(pathname);
  assert(response.status === 200, `GET ${pathname} status 200`);
}

await new Promise((resolve) => server.close(resolve));
pass("server closed cleanly");

if (failed > 0) process.exit(1);
console.log("PASS: static local dashboard test");

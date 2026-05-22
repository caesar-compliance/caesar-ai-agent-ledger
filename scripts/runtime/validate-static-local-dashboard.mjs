#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE_ROOT = path.join(ROOT, "site/local-dashboard");

const FILES = {
  html: path.join(SITE_ROOT, "index.html"),
  js: path.join(SITE_ROOT, "assets/dashboard.js"),
  json: path.join(SITE_ROOT, "data/sample-projection.json"),
  css: path.join(SITE_ROOT, "assets/dashboard.css"),
};

let failed = 0;
function pass(msg) { console.log(`PASS: ${msg}`); }
function fail(msg) { console.log(`FAIL: ${msg}`); failed += 1; }
function assert(cond, msg) { cond ? pass(msg) : fail(msg); }

for (const [label, file] of Object.entries(FILES)) {
  assert(fs.existsSync(file), `${label} exists`);
}

const html = fs.readFileSync(FILES.html, "utf8");
const js = fs.readFileSync(FILES.js, "utf8");
const css = fs.readFileSync(FILES.css, "utf8");
const sampleRaw = fs.readFileSync(FILES.json, "utf8");
let sample = {};

try {
  sample = JSON.parse(sampleRaw);
  pass("sample-projection.json parses");
} catch (error) {
  fail(`sample-projection.json parse failed: ${error.message}`);
}

const joined = `${html}\n${js}\n${css}\n${sampleRaw}`.toLowerCase();
assert(!joined.includes("http://"), "no http:// references in dashboard files");
assert(!joined.includes("https://"), "no https:// references in dashboard files");
assert(!joined.includes("cdn"), "no CDN references in dashboard files");
assert(!joined.includes("googletagmanager"), "no analytics snippets");
assert(!joined.includes("google-analytics"), "no analytics libraries");
assert(!joined.includes("gtag("), "no gtag usage");
assert(!joined.includes("font.googleapis.com"), "no external font imports");
assert(!joined.includes("fonts.gstatic.com"), "no external font static host");

const summary = sample.summary || {};
assert(summary.total_events === 2, "summary total_events = 2");
assert(summary.total_runs === 1, "summary total_runs = 1");
assert(summary.total_approvals === 1, "summary total_approvals = 1");
assert(summary.total_tool_calls === 1, "summary total_tool_calls = 1");
assert(summary.total_errors === 0, "summary total_errors = 0");

const forbiddenWords = ["secret", "password", "token", "api_key", "private_key"];
function checkNoForbiddenOutsideSafety(text, label) {
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const lower = lines[i].toLowerCase();
    for (const word of forbiddenWords) {
      if (lower.includes(word)) {
        const isSafetyContext = lower.includes("no secrets") || lower.includes("secret") && lower.includes("forbidden") || lower.includes("redaction") || lower.includes("safety");
        if (!isSafetyContext) {
          fail(`${label} contains forbidden word '${word}' at line ${i + 1}`);
          return;
        }
      }
    }
  }
  pass(`${label} forbidden-word scan passed`);
}

checkNoForbiddenOutsideSafety(html, "index.html");
checkNoForbiddenOutsideSafety(js, "dashboard.js");
checkNoForbiddenOutsideSafety(css, "dashboard.css");

const payloadText = JSON.stringify(sample.events || []).toLowerCase();
for (const word of forbiddenWords) {
  assert(!payloadText.includes(word), `sample events payload has no '${word}'`);
}

if (failed > 0) process.exit(1);
console.log("PASS: static local dashboard validation");

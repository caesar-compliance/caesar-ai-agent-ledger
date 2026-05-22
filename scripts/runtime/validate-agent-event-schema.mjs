#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  readJsonFile,
  validateEventAgainstSchema,
} from "../../src/event-buffer/agent-event-validator.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SCHEMA_FILE = path.join(ROOT, "schemas/agent-ledger-event.schema.json");
const FIXTURES = [
  { name: "valid-tool-call-requested", file: "fixtures/events/valid-tool-call-requested.json", expected: "pass" },
  { name: "valid-approval-granted", file: "fixtures/events/valid-approval-granted.json", expected: "pass" },
  { name: "invalid-raw-secret", file: "fixtures/events/invalid-raw-secret.json", expected: "fail" },
];

let failed = 0;

function pass(message) {
  console.log(`PASS: ${message}`);
}

function fail(message) {
  console.log(`FAIL: ${message}`);
  failed += 1;
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateSchemaDocument(schema) {
  if (!isObject(schema)) throw new Error("schema root must be an object");
  if (schema.$schema !== "https://json-schema.org/draft/2020-12/schema") {
    throw new Error("schema must declare draft 2020-12");
  }
  if (schema.type !== "object") throw new Error("schema root type must be object");
  if (!Array.isArray(schema.required)) throw new Error("schema required must be an array");
}

function main() {
  let schema;
  try {
    schema = readJsonFile(SCHEMA_FILE);
    validateSchemaDocument(schema);
    pass("schema parseable JSON");
  } catch (err) {
    fail(err.message);
    process.exit(1);
  }

  for (const fixture of FIXTURES) {
    try {
      const value = readJsonFile(path.join(ROOT, fixture.file));
      const validation = validateEventAgainstSchema(value, schema);

      if (fixture.expected === "pass") {
        if (!validation.valid) {
          for (const issue of validation.errors) {
            fail(`${fixture.name}: ${issue}`);
          }
        } else {
          pass(`${fixture.name} validated`);
        }
        continue;
      }

      if (validation.forbidden_issues.length === 0) {
        fail(`${fixture.name}: expected forbidden raw payload failure`);
        continue;
      }
      pass(`${fixture.name} rejected for forbidden raw content`);
    } catch (err) {
      if (fixture.expected === "pass") {
        fail(`${fixture.name}: ${err.message}`);
      } else {
        pass(`${fixture.name} rejected: ${err.message}`);
      }
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

main();

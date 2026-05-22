#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SCHEMA_FILE = path.join(ROOT, "schemas/agent-ledger-event.schema.json");
const FIXTURES = [
  { name: "valid-tool-call-requested", file: "fixtures/events/valid-tool-call-requested.json", expected: "pass" },
  { name: "valid-approval-granted", file: "fixtures/events/valid-approval-granted.json", expected: "pass" },
  { name: "invalid-raw-secret", file: "fixtures/events/invalid-raw-secret.json", expected: "fail" },
];
const FORBIDDEN_TOKENS = ["secret", "password", "token", "api_key", "private_key"];

let failed = 0;

function pass(message) {
  console.log(`PASS: ${message}`);
}

function fail(message) {
  console.log(`FAIL: ${message}`);
  failed += 1;
}

function readJson(file) {
  const raw = fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`${path.relative(ROOT, file)} is not valid JSON: ${err.message}`);
  }
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

function matchesType(expected, value) {
  const list = Array.isArray(expected) ? expected : [expected];
  return list.some((type) => {
    if (type === "object") return isObject(value);
    if (type === "array") return Array.isArray(value);
    if (type === "string") return typeof value === "string";
    if (type === "boolean") return typeof value === "boolean";
    if (type === "integer") return Number.isInteger(value);
    if (type === "number") return typeof value === "number" && Number.isFinite(value);
    if (type === "null") return value === null;
    return false;
  });
}

function validateNode(schema, value, location, errors) {
  if (schema.const !== undefined && value !== schema.const) {
    errors.push(`${location} must equal ${JSON.stringify(schema.const)}`);
    return;
  }
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${location} must be one of ${schema.enum.join(", ")}`);
    return;
  }
  if (schema.type && !matchesType(schema.type, value)) {
    errors.push(
      `${location} must be of type ${
        Array.isArray(schema.type) ? schema.type.join(" | ") : schema.type
      }`,
    );
    return;
  }
  if (schema.format === "date-time" && Number.isNaN(Date.parse(value))) {
    errors.push(`${location} must be a valid date-time`);
  }
  if (typeof schema.minLength === "number" && value.length < schema.minLength) {
    errors.push(`${location} must be at least ${schema.minLength} characters`);
  }
  if (typeof schema.minimum === "number" && value < schema.minimum) {
    errors.push(`${location} must be >= ${schema.minimum}`);
  }

  if (isObject(value)) {
    if (Array.isArray(schema.required)) {
      for (const key of schema.required) {
        if (!(key in value)) errors.push(`${location}.${key} is required`);
      }
    }
    const properties = schema.properties ?? {};
    for (const [key, child] of Object.entries(properties)) {
      if (key in value) validateNode(child, value[key], `${location}.${key}`, errors);
    }
    const extras = Object.keys(value).filter((key) => !(key in properties));
    if (schema.additionalProperties === false) {
      for (const key of extras) errors.push(`${location}.${key} is not allowed`);
    } else if (schema.additionalProperties && schema.additionalProperties !== true) {
      for (const key of extras) {
        validateNode(schema.additionalProperties, value[key], `${location}.${key}`, errors);
      }
    }
  }

  if (Array.isArray(value) && schema.items) {
    value.forEach((item, index) => validateNode(schema.items, item, `${location}[${index}]`, errors));
  }
}

function scanForbidden(value, location, issues) {
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    for (const token of FORBIDDEN_TOKENS) {
      if (lower.includes(token)) {
        issues.push(`${location} contains forbidden raw content token "${token}"`);
        break;
      }
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForbidden(item, `${location}[${index}]`, issues));
    return;
  }
  if (isObject(value)) {
    for (const [key, child] of Object.entries(value)) {
      const lowerKey = key.toLowerCase();
      for (const token of FORBIDDEN_TOKENS) {
        if (lowerKey === token) {
          issues.push(`${location}.${key} is a forbidden raw key`);
          break;
        }
      }
      scanForbidden(child, `${location}.${key}`, issues);
    }
  }
}

function main() {
  let schema;
  try {
    schema = readJson(SCHEMA_FILE);
    validateSchemaDocument(schema);
    pass("schema parseable JSON");
  } catch (err) {
    fail(err.message);
    process.exit(1);
  }

  for (const fixture of FIXTURES) {
    try {
      const value = readJson(path.join(ROOT, fixture.file));
      const structureErrors = [];
      const forbiddenIssues = [];
      validateNode(schema, value, "$", structureErrors);
      scanForbidden(value, "$", forbiddenIssues);

      if (fixture.expected === "pass") {
        if (structureErrors.length || forbiddenIssues.length) {
          for (const issue of [...structureErrors, ...forbiddenIssues]) {
            fail(`${fixture.name}: ${issue}`);
          }
        } else {
          pass(`${fixture.name} validated`);
        }
        continue;
      }

      if (forbiddenIssues.length === 0) {
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

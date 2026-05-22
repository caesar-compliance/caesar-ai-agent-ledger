import fs from "node:fs";

export const FORBIDDEN_TOKENS = [
  "secret",
  "password",
  "token",
  "api_key",
  "private_key",
];

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeForScan(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function readJsonFile(file) {
  const raw = fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`${file} is not valid JSON: ${err.message}`);
  }
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

export function validateSchemaNode(schema, value, location, errors) {
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
  if (schema.format === "date-time") {
    if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
      errors.push(`${location} must be a valid date-time`);
    }
  }
  if (typeof schema.minLength === "number" && typeof value === "string" && value.length < schema.minLength) {
    errors.push(`${location} must be at least ${schema.minLength} characters`);
  }
  if (typeof schema.minimum === "number" && typeof value === "number" && value < schema.minimum) {
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
      if (key in value) validateSchemaNode(child, value[key], `${location}.${key}`, errors);
    }

    const extras = Object.keys(value).filter((key) => !(key in properties));
    if (schema.additionalProperties === false) {
      for (const key of extras) errors.push(`${location}.${key} is not allowed`);
    } else if (schema.additionalProperties && schema.additionalProperties !== true) {
      for (const key of extras) {
        validateSchemaNode(schema.additionalProperties, value[key], `${location}.${key}`, errors);
      }
    }
  }

  if (Array.isArray(value) && schema.items) {
    value.forEach((item, index) => validateSchemaNode(schema.items, item, `${location}[${index}]`, errors));
  }
}

export function scanForForbiddenContent(value, location = "$", issues = []) {
  if (typeof value === "string") {
    const normalized = normalizeForScan(value);
    for (const token of FORBIDDEN_TOKENS) {
      const normalizedToken = normalizeForScan(token);
      if (normalized.includes(normalizedToken)) {
        issues.push(`${location} contains forbidden raw content token "${token}"`);
        break;
      }
    }
    return issues;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForForbiddenContent(item, `${location}[${index}]`, issues));
    return issues;
  }

  if (isObject(value)) {
    for (const [key, child] of Object.entries(value)) {
      const normalizedKey = normalizeForScan(key);
      for (const token of FORBIDDEN_TOKENS) {
        const normalizedToken = normalizeForScan(token);
        if (normalizedKey === normalizedToken) {
          issues.push(`${location}.${key} is a forbidden raw key`);
          break;
        }
      }
      scanForForbiddenContent(child, `${location}.${key}`, issues);
    }
  }

  return issues;
}

export function validateEventAgainstSchema(event, schema) {
  const schemaErrors = [];
  const forbiddenIssues = [];

  validateSchemaNode(schema, event, "$", schemaErrors);
  scanForForbiddenContent(event, "$", forbiddenIssues);

  return {
    valid: schemaErrors.length === 0 && forbiddenIssues.length === 0,
    schema_errors: schemaErrors,
    forbidden_issues: forbiddenIssues,
    errors: [...schemaErrors, ...forbiddenIssues],
  };
}

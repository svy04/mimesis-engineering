#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function readJson(relativePath) {
  const content = read(relativePath);
  if (!content) {
    return {};
  }
  try {
    return JSON.parse(content);
  } catch (error) {
    failures.push(`${relativePath} is not valid JSON: ${error.message}`);
    return {};
  }
}

function actualType(value) {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return "array";
  }
  return typeof value;
}

function allowsType(schema, typeName) {
  return Array.isArray(schema.type) ? schema.type.includes(typeName) : schema.type === typeName;
}

function validateAgainstSchema(value, schema, location) {
  if (!schema || typeof schema !== "object") {
    failures.push(`${location} schema is not an object`);
    return;
  }

  if (schema.const !== undefined && value !== schema.const) {
    failures.push(`${location} must equal ${JSON.stringify(schema.const)}`);
    return;
  }

  if (schema.enum && !schema.enum.includes(value)) {
    failures.push(`${location} must be one of ${schema.enum.join(", ")}`);
    return;
  }

  if (schema.type) {
    const typeName = actualType(value);
    if (!allowsType(schema, typeName)) {
      failures.push(`${location} must be ${JSON.stringify(schema.type)}, got ${typeName}`);
      return;
    }
  }

  if (allowsType(schema, "object") && value && typeof value === "object" && !Array.isArray(value)) {
    for (const key of schema.required ?? []) {
      if (!(key in value)) {
        failures.push(`${location} missing required property: ${key}`);
      }
    }

    const properties = schema.properties ?? {};
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in properties)) {
          failures.push(`${location} has unexpected property: ${key}`);
        }
      }
    }

    for (const [key, propertySchema] of Object.entries(properties)) {
      if (key in value) {
        validateAgainstSchema(value[key], propertySchema, `${location}.${key}`);
      }
    }
  }

  if (allowsType(schema, "array") && Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      failures.push(`${location} must include at least ${schema.minItems} items`);
    }
    if (schema.items) {
      value.forEach((item, index) => validateAgainstSchema(item, schema.items, `${location}[${index}]`));
    }
  }

  if (schema.minLength !== undefined && typeof value === "string" && value.length < schema.minLength) {
    failures.push(`${location} must include at least ${schema.minLength} characters`);
  }
}

const packageJson = readJson("package.json");
const schema = readJson("spec/proof-intake.schema.json");
const record = readJson(".mimesis/proof-intake/fixture-record.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/PROOF-INTAKE-RECORD.md");
const schemaDoc = read("docs/PROOF-INTAKE-SCHEMA.md");
const toolsReadme = read("tools/README.md");
const completionAudit = read("docs/COMPLETION-AUDIT.md");

for (const relativePath of [
  "tools/create-proof-intake-record.mjs",
  "tools/audit-proof-intake-record.mjs",
  "docs/PROOF-INTAKE-RECORD.md",
  ".mimesis/proof-intake/fixture-record.json",
]) {
  read(relativePath);
}

for (const scriptName of ["proof:intake-record", "audit:proof-intake-record"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

const releaseCheck = packageJson.scripts?.["release:check"] ?? "";
for (const command of ["proof:intake-record", "audit:proof-intake-record"]) {
  if (!releaseCheck.includes(command)) {
    failures.push(`release:check must include npm run ${command}`);
  }
}

for (const command of ["proof:intake-record", "audit:proof-intake-record"]) {
  if (!cli.includes(`"${command}"`)) {
    failures.push(`CLI missing ${command} command`);
  }
}

const combinedDocs = `${doc}\n${schemaDoc}\n${toolsReadme}\n${completionAudit}`.toLowerCase();
for (const text of [
  "proof intake record",
  "fixture-record.json",
  "schema-shaped",
  "does not create external proof",
  "not a real submitter artifact",
  "does not grant permission",
]) {
  if (!combinedDocs.includes(text.toLowerCase())) {
    failures.push(`proof intake record docs missing text: ${text}`);
  }
}

if (!failures.length) {
  const check = spawnSync(process.execPath, [path.join(root, "tools", "create-proof-intake-record.mjs"), "--check"], {
    cwd: root,
    encoding: "utf8",
  });
  if (check.status !== 0) {
    failures.push(`proof intake record check failed:\n${check.stdout}\n${check.stderr}`.trim());
  }
}

if (!failures.length) {
  validateAgainstSchema(record, schema, "proofIntakeRecord");
}

for (const [key, value] of [
  ["schemaVersion", "0.1.0"],
  ["status", "reviewed"],
  ["publicationPreference", "public"],
]) {
  if (record[key] !== value) {
    failures.push(`fixture record ${key} must be ${value}`);
  }
}

if (!record.submitter?.includes("fixture")) {
  failures.push("fixture record must identify itself as fixture-derived");
}

if (!record.safetyConfirmation?.noSecrets || !record.safetyConfirmation?.noPrivateCustomerData || !record.safetyConfirmation?.noCopiedProtectedMaterial) {
  failures.push("fixture record safety confirmations must all be true");
}

for (const claim of ["external adoption", "benchmarked productivity", "customer outcomes", "legal originality"]) {
  if (!record.prohibitedClaims?.some((item) => item.toLowerCase().includes(claim))) {
    failures.push(`fixture record prohibitedClaims missing ${claim}`);
  }
}

if (failures.length) {
  console.error("\nMimesis proof intake record audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis proof intake record audit passed: markdown intake fixture becomes a schema-shaped local record.");

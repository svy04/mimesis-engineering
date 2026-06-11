#!/usr/bin/env node

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

function allowsType(schema, typeName) {
  return Array.isArray(schema.type) ? schema.type.includes(typeName) : schema.type === typeName;
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
    const required = schema.required ?? [];
    for (const key of required) {
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
}

const packageJson = readJson("package.json");
const manifest = readJson(".mimesis/framework-manifest.json");
const schema = readJson("spec/framework-manifest.schema.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/FRAMEWORK-MANIFEST-SCHEMA.md");
const manifestDoc = read("docs/FRAMEWORK-MANIFEST.md");
const toolsReadme = read("tools/README.md");
const completionAudit = read("docs/COMPLETION-AUDIT.md");

for (const relativePath of [
  "spec/framework-manifest.schema.json",
  "docs/FRAMEWORK-MANIFEST-SCHEMA.md",
  "tools/audit-framework-manifest-schema.mjs",
  ".mimesis/framework-manifest.json",
]) {
  read(relativePath);
}

if (!packageJson.scripts?.["audit:framework-manifest-schema"]) {
  failures.push("package.json missing script: audit:framework-manifest-schema");
}

const releaseCheck = packageJson.scripts?.["release:check"] ?? "";
if (!releaseCheck.includes("audit:framework-manifest-schema")) {
  failures.push("release:check must include npm run audit:framework-manifest-schema");
}

if (!cli.includes('"audit:framework-manifest-schema"')) {
  failures.push("CLI missing audit:framework-manifest-schema command");
}

const combinedDocs = `${doc}\n${manifestDoc}\n${toolsReadme}\n${completionAudit}`.toLowerCase();
for (const text of [
  "framework manifest schema",
  "json schema",
  "ai-native",
  "does not prove external adoption",
  "does not prove package publication",
]) {
  if (!combinedDocs.includes(text.toLowerCase())) {
    failures.push(`framework manifest schema docs missing text: ${text}`);
  }
}

if (schema.$schema !== "https://json-schema.org/draft/2020-12/schema") {
  failures.push("schema must declare JSON Schema draft 2020-12");
}

if (schema.title !== "Mimesis Framework Manifest") {
  failures.push("schema title must be Mimesis Framework Manifest");
}

if (schema.type !== "object" || schema.additionalProperties !== false) {
  failures.push("schema root must be a closed object");
}

for (const key of [
  "name",
  "version",
  "status",
  "purpose",
  "corePhrases",
  "loop",
  "aiNativeShape",
  "entrypoints",
  "commands",
  "artifacts",
  "gates",
  "boundaries",
  "generatedFrom",
]) {
  if (!schema.required?.includes(key)) {
    failures.push(`schema missing required top-level key: ${key}`);
  }
}

if (!schema.properties?.name?.const || schema.properties.name.const !== "mimesis-engineering") {
  failures.push("schema must pin manifest name to mimesis-engineering");
}

if (!schema.properties?.status?.enum?.includes("public-working-framework-v0.1")) {
  failures.push("schema must allow public-working-framework-v0.1 status");
}

if (!failures.length) {
  validateAgainstSchema(manifest, schema, "manifest");
}

if (failures.length) {
  console.error("\nMimesis framework manifest schema audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis framework manifest schema audit passed: manifest contract is schema-described and locally checked.");

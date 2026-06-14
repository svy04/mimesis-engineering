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

const packageJson = readJson("package.json");
const schema = readJson("spec/proof-intake.schema.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/PROOF-INTAKE-SCHEMA.md");
const proofIntakeDoc = read("docs/PROOF-INTAKE-KIT.md");
const permissionedPacket = read("docs/PERMISSIONED-CASE-PACKET.md");
const toolsReadme = read("tools/README.md");
const completionAudit = read("docs/COMPLETION-AUDIT.md");

for (const relativePath of [
  "spec/proof-intake.schema.json",
  "docs/PROOF-INTAKE-SCHEMA.md",
  "tools/audit-proof-intake-schema.mjs",
]) {
  read(relativePath);
}

if (!packageJson.scripts?.["audit:proof-intake-schema"]) {
  failures.push("package.json missing script: audit:proof-intake-schema");
}

const releaseCheck = packageJson.scripts?.["release:check"] ?? "";
if (!releaseCheck.includes("audit:proof-intake-schema")) {
  failures.push("release:check must include npm run audit:proof-intake-schema");
}

if (!cli.includes('"audit:proof-intake-schema"')) {
  failures.push("CLI missing audit:proof-intake-schema command");
}

const combinedDocs = `${doc}\n${proofIntakeDoc}\n${permissionedPacket}\n${toolsReadme}\n${completionAudit}`.toLowerCase();
for (const text of [
  "proof intake schema",
  "json schema",
  "permissioned external weak artifact",
  "does not create external proof",
  "does not grant permission",
  "does not prove external adoption",
]) {
  if (!combinedDocs.includes(text.toLowerCase())) {
    failures.push(`proof intake schema docs missing text: ${text}`);
  }
}

if (schema.$schema !== "https://json-schema.org/draft/2020-12/schema") {
  failures.push("schema must declare JSON Schema draft 2020-12");
}

if (schema.title !== "Mimesis Proof Intake Record") {
  failures.push("schema title must be Mimesis Proof Intake Record");
}

if (schema.type !== "object" || schema.additionalProperties !== false) {
  failures.push("schema root must be a closed object");
}

for (const key of [
  "schemaVersion",
  "status",
  "submitter",
  "startingArtifact",
  "artifactOwner",
  "permissionStatus",
  "publicationPreference",
  "redactionRequirements",
  "referencesStudied",
  "desiredTransformation",
  "proofBoundary",
  "safetyConfirmation",
  "prohibitedClaims",
]) {
  if (!schema.required?.includes(key)) {
    failures.push(`schema missing required top-level key: ${key}`);
  }
}

if (schema.properties?.schemaVersion?.const !== "0.1.0") {
  failures.push("schema must pin schemaVersion to 0.1.0");
}

const publicationEnum = schema.properties?.publicationPreference?.enum ?? [];
for (const value of ["public", "anonymized", "redacted", "private only"]) {
  if (!publicationEnum.includes(value)) {
    failures.push(`publicationPreference enum missing value: ${value}`);
  }
}

const safetyProperties = schema.properties?.safetyConfirmation?.properties ?? {};
for (const key of ["noSecrets", "noPrivateCustomerData", "noCopiedProtectedMaterial"]) {
  if (safetyProperties[key]?.const !== true) {
    failures.push(`safetyConfirmation.${key} must be required true`);
  }
}

for (const arrayKey of ["referencesStudied", "proofBoundary", "prohibitedClaims"]) {
  if (schema.properties?.[arrayKey]?.type !== "array" || schema.properties?.[arrayKey]?.minItems < 1) {
    failures.push(`${arrayKey} must be a non-empty array`);
  }
}

if (failures.length) {
  console.error("\nMimesis proof intake schema audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis proof intake schema audit passed: proof intake contract is schema-described and bounded.");

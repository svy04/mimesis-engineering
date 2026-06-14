#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
let schemaRoot = null;

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

  if (schema.$ref) {
    const refName = schema.$ref.match(/^#\/\$defs\/(.+)$/)?.[1];
    const target = refName ? schemaRoot?.$defs?.[refName] : null;
    if (!target) {
      failures.push(`${location} has unresolved schema ref: ${schema.$ref}`);
      return;
    }
    validateAgainstSchema(value, target, location);
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

function commandList(packageJson) {
  return (packageJson.scripts?.["release:check"] ?? "")
    .split("&&")
    .map((part) => part.trim())
    .map((part) => part.replace(/^npm\s+run\s+/, "").trim())
    .filter(Boolean);
}

function requireBefore(commands, earlier, later) {
  const earlierIndex = commands.indexOf(earlier);
  const laterIndex = commands.indexOf(later);
  if (earlierIndex < 0 || laterIndex < 0) {
    return;
  }
  if (earlierIndex >= laterIndex) {
    failures.push(`release:check must run npm run ${earlier} before npm run ${later}`);
  }
}

const requiredFields = [
  "license_or_no_reuse",
  "weak_artifact_permission",
  "publication_scope",
  "package_action_plugin_scope",
  "benchmark_adoption_scope",
  "strict_sync_intent",
];

const requiredGateIds = [
  "owner_license_decision",
  "permissioned_external_artifact",
  "completed_external_case",
  "strict_publish_sync",
  "package_publication",
  "action_publication",
  "shipped_plugin",
  "benchmark_study",
  "external_adoption",
];

const packageJson = readJson("package.json");
const schema = readJson("spec/owner-decision-answer.schema.json");
schemaRoot = schema;
const record = readJson(".mimesis/owner-actions/fixture-answer-record.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/OWNER-DECISION-ANSWER-RECORD.md");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const validator = read("tools/validate-mimesis.mjs");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");
const releaseCommands = commandList(packageJson);

for (const scriptName of ["owner:decision-answer-record", "audit:owner-decision-answer-record"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!cli.includes('"owner:decision-answer-record"') || !cli.includes('"audit:owner-decision-answer-record"')) {
  failures.push("CLI missing owner:decision-answer-record or audit:owner-decision-answer-record command");
}

for (const command of ["owner:decision-answer-record", "audit:owner-decision-answer-record"]) {
  if (!releaseCommands.includes(command)) {
    failures.push(`release:check missing npm run ${command}`);
  }
}

for (const [earlier, later] of [
  ["owner:decision-intake", "owner:decision-answer-record"],
  ["owner:decision-answer-record", "release:artifact-manifest"],
  ["owner:decision-answer-record", "audit:owner-decision-answer-record"],
  ["audit:owner-decision-intake", "audit:owner-decision-answer-record"],
  ["audit:owner-decision-answer-record", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

for (const text of [
  "owner decision answer record",
  "schema-shaped",
  "fixture-answer-record.json",
  "pending owner answers",
  "does not choose a license",
  "does not collect an artifact",
  "does not grant permission",
  "does not publish",
  "does not create external proof",
  "does not close gates",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/OWNER-DECISION-ANSWER-RECORD.md missing text: ${text}`);
  }
}

if (schema.title !== "Mimesis Owner Decision Answer Record") {
  failures.push("owner decision answer schema title must be Mimesis Owner Decision Answer Record");
}

if (record.schemaVersion !== "0.1.0") {
  failures.push("owner decision answer record schemaVersion must be 0.1.0");
}

if (record.status !== "pending_owner_answers") {
  failures.push("owner decision answer fixture status must be pending_owner_answers");
}

if (record.sourceIntake !== ".mimesis/owner-actions/decision-intake.md") {
  failures.push("owner decision answer fixture sourceIntake must point to decision-intake.md");
}

if (!failures.length) {
  validateAgainstSchema(record, schema, "ownerDecisionAnswerRecord");
}

for (const field of requiredFields) {
  const entry = record.fields?.[field];
  if (!entry) {
    failures.push(`owner decision answer fixture missing field: ${field}`);
    continue;
  }
  if (entry.answerStatus !== "pending") {
    failures.push(`owner decision answer fixture field ${field} must be pending`);
  }
  if (!entry.ownerAnswer?.toLowerCase().includes("pending owner answer")) {
    failures.push(`owner decision answer fixture field ${field} must preserve pending owner answer text`);
  }
  if (!entry.boundary) {
    failures.push(`owner decision answer fixture field ${field} missing boundary`);
  }
}

for (const gateId of requiredGateIds) {
  if (!record.requiredGateIds?.includes(gateId)) {
    failures.push(`owner decision answer fixture missing gate id: ${gateId}`);
  }
}

for (const claim of ["external proof", "adoption", "benchmarked productivity", "customer outcomes", "publication"]) {
  if (!record.prohibitedClaims?.some((item) => item.toLowerCase().includes(claim))) {
    failures.push(`owner decision answer fixture prohibitedClaims missing ${claim}`);
  }
}

for (const boundary of [
  "does_not_choose_license",
  "does_not_collect_artifact",
  "does_not_grant_permission",
  "does_not_publish",
  "does_not_create_external_proof",
  "does_not_close_gates",
]) {
  if (!record.boundaries?.includes(boundary)) {
    failures.push(`owner decision answer fixture missing boundary: ${boundary}`);
  }
}

if (!record.safetyConfirmation?.noRealOwnerDecision && !failures.length) {
  failures.push("owner decision answer fixture must confirm no real owner decision");
}

if (!failures.length) {
  const check = spawnSync(process.execPath, [path.join(root, "tools", "create-owner-decision-answer-record.mjs"), "--check"], {
    cwd: root,
    encoding: "utf8",
  });
  if (check.status !== 0) {
    failures.push(`owner decision answer record check failed:\n${check.stdout}\n${check.stderr}`.trim());
  }
}

for (const [name, content] of [
  ["README.md", readme],
  ["tools/README.md", toolsReadme],
  ["docs/COMPLETION-AUDIT.md", completion],
  ["STATUS.md", status],
  ["ROADMAP.md", roadmap],
  ["docs/V0.1-RELEASE-PACKET.md", releasePacket],
]) {
  if (!content.toLowerCase().includes("owner decision answer record")) {
    failures.push(`${name} missing owner decision answer record text`);
  }
}

for (const text of [
  "spec/owner-decision-answer.schema.json",
  "docs/OWNER-DECISION-ANSWER-RECORD.md",
  ".mimesis/owner-actions/fixture-answer-record.json",
  "tools/create-owner-decision-answer-record.mjs",
  "tools/audit-owner-decision-answer-record.mjs",
]) {
  if (!validator.includes(text)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${text}`);
  }
}

for (const command of ["owner:decision-answer-record", "audit:owner-decision-answer-record"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/owner-actions/fixture-answer-record.json")) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing owner decision answer record");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "spec/owner-decision-answer.schema.json",
  "docs/OWNER-DECISION-ANSWER-RECORD.md",
  ".mimesis/owner-actions/fixture-answer-record.json",
  "tools/create-owner-decision-answer-record.mjs",
  "tools/audit-owner-decision-answer-record.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis owner decision answer record audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner decision answer record audit passed: owner answers are schema-shaped without making decisions or closing gates.");

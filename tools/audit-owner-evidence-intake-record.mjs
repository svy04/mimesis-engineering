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
const schema = readJson("spec/owner-evidence-intake.schema.json");
schemaRoot = schema;
const record = readJson(".mimesis/owner-actions/fixture-evidence-record.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/OWNER-EVIDENCE-INTAKE-RECORD.md");
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

for (const scriptName of ["owner:evidence-intake-record", "audit:owner-evidence-intake-record"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!cli.includes('"owner:evidence-intake-record"') || !cli.includes('"audit:owner-evidence-intake-record"')) {
  failures.push("CLI missing owner:evidence-intake-record or audit:owner-evidence-intake-record command");
}

for (const command of ["owner:evidence-intake-record", "audit:owner-evidence-intake-record"]) {
  if (!releaseCommands.includes(command)) {
    failures.push(`release:check missing npm run ${command}`);
  }
}

for (const [earlier, later] of [
  ["owner:evidence-bundle", "owner:evidence-intake-record"],
  ["owner:evidence-intake-record", "release:artifact-manifest"],
  ["owner:evidence-intake-record", "audit:owner-evidence-intake-record"],
  ["audit:owner-evidence-bundle", "audit:owner-evidence-intake-record"],
  ["audit:owner-evidence-intake-record", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

for (const text of [
  "owner evidence intake record",
  "schema-shaped",
  "fixture-evidence-record.json",
  "pending owner evidence attachments",
  "does not attach evidence",
  "does not choose a license",
  "does not collect an artifact",
  "does not grant permission",
  "does not publish",
  "does not create external proof",
  "does not close gates",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/OWNER-EVIDENCE-INTAKE-RECORD.md missing text: ${text}`);
  }
}

if (schema.title !== "Mimesis Owner Evidence Intake Record") {
  failures.push("owner evidence intake schema title must be Mimesis Owner Evidence Intake Record");
}

if (record.schemaVersion !== "0.1.0") {
  failures.push("owner evidence intake record schemaVersion must be 0.1.0");
}

if (record.status !== "pending_owner_evidence_attachments") {
  failures.push("owner evidence intake fixture status must be pending_owner_evidence_attachments");
}

if (record.sourceBundle !== ".mimesis/owner-actions/evidence-bundle.md") {
  failures.push("owner evidence intake fixture sourceBundle must point to evidence-bundle.md");
}

if (!failures.length) {
  validateAgainstSchema(record, schema, "ownerEvidenceIntakeRecord");
}

for (const field of requiredFields) {
  const entry = record.fields?.[field];
  if (!entry) {
    failures.push(`owner evidence intake fixture missing field: ${field}`);
    continue;
  }
  if (entry.attachmentStatus !== "pending") {
    failures.push(`owner evidence intake fixture field ${field} must be pending`);
  }
  if (!entry.ownerEvidence?.toLowerCase().includes("pending owner evidence")) {
    failures.push(`owner evidence intake fixture field ${field} must preserve pending owner evidence text`);
  }
  if (!Array.isArray(entry.blockedGateIds) || entry.blockedGateIds.length < 1) {
    failures.push(`owner evidence intake fixture field ${field} missing blocked gate ids`);
  }
  if (!Array.isArray(entry.requiredAttachments) || entry.requiredAttachments.length < 1) {
    failures.push(`owner evidence intake fixture field ${field} missing required attachments`);
  }
  if (!Array.isArray(entry.requiredCommands) || entry.requiredCommands.length < 1) {
    failures.push(`owner evidence intake fixture field ${field} missing required commands`);
  }
  if (!entry.stopCondition) {
    failures.push(`owner evidence intake fixture field ${field} missing stop condition`);
  }
  if (!entry.boundary) {
    failures.push(`owner evidence intake fixture field ${field} missing boundary`);
  }
}

for (const gateId of requiredGateIds) {
  if (!record.requiredGateIds?.includes(gateId)) {
    failures.push(`owner evidence intake fixture missing gate id: ${gateId}`);
  }
}

for (const claim of ["external proof", "adoption", "benchmarked productivity", "customer outcomes", "publication", "evidence attached"]) {
  if (!record.prohibitedClaims?.some((item) => item.toLowerCase().includes(claim))) {
    failures.push(`owner evidence intake fixture prohibitedClaims missing ${claim}`);
  }
}

for (const boundary of [
  "does_not_attach_evidence",
  "does_not_choose_license",
  "does_not_collect_artifact",
  "does_not_grant_permission",
  "does_not_publish",
  "does_not_create_external_proof",
  "does_not_close_gates",
]) {
  if (!record.boundaries?.includes(boundary)) {
    failures.push(`owner evidence intake fixture missing boundary: ${boundary}`);
  }
}

if (!record.safetyConfirmation?.noEvidenceAttached && !failures.length) {
  failures.push("owner evidence intake fixture must confirm no evidence attached");
}

if (!failures.length) {
  const check = spawnSync(process.execPath, [path.join(root, "tools", "create-owner-evidence-intake-record.mjs"), "--check"], {
    cwd: root,
    encoding: "utf8",
  });
  if (check.status !== 0) {
    failures.push(`owner evidence intake record check failed:\n${check.stdout}\n${check.stderr}`.trim());
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
  if (!content.toLowerCase().includes("owner evidence intake record")) {
    failures.push(`${name} missing owner evidence intake record text`);
  }
}

for (const text of [
  "spec/owner-evidence-intake.schema.json",
  "docs/OWNER-EVIDENCE-INTAKE-RECORD.md",
  ".mimesis/owner-actions/fixture-evidence-record.json",
  "tools/create-owner-evidence-intake-record.mjs",
  "tools/audit-owner-evidence-intake-record.mjs",
]) {
  if (!validator.includes(text)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${text}`);
  }
}

for (const command of ["owner:evidence-intake-record", "audit:owner-evidence-intake-record"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/owner-actions/fixture-evidence-record.json")) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing owner evidence intake record");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "spec/owner-evidence-intake.schema.json",
  "docs/OWNER-EVIDENCE-INTAKE-RECORD.md",
  ".mimesis/owner-actions/fixture-evidence-record.json",
  "tools/create-owner-evidence-intake-record.mjs",
  "tools/audit-owner-evidence-intake-record.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis owner evidence intake record audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner evidence intake record audit passed: evidence attachments are schema-shaped without being attached.");

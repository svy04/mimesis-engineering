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

function releaseCommands(packageJson) {
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

function runNode(args) {
  return spawnSync(process.execPath, args, {
    cwd: root,
    encoding: "utf8",
  });
}

const packageJson = readJson("package.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/OWNER-PROOF-INPUT.md");
const schema = readJson("spec/owner-proof-input.schema.json");
const template = readJson(".mimesis/owner-actions/proof-input-template.json");
const checkReport = read(".mimesis/owner-actions/fixture-proof-input-check.md");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const releaseOrderDoc = read("docs/RELEASE-CHECK-ORDER.md");
const statusRoadmapDoc = read("docs/STATUS-ROADMAP-SYNC.md");
const validator = read("tools/validate-mimesis.mjs");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");
const commands = releaseCommands(packageJson);

for (const scriptName of [
  "owner:proof-input-template",
  "owner:proof-input-check",
  "audit:owner-proof-input",
]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const command of [
  "owner:proof-input-template",
  "owner:proof-input-check",
  "audit:owner-proof-input",
]) {
  if (!cli.includes(`"${command}"`)) {
    failures.push(`CLI missing ${command}`);
  }
  if (!commands.includes(command)) {
    failures.push(`release:check missing npm run ${command}`);
  }
}

for (const [earlier, later] of [
  ["owner:proof-handoff", "owner:proof-input-template"],
  ["owner:proof-input-template", "owner:proof-input-check"],
  ["owner:proof-input-check", "owner:evidence-submission-record"],
  ["owner:proof-input-check", "release:artifact-manifest"],
  ["audit:owner-proof-handoff", "audit:owner-proof-input"],
  ["audit:owner-proof-input", "audit:owner-evidence-submission-record"],
  ["audit:owner-proof-input", "audit:release-artifact-manifest"],
]) {
  requireBefore(commands, earlier, later);
}

if (schema.title !== "Mimesis Owner Proof Input Record") {
  failures.push("spec/owner-proof-input.schema.json title must describe owner proof input record");
}

for (const required of [
  "schemaVersion",
  "status",
  "sourceHandoff",
  "minimumInputs",
  "safetyConfirmation",
  "prohibitedClaims",
  "boundaries",
]) {
  if (!schema.required?.includes(required)) {
    failures.push(`owner proof input schema missing required property: ${required}`);
  }
}

if (template.schemaVersion !== "0.1.0") {
  failures.push("proof input template schemaVersion must be 0.1.0");
}

if (template.status !== "template_not_owner_submitted") {
  failures.push("proof input template status must be template_not_owner_submitted");
}

for (const field of ["license_or_no_reuse", "weak_artifact_permission"]) {
  if (!template.minimumInputs?.[field]) {
    failures.push(`proof input template missing minimum input: ${field}`);
  }
}

for (const [field, expectedStatus] of [
  ["license_or_no_reuse", "pending_owner"],
  ["weak_artifact_permission", "pending_owner"],
]) {
  if (template.minimumInputs?.[field]?.inputStatus !== expectedStatus) {
    failures.push(`proof input template ${field}.inputStatus must be ${expectedStatus}`);
  }
}

for (const [key, expected] of Object.entries({
  noOwnerDecisionMade: true,
  noArtifactSubmitted: true,
  noPermissionGranted: true,
  noPublication: true,
  noExternalProof: true,
  noProofApproval: true,
  noClosedGates: true,
})) {
  if (template.safetyConfirmation?.[key] !== expected) {
    failures.push(`proof input template safetyConfirmation.${key} must be true`);
  }
}

for (const boundary of [
  "does_not_choose_license",
  "does_not_submit_artifact",
  "does_not_grant_permission",
  "does_not_create_external_proof",
  "does_not_approve_proof",
  "does_not_publish",
  "does_not_close_gates",
]) {
  if (!template.boundaries?.includes(boundary)) {
    failures.push(`proof input template missing boundary: ${boundary}`);
  }
}

for (const text of [
  "Status: not ready owner proof input",
  "license_or_no_reuse",
  "weak_artifact_permission",
  "does not choose a license",
  "does not submit an artifact",
  "does not grant permission",
  "does not create external proof",
  "does not approve proof",
  "does not close gates",
]) {
  if (!checkReport.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`fixture proof input check missing text: ${text}`);
  }
}

for (const [name, content] of [
  ["docs/OWNER-PROOF-INPUT.md", doc],
  ["README.md", readme],
  ["tools/README.md", toolsReadme],
  ["docs/COMPLETION-AUDIT.md", completion],
  ["STATUS.md", status],
  ["ROADMAP.md", roadmap],
  ["docs/V0.1-RELEASE-PACKET.md", releasePacket],
  ["docs/RELEASE-CHECK-ORDER.md", releaseOrderDoc],
  ["docs/STATUS-ROADMAP-SYNC.md", statusRoadmapDoc],
]) {
  if (!content.toLowerCase().includes("owner proof input")) {
    failures.push(`${name} missing owner proof input text`);
  }
}

for (const relativePath of [
  "docs/OWNER-PROOF-INPUT.md",
  "spec/owner-proof-input.schema.json",
  ".mimesis/owner-actions/proof-input-template.json",
  ".mimesis/owner-actions/fixture-proof-input-check.md",
  "tools/create-owner-proof-input-template.mjs",
  "tools/check-owner-proof-input-record.mjs",
  "tools/audit-owner-proof-input.mjs",
]) {
  if (!validator.includes(relativePath)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${relativePath}`);
  }
}

for (const command of [
  "owner:proof-input-template",
  "owner:proof-input-check",
  "audit:owner-proof-input",
]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`framework manifest commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/owner-actions/proof-input-template.json")) {
  failures.push("framework manifest entrypoints missing owner proof input template");
}

const artifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/OWNER-PROOF-INPUT.md",
  "spec/owner-proof-input.schema.json",
  ".mimesis/owner-actions/proof-input-template.json",
  ".mimesis/owner-actions/fixture-proof-input-check.md",
  "tools/create-owner-proof-input-template.mjs",
  "tools/check-owner-proof-input-record.mjs",
  "tools/audit-owner-proof-input.mjs",
]) {
  if (!artifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

const readyCheck = runNode([
  "tools/check-owner-proof-input-record.mjs",
  ".mimesis/owner-actions/proof-input-template.json",
  "--require-ready",
]);
if (readyCheck.status === 0) {
  failures.push("owner proof input ready check must fail for template_not_owner_submitted fixture");
}
if (!`${readyCheck.stderr}\n${readyCheck.stdout}`.toLowerCase().includes("not ready")) {
  failures.push("owner proof input ready check failure must explain not ready status");
}

if (failures.length) {
  console.error("\nMimesis owner proof input audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner proof input audit passed: owner minimum inputs are schema-shaped without claiming decision or proof.");

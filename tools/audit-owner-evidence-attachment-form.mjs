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
const cli = read("bin/mimesis.mjs");
const doc = read("docs/OWNER-EVIDENCE-ATTACHMENT-FORM.md");
const form = read(".mimesis/owner-actions/evidence-attachment-form.md");
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

for (const scriptName of ["owner:evidence-attachment-form", "audit:owner-evidence-attachment-form"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!cli.includes('"owner:evidence-attachment-form"') || !cli.includes('"audit:owner-evidence-attachment-form"')) {
  failures.push("CLI missing owner:evidence-attachment-form or audit:owner-evidence-attachment-form command");
}

for (const command of ["owner:evidence-attachment-form", "audit:owner-evidence-attachment-form"]) {
  if (!releaseCommands.includes(command)) {
    failures.push(`release:check missing npm run ${command}`);
  }
}

for (const [earlier, later] of [
  ["owner:evidence-review", "owner:evidence-attachment-form"],
  ["owner:evidence-attachment-form", "release:artifact-manifest"],
  ["owner:evidence-attachment-form", "audit:owner-evidence-attachment-form"],
  ["audit:owner-evidence-review", "audit:owner-evidence-attachment-form"],
  ["audit:owner-evidence-attachment-form", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

for (const text of [
  "owner evidence attachment form",
  "owner-provided evidence only",
  "not evidence",
  "blocked_pending_owner_evidence",
  "does not attach evidence",
  "does not choose a license",
  "does not collect an artifact",
  "does not grant permission",
  "does not publish",
  "does not create external proof",
  "does not close gates",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/OWNER-EVIDENCE-ATTACHMENT-FORM.md missing text: ${text}`);
  }
}

for (const section of [
  "# Mimesis Owner Evidence Attachment Form",
  "Status: owner evidence attachment form, not evidence.",
  "## Source Review",
  "## Owner Evidence Fields",
  "## Attachment Form",
  "## Safety Confirmation",
  "## Review Commands",
  "## Allowed Claim",
  "## Disallowed Claim",
  "## Boundary",
]) {
  if (!form.includes(section)) {
    failures.push(`owner evidence attachment form missing section: ${section}`);
  }
}

for (const text of [
  ".mimesis/owner-actions/evidence-review.md",
  ".mimesis/owner-actions/fixture-evidence-record.json",
  "blocked_pending_owner_evidence",
  "owner-provided evidence required",
  "owner-provided permission required",
  "| Field | Owner Evidence To Attach | Blocked Gates | Owner Attachment Slot | Safety Check |",
  "does not attach evidence",
  "does not choose a license",
  "does not collect an artifact",
  "does not grant permission",
  "does not publish",
  "does not create external proof",
  "does not close gates",
]) {
  if (!form.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`owner evidence attachment form missing text: ${text}`);
  }
}

for (const field of requiredFields) {
  if (!form.includes(field)) {
    failures.push(`owner evidence attachment form missing field: ${field}`);
  }
}

for (const gateId of requiredGateIds) {
  if (!form.includes(gateId)) {
    failures.push(`owner evidence attachment form missing gate id: ${gateId}`);
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
  if (!content.toLowerCase().includes("owner evidence attachment form")) {
    failures.push(`${name} missing owner evidence attachment form text`);
  }
}

for (const text of [
  "docs/OWNER-EVIDENCE-ATTACHMENT-FORM.md",
  ".mimesis/owner-actions/evidence-attachment-form.md",
  "tools/create-owner-evidence-attachment-form.mjs",
  "tools/audit-owner-evidence-attachment-form.mjs",
]) {
  if (!validator.includes(text)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${text}`);
  }
}

for (const command of ["owner:evidence-attachment-form", "audit:owner-evidence-attachment-form"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/owner-actions/evidence-attachment-form.md")) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing owner evidence attachment form");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/OWNER-EVIDENCE-ATTACHMENT-FORM.md",
  ".mimesis/owner-actions/evidence-attachment-form.md",
  "tools/create-owner-evidence-attachment-form.mjs",
  "tools/audit-owner-evidence-attachment-form.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis owner evidence attachment form audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner evidence attachment form audit passed: owner evidence can be requested without pretending it exists.");

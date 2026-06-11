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
const doc = read("docs/OWNER-EVIDENCE-REVIEW.md");
const review = read(".mimesis/owner-actions/evidence-review.md");
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

for (const scriptName of ["owner:evidence-review", "audit:owner-evidence-review"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!cli.includes('"owner:evidence-review"') || !cli.includes('"audit:owner-evidence-review"')) {
  failures.push("CLI missing owner:evidence-review or audit:owner-evidence-review command");
}

for (const command of ["owner:evidence-review", "audit:owner-evidence-review"]) {
  if (!releaseCommands.includes(command)) {
    failures.push(`release:check missing npm run ${command}`);
  }
}

for (const [earlier, later] of [
  ["owner:evidence-intake-record", "owner:evidence-review"],
  ["owner:evidence-review", "release:artifact-manifest"],
  ["owner:evidence-review", "audit:owner-evidence-review"],
  ["audit:owner-evidence-intake-record", "audit:owner-evidence-review"],
  ["audit:owner-evidence-review", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

for (const text of [
  "owner evidence review",
  "pending owner evidence attachments",
  "blocked_pending_owner_evidence",
  "ready to proceed: no",
  "does not attach evidence",
  "does not choose a license",
  "does not collect an artifact",
  "does not grant permission",
  "does not publish",
  "does not create external proof",
  "does not close gates",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/OWNER-EVIDENCE-REVIEW.md missing text: ${text}`);
  }
}

for (const section of [
  "# Mimesis Owner Evidence Review",
  "Status: owner evidence review packet, gates remain blocked.",
  "## Source Record",
  "## Evidence Attachment Status Table",
  "## Blocked Gates",
  "## Required Next Evidence",
  "## Allowed Claim",
  "## Disallowed Claim",
  "## Boundary",
]) {
  if (!review.includes(section)) {
    failures.push(`owner evidence review missing section: ${section}`);
  }
}

for (const text of [
  ".mimesis/owner-actions/fixture-evidence-record.json",
  "pending_owner_evidence_attachments",
  "blocked_pending_owner_evidence",
  "ready to proceed: no",
  "pending owner evidence",
  "| Field | Attachment Status | Owner Evidence | Required Attachments | Blocked Gates | Boundary |",
  "does not attach evidence",
  "does not choose a license",
  "does not collect an artifact",
  "does not grant permission",
  "does not publish",
  "does not create external proof",
  "does not close gates",
]) {
  if (!review.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`owner evidence review missing text: ${text}`);
  }
}

for (const field of requiredFields) {
  if (!review.includes(field)) {
    failures.push(`owner evidence review missing field: ${field}`);
  }
}

for (const gateId of requiredGateIds) {
  if (!review.includes(gateId)) {
    failures.push(`owner evidence review missing gate id: ${gateId}`);
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
  if (!content.toLowerCase().includes("owner evidence review")) {
    failures.push(`${name} missing owner evidence review text`);
  }
}

for (const text of [
  "docs/OWNER-EVIDENCE-REVIEW.md",
  ".mimesis/owner-actions/evidence-review.md",
  "tools/review-owner-evidence-intake-record.mjs",
  "tools/audit-owner-evidence-review.mjs",
]) {
  if (!validator.includes(text)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${text}`);
  }
}

for (const command of ["owner:evidence-review", "audit:owner-evidence-review"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/owner-actions/evidence-review.md")) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing owner evidence review");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/OWNER-EVIDENCE-REVIEW.md",
  ".mimesis/owner-actions/evidence-review.md",
  "tools/review-owner-evidence-intake-record.mjs",
  "tools/audit-owner-evidence-review.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis owner evidence review audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner evidence review audit passed: pending owner evidence keeps gates blocked and explicit.");

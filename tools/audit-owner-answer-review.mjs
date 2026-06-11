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
const doc = read("docs/OWNER-ANSWER-REVIEW.md");
const review = read(".mimesis/owner-actions/answer-review.md");
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

for (const scriptName of ["owner:answer-review", "audit:owner-answer-review"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!cli.includes('"owner:answer-review"') || !cli.includes('"audit:owner-answer-review"')) {
  failures.push("CLI missing owner:answer-review or audit:owner-answer-review command");
}

for (const command of ["owner:answer-review", "audit:owner-answer-review"]) {
  if (!releaseCommands.includes(command)) {
    failures.push(`release:check missing npm run ${command}`);
  }
}

for (const [earlier, later] of [
  ["owner:decision-answer-record", "owner:answer-review"],
  ["owner:answer-review", "release:artifact-manifest"],
  ["owner:answer-review", "audit:owner-answer-review"],
  ["audit:owner-decision-answer-record", "audit:owner-answer-review"],
  ["audit:owner-answer-review", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

for (const text of [
  "owner answer review",
  "blocked_pending_owner_answers",
  "ready to proceed: no",
  "does not choose a license",
  "does not collect an artifact",
  "does not grant permission",
  "does not publish",
  "does not create external proof",
  "does not close gates",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/OWNER-ANSWER-REVIEW.md missing text: ${text}`);
  }
}

for (const section of [
  "# Mimesis Owner Answer Review",
  "Status: owner answer review packet, gates remain blocked.",
  "## Source Record",
  "## Answer Status Table",
  "## Blocked Gates",
  "## Allowed Claim",
  "## Disallowed Claim",
  "## Boundary",
]) {
  if (!review.includes(section)) {
    failures.push(`owner answer review missing section: ${section}`);
  }
}

for (const text of [
  ".mimesis/owner-actions/fixture-answer-record.json",
  "blocked_pending_owner_answers",
  "ready to proceed: no",
  "pending owner answer",
  "| Field | Answer Status | Current Signal | Evidence To Attach | Boundary |",
  "does not choose a license",
  "does not collect an artifact",
  "does not grant permission",
  "does not publish",
  "does not create external proof",
  "does not close gates",
]) {
  if (!review.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`owner answer review missing text: ${text}`);
  }
}

for (const field of requiredFields) {
  if (!review.includes(field)) {
    failures.push(`owner answer review missing field: ${field}`);
  }
}

for (const gateId of requiredGateIds) {
  if (!review.includes(gateId)) {
    failures.push(`owner answer review missing gate id: ${gateId}`);
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
  if (!content.toLowerCase().includes("owner answer review")) {
    failures.push(`${name} missing owner answer review text`);
  }
}

for (const text of [
  "docs/OWNER-ANSWER-REVIEW.md",
  ".mimesis/owner-actions/answer-review.md",
  "tools/review-owner-decision-answer-record.mjs",
  "tools/audit-owner-answer-review.mjs",
]) {
  if (!validator.includes(text)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${text}`);
  }
}

for (const command of ["owner:answer-review", "audit:owner-answer-review"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/owner-actions/answer-review.md")) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing owner answer review");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/OWNER-ANSWER-REVIEW.md",
  ".mimesis/owner-actions/answer-review.md",
  "tools/review-owner-decision-answer-record.mjs",
  "tools/audit-owner-answer-review.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis owner answer review audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner answer review audit passed: pending owner answers keep gates blocked and explicit.");

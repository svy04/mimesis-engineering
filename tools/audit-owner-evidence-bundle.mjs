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

const requiredCommands = [
  "npm run audit:license",
  "npm run cli -- case:review",
  "npm run cli -- case:from-intake",
  "npm run cli -- case:check",
  "npm run evidence:from-case",
  "npm run evidence:review",
  "npm run audit:sync:strict",
  "npm run audit:package",
  "npm run audit:action",
  "npm run benchmark:packet",
];

const packageJson = readJson("package.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/OWNER-EVIDENCE-BUNDLE.md");
const bundle = read(".mimesis/owner-actions/evidence-bundle.md");
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

for (const scriptName of ["owner:evidence-bundle", "audit:owner-evidence-bundle"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!cli.includes('"owner:evidence-bundle"') || !cli.includes('"audit:owner-evidence-bundle"')) {
  failures.push("CLI missing owner:evidence-bundle or audit:owner-evidence-bundle command");
}

for (const command of ["owner:evidence-bundle", "audit:owner-evidence-bundle"]) {
  if (!releaseCommands.includes(command)) {
    failures.push(`release:check missing npm run ${command}`);
  }
}

for (const [earlier, later] of [
  ["owner:answer-review", "owner:evidence-bundle"],
  ["owner:evidence-bundle", "release:artifact-manifest"],
  ["owner:evidence-bundle", "audit:owner-evidence-bundle"],
  ["audit:owner-answer-review", "audit:owner-evidence-bundle"],
  ["audit:owner-evidence-bundle", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

for (const text of [
  "owner evidence bundle",
  "Status: owner evidence bundle, not evidence.",
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
    failures.push(`docs/OWNER-EVIDENCE-BUNDLE.md missing text: ${text}`);
  }
}

for (const section of [
  "# Mimesis Owner Evidence Bundle",
  "Status: owner evidence bundle, not evidence.",
  "## Source Review",
  "## Evidence Attachment Matrix",
  "## Required Commands",
  "## Stop Conditions",
  "## Allowed Claim",
  "## Disallowed Claim",
  "## Boundary",
]) {
  if (!bundle.includes(section)) {
    failures.push(`owner evidence bundle missing section: ${section}`);
  }
}

for (const text of [
  ".mimesis/owner-actions/answer-review.md",
  ".mimesis/owner-actions/fixture-answer-record.json",
  ".mimesis/gates/evidence-packet.md",
  ".mimesis/gaps/closure-plan.json",
  ".mimesis/release-evidence/v0.1-report.md",
  "blocked_pending_owner_answers",
  "ready to proceed: no",
  "does not choose a license",
  "does not collect an artifact",
  "does not grant permission",
  "does not publish",
  "does not create external proof",
  "does not close gates",
]) {
  if (!bundle.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`owner evidence bundle missing text: ${text}`);
  }
}

for (const field of requiredFields) {
  if (!bundle.includes(field)) {
    failures.push(`owner evidence bundle missing field: ${field}`);
  }
}

for (const gateId of requiredGateIds) {
  if (!bundle.includes(gateId)) {
    failures.push(`owner evidence bundle missing gate id: ${gateId}`);
  }
}

for (const command of requiredCommands) {
  if (!bundle.includes(command)) {
    failures.push(`owner evidence bundle missing required command: ${command}`);
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
  if (!content.toLowerCase().includes("owner evidence bundle")) {
    failures.push(`${name} missing owner evidence bundle text`);
  }
}

for (const text of [
  "docs/OWNER-EVIDENCE-BUNDLE.md",
  ".mimesis/owner-actions/evidence-bundle.md",
  "tools/create-owner-evidence-bundle.mjs",
  "tools/audit-owner-evidence-bundle.mjs",
]) {
  if (!validator.includes(text)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${text}`);
  }
}

for (const command of ["owner:evidence-bundle", "audit:owner-evidence-bundle"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/owner-actions/evidence-bundle.md")) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing owner evidence bundle");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/OWNER-EVIDENCE-BUNDLE.md",
  ".mimesis/owner-actions/evidence-bundle.md",
  "tools/create-owner-evidence-bundle.mjs",
  "tools/audit-owner-evidence-bundle.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis owner evidence bundle audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner evidence bundle audit passed: required owner evidence remains mapped but unclaimed.");

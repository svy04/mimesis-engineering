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

const packageJson = readJson("package.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/OWNER-DECISION-INTAKE.md");
const intake = read(".mimesis/owner-actions/decision-intake.md");
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

for (const scriptName of ["owner:decision-intake", "audit:owner-decision-intake"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!cli.includes('"owner:decision-intake"') || !cli.includes('"audit:owner-decision-intake"')) {
  failures.push("CLI missing owner:decision-intake or audit:owner-decision-intake command");
}

for (const command of ["owner:decision-intake", "audit:owner-decision-intake"]) {
  if (!releaseCommands.includes(command)) {
    failures.push(`release:check missing npm run ${command}`);
  }
}

for (const [earlier, later] of [
  ["owner:queue", "owner:decision-intake"],
  ["owner:decision-intake", "release:artifact-manifest"],
  ["owner:decision-intake", "audit:owner-decision-intake"],
  ["audit:owner-queue", "audit:owner-decision-intake"],
  ["audit:owner-decision-intake", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

for (const text of [
  "owner decision intake",
  "does not choose a license",
  "does not collect an artifact",
  "does not grant permission",
  "does not publish",
  "does not create external proof",
  "does not close gates",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/OWNER-DECISION-INTAKE.md missing text: ${text}`);
  }
}

for (const section of [
  "# Mimesis Owner Decision Intake",
  "Status: owner decision intake packet, not owner decision.",
  "## Source Queue",
  "## Decision Intake Form",
  "## Required Owner Answers",
  "## Evidence To Attach",
  "## Stop Conditions",
  "## Allowed Claim",
  "## Disallowed Claim",
  "## Boundary",
]) {
  if (!intake.includes(section)) {
    failures.push(`owner decision intake missing section: ${section}`);
  }
}

for (const text of [
  ".mimesis/owner-actions/current-action-queue.md",
  ".mimesis/release-decisions/owner-decision-record.json",
  ".mimesis/proof-intake/first-external-proof-kit.md",
  ".mimesis/license-packets/owner-decision.md",
  "owner_license_decision",
  "permissioned_external_artifact",
  "completed_external_case",
  "strict_publish_sync",
  "license_or_no_reuse",
  "weak_artifact_permission",
  "publication_scope",
  "package_action_plugin_scope",
  "benchmark_adoption_scope",
  "strict_sync_intent",
  "| Field | Owner Answer Needed | Current Signal | Evidence To Attach | Boundary |",
  "does not choose a license",
  "does not collect an artifact",
  "does not grant permission",
  "does not publish",
  "does not create external proof",
  "does not close gates",
]) {
  if (!intake.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`owner decision intake missing text: ${text}`);
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
  if (!content.toLowerCase().includes("owner decision intake")) {
    failures.push(`${name} missing owner decision intake text`);
  }
}

for (const text of [
  "docs/OWNER-DECISION-INTAKE.md",
  ".mimesis/owner-actions/decision-intake.md",
  "tools/create-owner-decision-intake.mjs",
  "tools/audit-owner-decision-intake.mjs",
]) {
  if (!validator.includes(text)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${text}`);
  }
}

for (const command of ["owner:decision-intake", "audit:owner-decision-intake"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/owner-actions/decision-intake.md")) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing owner decision intake");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/OWNER-DECISION-INTAKE.md",
  ".mimesis/owner-actions/decision-intake.md",
  "tools/create-owner-decision-intake.mjs",
  "tools/audit-owner-decision-intake.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis owner decision intake audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner decision intake audit passed: owner decisions can be captured without making claims or closing gates.");

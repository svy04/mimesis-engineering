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

function requireIncludes(label, content, needles) {
  for (const needle of needles) {
    if (!content.includes(needle)) {
      failures.push(`${label}: missing ${needle}`);
    }
  }
}

const packageJson = readJson("package.json");
const releaseCommands = commandList(packageJson);
const cli = read("bin/mimesis.mjs");
const doc = read("docs/OWNER-PROOF-INPUT-REQUEST.md");
const packet = read(".mimesis/owner-actions/proof-input-request.md");
const generator = read("tools/create-owner-proof-input-request.mjs");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const releaseOrderDoc = read("docs/RELEASE-CHECK-ORDER.md");
const validator = read("tools/validate-mimesis.mjs");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");

for (const scriptName of ["owner:proof-input-request", "audit:owner-proof-input-request"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
  if (!releaseCommands.includes(scriptName)) {
    failures.push(`release:check missing npm run ${scriptName}`);
  }
  if (!cli.includes(`"${scriptName}"`)) {
    failures.push(`CLI missing ${scriptName}`);
  }
}

for (const [earlier, later] of [
  ["owner:proof-handoff", "owner:proof-input-request"],
  ["owner:proof-input-issue", "owner:proof-input-request"],
  ["owner:proof-input-request", "owner:proof-input-issue-convert"],
  ["owner:proof-input-request", "owner:proof-input-check"],
  ["owner:proof-input-request", "release:artifact-manifest"],
  ["audit:owner-proof-handoff", "audit:owner-proof-input-request"],
  ["audit:owner-proof-input-issue", "audit:owner-proof-input-request"],
  ["audit:owner-proof-input-request", "audit:owner-proof-input-issue-convert"],
  ["audit:owner-proof-input-request", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

requireIncludes("generator", generator, [
  "proof-input-request.md",
  "license_or_no_reuse",
  "weak_artifact_permission",
  "Bring one weak artifact",
  "does not choose a license",
  "does not grant permission",
  "does not create external proof",
  "does not close gates",
]);

requireIncludes("doc", doc, [
  "# Owner Proof Input Request",
  "owner:proof-input-request",
  "license_or_no_reuse",
  "weak_artifact_permission",
  "does not choose a license",
  "does not grant permission",
  "does not create external proof",
  "does not close gates",
]);

requireIncludes("packet", packet, [
  "# Mimesis Owner Proof Input Request",
  "Status: owner request packet, not owner decision or proof.",
  "license_or_no_reuse",
  "weak_artifact_permission",
  "Bring one weak artifact",
  "Open the owner proof input issue form",
  "owner:proof-input-issue-convert",
  "does not choose a license",
  "does not grant permission",
  "does not create external proof",
  "does not close gates",
]);

for (const [label, content] of [
  ["README.md", readme],
  ["tools/README.md", toolsReadme],
  ["docs/COMPLETION-AUDIT.md", completion],
  ["STATUS.md", status],
  ["ROADMAP.md", roadmap],
  ["docs/V0.1-RELEASE-PACKET.md", releasePacket],
  ["docs/RELEASE-CHECK-ORDER.md", releaseOrderDoc],
]) {
  if (!content.toLowerCase().includes("owner proof input request")) {
    failures.push(`${label}: missing owner proof input request text`);
  }
}

for (const relativePath of [
  "docs/OWNER-PROOF-INPUT-REQUEST.md",
  ".mimesis/owner-actions/proof-input-request.md",
  "tools/create-owner-proof-input-request.mjs",
  "tools/audit-owner-proof-input-request.mjs",
]) {
  if (!validator.includes(relativePath)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${relativePath}`);
  }
}

for (const command of ["owner:proof-input-request", "audit:owner-proof-input-request"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/owner-actions/proof-input-request.md")) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing owner proof input request packet");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/OWNER-PROOF-INPUT-REQUEST.md",
  ".mimesis/owner-actions/proof-input-request.md",
  "tools/create-owner-proof-input-request.mjs",
  "tools/audit-owner-proof-input-request.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis owner proof input request audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner proof input request audit passed: owner-facing request is visible and bounded.");

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
const issueForm = read(".github/ISSUE_TEMPLATE/owner-proof-input.yml");
const doc = read("docs/OWNER-PROOF-INPUT-ISSUE.md");
const packet = read(".mimesis/owner-actions/proof-input-issue-packet.md");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const releaseOrderDoc = read("docs/RELEASE-CHECK-ORDER.md");
const issueAudit = read("tools/audit-issue-forms.mjs");
const validator = read("tools/validate-mimesis.mjs");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");

for (const scriptName of ["owner:proof-input-issue", "audit:owner-proof-input-issue"]) {
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
  ["owner:proof-handoff", "owner:proof-input-issue"],
  ["owner:proof-input-template", "owner:proof-input-issue"],
  ["owner:proof-input-issue", "owner:proof-input-check"],
  ["owner:proof-input-issue", "owner:proof-input-split"],
  ["owner:proof-input-issue", "release:artifact-manifest"],
  ["audit:owner-proof-handoff", "audit:owner-proof-input-issue"],
  ["audit:owner-proof-input", "audit:owner-proof-input-issue"],
  ["audit:owner-proof-input-issue", "audit:owner-proof-input-split"],
  ["audit:owner-proof-input-issue", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

requireIncludes("issue form", issueForm, [
  "name: Owner Proof Input",
  "labels: [\"owner-proof-input\"]",
  "id: license_or_no_reuse",
  "id: weak_artifact_permission",
  "id: artifact_owner",
  "id: publication_preference",
  "id: redaction_requirements",
  "id: safety_confirmation",
  "I did not include secrets, passwords, tokens, or private customer data.",
  "I understand this issue does not grant permission, approve proof, publish, or close gates.",
]);

requireIncludes("doc", doc, [
  "# Owner Proof Input Issue",
  "owner-proof-input.yml",
  "license_or_no_reuse",
  "weak_artifact_permission",
  "does not choose a license",
  "does not grant permission",
  "does not create external proof",
]);

requireIncludes("packet", packet, [
  "# Mimesis Owner Proof Input Issue Packet",
  "Status: owner proof input issue handoff, not owner decision or proof.",
  ".github/ISSUE_TEMPLATE/owner-proof-input.yml",
  "license_or_no_reuse",
  "weak_artifact_permission",
  "owner:proof-input-check",
  "owner:proof-input-split",
  "does not choose a license",
  "does not grant permission",
  "does not create external proof",
  "does not publish",
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
  if (!content.toLowerCase().includes("owner proof input issue")) {
    failures.push(`${label}: missing owner proof input issue text`);
  }
}

requireIncludes("issue audit", issueAudit, [
  "owner-proof-input.yml",
  "license_or_no_reuse",
  "weak_artifact_permission",
]);

for (const relativePath of [
  ".github/ISSUE_TEMPLATE/owner-proof-input.yml",
  "docs/OWNER-PROOF-INPUT-ISSUE.md",
  ".mimesis/owner-actions/proof-input-issue-packet.md",
  "tools/create-owner-proof-input-issue-packet.mjs",
  "tools/audit-owner-proof-input-issue.mjs",
]) {
  if (!validator.includes(relativePath)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${relativePath}`);
  }
}

for (const command of ["owner:proof-input-issue", "audit:owner-proof-input-issue"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/owner-actions/proof-input-issue-packet.md")) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing owner proof input issue packet");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  ".github/ISSUE_TEMPLATE/owner-proof-input.yml",
  "docs/OWNER-PROOF-INPUT-ISSUE.md",
  ".mimesis/owner-actions/proof-input-issue-packet.md",
  "tools/create-owner-proof-input-issue-packet.mjs",
  "tools/audit-owner-proof-input-issue.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis owner proof input issue audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner proof input issue audit passed: public owner proof input intake is visible and bounded.");

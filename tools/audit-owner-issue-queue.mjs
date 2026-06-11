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

const requiredGapIds = [
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
const doc = read("docs/OWNER-ISSUE-QUEUE.md");
const queue = read(".mimesis/owner-actions/v0.2-issue-queue.md");
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

for (const scriptName of ["owner:issue-queue", "audit:owner-issue-queue"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!cli.includes('"owner:issue-queue"') || !cli.includes('"audit:owner-issue-queue"')) {
  failures.push("CLI missing owner:issue-queue or audit:owner-issue-queue command");
}

for (const command of ["owner:issue-queue", "audit:owner-issue-queue"]) {
  if (!releaseCommands.includes(command)) {
    failures.push(`release:check missing npm run ${command}`);
  }
}

for (const [earlier, later] of [
  ["owner:queue", "owner:issue-queue"],
  ["gap:closure-plan", "owner:issue-queue"],
  ["owner:issue-queue", "release:artifact-manifest"],
  ["owner:issue-queue", "audit:owner-issue-queue"],
  ["audit:owner-queue", "audit:owner-issue-queue"],
  ["audit:gap-closure-plan", "audit:owner-issue-queue"],
  ["audit:owner-issue-queue", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

for (const text of [
  "owner issue queue",
  "does not create GitHub issues",
  "does not close gates",
  "does not choose a license",
  "does not collect an artifact",
  "does not create external proof",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/OWNER-ISSUE-QUEUE.md missing text: ${text}`);
  }
}

for (const section of [
  "# Mimesis Owner Issue Queue",
  "Status: issue-ready owner queue, not remote issue creation.",
  "## Source Packets",
  "## Issue Queue",
  "## Issue Body Drafts",
  "## Stop Conditions",
  "## Allowed Claim",
  "## Disallowed Claim",
  "## Boundary",
]) {
  if (!queue.includes(section)) {
    failures.push(`owner issue queue missing section: ${section}`);
  }
}

for (const text of [
  ".mimesis/gaps/current-gap-register.json",
  ".mimesis/gaps/closure-plan.json",
  ".mimesis/owner-actions/current-action-queue.md",
  "label: mimesis-owner-gate",
  "label: mimesis-proof-gate",
  "label: mimesis-publication-gate",
  "label: mimesis-measurement-gate",
  "copyable issue body only",
  "does not create GitHub issues",
  "does not close gates",
  "does not choose a license",
  "does not collect an artifact",
  "does not create external proof",
  "does not prove adoption",
]) {
  if (!queue.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`owner issue queue missing text: ${text}`);
  }
}

for (const forbidden of [
  "gh issue create",
  "gh api repos",
  "closed gate",
  "owner approved",
  "proof exists",
  "adoption exists",
]) {
  if (queue.toLowerCase().includes(forbidden.toLowerCase())) {
    failures.push(`owner issue queue must not include unsafe claim or remote mutation text: ${forbidden}`);
  }
}

for (const id of requiredGapIds) {
  if (!queue.includes(id)) {
    failures.push(`owner issue queue missing gap id: ${id}`);
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
  if (!content.toLowerCase().includes("owner issue queue")) {
    failures.push(`${name} missing owner issue queue text`);
  }
}

for (const text of [
  "docs/OWNER-ISSUE-QUEUE.md",
  ".mimesis/owner-actions/v0.2-issue-queue.md",
  "tools/create-owner-issue-queue.mjs",
  "tools/audit-owner-issue-queue.mjs",
]) {
  if (!validator.includes(text)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${text}`);
  }
}

for (const command of ["owner:issue-queue", "audit:owner-issue-queue"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/owner-actions/v0.2-issue-queue.md")) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing owner issue queue");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/OWNER-ISSUE-QUEUE.md",
  ".mimesis/owner-actions/v0.2-issue-queue.md",
  "tools/create-owner-issue-queue.mjs",
  "tools/audit-owner-issue-queue.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis owner issue queue audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner issue queue audit passed: open owner/proof gates have copyable issue bodies without creating issues or claiming closure.");

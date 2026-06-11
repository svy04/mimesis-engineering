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
  "strict_publish_sync",
  "owner_license_decision",
  "permissioned_external_artifact",
  "completed_external_case",
  "package_publication",
  "action_publication",
  "shipped_plugin",
  "benchmark_study",
  "external_adoption",
];

const requiredDecisionIds = [
  "license",
  "publicRelease",
  "npmPublication",
  "actionPublication",
  "pluginPublication",
  "externalProof",
  "benchmarkOrAdoption",
];

const packageJson = readJson("package.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/OWNER-ACTION-QUEUE.md");
const queue = read(".mimesis/owner-actions/current-action-queue.md");
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

for (const scriptName of ["owner:queue", "audit:owner-queue"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!cli.includes('"owner:queue"') || !cli.includes('"audit:owner-queue"')) {
  failures.push("CLI missing owner:queue or audit:owner-queue command");
}

for (const command of ["owner:queue", "audit:owner-queue"]) {
  if (!releaseCommands.includes(command)) {
    failures.push(`release:check missing npm run ${command}`);
  }
}

for (const [earlier, later] of [
  ["release:decision-record", "owner:queue"],
  ["release:evidence-report", "owner:queue"],
  ["gap:closure-plan", "owner:queue"],
  ["gate:evidence-packet", "owner:queue"],
  ["proof:execution-report", "owner:queue"],
  ["owner:queue", "release:artifact-manifest"],
  ["owner:queue", "audit:owner-queue"],
  ["audit:release-decision-record", "audit:owner-queue"],
  ["audit:release-evidence-report", "audit:owner-queue"],
  ["audit:gap-closure-plan", "audit:owner-queue"],
  ["audit:gate-evidence-packet", "audit:owner-queue"],
  ["audit:proof-execution-report", "audit:owner-queue"],
  ["audit:owner-queue", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

for (const text of [
  "owner action queue",
  "does not choose a license",
  "does not collect an artifact",
  "does not publish",
  "does not create external proof",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/OWNER-ACTION-QUEUE.md missing text: ${text}`);
  }
}

for (const section of [
  "# Mimesis Owner Action Queue",
  "Status: owner action queue packet, not owner decision.",
  "## Source Packets",
  "## Owner Decision Snapshot",
  "## Owner Action Queue",
  "## Fastest Safe Path",
  "## Stop Conditions",
  "## Allowed Claim",
  "## Disallowed Claim",
  "## Boundary",
]) {
  if (!queue.includes(section)) {
    failures.push(`owner action queue missing section: ${section}`);
  }
}

for (const text of [
  ".mimesis/gaps/current-gap-register.json",
  ".mimesis/gaps/closure-plan.json",
  ".mimesis/gates/evidence-packet.md",
  ".mimesis/release-evidence/v0.1-report.md",
  ".mimesis/release-decisions/owner-decision-record.json",
  "proof execution ledger: yes",
  "| Decision ID | Decision | Current Signal | Owner Question | Required Evidence |",
  "owner_license_decision",
  "permissioned_external_artifact",
  "completed_external_case",
  "strict_publish_sync",
  "npm run audit:sync:strict",
  "npm run cli -- case:review",
  "npm run release:evidence-report",
  "does not choose a license",
  "does not collect an artifact",
  "does not publish",
  "does not create external proof",
  "does not prove adoption",
]) {
  if (!queue.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`owner action queue missing text: ${text}`);
  }
}

for (const id of requiredGapIds) {
  if (!queue.includes(id)) {
    failures.push(`owner action queue missing gap id: ${id}`);
  }
}

for (const id of requiredDecisionIds) {
  if (!queue.includes(`\`${id}\``)) {
    failures.push(`owner action queue missing decision id: ${id}`);
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
  if (!content.toLowerCase().includes("owner action queue")) {
    failures.push(`${name} missing owner action queue text`);
  }
}

for (const text of [
  "docs/OWNER-ACTION-QUEUE.md",
  ".mimesis/owner-actions/current-action-queue.md",
  "tools/create-owner-action-queue.mjs",
  "tools/audit-owner-action-queue.mjs",
]) {
  if (!validator.includes(text)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${text}`);
  }
}

for (const command of ["owner:queue", "audit:owner-queue"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/owner-actions/current-action-queue.md")) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing owner action queue");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/OWNER-ACTION-QUEUE.md",
  ".mimesis/owner-actions/current-action-queue.md",
  "tools/create-owner-action-queue.mjs",
  "tools/audit-owner-action-queue.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis owner action queue audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner action queue audit passed: owner-facing actions are explicit without making decisions or claiming proof.");

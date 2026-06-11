#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

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

function requireIncludes(label, content, needles) {
  for (const needle of needles) {
    if (!content.toLowerCase().includes(needle.toLowerCase())) {
      failures.push(`${label} missing text: ${needle}`);
    }
  }
}

const packageJson = readJson("package.json");
const commands = releaseCommands(packageJson);
const cli = read("bin/mimesis.mjs");
const sync = readJson(".mimesis/owner-actions/remote-issue-sync.json");
const report = read(".mimesis/owner-actions/remote-issue-sync.md");
const doc = read("docs/OWNER-ISSUE-REMOTE-SYNC.md");
const generator = read("tools/create-owner-issue-remote-sync.mjs");
const validator = read("tools/validate-mimesis.mjs");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const releaseOrderDoc = read("docs/RELEASE-CHECK-ORDER.md");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");

for (const scriptName of ["owner:issue-remote-sync", "audit:owner-issue-remote-sync"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
  if (!cli.includes(`"${scriptName}"`)) {
    failures.push(`CLI missing ${scriptName}`);
  }
}

if (commands.includes("owner:issue-remote-sync")) {
  failures.push("release:check must not run npm run owner:issue-remote-sync because it reads live remote state");
}

if (!commands.includes("audit:owner-issue-remote-sync")) {
  failures.push("release:check missing npm run audit:owner-issue-remote-sync");
}

for (const [earlier, later] of [
  ["owner:issue-queue", "owner:issue-remote-sync"],
  ["audit:owner-issue-queue", "audit:owner-issue-remote-sync"],
  ["audit:owner-issue-remote-sync", "audit:release-artifact-manifest"],
]) {
  requireBefore(commands, earlier, later);
}

requireIncludes("generator", generator, [
  "gh",
  "issue",
  "list",
  "--json",
  "read_only_remote_snapshot",
  "does_not_create_github_issues",
  "does_not_close_gates",
]);

if (sync.schema !== "mimesis.owner-issue-remote-sync.v0.1") {
  failures.push("remote issue sync schema must be mimesis.owner-issue-remote-sync.v0.1");
}

if (!["remote_gate_issues_missing", "remote_gate_issues_partial", "remote_gate_issues_matched", "remote_unavailable"].includes(sync.status)) {
  failures.push("remote issue sync status must be a known bounded status");
}

if (sync.sourceQueue !== ".mimesis/owner-actions/v0.2-issue-queue.md") {
  failures.push("remote issue sync sourceQueue must point to .mimesis/owner-actions/v0.2-issue-queue.md");
}

if (sync.repository !== "svy04/mimesis-engineering") {
  failures.push("remote issue sync repository must be svy04/mimesis-engineering");
}

if (sync.snapshotKind !== "read_only_remote_snapshot") {
  failures.push("remote issue sync snapshotKind must be read_only_remote_snapshot");
}

if (sync.requiredGateCount !== requiredGapIds.length) {
  failures.push(`remote issue sync requiredGateCount must be ${requiredGapIds.length}`);
}

if (!Array.isArray(sync.matches) || sync.matches.length !== requiredGapIds.length) {
  failures.push(`remote issue sync matches must list ${requiredGapIds.length} gate entries`);
}

const byGap = new Map((sync.matches ?? []).map((entry) => [entry.gapId, entry]));
for (const id of requiredGapIds) {
  const entry = byGap.get(id);
  if (!entry) {
    failures.push(`remote issue sync missing gap id: ${id}`);
    continue;
  }

  if (!entry.expectedTitle?.startsWith("[Mimesis v0.2 gate] ")) {
    failures.push(`remote issue sync expectedTitle malformed for ${id}`);
  }

  if (!Array.isArray(entry.labels) || entry.labels.length < 3) {
    failures.push(`remote issue sync labels missing for ${id}`);
  }

  if (!["matched", "missing"].includes(entry.remoteState)) {
    failures.push(`remote issue sync remoteState must be matched or missing for ${id}`);
  }

  if (entry.remoteIssue && ("body" in entry.remoteIssue || "rawBody" in entry.remoteIssue || "issueBody" in entry.remoteIssue)) {
    failures.push(`remote issue sync must not store issue body for ${id}`);
  }
}

for (const field of ["matchedGateCount", "missingGateCount", "existingNonGateIssueCount"]) {
  if (!Number.isInteger(sync[field]) || sync[field] < 0) {
    failures.push(`remote issue sync ${field} must be a non-negative integer`);
  }
}

for (const boundary of [
  "read_only_remote_snapshot",
  "does_not_create_github_issues",
  "does_not_close_gates",
  "does_not_choose_license",
  "does_not_collect_artifact",
  "does_not_create_external_proof",
  "does_not_prove_adoption",
]) {
  if (!sync.boundaries?.includes(boundary)) {
    failures.push(`remote issue sync missing boundary: ${boundary}`);
  }
}

requireIncludes("remote issue sync claims", `${sync.allowedClaim}\n${sync.disallowedClaim}`, [
  "read-only",
  "not remote issue creation",
  "not gate closure",
  "not proof",
]);

requireIncludes("report", report, [
  "# Mimesis Owner Issue Remote Sync",
  "Status: read-only remote issue sync snapshot, not remote issue creation.",
  "## Source Packets",
  "## Remote Issue Match Table",
  "## Missing Gate Issues",
  "## Existing Non-Gate Issues",
  "## Allowed Claim",
  "## Disallowed Claim",
  "## Boundary",
  "does not create GitHub issues",
  "does not close gates",
  "does not choose a license",
  "does not collect an artifact",
  "does not create external proof",
  "does not prove adoption",
]);

for (const id of requiredGapIds) {
  if (!report.includes(id)) {
    failures.push(`remote issue sync report missing gap id: ${id}`);
  }
}

for (const forbidden of [
  "gh issue create",
  "closed gate",
  "owner approved",
  "proof exists",
  "adoption exists",
]) {
  if (report.toLowerCase().includes(forbidden.toLowerCase())) {
    failures.push(`remote issue sync report must not include unsafe claim or mutation text: ${forbidden}`);
  }
}

requireIncludes("doc", doc, [
  "Owner Issue Remote Sync",
  "owner:issue-remote-sync",
  "audit:owner-issue-remote-sync",
  "read-only",
  "does not create GitHub issues",
  "does not close gates",
  "does not choose a license",
  "does not collect an artifact",
  "does not create external proof",
  "does not prove adoption",
]);

for (const relativePath of [
  "docs/OWNER-ISSUE-REMOTE-SYNC.md",
  ".mimesis/owner-actions/remote-issue-sync.json",
  ".mimesis/owner-actions/remote-issue-sync.md",
  "tools/create-owner-issue-remote-sync.mjs",
  "tools/audit-owner-issue-remote-sync.mjs",
]) {
  if (!validator.includes(relativePath)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${relativePath}`);
  }
}

for (const command of ["owner:issue-remote-sync", "audit:owner-issue-remote-sync"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/owner-actions/remote-issue-sync.json")) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing owner issue remote sync JSON");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/OWNER-ISSUE-REMOTE-SYNC.md",
  ".mimesis/owner-actions/remote-issue-sync.json",
  ".mimesis/owner-actions/remote-issue-sync.md",
  "tools/create-owner-issue-remote-sync.mjs",
  "tools/audit-owner-issue-remote-sync.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

for (const [label, content] of [
  ["README.md", readme],
  ["tools/README.md", toolsReadme],
  ["docs/COMPLETION-AUDIT.md", completion],
  ["STATUS.md", status],
  ["ROADMAP.md", roadmap],
  ["docs/V0.1-RELEASE-PACKET.md", releasePacket],
  ["docs/RELEASE-CHECK-ORDER.md", releaseOrderDoc],
]) {
  if (!content.toLowerCase().includes("owner issue remote sync")) {
    failures.push(`${label}: missing owner issue remote sync text`);
  }
}

if (failures.length) {
  console.error("\nMimesis owner issue remote sync audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner issue remote sync audit passed: live issue metadata is mirrored read-only without creating issues or closing gates.");

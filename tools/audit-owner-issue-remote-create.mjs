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
const create = readJson(".mimesis/owner-actions/remote-issue-create.json");
const report = read(".mimesis/owner-actions/remote-issue-create.md");
const doc = read("docs/OWNER-ISSUE-REMOTE-CREATE.md");
const generator = read("tools/create-owner-issue-remote-create.mjs");
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

for (const scriptName of ["owner:issue-remote-create", "audit:owner-issue-remote-create"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
  if (!cli.includes(`"${scriptName}"`)) {
    failures.push(`CLI missing ${scriptName}`);
  }
}

if (commands.includes("owner:issue-remote-create")) {
  failures.push("release:check must not run npm run owner:issue-remote-create because it mutates live remote state");
}

if (!commands.includes("audit:owner-issue-remote-create")) {
  failures.push("release:check missing npm run audit:owner-issue-remote-create");
}

for (const [earlier, later] of [
  ["audit:owner-issue-remote-sync", "audit:owner-issue-remote-create"],
  ["audit:owner-issue-remote-create", "audit:release-artifact-manifest"],
  ["audit:owner-issue-remote-create", "audit:owner-decision-intake"],
]) {
  requireBefore(commands, earlier, later);
}

requireIncludes("generator", generator, [
  "gh",
  "issue",
  "create",
  "label",
  "create",
  "--execute",
  "dryRun",
  "does_not_close_gates",
  "does_not_create_external_proof",
]);

if (create.schema !== "mimesis.owner-issue-remote-create.v0.1") {
  failures.push("remote issue create schema must be mimesis.owner-issue-remote-create.v0.1");
}

if (create.repository !== "svy04/mimesis-engineering") {
  failures.push("remote issue create repository must be svy04/mimesis-engineering");
}

if (create.sourceQueue !== ".mimesis/owner-actions/v0.2-issue-queue.md") {
  failures.push("remote issue create sourceQueue must point to .mimesis/owner-actions/v0.2-issue-queue.md");
}

if (create.executeMode !== true) {
  failures.push("committed remote issue create report must come from --execute mode");
}

if (![
  "remote_gate_issues_created",
  "remote_gate_issues_already_present",
  "remote_create_partial",
  "remote_create_failed",
].includes(create.status)) {
  failures.push("remote issue create status must be a known executed status");
}

if (create.requiredGateCount !== requiredGapIds.length) {
  failures.push(`remote issue create requiredGateCount must be ${requiredGapIds.length}`);
}

for (const field of [
  "createdIssueCount",
  "existingMatchCount",
  "missingAfterCreateCount",
  "failedIssueCount",
  "labelCreatedCount",
]) {
  if (!Number.isInteger(create[field]) || create[field] < 0) {
    failures.push(`remote issue create ${field} must be a non-negative integer`);
  }
}

if (create.missingAfterCreateCount !== 0) {
  failures.push("remote issue create missingAfterCreateCount must be 0 after committed execute report");
}

if (create.failedIssueCount !== 0) {
  failures.push("remote issue create failedIssueCount must be 0 after committed execute report");
}

if (!Array.isArray(create.issueResults) || create.issueResults.length !== requiredGapIds.length) {
  failures.push(`remote issue create issueResults must list ${requiredGapIds.length} gate entries`);
}

const byGap = new Map((create.issueResults ?? []).map((entry) => [entry.gapId, entry]));
for (const id of requiredGapIds) {
  const entry = byGap.get(id);
  if (!entry) {
    failures.push(`remote issue create missing gap id: ${id}`);
    continue;
  }
  if (!entry.expectedTitle?.startsWith("[Mimesis v0.2 gate] ")) {
    failures.push(`remote issue create expectedTitle malformed for ${id}`);
  }
  if (!Array.isArray(entry.labels) || entry.labels.length < 3) {
    failures.push(`remote issue create labels missing for ${id}`);
  }
  if (!["created", "existing"].includes(entry.remoteState)) {
    failures.push(`remote issue create remoteState must be created or existing for ${id}`);
  }
  if (!entry.remoteIssue?.url || !Number.isInteger(entry.remoteIssue?.number)) {
    failures.push(`remote issue create remoteIssue metadata missing for ${id}`);
  }
  if (entry.remoteIssue && ("body" in entry.remoteIssue || "rawBody" in entry.remoteIssue || "issueBody" in entry.remoteIssue)) {
    failures.push(`remote issue create must not store issue body for ${id}`);
  }
}

for (const boundary of [
  "does_not_close_gates",
  "does_not_choose_license",
  "does_not_collect_artifact",
  "does_not_create_external_proof",
  "does_not_prove_adoption",
  "does_not_prove_benchmark",
  "does_not_publish",
]) {
  if (!create.boundaries?.includes(boundary)) {
    failures.push(`remote issue create missing boundary: ${boundary}`);
  }
}

requireIncludes("remote issue create claims", `${create.allowedClaim}\n${create.disallowedClaim}`, [
  "remote GitHub gate issues",
  "not gate closure",
  "not proof",
  "not owner approval",
]);

requireIncludes("report", report, [
  "# Mimesis Owner Issue Remote Create",
  "Status: executed remote issue creation metadata, not gate closure.",
  "## Created Or Existing Gate Issues",
  "## Labels",
  "## Allowed Claim",
  "## Disallowed Claim",
  "## Boundary",
  "does not close gates",
  "does not choose a license",
  "does not collect an artifact",
  "does not create external proof",
  "does not prove adoption",
]);

for (const id of requiredGapIds) {
  if (!report.includes(id)) {
    failures.push(`remote issue create report missing gap id: ${id}`);
  }
}

requireIncludes("doc", doc, [
  "Owner Issue Remote Create",
  "owner:issue-remote-create",
  "audit:owner-issue-remote-create",
  "--execute",
  "does not close gates",
  "does not choose a license",
  "does not collect an artifact",
  "does not create external proof",
  "does not prove adoption",
]);

for (const relativePath of [
  "docs/OWNER-ISSUE-REMOTE-CREATE.md",
  ".mimesis/owner-actions/remote-issue-create.json",
  ".mimesis/owner-actions/remote-issue-create.md",
  "tools/create-owner-issue-remote-create.mjs",
  "tools/audit-owner-issue-remote-create.mjs",
]) {
  if (!validator.includes(relativePath)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${relativePath}`);
  }
}

for (const command of ["owner:issue-remote-create", "audit:owner-issue-remote-create"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/owner-actions/remote-issue-create.json")) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing owner issue remote create JSON");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/OWNER-ISSUE-REMOTE-CREATE.md",
  ".mimesis/owner-actions/remote-issue-create.json",
  ".mimesis/owner-actions/remote-issue-create.md",
  "tools/create-owner-issue-remote-create.mjs",
  "tools/audit-owner-issue-remote-create.mjs",
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
  if (!content.toLowerCase().includes("owner issue remote create")) {
    failures.push(`${label}: missing owner issue remote create text`);
  }
}

if (failures.length) {
  console.error("\nMimesis owner issue remote create audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner issue remote create audit passed: remote gate issues exist without proof or closure claims.");

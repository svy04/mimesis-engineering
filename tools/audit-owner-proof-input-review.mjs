#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
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
const doc = read("docs/OWNER-PROOF-INPUT-REVIEW.md");
const report = read(".mimesis/owner-actions/fixture-proof-input-review.md");
const reviewer = read("tools/review-owner-proof-input-record.mjs");
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

for (const scriptName of ["owner:proof-input-review", "audit:owner-proof-input-review"]) {
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
  ["owner:proof-input-issue-convert", "owner:proof-input-review"],
  ["owner:proof-input-review", "owner:proof-input-check"],
  ["owner:proof-input-review", "owner:proof-input-split"],
  ["owner:proof-input-review", "release:artifact-manifest"],
  ["audit:owner-proof-input-issue-convert", "audit:owner-proof-input-review"],
  ["audit:owner-proof-input-review", "audit:owner-proof-input-split"],
  ["audit:owner-proof-input-review", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

requireIncludes("reviewer", reviewer, [
  "review-owner-proof-input-record",
  "license_or_no_reuse",
  "weak_artifact_permission",
  "reviewStatus",
  "does_not_choose_license",
  "does_not_grant_permission",
  "does_not_create_external_proof",
  "does_not_close_gates",
]);

requireIncludes("doc", doc, [
  "# Owner Proof Input Review",
  "owner:proof-input-review",
  "license_or_no_reuse",
  "weak_artifact_permission",
  "does not choose a license",
  "does not grant permission",
  "does not create external proof",
  "does not close gates",
]);

requireIncludes("report", report, [
  "# Mimesis Owner Proof Input Review",
  "Status: fixture owner proof input review, not owner decision or proof.",
  "reviewStatus: blocked_fixture",
  "ready for reviewed record promotion: no",
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
  if (!content.toLowerCase().includes("owner proof input review")) {
    failures.push(`${label}: missing owner proof input review text`);
  }
}

for (const relativePath of [
  "docs/OWNER-PROOF-INPUT-REVIEW.md",
  ".mimesis/owner-actions/fixture-proof-input-review.md",
  "tools/review-owner-proof-input-record.mjs",
  "tools/audit-owner-proof-input-review.mjs",
]) {
  if (!validator.includes(relativePath)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${relativePath}`);
  }
}

for (const command of ["owner:proof-input-review", "audit:owner-proof-input-review"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/owner-actions/fixture-proof-input-review.md")) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing owner proof input review report");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/OWNER-PROOF-INPUT-REVIEW.md",
  ".mimesis/owner-actions/fixture-proof-input-review.md",
  "tools/review-owner-proof-input-record.mjs",
  "tools/audit-owner-proof-input-review.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (fs.existsSync(path.join(root, "tools", "review-owner-proof-input-record.mjs"))
  && fs.existsSync(path.join(root, ".mimesis", "owner-actions", "fixture-owner-proof-input-issue-record.json"))) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-owner-proof-review-"));
  const reviewedPath = path.join(tmpDir, "reviewed-record.json");
  const reviewReport = path.join(tmpDir, "review.md");
  const result = spawnSync(
    process.execPath,
    [
      "tools/review-owner-proof-input-record.mjs",
      ".mimesis/owner-actions/fixture-owner-proof-input-issue-record.json",
      "--write-report",
      reviewReport,
      "--output-record",
      reviewedPath,
      "--approve",
      "--allow-fixture",
    ],
    { cwd: root, encoding: "utf8" },
  );
  if (result.status !== 0) {
    failures.push(`reviewer smoke failed: ${result.stderr || result.stdout}`);
  } else {
    const reviewed = JSON.parse(fs.readFileSync(reviewedPath, "utf8"));
    const smokeReport = fs.readFileSync(reviewReport, "utf8");
    if (reviewed.status !== "reviewed") {
      failures.push("reviewer smoke output record must be reviewed with explicit approve");
    }
    if (!smokeReport.includes("reviewStatus: approved_candidate")) {
      failures.push("reviewer smoke report must show approved_candidate with explicit approve");
    }
  }
}

if (failures.length) {
  console.error("\nMimesis owner proof input review audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner proof input review audit passed: draft proof input review is visible and bounded.");

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
const doc = read("docs/OWNER-EVIDENCE-SUBMISSION-ISSUE-CONVERT.md");
const fixtureIssue = read(".mimesis/owner-actions/fixture-owner-evidence-submission-issue.md");
const fixtureRecord = readJson(".mimesis/owner-actions/fixture-owner-evidence-submission-issue-record.json");
const fixtureReport = read(".mimesis/owner-actions/fixture-owner-evidence-submission-issue-conversion-report.md");
const converter = read("tools/convert-owner-evidence-submission-issue.mjs");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const releaseOrderDoc = read("docs/RELEASE-CHECK-ORDER.md");
const statusRoadmapDoc = read("docs/STATUS-ROADMAP-SYNC.md");
const statusRoadmapAudit = read("tools/audit-status-roadmap-sync.mjs");
const completionAudit = read("tools/audit-completion-matrix.mjs");
const validator = read("tools/validate-mimesis.mjs");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");

for (const scriptName of [
  "owner:evidence-submission-issue-convert",
  "audit:owner-evidence-submission-issue-convert",
]) {
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
  ["owner:evidence-submission-record", "owner:evidence-submission-issue-convert"],
  ["owner:evidence-submission-issue-convert", "owner:evidence-submission-check"],
  ["owner:evidence-submission-issue-convert", "release:artifact-manifest"],
  ["audit:owner-evidence-submission-record", "audit:owner-evidence-submission-issue-convert"],
  ["audit:owner-evidence-submission-issue-convert", "audit:owner-evidence-submission-check"],
  ["audit:owner-evidence-submission-issue-convert", "audit:gate-closure-readiness"],
  ["audit:owner-evidence-submission-issue-convert", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

requireIncludes("converter", converter, [
  "parseIssueBody",
  "license_or_no_reuse",
  "weak_artifact_permission",
  "publication_scope",
  "does_not_submit_evidence",
  "does_not_attach_evidence",
  "does_not_close_gates",
]);

requireIncludes("doc", doc, [
  "# Owner Evidence Submission Issue Convert",
  "owner:evidence-submission-issue-convert",
  "fixture-owner-evidence-submission-issue.md",
  "draft owner evidence submission record",
  "does not choose a license",
  "does not grant permission",
  "does not close gates",
]);

requireIncludes("fixture issue", fixtureIssue, [
  "### license_or_no_reuse",
  "### weak_artifact_permission",
  "### review_state",
  "fixture only",
  "does not choose a license",
  "does not close gates",
]);

requireIncludes("fixture report", fixtureReport, [
  "# Mimesis Owner Evidence Submission Issue Conversion Report",
  "Status: fixture issue converted to draft owner evidence submission record, not owner decision or proof.",
  "ready for gate movement: no",
  "field movement ready: no",
  "does not choose a license",
  "does not close gates",
]);

if (fixtureRecord.schemaVersion !== "0.1.0") {
  failures.push("fixture converted owner evidence submission record schemaVersion must be 0.1.0");
}
if (fixtureRecord.status !== "draft") {
  failures.push("fixture converted owner evidence submission record status must be draft");
}
if (fixtureRecord.fields?.license_or_no_reuse?.submissionStatus !== "submitted") {
  failures.push("fixture converted record must route license_or_no_reuse as submitted draft evidence");
}
if (fixtureRecord.fields?.weak_artifact_permission?.submissionStatus !== "missing") {
  failures.push("fixture converted record must keep weak_artifact_permission missing in the fixture");
}
if (fixtureRecord.safetyConfirmation?.noClosedGates !== true) {
  failures.push("fixture converted record must preserve noClosedGates safety confirmation");
}
if (!fixtureRecord.boundaries?.includes("does_not_close_gates")) {
  failures.push("fixture converted record boundaries must include does_not_close_gates");
}

for (const [label, content] of [
  ["README.md", readme],
  ["tools/README.md", toolsReadme],
  ["docs/COMPLETION-AUDIT.md", completion],
  ["STATUS.md", status],
  ["ROADMAP.md", roadmap],
  ["docs/V0.1-RELEASE-PACKET.md", releasePacket],
  ["docs/RELEASE-CHECK-ORDER.md", releaseOrderDoc],
  ["docs/STATUS-ROADMAP-SYNC.md", statusRoadmapDoc],
]) {
  if (!content.toLowerCase().includes("owner evidence submission issue convert")) {
    failures.push(`${label}: missing owner evidence submission issue convert text`);
  }
}

for (const [label, content] of [
  ["tools/audit-status-roadmap-sync.mjs", statusRoadmapAudit],
  ["tools/audit-completion-matrix.mjs", completionAudit],
]) {
  if (!content.includes("Owner evidence submission issue convert")
    && !content.includes("owner evidence submission issue convert")) {
    failures.push(`${label}: missing owner evidence submission issue convert audit coverage`);
  }
}

for (const relativePath of [
  "docs/OWNER-EVIDENCE-SUBMISSION-ISSUE-CONVERT.md",
  ".mimesis/owner-actions/fixture-owner-evidence-submission-issue.md",
  ".mimesis/owner-actions/fixture-owner-evidence-submission-issue-record.json",
  ".mimesis/owner-actions/fixture-owner-evidence-submission-issue-conversion-report.md",
  "tools/convert-owner-evidence-submission-issue.mjs",
  "tools/audit-owner-evidence-submission-issue-convert.mjs",
]) {
  if (!validator.includes(relativePath)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${relativePath}`);
  }
}

for (const command of [
  "owner:evidence-submission-issue-convert",
  "audit:owner-evidence-submission-issue-convert",
]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/owner-actions/fixture-owner-evidence-submission-issue-record.json")) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing converted owner evidence submission issue record");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/OWNER-EVIDENCE-SUBMISSION-ISSUE-CONVERT.md",
  ".mimesis/owner-actions/fixture-owner-evidence-submission-issue.md",
  ".mimesis/owner-actions/fixture-owner-evidence-submission-issue-record.json",
  ".mimesis/owner-actions/fixture-owner-evidence-submission-issue-conversion-report.md",
  "tools/convert-owner-evidence-submission-issue.mjs",
  "tools/audit-owner-evidence-submission-issue-convert.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (fs.existsSync(path.join(root, "tools", "convert-owner-evidence-submission-issue.mjs"))
  && fs.existsSync(path.join(root, ".mimesis", "owner-actions", "fixture-owner-evidence-submission-issue.md"))) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-owner-evidence-issue-convert-"));
  const outputPath = path.join(tmpDir, "record.json");
  const reportPath = path.join(tmpDir, "report.md");
  const result = spawnSync(
    process.execPath,
    [
      "tools/convert-owner-evidence-submission-issue.mjs",
      ".mimesis/owner-actions/fixture-owner-evidence-submission-issue.md",
      "--output",
      outputPath,
      "--report",
      reportPath,
      "--source",
      "audit smoke",
    ],
    { cwd: root, encoding: "utf8" },
  );
  if (result.status !== 0) {
    failures.push(`converter smoke failed: ${result.stderr || result.stdout}`.trim());
  } else {
    const smokeRecord = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    const smokeReport = fs.readFileSync(reportPath, "utf8");
    if (smokeRecord.status !== "draft") {
      failures.push("converter smoke record must be draft by default");
    }
    if (smokeRecord.fields?.license_or_no_reuse?.submissionStatus !== "submitted") {
      failures.push("converter smoke record must preserve submitted license_or_no_reuse fixture field");
    }
    if (!smokeReport.includes("ready for gate movement: no")) {
      failures.push("converter smoke report must keep default draft not ready");
    }
  }
}

if (failures.length) {
  console.error("\nMimesis owner evidence submission issue convert audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner evidence submission issue convert audit passed: issue markdown can become a bounded draft owner evidence submission record.");

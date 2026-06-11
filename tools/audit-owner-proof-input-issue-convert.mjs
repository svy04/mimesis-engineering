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
const doc = read("docs/OWNER-PROOF-INPUT-ISSUE-CONVERT.md");
const fixtureIssue = read(".mimesis/owner-actions/fixture-owner-proof-input-issue.md");
const fixtureRecord = readJson(".mimesis/owner-actions/fixture-owner-proof-input-issue-record.json");
const fixtureReport = read(".mimesis/owner-actions/fixture-owner-proof-input-issue-conversion-report.md");
const converter = read("tools/convert-owner-proof-input-issue.mjs");
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

for (const scriptName of ["owner:proof-input-issue-convert", "audit:owner-proof-input-issue-convert"]) {
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
  ["owner:proof-input-issue", "owner:proof-input-issue-convert"],
  ["owner:proof-input-issue-convert", "owner:proof-input-check"],
  ["owner:proof-input-issue-convert", "owner:proof-input-split"],
  ["owner:proof-input-issue-convert", "release:artifact-manifest"],
  ["audit:owner-proof-input-issue", "audit:owner-proof-input-issue-convert"],
  ["audit:owner-proof-input-issue-convert", "audit:owner-proof-input-split"],
  ["audit:owner-proof-input-issue-convert", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

requireIncludes("converter", converter, [
  "parseIssueBody",
  "license_or_no_reuse",
  "weak_artifact_permission",
  "does_not_grant_permission",
  "does_not_create_external_proof",
  "does_not_close_gates",
]);

requireIncludes("doc", doc, [
  "# Owner Proof Input Issue Convert",
  "owner:proof-input-issue-convert",
  "fixture-owner-proof-input-issue.md",
  "does not grant permission",
  "does not create external proof",
  "does not close gates",
]);

requireIncludes("fixture issue", fixtureIssue, [
  "### license_or_no_reuse",
  "### weak_artifact_permission",
  "fixture only",
  "does not grant permission",
]);

requireIncludes("fixture report", fixtureReport, [
  "# Mimesis Owner Proof Input Issue Conversion Report",
  "Status: fixture issue converted to draft owner proof input record, not owner decision or proof.",
  "ready for downstream conversion: no",
  "does not grant permission",
  "does not create external proof",
  "does not close gates",
]);

if (fixtureRecord.schemaVersion !== "0.1.0") {
  failures.push("fixture converted record schemaVersion must be 0.1.0");
}
if (fixtureRecord.status !== "draft") {
  failures.push("fixture converted record status must be draft");
}
if (fixtureRecord.minimumInputs?.license_or_no_reuse?.inputStatus !== "submitted") {
  failures.push("fixture converted record must route license_or_no_reuse as submitted draft input");
}
if (fixtureRecord.minimumInputs?.weak_artifact_permission?.inputStatus !== "submitted") {
  failures.push("fixture converted record must route weak_artifact_permission as submitted draft input");
}
if (fixtureRecord.safetyConfirmation?.noPermissionGranted !== true) {
  failures.push("fixture converted record must preserve noPermissionGranted safety confirmation");
}
if (!fixtureRecord.boundaries?.includes("does_not_create_external_proof")) {
  failures.push("fixture converted record boundaries must include does_not_create_external_proof");
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
  if (!content.toLowerCase().includes("owner proof input issue convert")) {
    failures.push(`${label}: missing owner proof input issue convert text`);
  }
}

for (const relativePath of [
  "docs/OWNER-PROOF-INPUT-ISSUE-CONVERT.md",
  ".mimesis/owner-actions/fixture-owner-proof-input-issue.md",
  ".mimesis/owner-actions/fixture-owner-proof-input-issue-record.json",
  ".mimesis/owner-actions/fixture-owner-proof-input-issue-conversion-report.md",
  "tools/convert-owner-proof-input-issue.mjs",
  "tools/audit-owner-proof-input-issue-convert.mjs",
]) {
  if (!validator.includes(relativePath)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${relativePath}`);
  }
}

for (const command of ["owner:proof-input-issue-convert", "audit:owner-proof-input-issue-convert"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/owner-actions/fixture-owner-proof-input-issue-record.json")) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing converted owner proof input issue record");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/OWNER-PROOF-INPUT-ISSUE-CONVERT.md",
  ".mimesis/owner-actions/fixture-owner-proof-input-issue.md",
  ".mimesis/owner-actions/fixture-owner-proof-input-issue-record.json",
  ".mimesis/owner-actions/fixture-owner-proof-input-issue-conversion-report.md",
  "tools/convert-owner-proof-input-issue.mjs",
  "tools/audit-owner-proof-input-issue-convert.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (fs.existsSync(path.join(root, "tools", "convert-owner-proof-input-issue.mjs"))
  && fs.existsSync(path.join(root, ".mimesis", "owner-actions", "fixture-owner-proof-input-issue.md"))) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-owner-issue-convert-"));
  const outputPath = path.join(tmpDir, "record.json");
  const reportPath = path.join(tmpDir, "report.md");
  const result = spawnSync(
    process.execPath,
    [
      "tools/convert-owner-proof-input-issue.mjs",
      ".mimesis/owner-actions/fixture-owner-proof-input-issue.md",
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
    failures.push(`converter smoke failed: ${result.stderr || result.stdout}`);
  } else {
    const smokeRecord = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    const smokeReport = fs.readFileSync(reportPath, "utf8");
    if (smokeRecord.status !== "draft") {
      failures.push("converter smoke record must be draft by default");
    }
    if (!smokeReport.includes("ready for downstream conversion: no")) {
      failures.push("converter smoke report must keep default draft not ready");
    }
  }
}

if (fs.existsSync(path.join(root, "tools", "convert-owner-proof-input-issue.mjs"))) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-owner-issue-anchor-"));
  const issuePath = path.join(tmpDir, "owner-proof-input-issue-anchor.md");
  const outputPath = path.join(tmpDir, "record.json");
  const reportPath = path.join(tmpDir, "report.md");
  fs.writeFileSync(issuePath, `# Owner Proof Input

## 1. license_or_no_reuse

- [x] No reuse for now
- [ ] Reuse allowed under an existing repository license

Notes:

\`\`\`text
Owner says no reuse until a later explicit license decision.
\`\`\`

## 2. weak_artifact_permission

Artifact/excerpt/path/link:

\`\`\`text
Weak README excerpt: the first screen is unclear and needs a 30-second explanation path.
\`\`\`

Artifact owner:

\`\`\`text
Owner-reviewed fixture submitter
\`\`\`

Publication preference:

- [ ] Private review only
- [ ] Public
- [x] Redacted

Redaction requirements:

\`\`\`text
Redact private names and project-specific secrets before any public case.
\`\`\`

Proof boundary, meaning what this artifact/case must not claim:

\`\`\`text
Do not claim external adoption, benchmarked productivity, revenue, or publication.
\`\`\`

## Safety Confirmation

- [x] I did not include secrets, passwords, tokens, or private customer data.
- [x] I own or control the submitted artifact, or I have permission to submit the shown redacted excerpt/path/link for review.
- [x] I understand this issue does not grant permission, approve proof, publish, or close gates.
`);

  const result = spawnSync(
    process.execPath,
    [
      "tools/convert-owner-proof-input-issue.mjs",
      issuePath,
      "--output",
      outputPath,
      "--report",
      reportPath,
      "--source",
      "audit issue #7 format smoke",
      "--status",
      "reviewed",
      "--require-complete",
    ],
    { cwd: root, encoding: "utf8" },
  );
  if (result.status !== 0) {
    failures.push(`converter issue #7 format smoke failed: ${result.stderr || result.stdout}`);
  } else {
    const smokeRecord = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    const smokeReport = fs.readFileSync(reportPath, "utf8");
    if (smokeRecord.status !== "reviewed") {
      failures.push("converter issue #7 format smoke record must preserve reviewed status");
    }
    if (smokeRecord.minimumInputs?.license_or_no_reuse?.inputStatus !== "submitted") {
      failures.push("converter issue #7 format smoke must parse license_or_no_reuse from ## heading");
    }
    if (smokeRecord.minimumInputs?.weak_artifact_permission?.inputStatus !== "submitted") {
      failures.push("converter issue #7 format smoke must parse weak_artifact_permission from ## heading");
    }
    if (!smokeRecord.minimumInputs?.weak_artifact_permission?.ownerInput?.includes("Weak README excerpt")) {
      failures.push("converter issue #7 format smoke must preserve weak artifact excerpt");
    }
    if (!smokeRecord.minimumInputs?.weak_artifact_permission?.ownerInput?.includes("Redacted")) {
      failures.push("converter issue #7 format smoke must preserve checked publication preference");
    }
    if (!smokeReport.includes("ready for downstream conversion: yes")) {
      failures.push("converter issue #7 format smoke report must mark reviewed complete input as downstream ready");
    }
  }
}

if (failures.length) {
  console.error("\nMimesis owner proof input issue convert audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner proof input issue convert audit passed: issue markdown can become a bounded draft owner proof input record.");

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
    if (!content.includes(needle)) {
      failures.push(`${label}: missing ${needle}`);
    }
  }
}

const packageJson = readJson("package.json");
const commands = releaseCommands(packageJson);
const cli = read("bin/mimesis.mjs");
const snapshot = readJson(".mimesis/owner-actions/remote-proof-input-issue-snapshot.json");
const report = read(".mimesis/owner-actions/remote-proof-input-issue-snapshot.md");
const doc = read("docs/OWNER-PROOF-INPUT-REMOTE-ISSUE-SNAPSHOT.md");
const generator = read("tools/create-owner-proof-input-remote-issue-snapshot.mjs");
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

for (const scriptName of [
  "owner:proof-input-remote-issue-snapshot",
  "audit:owner-proof-input-remote-issue-snapshot",
]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
  if (!cli.includes(`"${scriptName}"`)) {
    failures.push(`CLI missing ${scriptName}`);
  }
}

if (!commands.includes("audit:owner-proof-input-remote-issue-snapshot")) {
  failures.push("release:check missing npm run audit:owner-proof-input-remote-issue-snapshot");
}

for (const [earlier, later] of [
  ["audit:owner-proof-input-remote-issue", "audit:owner-proof-input-remote-issue-snapshot"],
  ["audit:owner-proof-input-remote-issue-snapshot", "audit:owner-proof-input-issue-convert"],
  ["audit:owner-proof-input-remote-issue-snapshot", "audit:release-artifact-manifest"],
]) {
  requireBefore(commands, earlier, later);
}

requireIncludes("generator", generator, [
  "gh",
  "issue",
  "view",
  "bodySha256",
  "bodyStored",
  "bodyOmittedReason",
  "request_only_pending_owner",
  "checkedSafetyCount",
  "licenseChoiceChecked",
  "publicationChoiceChecked",
  "does_not_store_issue_body",
]);

if (snapshot.schema !== "mimesis.owner-proof-input-remote-issue-snapshot.v0.1") {
  failures.push("snapshot schema must be mimesis.owner-proof-input-remote-issue-snapshot.v0.1");
}

if (snapshot.issue?.url !== "https://github.com/svy04/mimesis-engineering/issues/7") {
  failures.push("snapshot issue URL must point to GitHub issue #7");
}

if (snapshot.issue?.number !== 7) {
  failures.push("snapshot issue number must be 7");
}

if (snapshot.bodyStored !== false) {
  failures.push("snapshot must set bodyStored false");
}

if ("body" in snapshot || "issueBody" in snapshot || "rawBody" in snapshot) {
  failures.push("snapshot must not store the raw issue body");
}

if (typeof snapshot.bodySha256 !== "string" || snapshot.bodySha256.length !== 64) {
  failures.push("snapshot must include a 64-character bodySha256");
}

if (!["request_only_pending_owner", "candidate_owner_input", "unsafe_blocked", "missing_or_unavailable"].includes(snapshot.ownerInputStatus)) {
  failures.push("snapshot ownerInputStatus must be a known bounded status");
}

if (snapshot.ownerInputStatus === "request_only_pending_owner" && snapshot.readyForLocalConversion !== false) {
  failures.push("request-only snapshots must not be ready for local conversion");
}

if (!Number.isInteger(snapshot.requiredSignals?.checkedSafetyCount)) {
  failures.push("snapshot requiredSignals.checkedSafetyCount must be an integer");
}

for (const signal of ["licenseChoiceChecked", "publicationChoiceChecked"]) {
  if (typeof snapshot.requiredSignals?.[signal] !== "boolean") {
    failures.push(`snapshot requiredSignals.${signal} must be a boolean`);
  }
}

for (const boundary of [
  "does_not_store_issue_body",
  "does_not_choose_license",
  "does_not_grant_permission",
  "does_not_create_external_proof",
  "does_not_close_gates",
]) {
  if (!snapshot.boundaries?.includes(boundary)) {
    failures.push(`snapshot missing boundary: ${boundary}`);
  }
}

requireIncludes("snapshot allowed/disallowed claims", JSON.stringify(snapshot), [
  "metadata-only",
  "not owner decision",
  "not permission",
  "not proof",
]);

requireIncludes("report", report, [
  "# Mimesis Remote Owner Proof Input Issue Snapshot",
  "body stored: no",
  "body sha256",
  "license choice checked",
  "publication choice checked",
  "safety confirmations checked",
  "not owner decision",
  "not proof",
  "does not store the raw issue body",
]);

requireIncludes("doc", doc, [
  "Owner Proof Input Remote Issue Snapshot",
  "owner:proof-input-remote-issue-snapshot",
  "audit:owner-proof-input-remote-issue-snapshot",
  "metadata-only",
  "does not store the raw issue body",
  "does not choose a license",
  "does not grant permission",
  "does not create external proof",
  "does not close gates",
]);

for (const relativePath of [
  "docs/OWNER-PROOF-INPUT-REMOTE-ISSUE-SNAPSHOT.md",
  ".mimesis/owner-actions/remote-proof-input-issue-snapshot.json",
  ".mimesis/owner-actions/remote-proof-input-issue-snapshot.md",
  "tools/create-owner-proof-input-remote-issue-snapshot.mjs",
  "tools/audit-owner-proof-input-remote-issue-snapshot.mjs",
]) {
  if (!validator.includes(relativePath)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${relativePath}`);
  }
}

for (const command of [
  "owner:proof-input-remote-issue-snapshot",
  "audit:owner-proof-input-remote-issue-snapshot",
]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/OWNER-PROOF-INPUT-REMOTE-ISSUE-SNAPSHOT.md",
  ".mimesis/owner-actions/remote-proof-input-issue-snapshot.json",
  ".mimesis/owner-actions/remote-proof-input-issue-snapshot.md",
  "tools/create-owner-proof-input-remote-issue-snapshot.mjs",
  "tools/audit-owner-proof-input-remote-issue-snapshot.mjs",
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
  if (!content.toLowerCase().includes("owner proof input remote issue snapshot")) {
    failures.push(`${label}: missing owner proof input remote issue snapshot text`);
  }
}

if (fs.existsSync(path.join(root, "tools", "create-owner-proof-input-remote-issue-snapshot.mjs"))) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-owner-proof-snapshot-"));
  const issueJsonPath = path.join(tmpDir, "issue.json");
  const outputPath = path.join(tmpDir, "snapshot.json");
  const reportPath = path.join(tmpDir, "snapshot.md");
  fs.writeFileSync(issueJsonPath, `${JSON.stringify({
    number: 77,
    title: "[Owner Proof Input]: fixture with unchecked safety",
    state: "OPEN",
    url: "https://github.com/svy04/mimesis-engineering/issues/77",
    labels: [{ name: "owner-proof-input" }],
    createdAt: "2026-06-11T00:00:00Z",
    updatedAt: "2026-06-11T00:00:00Z",
    body: `Status: owner input candidate fixture, not owner decision or proof.

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
Weak README excerpt that needs a clearer 30-second explanation path.
\`\`\`

Artifact owner:

\`\`\`text
Owner-reviewed fixture submitter
\`\`\`

Publication preference:

- [ ] Private review only
- [ ] Public
- [ ] Anonymized
- [x] Redacted

Redaction requirements:

\`\`\`text
Redact private names before public use.
\`\`\`

Proof boundary, meaning what this artifact/case must not claim:

\`\`\`text
Do not claim external adoption, benchmarked productivity, revenue, or publication.
\`\`\`

## Safety Confirmation

- [ ] I did not include secrets, passwords, tokens, or private customer data.
- [ ] I own or control the submitted artifact, or I have permission to submit the shown redacted excerpt/path/link for review.
- [ ] I understand this issue does not grant permission, approve proof, publish, or close gates.
`,
  }, null, 2)}\n`);

  const result = spawnSync(
    process.execPath,
    [
      "tools/create-owner-proof-input-remote-issue-snapshot.mjs",
      "--issue-json",
      issueJsonPath,
      "--output",
      outputPath,
      "--report",
      reportPath,
    ],
    { cwd: root, encoding: "utf8" },
  );

  if (result.status !== 0) {
    failures.push(`snapshot fixture smoke failed: ${result.stderr || result.stdout}`);
  } else {
    const smokeSnapshot = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    const smokeReport = fs.readFileSync(reportPath, "utf8");
    if (smokeSnapshot.issue?.number !== 77) {
      failures.push("snapshot fixture smoke must read --issue-json instead of live issue #7");
    }
    if (smokeSnapshot.ownerInputStatus !== "request_only_pending_owner") {
      failures.push("snapshot fixture smoke with unchecked safety confirmations must remain request_only_pending_owner");
    }
    if (smokeSnapshot.readyForLocalConversion !== false) {
      failures.push("snapshot fixture smoke with unchecked safety confirmations must not be ready for local conversion");
    }
    if (smokeSnapshot.requiredSignals?.licenseChoiceChecked !== true) {
      failures.push("snapshot fixture smoke must detect checked license choice");
    }
    if (smokeSnapshot.requiredSignals?.publicationChoiceChecked !== true) {
      failures.push("snapshot fixture smoke must detect checked publication preference");
    }
    if (smokeSnapshot.requiredSignals?.checkedSafetyCount !== 0) {
      failures.push("snapshot fixture smoke must count zero checked safety confirmations");
    }
    if (!smokeReport.includes("safety confirmations checked: 0")) {
      failures.push("snapshot fixture smoke report must show zero checked safety confirmations");
    }
  }
}

if (failures.length) {
  console.error("\nMimesis owner proof input remote issue snapshot audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner proof input remote issue snapshot audit passed: live issue metadata is bounded without storing the issue body.");

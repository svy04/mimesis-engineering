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

function runTool(args, options = {}) {
  return spawnSync(process.execPath, [path.join(root, "tools", "check-owner-evidence-submission-record.mjs"), ...args], {
    cwd: options.cwd ?? root,
    encoding: "utf8",
  });
}

const packageJson = readJson("package.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/OWNER-EVIDENCE-SUBMISSION-CHECK.md");
const report = read(".mimesis/owner-actions/fixture-evidence-submission-check.md");
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
const releaseCommands = commandList(packageJson);

if (
  packageJson.scripts?.["owner:evidence-submission-check"] !==
  "node tools/check-owner-evidence-submission-record.mjs .mimesis/owner-actions/fixture-evidence-submission-record.json --write-report .mimesis/owner-actions/fixture-evidence-submission-check.md"
) {
  failures.push("package.json missing script: owner:evidence-submission-check");
}

if (packageJson.scripts?.["audit:owner-evidence-submission-check"] !== "node tools/audit-owner-evidence-submission-check.mjs") {
  failures.push("package.json missing script: audit:owner-evidence-submission-check");
}

for (const command of ["owner:evidence-submission-check", "audit:owner-evidence-submission-check"]) {
  if (!releaseCommands.includes(command)) {
    failures.push(`release:check missing npm run ${command}`);
  }
  if (!cli.includes(`"${command}"`)) {
    failures.push(`CLI missing ${command} command`);
  }
}

for (const [earlier, later] of [
  ["owner:evidence-submission-record", "owner:evidence-submission-check"],
  ["owner:evidence-submission-check", "state:summary"],
  ["owner:evidence-submission-check", "gate:closure-readiness"],
  ["owner:evidence-submission-check", "release:artifact-manifest"],
  ["owner:evidence-submission-check", "audit:owner-evidence-submission-check"],
  ["audit:owner-evidence-submission-record", "audit:owner-evidence-submission-check"],
  ["audit:owner-evidence-submission-check", "audit:gate-closure-readiness"],
  ["audit:owner-evidence-submission-check", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

for (const text of [
  "owner evidence submission check",
  "not submitted owner evidence",
  "gates remain blocked",
  "--require-field weak_artifact_permission",
  "field-level readiness",
  "does not submit evidence",
  "does not attach evidence",
  "does not close gates",
  "does not create external proof",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/OWNER-EVIDENCE-SUBMISSION-CHECK.md missing text: ${text}`);
  }
}

for (const section of [
  "# Mimesis Owner Evidence Submission Check",
  "Status: not submitted owner evidence, gates remain blocked.",
  "## Source Record",
  "## Field Status",
  "## Gate Movement Gate",
  "## Safety Checks",
  "## Failures",
  "## Allowed Claim",
  "## Disallowed Claim",
  "## Boundary",
]) {
  if (!report.includes(section)) {
    failures.push(`owner evidence submission check report missing section: ${section}`);
  }
}

for (const text of [
  ".mimesis/owner-actions/fixture-evidence-submission-record.json",
  "not_submitted_owner_evidence",
  "submission fields: 6",
  "missing fields: 6",
  "required field: none",
  "field movement ready: no",
  "case movement ready: no",
  "does not submit evidence",
  "does not attach evidence",
  "does not close gates",
]) {
  if (!report.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`owner evidence submission check report missing text: ${text}`);
  }
}

for (const [name, content] of [
  ["README.md", readme],
  ["tools/README.md", toolsReadme],
  ["docs/COMPLETION-AUDIT.md", completion],
  ["STATUS.md", status],
  ["ROADMAP.md", roadmap],
  ["docs/V0.1-RELEASE-PACKET.md", releasePacket],
  ["docs/RELEASE-CHECK-ORDER.md", releaseOrderDoc],
]) {
  if (!content.toLowerCase().includes("owner evidence submission check")) {
    failures.push(`${name} missing owner evidence submission check text`);
  }
}

for (const requiredPath of [
  "docs/OWNER-EVIDENCE-SUBMISSION-CHECK.md",
  ".mimesis/owner-actions/fixture-evidence-submission-check.md",
  "tools/check-owner-evidence-submission-record.mjs",
  "tools/audit-owner-evidence-submission-check.mjs",
]) {
  if (!validator.includes(requiredPath)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${requiredPath}`);
  }
}

for (const command of ["owner:evidence-submission-check", "audit:owner-evidence-submission-check"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/owner-actions/fixture-evidence-submission-check.md")) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing owner evidence submission check report");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/OWNER-EVIDENCE-SUBMISSION-CHECK.md",
  ".mimesis/owner-actions/fixture-evidence-submission-check.md",
  "tools/check-owner-evidence-submission-record.mjs",
  "tools/audit-owner-evidence-submission-check.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (!failures.length) {
  const ok = runTool([
    ".mimesis/owner-actions/fixture-evidence-submission-record.json",
    "--write-report",
    path.join(os.tmpdir(), `mimesis-owner-evidence-submission-check-${process.pid}.md`),
  ]);
  if (ok.status !== 0) {
    failures.push(`owner evidence submission check fixture command failed:\n${ok.stdout}\n${ok.stderr}`.trim());
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-bad-owner-evidence-"));
  const badRecord = path.join(tmpDir, "bad-owner-evidence.json");
  fs.writeFileSync(
    badRecord,
    `${JSON.stringify(
      {
        schemaVersion: "0.1.0",
        status: "submitted",
        sourceForm: ".mimesis/owner-actions/evidence-attachment-form.md",
        sourceEvidenceRecord: ".mimesis/owner-actions/fixture-evidence-record.json",
        fields: {
          license_or_no_reuse: {
            submissionStatus: "submitted",
            ownerSubmittedEvidence: "oauth_token: abcdefghijk",
            blockedGateIds: ["owner_license_decision"],
            requiredAttachments: [],
            ownerAttachmentSlot: "",
            safetyCheck: "",
            boundary: "gates are closed",
          },
        },
        requiredGateIds: ["owner_license_decision"],
        safetyConfirmation: {
          noEvidenceSubmitted: false,
          noEvidenceAttached: false,
          noArtifactCollected: false,
          noPermissionGranted: false,
          noPublication: false,
          noExternalProof: false,
          noClosedGates: false,
        },
        prohibitedClaims: [],
        boundaries: [],
      },
      null,
      2,
    )}\n`,
  );

  const bad = runTool([badRecord, "--require-gate-ready"], { cwd: tmpDir });
  if (bad.status === 0) {
    failures.push("owner evidence submission check must reject unsafe submitted records when gate-ready evidence is required");
  }
  if (!`${bad.stdout}\n${bad.stderr}`.toLowerCase().includes("not ready")) {
    failures.push("owner evidence submission check rejection output must say not ready");
  }

  const missingField = runTool([
    ".mimesis/owner-actions/fixture-evidence-submission-record.json",
    "--require-field",
    "weak_artifact_permission",
  ]);
  if (missingField.status === 0) {
    failures.push("owner evidence submission check must reject missing fixture evidence when a required field is requested");
  }
  if (!`${missingField.stdout}\n${missingField.stderr}`.toLowerCase().includes("required field weak_artifact_permission")) {
    failures.push("owner evidence submission check missing-field rejection must name required field weak_artifact_permission");
  }

  const fixtureRecord = readJson(".mimesis/owner-actions/fixture-evidence-submission-record.json");
  const reviewedWeakArtifactRecord = path.join(tmpDir, "reviewed-weak-artifact-owner-evidence.json");
  fixtureRecord.status = "reviewed";
  fixtureRecord.fields.weak_artifact_permission = {
    ...fixtureRecord.fields.weak_artifact_permission,
    submissionStatus: "submitted",
    ownerSubmittedEvidence: "permissioned or clearly redacted weak artifact attached for field-level review only",
    ownerAttachmentSlot: "examples/permissioned-case-intake.md",
    safetyCheck: "owner confirms permission, redaction, submitter scope, and publication scope before case movement",
    boundary: "does not create external proof, close gates, publish, or prove adoption",
  };
  fs.writeFileSync(reviewedWeakArtifactRecord, `${JSON.stringify(fixtureRecord, null, 2)}\n`);

  const fieldReport = path.join(tmpDir, "reviewed-weak-artifact-field-check.md");
  const fieldReady = runTool([
    reviewedWeakArtifactRecord,
    "--require-field",
    "weak_artifact_permission",
    "--write-report",
    fieldReport,
  ]);
  if (fieldReady.status !== 0) {
    failures.push(`owner evidence submission check must accept reviewed weak_artifact_permission field evidence:\n${fieldReady.stdout}\n${fieldReady.stderr}`.trim());
  }
  const fieldReportText = fs.existsSync(fieldReport) ? fs.readFileSync(fieldReport, "utf8") : "";
  for (const text of [
    "required field: weak_artifact_permission",
    "field movement ready: yes",
    "gate movement ready: no",
    "reviewed owner evidence field, gates remain blocked until gate-specific review.",
  ]) {
    if (!fieldReportText.toLowerCase().includes(text.toLowerCase())) {
      failures.push(`field-level owner evidence report missing text: ${text}`);
    }
  }

  const wrongField = runTool([
    reviewedWeakArtifactRecord,
    "--require-field",
    "publication_scope",
  ]);
  if (wrongField.status === 0) {
    failures.push("owner evidence submission check must reject a requested field that remains missing");
  }
}

if (failures.length) {
  console.error("\nMimesis owner evidence submission check audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner evidence submission check audit passed: owner evidence submissions are checkable before gate movement.");

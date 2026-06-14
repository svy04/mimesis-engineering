#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const fixturePath = ".mimesis/owner-actions/fixture-owner-proof-input-remote-issue-candidate.json";
const privateDir = ".mimesis/private/audit/owner-proof-input-private-pipeline";
const exportedIssuePath = `${privateDir}/remote-proof-input-issue.md`;
const exportReportPath = `${privateDir}/remote-proof-input-issue-export.md`;
const convertedRecordPath = `${privateDir}/owner-proof-input-record.json`;
const conversionReportPath = `${privateDir}/owner-proof-input-conversion.md`;
const reviewReportPath = `${privateDir}/owner-proof-input-review.md`;
const reviewedRecordPath = `${privateDir}/reviewed-owner-proof-input-record.json`;
const checkReportPath = `${privateDir}/owner-proof-input-check.md`;
const splitDir = `${privateDir}/split`;
const splitReportPath = `${privateDir}/owner-proof-input-split.md`;

function full(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  const filePath = full(relativePath);
  if (!fs.existsSync(filePath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(filePath, "utf8");
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

function requireArrayIncludes(label, values, needles) {
  const set = new Set(Array.isArray(values) ? values : []);
  for (const needle of needles) {
    if (!set.has(needle)) {
      failures.push(`${label}: missing ${needle}`);
    }
  }
}

function requireSafetyTrue(label, record, fields) {
  for (const field of fields) {
    if (record.safetyConfirmation?.[field] !== true) {
      failures.push(`${label}: safetyConfirmation.${field} must be true`);
    }
  }
}

function cleanupPrivateAudit() {
  fs.rmSync(full(privateDir), {
    recursive: true,
    force: true,
  });
}

function runNode(args, label) {
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    failures.push(`${label} failed:\n${`${result.stdout}\n${result.stderr}`.trim()}`);
  }
  return result;
}

function requireGitIgnored(relativePath) {
  const ignored = spawnSync("git", ["check-ignore", relativePath], {
    cwd: root,
    encoding: "utf8",
  });
  if (ignored.status !== 0) {
    failures.push(`${relativePath} must be ignored by git`);
  }
}

function runPrivatePipelineSmoke() {
  cleanupPrivateAudit();

  runNode([
    "tools/export-owner-proof-input-remote-issue.mjs",
    "--issue-json",
    fixturePath,
    "--output",
    exportedIssuePath,
    "--report",
    exportReportPath,
  ], "private pipeline export");

  runNode([
    "tools/convert-owner-proof-input-issue.mjs",
    exportedIssuePath,
    "--output",
    convertedRecordPath,
    "--report",
    conversionReportPath,
    "--source",
    "private pipeline audit",
    "--status",
    "reviewed",
    "--require-complete",
  ], "private pipeline convert");

  runNode([
    "tools/review-owner-proof-input-record.mjs",
    convertedRecordPath,
    "--write-report",
    reviewReportPath,
    "--output-record",
    reviewedRecordPath,
    "--approve",
    "--require-approvable",
  ], "private pipeline review");

  runNode([
    "tools/check-owner-proof-input-record.mjs",
    reviewedRecordPath,
    "--require-ready",
    "--write-report",
    checkReportPath,
  ], "private pipeline check");

  runNode([
    "tools/split-owner-proof-input-record.mjs",
    reviewedRecordPath,
    "--output-dir",
    splitDir,
    "--report",
    splitReportPath,
    "--require-ready",
    "--force",
  ], "private pipeline split");

  for (const relativePath of [
    exportedIssuePath,
    exportReportPath,
    convertedRecordPath,
    conversionReportPath,
    reviewReportPath,
    reviewedRecordPath,
    checkReportPath,
    splitReportPath,
    `${splitDir}/owner-decision-answer-record.json`,
    `${splitDir}/owner-evidence-submission-record.json`,
  ]) {
    if (!fs.existsSync(full(relativePath))) {
      failures.push(`private pipeline did not write ${relativePath}`);
    }
    requireGitIgnored(relativePath);
  }

  const exportReport = fs.existsSync(full(exportReportPath)) ? fs.readFileSync(full(exportReportPath), "utf8") : "";
  const conversionReport = fs.existsSync(full(conversionReportPath)) ? fs.readFileSync(full(conversionReportPath), "utf8") : "";
  const reviewReport = fs.existsSync(full(reviewReportPath)) ? fs.readFileSync(full(reviewReportPath), "utf8") : "";
  const checkReport = fs.existsSync(full(checkReportPath)) ? fs.readFileSync(full(checkReportPath), "utf8") : "";
  const splitReport = fs.existsSync(full(splitReportPath)) ? fs.readFileSync(full(splitReportPath), "utf8") : "";
  const reviewedRecord = fs.existsSync(full(reviewedRecordPath)) ? JSON.parse(fs.readFileSync(full(reviewedRecordPath), "utf8")) : {};
  const decisionRecord = fs.existsSync(full(`${splitDir}/owner-decision-answer-record.json`))
    ? JSON.parse(fs.readFileSync(full(`${splitDir}/owner-decision-answer-record.json`), "utf8"))
    : {};
  const evidenceRecord = fs.existsSync(full(`${splitDir}/owner-evidence-submission-record.json`))
    ? JSON.parse(fs.readFileSync(full(`${splitDir}/owner-evidence-submission-record.json`), "utf8"))
    : {};

  requireIncludes("private pipeline export report", exportReport, [
    "owner input status: candidate_owner_input",
    "ready for local conversion: yes",
    "body export written: yes",
    "It does not close gates",
  ]);
  requireIncludes("private pipeline conversion report", conversionReport, [
    "converted status: reviewed",
    "ready for downstream conversion: yes",
    "does not grant permission",
    "does not close gates",
  ]);
  requireIncludes("private pipeline review report", reviewReport, [
    "reviewStatus: approved_candidate",
    "ready for reviewed record promotion: yes",
    "does not close gates",
  ]);
  requireIncludes("private pipeline check report", checkReport, [
    "ready for downstream conversion: yes",
    "does not close gates",
  ]);
  requireIncludes("private pipeline split report", splitReport, [
    "downstream records written: yes",
    "does not close gates",
  ]);

  if (reviewedRecord.status !== "reviewed") {
    failures.push("private pipeline reviewed owner proof input record must be reviewed");
  }
  if (decisionRecord.status !== "reviewed") {
    failures.push("private pipeline owner decision answer record must be reviewed");
  }
  if (decisionRecord.fields?.license_or_no_reuse?.answerStatus !== "answered") {
    failures.push("private pipeline decision record must route license_or_no_reuse as answered");
  }
  if (evidenceRecord.status !== "reviewed") {
    failures.push("private pipeline owner evidence submission record must be reviewed");
  }
  if (evidenceRecord.fields?.weak_artifact_permission?.submissionStatus !== "submitted") {
    failures.push("private pipeline evidence record must route weak_artifact_permission as submitted");
  }

  requireSafetyTrue("private pipeline reviewed owner proof input record", reviewedRecord, [
    "noPermissionGranted",
    "noPublication",
    "noExternalProof",
    "noProofApproval",
    "noClosedGates",
  ]);
  requireSafetyTrue("private pipeline owner decision answer record", decisionRecord, [
    "noPermissionGranted",
    "noPublication",
    "noExternalProof",
    "noClosedGates",
  ]);
  requireSafetyTrue("private pipeline owner evidence submission record", evidenceRecord, [
    "noEvidenceSubmitted",
    "noEvidenceAttached",
    "noPermissionGranted",
    "noPublication",
    "noExternalProof",
    "noClosedGates",
  ]);
  requireArrayIncludes("private pipeline reviewed owner proof input record boundaries", reviewedRecord.boundaries, [
    "does_not_grant_permission",
    "does_not_create_external_proof",
    "does_not_publish",
    "does_not_close_gates",
  ]);
  requireArrayIncludes("private pipeline owner decision answer record boundaries", decisionRecord.boundaries, [
    "does_not_grant_permission",
    "does_not_create_external_proof",
    "does_not_publish",
    "does_not_close_gates",
  ]);
  requireArrayIncludes("private pipeline owner evidence submission record boundaries", evidenceRecord.boundaries, [
    "does_not_grant_permission",
    "does_not_create_external_proof",
    "does_not_publish",
    "does_not_close_gates",
  ]);

  cleanupPrivateAudit();
}

const packageJson = readJson("package.json");
const commands = releaseCommands(packageJson);
const cli = read("bin/mimesis.mjs");
const doc = read("docs/OWNER-PROOF-INPUT-PRIVATE-PIPELINE.md");
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
const auditScript = read("tools/audit-owner-proof-input-private-pipeline.mjs");

const scriptName = "audit:owner-proof-input-private-pipeline";
if (!packageJson.scripts?.[scriptName]) {
  failures.push(`package.json missing script: ${scriptName}`);
}
if (!cli.includes(`"${scriptName}"`)) {
  failures.push(`CLI missing ${scriptName}`);
}
if (!commands.includes(scriptName)) {
  failures.push(`release:check missing npm run ${scriptName}`);
}

for (const [earlier, later] of [
  ["audit:owner-proof-input-remote-issue-export-candidate", scriptName],
  ["audit:owner-proof-input-issue-convert", scriptName],
  ["audit:owner-proof-input-review", scriptName],
  ["audit:owner-proof-input-split", scriptName],
  [scriptName, "audit:owner-evidence-submission-record"],
  [scriptName, "audit:release-artifact-manifest"],
]) {
  requireBefore(commands, earlier, later);
}

requireIncludes("private pipeline audit", auditScript, [
  fixturePath,
  "exportedIssuePath",
  "convertedRecordPath",
  "reviewedRecordPath",
  "owner-decision-answer-record.json",
  "owner-evidence-submission-record.json",
  "does not close gates",
]);

requireIncludes("doc", doc, [
  "Owner Proof Input Private Pipeline",
  "audit:owner-proof-input-private-pipeline",
  ".mimesis/private/audit/",
  "private export",
  "convert",
  "review",
  "check",
  "split",
  "does not close gates",
]);

for (const relativePath of [
  "docs/OWNER-PROOF-INPUT-PRIVATE-PIPELINE.md",
  "tools/audit-owner-proof-input-private-pipeline.mjs",
]) {
  if (!validator.includes(relativePath)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${relativePath}`);
  }
}

if (!frameworkManifest.commands?.some((entry) => entry.name === scriptName)) {
  failures.push(`.mimesis/framework-manifest.json commands missing ${scriptName}`);
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/OWNER-PROOF-INPUT-PRIVATE-PIPELINE.md",
  "tools/audit-owner-proof-input-private-pipeline.mjs",
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
  if (!content.toLowerCase().includes("owner proof input private pipeline")) {
    failures.push(`${label}: missing owner proof input private pipeline text`);
  }
}

if (!failures.length) {
  runPrivatePipelineSmoke();
}

if (failures.length) {
  cleanupPrivateAudit();
  console.error("\nMimesis owner proof input private pipeline audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner proof input private pipeline audit passed: private candidate export can convert, review, check, and split without proof or gate closure claims.");

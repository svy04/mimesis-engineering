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

function runNode(args, cwd) {
  return spawnSync(process.execPath, args, {
    cwd,
    encoding: "utf8",
  });
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

const packageJson = readJson("package.json");
const ownerAnswerSchema = readJson("spec/owner-decision-answer.schema.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/LICENSE-DECISION-FROM-OWNER-ANSWER.md");
const ownerAnswerDoc = read("docs/OWNER-DECISION-ANSWER-RECORD.md");
const releaseDecisionDoc = read("docs/RELEASE-DECISION-RECORD.md");
const toolsReadme = read("tools/README.md");
const completionAudit = read("docs/COMPLETION-AUDIT.md");
const releaseOrderDoc = read("docs/RELEASE-CHECK-ORDER.md");
const manifestGenerator = read("tools/create-framework-manifest.mjs");
const validator = read("tools/validate-mimesis.mjs");
const releaseArtifactGenerator = read("tools/create-release-artifact-manifest.mjs");
const fixture = readJson(".mimesis/owner-actions/fixture-answer-record.json");

for (const relativePath of [
  "tools/license-decision-from-owner-answer.mjs",
  "tools/audit-license-decision-from-owner-answer.mjs",
  "docs/LICENSE-DECISION-FROM-OWNER-ANSWER.md",
  ".mimesis/owner-actions/fixture-answer-record.json",
]) {
  read(relativePath);
}

for (const scriptName of ["license:decision-from-owner-answer", "audit:license-decision-from-owner-answer"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

const releaseCheck = packageJson.scripts?.["release:check"] ?? "";
for (const command of [
  "license:decision-from-owner-answer",
  "audit:license-decision-from-owner-answer",
]) {
  if (!releaseCheck.includes(command)) {
    failures.push(`release:check must include npm run ${command}`);
  }
}

for (const command of ["license:decision-from-owner-answer", "audit:license-decision-from-owner-answer"]) {
  if (!cli.includes(`"${command}"`)) {
    failures.push(`CLI missing ${command} command`);
  }
}

const combinedDocs = `${doc}\n${ownerAnswerDoc}\n${releaseDecisionDoc}\n${toolsReadme}\n${completionAudit}\n${releaseOrderDoc}`.toLowerCase();
for (const text of [
  "license decision from owner answer",
  "license_or_no_reuse",
  "reviewed owner answer",
  "does not provide legal advice",
  "does not publish",
  "does not create external proof",
  "does not close gates",
  "owner decision answer record",
]) {
  if (!combinedDocs.includes(text.toLowerCase())) {
    failures.push(`license answer bridge docs missing text: ${text}`);
  }
}

const noRealOwnerDecisionSchema = ownerAnswerSchema.properties
  ?.safetyConfirmation
  ?.properties
  ?.noRealOwnerDecision;
if (noRealOwnerDecisionSchema?.const === true) {
  failures.push("owner decision answer schema must allow reviewed owner decision records to set noRealOwnerDecision false");
}

for (const text of [
  "LICENSE-DECISION-FROM-OWNER-ANSWER.md",
  "license-decision-from-owner-answer.mjs",
  ".mimesis/release-decisions/from-owner-answer-bridge.md",
]) {
  if (!validator.includes(text)) {
    failures.push(`validate-mimesis must require ${text}`);
  }
}

if (!manifestGenerator.includes("license:decision-from-owner-answer")) {
  failures.push("framework manifest must include license:decision-from-owner-answer entry");
}

for (const artifactPath of [
  "docs/LICENSE-DECISION-FROM-OWNER-ANSWER.md",
  "tools/license-decision-from-owner-answer.mjs",
  "tools/audit-license-decision-from-owner-answer.mjs",
  ".mimesis/release-decisions/from-owner-answer-bridge.md",
]) {
  if (!releaseArtifactGenerator.includes(`"${artifactPath}"`)) {
    failures.push(`release artifact manifest generator missing artifact: ${artifactPath}`);
  }
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-license-owner-answer-"));

try {
  const defaultReport = runNode([
    path.join(root, "tools", "license-decision-from-owner-answer.mjs"),
    "--default-report",
    path.join(tempRoot, "blocked-report.md"),
  ], tempRoot);

  if (defaultReport.status !== 0) {
    failures.push(`license decision bridge default report failed: ${defaultReport.stderr || defaultReport.stdout}`);
  }

  const blockedReportPath = path.join(tempRoot, "blocked-report.md");
  if (fs.existsSync(blockedReportPath)) {
    const blockedReport = fs.readFileSync(blockedReportPath, "utf8").toLowerCase();
    for (const text of [
      "blocked",
      "license_or_no_reuse",
      "does not provide legal advice",
      "does not publish",
    ]) {
      if (!blockedReport.includes(text)) {
        failures.push(`default bridge report missing text: ${text}`);
      }
    }
  } else {
    failures.push("default bridge report was not written");
  }

  const reviewedRecord = structuredClone(fixture);
  reviewedRecord.status = "reviewed";
  reviewedRecord.safetyConfirmation = {
    ...reviewedRecord.safetyConfirmation,
    noRealOwnerDecision: false,
  };
  reviewedRecord.fields.license_or_no_reuse = {
    ...reviewedRecord.fields.license_or_no_reuse,
    answerStatus: "answered",
    ownerAnswer: "Owner chooses to keep the no-reuse boundary for v0.1 until a later explicit license decision.",
    currentSignal: "owner_answered_no_reuse_boundary",
    boundary: "records owner-provided no-reuse boundary; does not provide legal advice, publish, or close gates",
  };

  const reviewedPath = path.join(tempRoot, "reviewed-owner-answer.json");
  const decisionPath = path.join(tempRoot, "release-decision-record.json");
  writeJson(reviewedPath, reviewedRecord);

  const bridge = runNode([
    path.join(root, "tools", "license-decision-from-owner-answer.mjs"),
    reviewedPath,
    "--output",
    decisionPath,
    "--decision",
    "no_reuse_boundary",
    "--owner-confirmation",
    "Owner explicitly chose the no-reuse boundary for v0.1.",
    "--decision-evidence",
    "reviewed-owner-answer.json",
    "--confirm-owner-reviewed",
    "--confirm-not-legal-advice",
    "--confirm-no-publication",
  ], tempRoot);

  if (bridge.status !== 0) {
    failures.push(`license decision bridge reviewed smoke failed: ${bridge.stderr || bridge.stdout}`);
  }

  if (fs.existsSync(decisionPath)) {
    const decisionRecord = JSON.parse(fs.readFileSync(decisionPath, "utf8"));
    if (decisionRecord.schema !== "mimesis.release-decision-record.v0.1") {
      failures.push("decision bridge output schema must be mimesis.release-decision-record.v0.1");
    }
    if (decisionRecord.status !== "owner_license_decision_recorded_not_publication") {
      failures.push("decision bridge output status must record owner license decision without publication");
    }
    if (decisionRecord.license?.decision !== "no_reuse_boundary") {
      failures.push("decision bridge output license decision must preserve no_reuse_boundary");
    }
    if (!decisionRecord.license?.ownerAnswer?.includes("no-reuse boundary")) {
      failures.push("decision bridge output must preserve owner answer text");
    }
    if (!decisionRecord.license?.boundary?.toLowerCase().includes("does not provide legal advice")) {
      failures.push("decision bridge output license boundary must preserve legal-advice boundary");
    }
    if (!decisionRecord.boundaries?.includes("does_not_provide_legal_advice")) {
      failures.push("decision bridge output missing does_not_provide_legal_advice boundary");
    }
    if (decisionRecord.publicRelease?.decision !== "pending") {
      failures.push("decision bridge output must leave publicRelease pending");
    }
    if (decisionRecord.npmPublication?.decision !== "blocked") {
      failures.push("decision bridge output must leave npmPublication blocked");
    }
    if (decisionRecord.externalProof?.decision !== "waiting_for_artifact") {
      failures.push("decision bridge output must leave externalProof waiting_for_artifact");
    }
  } else {
    failures.push("decision bridge smoke did not write release decision output");
  }

  const defaultFixtureReject = runNode([
    path.join(root, "tools", "license-decision-from-owner-answer.mjs"),
    path.join(root, ".mimesis", "owner-actions", "fixture-answer-record.json"),
    "--output",
    path.join(tempRoot, "must-not-exist.json"),
    "--decision",
    "no_reuse_boundary",
    "--owner-confirmation",
    "fixture should not pass",
    "--decision-evidence",
    "fixture-answer-record.json",
    "--confirm-owner-reviewed",
    "--confirm-not-legal-advice",
    "--confirm-no-publication",
  ], tempRoot);

  if (defaultFixtureReject.status === 0) {
    failures.push("license decision bridge must reject the pending owner answer fixture");
  }

  const missingConfirmationReject = runNode([
    path.join(root, "tools", "license-decision-from-owner-answer.mjs"),
    reviewedPath,
    "--output",
    path.join(tempRoot, "unsafe-release-decision-record.json"),
    "--decision",
    "no_reuse_boundary",
  ], tempRoot);

  if (missingConfirmationReject.status === 0) {
    failures.push("license decision bridge must reject missing owner/legal/publication confirmations");
  }

  const missingLicenseNameReject = runNode([
    path.join(root, "tools", "license-decision-from-owner-answer.mjs"),
    reviewedPath,
    "--output",
    path.join(tempRoot, "missing-license-name.json"),
    "--decision",
    "reuse_license_selected",
    "--owner-confirmation",
    "Owner selected a reuse license.",
    "--decision-evidence",
    "reviewed-owner-answer.json",
    "--confirm-owner-reviewed",
    "--confirm-not-legal-advice",
    "--confirm-no-publication",
  ], tempRoot);

  if (missingLicenseNameReject.status === 0) {
    failures.push("reuse_license_selected bridge path must require --license-name");
  }
} finally {
  if (tempRoot.startsWith(os.tmpdir())) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

if (failures.length) {
  console.error("\nMimesis license decision from owner answer audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis license decision from owner answer audit passed: reviewed owner license answers can become bounded release decision candidates.");

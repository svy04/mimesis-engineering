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
const cli = read("bin/mimesis.mjs");
const doc = read("docs/PROOF-INTAKE-FROM-OWNER-EVIDENCE.md");
const toolsReadme = read("tools/README.md");
const completionAudit = read("docs/COMPLETION-AUDIT.md");
const releaseOrderDoc = read("docs/RELEASE-CHECK-ORDER.md");
const manifestGenerator = read("tools/create-framework-manifest.mjs");
const validator = read("tools/validate-mimesis.mjs");
const fixture = readJson(".mimesis/owner-actions/fixture-evidence-submission-record.json");

for (const relativePath of [
  "tools/proof-intake-from-owner-evidence.mjs",
  "tools/audit-proof-intake-from-owner-evidence.mjs",
  "docs/PROOF-INTAKE-FROM-OWNER-EVIDENCE.md",
  ".mimesis/owner-actions/fixture-evidence-submission-record.json",
]) {
  read(relativePath);
}

for (const scriptName of ["proof:intake-from-owner-evidence", "audit:proof-intake-from-owner-evidence"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

const releaseCheck = packageJson.scripts?.["release:check"] ?? "";
for (const command of [
  "proof:intake-from-owner-evidence",
  "audit:proof-intake-from-owner-evidence",
]) {
  if (!releaseCheck.includes(command)) {
    failures.push(`release:check must include npm run ${command}`);
  }
}

for (const command of ["proof:intake-from-owner-evidence", "audit:proof-intake-from-owner-evidence"]) {
  if (!cli.includes(`"${command}"`)) {
    failures.push(`CLI missing ${command} command`);
  }
}

const combinedDocs = `${doc}\n${toolsReadme}\n${completionAudit}\n${releaseOrderDoc}`.toLowerCase();
for (const text of [
  "proof intake from owner evidence",
  "weak_artifact_permission",
  "does not grant permission",
  "does not create external proof",
  "does not close gates",
  "owner evidence submission record",
]) {
  if (!combinedDocs.includes(text.toLowerCase())) {
    failures.push(`owner-evidence bridge docs missing text: ${text}`);
  }
}

for (const text of [
  "PROOF-INTAKE-FROM-OWNER-EVIDENCE.md",
  "proof-intake-from-owner-evidence.mjs",
]) {
  if (!validator.includes(text)) {
    failures.push(`validate-mimesis must require ${text}`);
  }
}

if (!manifestGenerator.includes("proof:intake-from-owner-evidence")) {
  failures.push("framework manifest must include proof:intake-from-owner-evidence entry");
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-owner-evidence-bridge-"));

try {
  const reviewedRecord = structuredClone(fixture);
  reviewedRecord.status = "reviewed";
  reviewedRecord.fields.weak_artifact_permission = {
    ...reviewedRecord.fields.weak_artifact_permission,
    submissionStatus: "submitted",
    ownerSubmittedEvidence: [
      "# Weak Artifact",
      "",
      "This is an owner-submitted weak README excerpt for a local Mimesis case.",
      "It contains no secrets, no private customer data, and no copied protected material.",
      "The owner permits redacted framework review only.",
    ].join("\n"),
    ownerAttachmentSlot: "owner-submitted weak artifact text included in the reviewed record",
    safetyCheck: "owner reviewed this weak artifact and permits redacted framework review only",
    boundary: "does not grant permission, create external proof, publish, or close gates",
  };

  const reviewedPath = path.join(tempRoot, "reviewed-owner-evidence.json");
  const proofRecordPath = path.join(tempRoot, "proof-intake-record.json");
  writeJson(reviewedPath, reviewedRecord);

  const bridge = runNode([
    path.join(root, "tools", "proof-intake-from-owner-evidence.mjs"),
    reviewedPath,
    "--output",
    proofRecordPath,
    "--submitter",
    "owner-reviewed weak artifact bridge audit",
    "--artifact-owner",
    "owner-confirmed weak artifact owner",
    "--permission-status",
    "owner permits redacted framework review only; this is not publication permission",
    "--publication-preference",
    "redacted",
    "--redaction-requirements",
    "redact identifying and private details before any public use",
    "--reference",
    "reference-packs/github-readme.md",
    "--desired-transformation",
    "Transform the submitted weak artifact into a clearer Mimesis case artifact while preserving proof boundaries.",
    "--confirm-no-secrets",
    "--confirm-no-private-customer-data",
    "--confirm-no-copied-protected-material",
  ], tempRoot);

  if (bridge.status !== 0) {
    failures.push(`proof:intake-from-owner-evidence smoke failed: ${bridge.stderr || bridge.stdout}`);
  }

  if (fs.existsSync(proofRecordPath)) {
    const proofRecord = JSON.parse(fs.readFileSync(proofRecordPath, "utf8"));
    if (proofRecord.schemaVersion !== "0.1.0") {
      failures.push("bridge output schemaVersion must be 0.1.0");
    }
    if (proofRecord.status !== "reviewed") {
      failures.push("bridge output status must be reviewed");
    }
    if (proofRecord.publicationPreference !== "redacted") {
      failures.push("bridge output publicationPreference must preserve redacted preference");
    }
    if (!proofRecord.startingArtifact?.includes("owner-submitted weak README excerpt")) {
      failures.push("bridge output must carry the submitted weak artifact");
    }
    if (!proofRecord.proofBoundary?.some((item) => item.includes("does not grant permission"))) {
      failures.push("bridge output proofBoundary must preserve no-permission boundary");
    }
    if (!proofRecord.prohibitedClaims?.some((item) => item.includes("external adoption"))) {
      failures.push("bridge output prohibitedClaims must forbid external adoption claims");
    }
    if (proofRecord.safetyConfirmation?.noSecrets !== true) {
      failures.push("bridge output must require noSecrets confirmation");
    }
  } else {
    failures.push("bridge smoke did not write proof intake output");
  }

  const defaultFixtureReject = runNode([
    path.join(root, "tools", "proof-intake-from-owner-evidence.mjs"),
    path.join(root, ".mimesis", "owner-actions", "fixture-evidence-submission-record.json"),
    "--output",
    path.join(tempRoot, "must-not-exist.json"),
    "--confirm-no-secrets",
    "--confirm-no-private-customer-data",
    "--confirm-no-copied-protected-material",
  ], tempRoot);

  if (defaultFixtureReject.status === 0) {
    failures.push("bridge must reject the not-submitted owner evidence fixture");
  }

  const noSafetyReject = runNode([
    path.join(root, "tools", "proof-intake-from-owner-evidence.mjs"),
    reviewedPath,
    "--output",
    path.join(tempRoot, "unsafe-proof-intake-record.json"),
  ], tempRoot);

  if (noSafetyReject.status === 0) {
    failures.push("bridge must reject missing explicit safety confirmations");
  }

  if (fs.existsSync(proofRecordPath)) {
    const check = runNode([
      path.join(root, "tools", "check-proof-intake-record.mjs"),
      proofRecordPath,
      "--require-case-ready",
    ], tempRoot);

    if (check.status !== 0) {
      failures.push(`bridge output must pass proof-intake-check: ${check.stderr || check.stdout}`);
    }

    const caseOut = path.join(tempRoot, "owner-bridge-case");
    const fromRecord = runNode([
      path.join(root, "tools", "case-from-record.mjs"),
      proofRecordPath,
      "--title",
      "Owner Evidence Bridge Case",
      "--out",
      caseOut,
    ], tempRoot);

    if (fromRecord.status !== 0) {
      failures.push(`bridge output must create a started case: ${fromRecord.stderr || fromRecord.stdout}`);
    }

    const caseCheck = runNode([
      path.join(root, "tools", "check-case.mjs"),
      caseOut,
    ], tempRoot);

    if (caseCheck.status === 0) {
      failures.push("bridge-created case must not pass case:check before transformation");
    }
  }
} finally {
  if (tempRoot.startsWith(os.tmpdir())) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

if (failures.length) {
  console.error("\nMimesis proof-intake-from-owner-evidence audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis proof-intake-from-owner-evidence audit passed: reviewed weak owner evidence can become a checked proof intake record.");

#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scriptId = "review-owner-proof-input-record";
const args = process.argv.slice(2);
const flags = new Map();
const positional = [];

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg.startsWith("--")) {
    const key = arg.slice(2);
    const next = args[index + 1];
    if (next && !next.startsWith("--")) {
      flags.set(key, next);
      index += 1;
    } else {
      flags.set(key, true);
    }
  } else {
    positional.push(arg);
  }
}

const requiredFields = ["license_or_no_reuse", "weak_artifact_permission"];
const requiredBoundaries = [
  "does_not_choose_license",
  "does_not_submit_artifact",
  "does_not_grant_permission",
  "does_not_create_external_proof",
  "does_not_approve_proof",
  "does_not_publish",
  "does_not_close_gates",
];
const placeholderPattern = /\bTBD\b|<fill|TODO|pending owner input|not provided|none yet/i;
const secretPattern = /\b(api[_-]?key|secret|password|token|oauth[_-]?token)\b\s*[:=]\s*["']?[A-Za-z0-9._\-]{8,}/i;

function usage() {
  console.log(`Usage: mimesis owner:proof-input-review [path/to/owner-proof-input-record.json] [--write-report path/to/report.md] [--output-record path/to/reviewed.json] [--approve] [--allow-fixture] [--require-approvable]

Reviews a draft owner proof input record before it can be treated as reviewed.
It does not choose a license, submit an artifact, grant permission, create external proof, approve proof, publish, or close gates.
Script: ${scriptId}.
`);
}

function resolveInput(inputPath) {
  const cwdPath = path.resolve(process.cwd(), inputPath);
  if (fs.existsSync(cwdPath)) {
    return cwdPath;
  }
  const repoPath = path.resolve(root, inputPath);
  if (fs.existsSync(repoPath)) {
    return repoPath;
  }
  return cwdPath;
}

function resolveOutput(outputPath) {
  return path.resolve(process.cwd(), outputPath);
}

function displayPath(filePath) {
  const repoRelative = path.relative(root, filePath);
  if (!repoRelative.startsWith("..") && !path.isAbsolute(repoRelative)) {
    return repoRelative.replaceAll(path.sep, "/");
  }
  return path.relative(process.cwd(), filePath).replaceAll(path.sep, "/") || filePath;
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`Owner proof input record is not valid JSON: ${error.message}`);
    process.exit(1);
  }
}

function writeText(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function stableStringify(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function list(items) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- none";
}

function isFixtureRecord(record, recordPath) {
  const haystack = `${displayPath(recordPath)} ${record.sourceIssue ?? ""} ${record.sourceReview ?? ""}`;
  return haystack.includes("fixture-owner-proof-input-issue");
}

function validateReview(record, recordPath, allowFixture) {
  const failures = [];
  const warnings = [];
  const fixture = isFixtureRecord(record, recordPath);

  if (record.schemaVersion !== "0.1.0") {
    failures.push("schemaVersion must be 0.1.0");
  }
  if (!["draft", "reviewed"].includes(record.status)) {
    failures.push("status must be draft or reviewed before owner proof input review");
  }
  if (!record.sourceHandoff || placeholderPattern.test(record.sourceHandoff)) {
    failures.push("sourceHandoff must be filled and not placeholder text");
  }

  for (const fieldName of requiredFields) {
    const field = record.minimumInputs?.[fieldName];
    if (!field) {
      failures.push(`minimumInputs missing ${fieldName}`);
      continue;
    }
    if (field.inputStatus !== "submitted") {
      failures.push(`${fieldName}.inputStatus must be submitted before review approval`);
    }
    if (!field.ownerInput || placeholderPattern.test(field.ownerInput)) {
      failures.push(`${fieldName}.ownerInput must be filled and not placeholder text`);
    }
    if (!Array.isArray(field.reviewChecklist) || field.reviewChecklist.length === 0) {
      failures.push(`${fieldName}.reviewChecklist must include review items`);
    }
    if (!field.boundary || !/does not/i.test(field.boundary)) {
      failures.push(`${fieldName}.boundary must preserve a does-not boundary`);
    }
  }

  for (const [key, expected] of Object.entries({
    noOwnerDecisionMade: true,
    noArtifactSubmitted: true,
    noFrameworkChosenLicense: true,
    noPermissionGranted: true,
    noPublication: true,
    noExternalProof: true,
    noProofApproval: true,
    noClosedGates: true,
  })) {
    if (record.safetyConfirmation?.[key] !== expected) {
      failures.push(`safetyConfirmation.${key} must be true`);
    }
  }

  for (const boundary of requiredBoundaries) {
    if (!record.boundaries?.includes(boundary)) {
      failures.push(`boundaries missing ${boundary}`);
    }
  }

  if (secretPattern.test(JSON.stringify(record))) {
    failures.push("record appears to include a secret, token, password, OAuth token, or API key");
  }
  if (fixture && !allowFixture) {
    warnings.push("fixture record is intentionally blocked from review promotion without --allow-fixture");
  }
  if (record.status === "reviewed") {
    warnings.push("record is already reviewed; this review report does not add proof or close gates");
  }

  const approvable = failures.length === 0 && (!fixture || allowFixture);
  const reviewStatus = approvable ? "approved_candidate" : fixture ? "blocked_fixture" : "blocked";

  return {
    failures,
    warnings,
    fixture,
    approvable,
    reviewStatus,
  };
}

function buildReport({ record, recordPath, reportPath, outputRecordPath, reviewStatus, failures, warnings, approvable, approve }) {
  return `# Mimesis Owner Proof Input Review

Status: fixture owner proof input review, not owner decision or proof.

This report reviews a draft owner proof input record before it can be treated as reviewed.
It is not an owner decision, submitted artifact, permission grant, external proof, proof approval, publication, or gate closure.

## Source

- source record: \`${displayPath(recordPath)}\`
- report: \`${displayPath(reportPath)}\`
- output record: ${outputRecordPath ? `\`${displayPath(outputRecordPath)}\`` : "not written"}
- source status: ${record.status ?? "missing"}
- reviewStatus: ${reviewStatus}
- explicit approve flag: ${approve ? "yes" : "no"}
- ready for reviewed record promotion: ${approvable && approve ? "yes" : "no"}

## Minimum Inputs

- license_or_no_reuse status: ${record.minimumInputs?.license_or_no_reuse?.inputStatus ?? "missing"}
- weak_artifact_permission status: ${record.minimumInputs?.weak_artifact_permission?.inputStatus ?? "missing"}

## Warnings

${list(warnings)}

## Failures

${list(failures)}

## Allowed Claim

Mimesis can review whether a draft owner proof input record is ready to become a reviewed record candidate.

## Disallowed Claim

The owner proof input review does not choose a license.
It does not submit an artifact.
It does not grant permission.
It does not create external proof.
It does not approve proof.
It does not publish.
It does not close gates.

## Boundary

Reviewed owner proof input records still require owner proof input check, split, downstream owner answer/evidence checks, proof intake, proof execution, evidence review, and gate review before any stronger claim.
`;
}

if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

const recordArg = positional[0] || ".mimesis/owner-actions/fixture-owner-proof-input-issue-record.json";
const recordPath = resolveInput(recordArg);
const reportArg = flags.get("write-report") === true || !flags.has("write-report")
  ? ".mimesis/owner-actions/fixture-proof-input-review.md"
  : String(flags.get("write-report"));
const outputRecordArg = flags.get("output-record");
const reportPath = resolveOutput(reportArg);
const outputRecordPath = outputRecordArg && outputRecordArg !== true ? resolveOutput(String(outputRecordArg)) : null;
const approve = flags.has("approve");
const allowFixture = flags.has("allow-fixture");
const requireApprovable = flags.has("require-approvable");

if (!fs.existsSync(recordPath) || !fs.statSync(recordPath).isFile()) {
  console.error(`Owner proof input record file does not exist: ${recordPath}`);
  process.exit(1);
}

const record = readJson(recordPath);
const { failures, warnings, approvable, reviewStatus } = validateReview(record, recordPath, allowFixture);

if (outputRecordPath && approve && approvable) {
  writeText(outputRecordPath, stableStringify({
    ...record,
    status: "reviewed",
    sourceReview: displayPath(reportPath),
  }));
}

const report = buildReport({
  record,
  recordPath,
  reportPath,
  outputRecordPath,
  reviewStatus,
  failures,
  warnings,
  approvable,
  approve,
});
writeText(reportPath, report);
console.log(`[owner-proof-input-review] ${displayPath(reportPath)}`);
if (outputRecordPath && approve && approvable) {
  console.log(`[owner-proof-input-review] ${displayPath(outputRecordPath)}`);
}

if ((requireApprovable || approve) && !approvable) {
  console.error("\nOwner proof input review is not approvable:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  for (const warning of warnings) {
    console.error(`[warn] ${warning}`);
  }
  process.exit(1);
}

console.log(`Mimesis owner proof input review checked: ${reviewStatus}; gates remain blocked.`);

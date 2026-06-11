#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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

const secretPattern = /\b(api[_-]?key|secret|password|token|oauth[_-]?token)\b\s*[:=]\s*["']?[A-Za-z0-9._\-]{8,}/i;
const placeholderPattern = /\bTBD\b|<fill|TODO|not provided|none yet/i;
const requiredFields = [
  "license_or_no_reuse",
  "weak_artifact_permission",
  "publication_scope",
  "package_action_plugin_scope",
  "benchmark_adoption_scope",
  "strict_sync_intent",
];
const requiredBoundaries = [
  "does_not_submit_evidence",
  "does_not_attach_evidence",
  "does_not_choose_license",
  "does_not_collect_artifact",
  "does_not_grant_permission",
  "does_not_publish",
  "does_not_create_external_proof",
  "does_not_close_gates",
];

function usage() {
  console.log(`Usage: mimesis owner:evidence-submission-check [path/to/owner-evidence-submission-record.json] [--require-gate-ready] [--write-report path/to/report.md]

Checks a schema-shaped owner evidence submission record before it can influence gate movement.
It does not submit evidence, attach evidence, choose a license, create proof, publish, or close gates.
`);
}

function resolveInput(inputPath) {
  const cwdPath = path.resolve(process.cwd(), inputPath);
  if (fs.existsSync(cwdPath)) {
    return cwdPath;
  }
  const repoPath = path.resolve(repoRoot, inputPath);
  if (fs.existsSync(repoPath)) {
    return repoPath;
  }
  return cwdPath;
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`Owner evidence submission record is not valid JSON: ${error.message}`);
    process.exit(1);
  }
}

function displayPath(filePath) {
  const repoRelative = path.relative(repoRoot, filePath);
  if (!repoRelative.startsWith("..") && !path.isAbsolute(repoRelative)) {
    return repoRelative.replaceAll(path.sep, "/");
  }
  return path.relative(process.cwd(), filePath).replaceAll(path.sep, "/") || filePath;
}

function listStatus(items) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- none";
}

function arrayIncludesAll(source, expected) {
  return expected.every((item) => source?.includes(item));
}

function validateRecord(record, requireGateReady) {
  const failures = [];
  const warnings = [];
  const requiredKeys = [
    "schemaVersion",
    "status",
    "sourceForm",
    "sourceEvidenceRecord",
    "fields",
    "requiredGateIds",
    "safetyConfirmation",
    "prohibitedClaims",
    "boundaries",
  ];

  for (const key of requiredKeys) {
    if (!(key in record)) {
      failures.push(`record missing required property: ${key}`);
    }
  }

  if (record.schemaVersion !== "0.1.0") {
    failures.push("schemaVersion must be 0.1.0");
  }

  if (!["not_submitted_owner_evidence", "draft", "reviewed", "rejected"].includes(record.status)) {
    failures.push("status must be not_submitted_owner_evidence, draft, reviewed, or rejected");
  }

  if (!record.sourceForm || placeholderPattern.test(record.sourceForm)) {
    failures.push("sourceForm must be filled and not placeholder text");
  }

  if (!record.sourceEvidenceRecord || placeholderPattern.test(record.sourceEvidenceRecord)) {
    failures.push("sourceEvidenceRecord must be filled and not placeholder text");
  }

  const fields = record.fields ?? {};
  for (const fieldName of requiredFields) {
    const field = fields[fieldName];
    if (!field) {
      failures.push(`fields missing required owner evidence field: ${fieldName}`);
      continue;
    }

    if (!["missing", "submitted", "blocked", "not_in_scope"].includes(field.submissionStatus)) {
      failures.push(`${fieldName}.submissionStatus must be missing, submitted, blocked, or not_in_scope`);
    }

    if (!field.ownerSubmittedEvidence || placeholderPattern.test(field.ownerSubmittedEvidence)) {
      failures.push(`${fieldName}.ownerSubmittedEvidence must be filled and not placeholder text`);
    }

    if (!Array.isArray(field.blockedGateIds) || field.blockedGateIds.length === 0) {
      failures.push(`${fieldName}.blockedGateIds must list at least one gate`);
    }

    if (!Array.isArray(field.requiredAttachments) || field.requiredAttachments.length === 0) {
      failures.push(`${fieldName}.requiredAttachments must list at least one attachment`);
    }

    if (!field.ownerAttachmentSlot || placeholderPattern.test(field.ownerAttachmentSlot)) {
      failures.push(`${fieldName}.ownerAttachmentSlot must be filled and not placeholder text`);
    }

    if (!field.safetyCheck || placeholderPattern.test(field.safetyCheck)) {
      failures.push(`${fieldName}.safetyCheck must be filled and not placeholder text`);
    }

    if (!field.boundary || !/does not/i.test(field.boundary)) {
      failures.push(`${fieldName}.boundary must preserve a does-not boundary`);
    }
  }

  const safety = record.safetyConfirmation ?? {};
  for (const [key, value] of Object.entries({
    noEvidenceSubmitted: safety.noEvidenceSubmitted,
    noEvidenceAttached: safety.noEvidenceAttached,
    noArtifactCollected: safety.noArtifactCollected,
    noPermissionGranted: safety.noPermissionGranted,
    noPublication: safety.noPublication,
    noExternalProof: safety.noExternalProof,
    noClosedGates: safety.noClosedGates,
  })) {
    if (value !== true) {
      failures.push(`safetyConfirmation.${key} must be true`);
    }
  }

  if (!Array.isArray(record.prohibitedClaims) || record.prohibitedClaims.length === 0) {
    failures.push("prohibitedClaims must include at least one forbidden claim");
  }

  if (!arrayIncludesAll(record.boundaries, requiredBoundaries)) {
    failures.push("boundaries must include all no-submission/no-evidence/no-closure boundary names");
  }

  if (secretPattern.test(JSON.stringify(record))) {
    failures.push("record appears to include a secret, token, password, OAuth token, or API key");
  }

  const fieldValues = Object.values(fields);
  const missingFields = fieldValues.filter((field) => field?.submissionStatus !== "submitted");
  const submittedFields = fieldValues.filter((field) => field?.submissionStatus === "submitted");

  if (submittedFields.length > 0) {
    warnings.push("submitted owner evidence still needs gate-specific review before any closure claim");
  }

  if (requireGateReady) {
    if (record.status !== "reviewed") {
      failures.push("record status must be reviewed before gate movement");
    }
    if (missingFields.length > 0) {
      failures.push("all owner evidence fields must be submitted before gate movement");
    }
  }

  return {
    failures,
    warnings,
    fieldCount: fieldValues.length,
    missingCount: missingFields.length,
    submittedCount: submittedFields.length,
  };
}

if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

const recordArg = positional[0] || flags.get("record") || ".mimesis/owner-actions/fixture-evidence-submission-record.json";
const requireGateReady = flags.has("require-gate-ready");
const writeReport = flags.has("write-report");
const reportArg = flags.get("write-report") === true
  ? ".mimesis/owner-actions/fixture-evidence-submission-check.md"
  : flags.get("write-report");

const recordPath = resolveInput(String(recordArg));
if (!fs.existsSync(recordPath) || !fs.statSync(recordPath).isFile()) {
  console.error(`Owner evidence submission record file does not exist: ${recordPath}`);
  process.exit(1);
}

const record = readJson(recordPath);
const { failures, warnings, fieldCount, missingCount, submittedCount } = validateRecord(record, requireGateReady);
const source = displayPath(recordPath);
const gateMovementReady = failures.length === 0 && missingCount === 0 && record.status === "reviewed";
const reportStatus = failures.length
  ? "not ready owner evidence submission, gates remain blocked."
  : missingCount > 0
    ? "not submitted owner evidence, gates remain blocked."
    : "reviewed owner evidence submission, gates remain blocked until gate-specific review.";
const reportPath = reportArg ? path.resolve(process.cwd(), String(reportArg)) : null;

const report = `# Mimesis Owner Evidence Submission Check

Status: ${reportStatus}

This report checks a schema-shaped owner evidence submission record before gate movement.
It is not submitted evidence, attached evidence, an owner decision, publication, external proof, or gate closure.

## Source Record

- record: \`${source}\`
- schemaVersion: ${record.schemaVersion ?? "missing"}
- status: ${record.status ?? "missing"}
- source form: ${record.sourceForm ?? "missing"}
- source evidence record: ${record.sourceEvidenceRecord ?? "missing"}

## Field Status

- submission fields: ${fieldCount}
- missing fields: ${missingCount}
- submitted fields: ${submittedCount}
- required gate ids: ${Array.isArray(record.requiredGateIds) ? record.requiredGateIds.length : 0}

## Gate Movement Gate

- require gate ready: ${requireGateReady}
- case movement ready: ${gateMovementReady ? "yes" : "no"}
- gate movement ready: ${gateMovementReady ? "yes" : "no"}
- next command: \`npm run gate:closure-readiness && npm run audit:gate-closure-readiness\`

## Safety Checks

- no evidence submitted: ${record.safetyConfirmation?.noEvidenceSubmitted === true}
- no evidence attached: ${record.safetyConfirmation?.noEvidenceAttached === true}
- no artifact collected: ${record.safetyConfirmation?.noArtifactCollected === true}
- no permission granted: ${record.safetyConfirmation?.noPermissionGranted === true}
- no publication: ${record.safetyConfirmation?.noPublication === true}
- no external proof: ${record.safetyConfirmation?.noExternalProof === true}
- no closed gates: ${record.safetyConfirmation?.noClosedGates === true}
- heuristic secret scan: ${secretPattern.test(JSON.stringify(record)) ? "failed" : "clear"}

## Warnings

${listStatus(warnings)}

## Failures

${listStatus(failures)}

## Allowed Claim

Mimesis can check an owner evidence submission record before gate movement.

## Disallowed Claim

The owner evidence submission check does not submit evidence.
It does not attach evidence.
It does not choose a license.
It does not collect an artifact.
It does not grant permission.
It does not publish.
It does not create external proof.
It does not prove adoption.
It does not close gates.

## Boundary

This is a local owner evidence submission check.
It does not replace owner review, legal review, permission review, evidence packet review, release review, or gate-specific closure evidence.
`;

if (writeReport) {
  const outputPath = reportPath ?? path.resolve(process.cwd(), ".mimesis/owner-actions/fixture-evidence-submission-check.md");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, report);
  console.log(`[owner-evidence-submission-check] ${displayPath(outputPath)}`);
}

if (failures.length) {
  console.error("\nOwner evidence submission record is not ready:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log(`Mimesis owner evidence submission check passed: ${missingCount ? "missing owner evidence keeps gates blocked" : "record is ready for gate-specific review"}.`);

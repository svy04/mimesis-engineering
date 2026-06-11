#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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
const placeholderPattern = /\bTBD\b|<fill|TODO|pending owner input|not provided|none yet/i;
const secretPattern = /\b(api[_-]?key|secret|password|token|oauth[_-]?token)\b\s*[:=]\s*["']?[A-Za-z0-9._\-]{8,}/i;
const requiredBoundaries = [
  "does_not_choose_license",
  "does_not_submit_artifact",
  "does_not_grant_permission",
  "does_not_create_external_proof",
  "does_not_approve_proof",
  "does_not_publish",
  "does_not_close_gates",
];

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

function list(items) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- none";
}

function validate(record, requireReady) {
  const failures = [];
  const warnings = [];
  const templatePending = record.status === "template_not_owner_submitted" && !requireReady;

  if (record.schemaVersion !== "0.1.0") {
    failures.push("schemaVersion must be 0.1.0");
  }

  if (!["template_not_owner_submitted", "draft", "reviewed", "rejected"].includes(record.status)) {
    failures.push("status must be template_not_owner_submitted, draft, reviewed, or rejected");
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

    if (!["pending_owner", "submitted", "blocked", "not_in_scope"].includes(field.inputStatus)) {
      failures.push(`${fieldName}.inputStatus must be pending_owner, submitted, blocked, or not_in_scope`);
    }

    if (!field.ownerInput || (!templatePending && placeholderPattern.test(field.ownerInput))) {
      failures.push(`${fieldName}.ownerInput must be filled and not placeholder text`);
    }

    if (!Array.isArray(field.requiredEvidence) || field.requiredEvidence.length === 0) {
      failures.push(`${fieldName}.requiredEvidence must include at least one evidence item`);
    }

    if (!Array.isArray(field.reviewChecklist) || field.reviewChecklist.length === 0) {
      failures.push(`${fieldName}.reviewChecklist must include at least one review item`);
    }

    if (!field.downstreamTarget || placeholderPattern.test(field.downstreamTarget)) {
      failures.push(`${fieldName}.downstreamTarget must be filled and not placeholder text`);
    }

    if (!field.boundary || !/does not/i.test(field.boundary)) {
      failures.push(`${fieldName}.boundary must preserve a does-not boundary`);
    }
  }

  for (const [key, expected] of Object.entries({
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

  if (!Array.isArray(record.prohibitedClaims) || record.prohibitedClaims.length === 0) {
    failures.push("prohibitedClaims must include at least one prohibited claim");
  }

  for (const boundary of requiredBoundaries) {
    if (!record.boundaries?.includes(boundary)) {
      failures.push(`boundaries missing ${boundary}`);
    }
  }

  if (secretPattern.test(JSON.stringify(record))) {
    failures.push("record appears to include a secret, token, password, OAuth token, or API key");
  }

  const submittedCount = requiredFields.filter((fieldName) => record.minimumInputs?.[fieldName]?.inputStatus === "submitted").length;
  const ready = record.status === "reviewed" && submittedCount === requiredFields.length;

  if (submittedCount > 0) {
    warnings.push("submitted owner proof input still needs downstream record conversion and gate-specific review");
  }

  if (requireReady && !ready) {
    failures.push("not ready: owner proof input requires reviewed status and submitted minimum inputs");
  }

  return {
    failures,
    warnings,
    submittedCount,
    ready,
  };
}

if (args.includes("--help") || args.includes("-h")) {
  console.log(`Usage: mimesis owner:proof-input-check [path/to/owner-proof-input.json] [--require-ready] [--write-report path/to/report.md]

Checks the owner proof input record before it can be split into owner answer/evidence records.
It does not choose a license, submit an artifact, grant permission, create external proof, approve proof, publish, or close gates.
`);
  process.exit(0);
}

const recordArg = positional[0] || ".mimesis/owner-actions/proof-input-template.json";
const recordPath = resolveInput(recordArg);
const requireReady = flags.has("require-ready");
const reportArg = flags.get("write-report") === true
  ? ".mimesis/owner-actions/fixture-proof-input-check.md"
  : flags.get("write-report");

if (!fs.existsSync(recordPath) || !fs.statSync(recordPath).isFile()) {
  console.error(`Owner proof input record file does not exist: ${recordPath}`);
  process.exit(1);
}

const record = readJson(recordPath);
const { failures, warnings, submittedCount, ready } = validate(record, requireReady);
const status = ready
  ? "reviewed owner proof input, still not proof or gate closure."
  : "not ready owner proof input, gates remain blocked.";

const report = `# Mimesis Owner Proof Input Check

Status: ${status}

This report checks the single owner proof input record for the first real proof loop.
It is not an owner decision by itself, submitted artifact by itself, permission grant, external proof, proof approval, publication, or gate closure.

## Source Record

- record: \`${displayPath(recordPath)}\`
- schemaVersion: ${record.schemaVersion ?? "missing"}
- status: ${record.status ?? "missing"}
- source handoff: ${record.sourceHandoff ?? "missing"}

## Minimum Inputs

- license_or_no_reuse status: ${record.minimumInputs?.license_or_no_reuse?.inputStatus ?? "missing"}
- weak_artifact_permission status: ${record.minimumInputs?.weak_artifact_permission?.inputStatus ?? "missing"}
- submitted minimum inputs: ${submittedCount} / ${requiredFields.length}
- require ready: ${requireReady}
- ready for downstream conversion: ${ready ? "yes" : "no"}

## Safety Checks

- no framework-chosen license: ${record.safetyConfirmation?.noFrameworkChosenLicense === true}
- no permission granted: ${record.safetyConfirmation?.noPermissionGranted === true}
- no publication: ${record.safetyConfirmation?.noPublication === true}
- no external proof: ${record.safetyConfirmation?.noExternalProof === true}
- no proof approval: ${record.safetyConfirmation?.noProofApproval === true}
- no closed gates: ${record.safetyConfirmation?.noClosedGates === true}
- heuristic secret scan: ${secretPattern.test(JSON.stringify(record)) ? "failed" : "clear"}

## Warnings

${list(warnings)}

## Failures

${list(failures)}

## Allowed Claim

Mimesis can check whether the minimum owner proof input record is ready for downstream conversion.

## Disallowed Claim

The owner proof input check does not choose a license.
It does not submit an artifact.
It does not grant permission.
It does not create external proof.
It does not approve proof.
It does not publish.
It does not close gates.

## Boundary

This check is a local pre-conversion gate only.
Downstream owner answer, owner evidence, proof intake, proof execution, evidence review, and gate review records are still required before any stronger claim.
`;

if (reportArg) {
  const reportPath = path.resolve(process.cwd(), reportArg);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, report);
  console.log(`[owner-proof-input-check] ${displayPath(reportPath)}`);
}

if (failures.length) {
  console.error("\nOwner proof input record is not ready:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log(`Mimesis owner proof input check passed: ${ready ? "record is ready for downstream conversion" : "template is checked and still not ready"}.`);

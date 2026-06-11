#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const inputIndex = args.indexOf("--input");
const formIndex = args.indexOf("--form");
const outputIndex = args.indexOf("--output");

const inputRelative = inputIndex >= 0 && args[inputIndex + 1]
  ? args[inputIndex + 1]
  : ".mimesis/owner-actions/fixture-evidence-record.json";
const formRelative = formIndex >= 0 && args[formIndex + 1]
  ? args[formIndex + 1]
  : ".mimesis/owner-actions/evidence-attachment-form.md";
const outputRelative = outputIndex >= 0 && args[outputIndex + 1]
  ? args[outputIndex + 1]
  : ".mimesis/owner-actions/fixture-evidence-submission-record.json";

const inputPath = path.resolve(root, inputRelative);
const formPath = path.resolve(root, formRelative);
const outputPath = path.resolve(root, outputRelative);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function stableStringify(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function safetyCheckFor(field) {
  if (field === "weak_artifact_permission") {
    return "owner-provided permission required before public or proof use";
  }
  return "owner must confirm source, permission, redaction, and publication scope";
}

function buildSubmissionRecord(record) {
  const fields = Object.fromEntries(
    Object.entries(record.fields ?? {}).map(([field, entry]) => [
      field,
      {
        submissionStatus: "missing",
        ownerSubmittedEvidence: "not submitted owner evidence",
        blockedGateIds: entry.blockedGateIds ?? [],
        requiredAttachments: entry.requiredAttachments ?? ["owner-provided evidence required"],
        ownerAttachmentSlot: "owner-provided evidence required",
        safetyCheck: safetyCheckFor(field),
        boundary: "does not submit evidence or close gates",
      },
    ]),
  );

  return {
    schemaVersion: "0.1.0",
    status: "not_submitted_owner_evidence",
    sourceForm: formRelative.replaceAll(path.sep, "/"),
    sourceEvidenceRecord: inputRelative.replaceAll(path.sep, "/"),
    fields,
    requiredGateIds: record.requiredGateIds ?? [],
    safetyConfirmation: {
      noEvidenceSubmitted: true,
      noEvidenceAttached: true,
      noArtifactCollected: true,
      noPermissionGranted: true,
      noPublication: true,
      noExternalProof: true,
      noClosedGates: true,
    },
    prohibitedClaims: [
      "evidence submitted",
      "evidence attached",
      "external proof exists",
      "adoption proof exists",
      "benchmarked productivity exists",
      "customer outcomes exist",
      "publication happened",
      "license was chosen",
      "permission was granted",
      "gates are closed",
    ],
    boundaries: [
      "does_not_submit_evidence",
      "does_not_attach_evidence",
      "does_not_choose_license",
      "does_not_collect_artifact",
      "does_not_grant_permission",
      "does_not_publish",
      "does_not_create_external_proof",
      "does_not_close_gates",
    ],
  };
}

if (!fs.existsSync(inputPath)) {
  throw new Error(`Owner evidence record does not exist: ${inputPath}`);
}

if (!fs.existsSync(formPath)) {
  throw new Error(`Owner evidence attachment form does not exist: ${formPath}`);
}

const record = readJson(inputPath);
const serialized = stableStringify(buildSubmissionRecord(record));

if (checkOnly) {
  if (!fs.existsSync(outputPath)) {
    throw new Error(`Owner evidence submission record is missing: ${outputPath}`);
  }

  const current = fs.readFileSync(outputPath, "utf8");
  if (current !== serialized) {
    throw new Error("Owner evidence submission record is stale; run npm run owner:evidence-submission-record");
  }

  console.log("Mimesis owner evidence submission record check passed.");
  process.exit(0);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, serialized);

console.log(`[owner-evidence-submission-record] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

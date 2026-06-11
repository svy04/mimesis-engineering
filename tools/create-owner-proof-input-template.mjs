#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "owner-actions", "proof-input-template.json");
const handoffPath = ".mimesis/owner-actions/proof-run-handoff.md";

function stableStringify(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

if (!fs.existsSync(path.join(root, handoffPath))) {
  throw new Error(`${handoffPath} is missing; run npm run owner:proof-handoff first`);
}

const handoff = read(handoffPath);

const template = {
  schemaVersion: "0.1.0",
  status: "template_not_owner_submitted",
  sourceHandoff: handoffPath,
  minimumInputs: {
    license_or_no_reuse: {
      inputStatus: "pending_owner",
      ownerInput: "pending owner input",
      requiredEvidence: [
        "explicit owner license, split license, or no-reuse answer",
        "owner confirmation that this is not legal advice from the framework",
        "source path or note for the reviewed owner answer",
      ],
      reviewChecklist: [
        "answer is owner-provided",
        "answer is explicit enough to route into license:decision-from-owner-answer",
        "answer does not imply publication by itself",
      ],
      downstreamTarget: "owner decision answer record",
      boundary: "does not choose a license or provide legal advice",
    },
    weak_artifact_permission: {
      inputStatus: "pending_owner",
      ownerInput: "pending owner input",
      requiredEvidence: [
        "weak artifact text, file path, or redacted excerpt",
        "artifact owner or submitter identity",
        "permission status and publication preference",
        "redaction requirements and private-data safety confirmation",
      ],
      reviewChecklist: [
        "artifact is user-submitted, permissioned, or clearly redacted",
        "artifact has no secrets, API keys, OAuth tokens, passwords, or private customer data",
        "artifact can route into owner:evidence-submission-check --require-field weak_artifact_permission",
      ],
      downstreamTarget: "owner evidence submission record",
      boundary: "does not submit an artifact, grant permission, or create external proof",
    },
  },
  downstreamTargets: {
    ownerDecisionAnswerRecord:
      "npm run cli -- license:decision-from-owner-answer path/to/owner-decision-answer-record.json --output path/to/release-decision-record.json",
    ownerEvidenceSubmissionRecord:
      "npm run cli -- owner:evidence-submission-check path/to/owner-evidence-submission-record.json --require-field weak_artifact_permission",
    proofIntakeRecord:
      "npm run cli -- proof:intake-from-owner-evidence path/to/owner-evidence-submission-record.json --output path/to/proof-intake-record.json",
    proofExecutionRecord:
      "npm run cli -- proof:execution-report --execution-record path/to/proof-execution-record.json --output path/to/proof-execution-candidate.md",
  },
  sourceSignals: {
    handoffNamesLicenseField: handoff.includes("license_or_no_reuse"),
    handoffNamesWeakArtifactField: handoff.includes("weak_artifact_permission"),
    handoffNamesProofExecutionRecord: handoff.includes("proof execution record"),
  },
  safetyConfirmation: {
    noOwnerDecisionMade: true,
    noArtifactSubmitted: true,
    noFrameworkChosenLicense: true,
    noPermissionGranted: true,
    noPublication: true,
    noExternalProof: true,
    noProofApproval: true,
    noClosedGates: true,
  },
  prohibitedClaims: [
    "owner decision made",
    "license chosen by framework",
    "artifact submitted",
    "permission granted",
    "external proof exists",
    "proof approved",
    "publication happened",
    "gates closed",
  ],
  boundaries: [
    "does_not_choose_license",
    "does_not_submit_artifact",
    "does_not_grant_permission",
    "does_not_create_external_proof",
    "does_not_approve_proof",
    "does_not_publish",
    "does_not_close_gates",
  ],
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, stableStringify(template));

console.log(`[owner-proof-input-template] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

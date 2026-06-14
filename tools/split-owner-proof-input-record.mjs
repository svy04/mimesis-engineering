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

const requiredProofInputFields = ["license_or_no_reuse", "weak_artifact_permission"];
const requiredOwnerFields = [
  "license_or_no_reuse",
  "weak_artifact_permission",
  "publication_scope",
  "package_action_plugin_scope",
  "benchmark_adoption_scope",
  "strict_sync_intent",
];
const requiredGateIds = [
  "owner_license_decision",
  "permissioned_external_artifact",
  "completed_external_case",
  "strict_publish_sync",
  "package_publication",
  "action_publication",
  "shipped_plugin",
  "benchmark_study",
  "external_adoption",
];
const placeholderPattern = /\bTBD\b|<fill|TODO|pending owner input|not provided|none yet/i;
const secretPattern = /\b(api[_-]?key|secret|password|token|oauth[_-]?token)\b\s*[:=]\s*["']?[A-Za-z0-9._\-]{8,}/i;

function usage() {
  console.log(`Usage: mimesis owner:proof-input-split [path/to/owner-proof-input.json] [--output-dir path/to/dir] [--report path/to/report.md] [--require-ready] [--force]

Splits a reviewed owner proof input record into downstream owner decision/evidence records.
The default local template writes a blocked split report only.
It does not choose a license, submit an artifact, grant permission, create external proof, publish, approve proof, or close gates.
`);
}

function stableStringify(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
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

function writeJson(filePath, value, force) {
  if (fs.existsSync(filePath) && !force) {
    console.error(`Output already exists: ${filePath}`);
    console.error("Re-run with --force to overwrite generated files.");
    process.exit(1);
  }
  writeText(filePath, stableStringify(value));
}

function list(items) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- none";
}

function validateProofInput(record) {
  const failures = [];
  const warnings = [];

  if (record.schemaVersion !== "0.1.0") {
    failures.push("schemaVersion must be 0.1.0");
  }
  if (!["template_not_owner_submitted", "draft", "reviewed", "rejected"].includes(record.status)) {
    failures.push("status must be template_not_owner_submitted, draft, reviewed, or rejected");
  }

  for (const fieldName of requiredProofInputFields) {
    const field = record.minimumInputs?.[fieldName];
    if (!field) {
      failures.push(`minimumInputs missing ${fieldName}`);
      continue;
    }
    if (!["pending_owner", "submitted", "blocked", "not_in_scope"].includes(field.inputStatus)) {
      failures.push(`${fieldName}.inputStatus must be pending_owner, submitted, blocked, or not_in_scope`);
    }
    if (!field.ownerInput || (record.status !== "template_not_owner_submitted" && placeholderPattern.test(field.ownerInput))) {
      failures.push(`${fieldName}.ownerInput must be filled and not placeholder text`);
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

  if (secretPattern.test(JSON.stringify(record))) {
    failures.push("record appears to include a secret, token, password, OAuth token, or API key");
  }

  const submittedCount = requiredProofInputFields.filter((fieldName) => record.minimumInputs?.[fieldName]?.inputStatus === "submitted").length;
  const ready = record.status === "reviewed" && submittedCount === requiredProofInputFields.length;

  if (submittedCount > 0 && !ready) {
    warnings.push("partial owner proof input is present but not reviewed and fully submitted");
  }

  if (!ready) {
    failures.push("not ready: owner proof input requires reviewed status and submitted minimum inputs");
  }

  return {
    failures,
    warnings,
    submittedCount,
    ready,
  };
}

function pendingAnswerField(fieldName) {
  const defaults = {
    license_or_no_reuse: {
      currentSignal: "pending owner license/no-reuse answer",
      evidenceToAttach: ["docs/LICENSE-DECISION.md", ".mimesis/license-packets/owner-decision.md"],
      boundary: "does not choose a license",
    },
    weak_artifact_permission: {
      currentSignal: "weak artifact input is handled in the split owner evidence submission record",
      evidenceToAttach: ["docs/PROOF-INTAKE-KIT.md", ".mimesis/proof-intake/first-external-proof-kit.md", "permissioned or clearly redacted weak artifact"],
      boundary: "does not collect an artifact or grant permission",
    },
    publication_scope: {
      currentSignal: "publication scope still pending owner decision",
      evidenceToAttach: ["npm run release:check:public", "npm run audit:sync:strict"],
      boundary: "does not publish",
    },
    package_action_plugin_scope: {
      currentSignal: "package/action/plugin publication scope still pending owner decision",
      evidenceToAttach: ["docs/PACKAGE-RELEASE-CANDIDATE.md", "docs/ACTION-RELEASE-CANDIDATE.md", "docs/PLUGIN-RELEASE-PACKET.md"],
      boundary: "does not publish, ship a plugin, or prove official host compliance",
    },
    benchmark_adoption_scope: {
      currentSignal: "benchmark and adoption scope still pending evidence",
      evidenceToAttach: ["docs/BENCHMARK-PACKET.md", "templates/evidence-packet.md"],
      boundary: "does not prove adoption, productivity, customer outcomes, or benchmark results",
    },
    strict_sync_intent: {
      currentSignal: "runtime sync audit still required",
      evidenceToAttach: ["npm run audit:sync:strict"],
      boundary: "does not stage, commit, push, tag, release, close gates, or prove sync",
    },
  };
  return {
    answerStatus: "pending",
    ownerAnswer: "pending owner answer",
    ...defaults[fieldName],
  };
}

function buildDecisionAnswerRecord(record, sourceDisplay) {
  const fields = Object.fromEntries(requiredOwnerFields.map((fieldName) => [fieldName, pendingAnswerField(fieldName)]));
  fields.license_or_no_reuse = {
    ...fields.license_or_no_reuse,
    answerStatus: "answered",
    ownerAnswer: record.minimumInputs.license_or_no_reuse.ownerInput,
    currentSignal: "owner proof input reviewed and split into owner decision answer candidate",
    boundary: "records owner-provided license/no-reuse input; does not provide legal advice, publish, or close gates",
  };
  fields.weak_artifact_permission = {
    ...fields.weak_artifact_permission,
    answerStatus: "answered",
    ownerAnswer: "Owner supplied weak artifact permission input; artifact text is routed to the split owner evidence submission record.",
    currentSignal: "owner proof input reviewed and split into owner evidence submission candidate",
    boundary: "records owner-provided permission intent; does not collect an artifact, grant permission by framework, publish, or close gates",
  };

  return {
    schemaVersion: "0.1.0",
    status: "reviewed",
    sourceIntake: sourceDisplay,
    fields,
    requiredGateIds,
    safetyConfirmation: {
      noRealOwnerDecision: false,
      noArtifactCollected: true,
      noPermissionGranted: true,
      noPublication: true,
      noExternalProof: true,
      noClosedGates: true,
    },
    prohibitedClaims: [
      "license chosen by framework",
      "legal advice provided",
      "external proof exists",
      "adoption proof exists",
      "benchmarked productivity exists",
      "customer outcomes exist",
      "publication happened",
      "permission was granted",
      "gates are closed",
    ],
    boundaries: [
      "does_not_choose_license",
      "does_not_provide_legal_advice",
      "does_not_collect_artifact",
      "does_not_grant_permission",
      "does_not_publish",
      "does_not_create_external_proof",
      "does_not_close_gates",
    ],
  };
}

function missingSubmissionField(fieldName) {
  const blockedGateMap = {
    license_or_no_reuse: ["owner_license_decision"],
    weak_artifact_permission: ["permissioned_external_artifact", "completed_external_case"],
    publication_scope: ["strict_publish_sync"],
    package_action_plugin_scope: ["package_publication", "action_publication", "shipped_plugin"],
    benchmark_adoption_scope: ["benchmark_study", "external_adoption"],
    strict_sync_intent: ["strict_publish_sync"],
  };
  const attachmentMap = {
    license_or_no_reuse: ["docs/LICENSE-DECISION.md", ".mimesis/license-packets/owner-decision.md"],
    weak_artifact_permission: ["docs/PROOF-INTAKE-KIT.md", ".mimesis/proof-intake/first-external-proof-kit.md", "permissioned or clearly redacted weak artifact"],
    publication_scope: ["npm run release:check:public", "npm run audit:sync:strict"],
    package_action_plugin_scope: ["docs/PACKAGE-RELEASE-CANDIDATE.md", "docs/ACTION-RELEASE-CANDIDATE.md", "docs/PLUGIN-RELEASE-PACKET.md"],
    benchmark_adoption_scope: ["docs/BENCHMARK-PACKET.md", "templates/evidence-packet.md"],
    strict_sync_intent: ["npm run audit:sync:strict"],
  };
  return {
    submissionStatus: "missing",
    ownerSubmittedEvidence: "not submitted owner evidence",
    blockedGateIds: blockedGateMap[fieldName],
    requiredAttachments: attachmentMap[fieldName],
    ownerAttachmentSlot: "owner-provided evidence required",
    safetyCheck: fieldName === "weak_artifact_permission"
      ? "owner-provided permission required before public or proof use"
      : "owner must confirm source, permission, redaction, and publication scope",
    boundary: "does not submit evidence or close gates",
  };
}

function buildEvidenceSubmissionRecord(record, sourceDisplay) {
  const fields = Object.fromEntries(requiredOwnerFields.map((fieldName) => [fieldName, missingSubmissionField(fieldName)]));
  fields.weak_artifact_permission = {
    ...fields.weak_artifact_permission,
    submissionStatus: "submitted",
    ownerSubmittedEvidence: record.minimumInputs.weak_artifact_permission.ownerInput,
    requiredAttachments: record.minimumInputs.weak_artifact_permission.requiredEvidence,
    ownerAttachmentSlot: "owner proof input split: weak_artifact_permission",
    safetyCheck: "owner reviewed weak artifact permission input; operator must still confirm no secrets, no private customer data, and no copied protected material before proof intake",
    boundary: "does not grant permission, create external proof, publish, or close gates",
  };

  return {
    schemaVersion: "0.1.0",
    status: "reviewed",
    sourceForm: sourceDisplay,
    sourceEvidenceRecord: sourceDisplay,
    fieldLevelReadiness: {
      purpose: "Check one submitted owner evidence field before field-specific review movement.",
      defaultField: "weak_artifact_permission",
      supportedFields: requiredOwnerFields,
      command: "npm run cli -- owner:evidence-submission-check path/to/owner-evidence-submission-record.json --require-field weak_artifact_permission",
      boundary: "Field-level readiness is not submitted evidence, attached evidence, permission, external proof, publication, adoption proof, benchmark proof, or gate closure.",
      boundaries: [
        "does_not_submit_evidence",
        "does_not_attach_evidence",
        "does_not_grant_permission",
        "does_not_create_external_proof",
        "does_not_publish",
        "does_not_prove_adoption",
        "does_not_close_gates",
      ],
    },
    fields,
    requiredGateIds,
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
      "evidence submitted by framework",
      "evidence attached by framework",
      "license chosen by framework",
      "permission granted",
      "external proof exists",
      "adoption proof exists",
      "benchmarked productivity exists",
      "customer outcomes exist",
      "publication happened",
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

function report({ ready, recordPath, outDir, reportPath, failures, warnings, submittedCount, wroteRecords }) {
  const status = ready
    ? "reviewed owner proof input split, downstream records written but gates remain blocked."
    : "not ready owner proof input split, no downstream records written.";

  return `# Mimesis Owner Proof Input Split Report

Status: ${status}

This report checks whether one owner proof input record can be split into downstream owner decision and owner evidence records.
It is not an owner decision, submitted artifact, permission grant, external proof, proof approval, publication, or gate closure.

## Source

- owner proof input record: \`${displayPath(recordPath)}\`
- output directory: \`${displayPath(outDir)}\`
- report: \`${displayPath(reportPath)}\`
- submitted minimum inputs: ${submittedCount} / ${requiredProofInputFields.length}
- downstream records written: ${wroteRecords ? "yes" : "no"}

## Minimum Inputs

- license_or_no_reuse
- weak_artifact_permission

## Downstream Records

- owner decision answer record: \`${displayPath(path.join(outDir, "owner-decision-answer-record.json"))}\`
- owner evidence submission record: \`${displayPath(path.join(outDir, "owner-evidence-submission-record.json"))}\`

## Warnings

${list(warnings)}

## Failures

${list(failures)}

## Allowed Claim

Mimesis can split a reviewed owner proof input record into downstream owner answer/evidence record candidates.

## Disallowed Claim

The owner proof input split does not choose a license.
It does not submit an artifact.
It does not grant permission.
It does not create external proof.
It does not approve proof.
It does not publish.
It does not close gates.

## Boundary

Split output records are candidates for downstream checks only.
License decision review, owner evidence submission checks, proof intake conversion, proof execution, evidence review, and gate closure review are still required before any stronger claim.
`;
}

if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

const recordArg = positional[0] || ".mimesis/owner-actions/proof-input-template.json";
const recordPath = resolveInput(recordArg);
const outputDir = resolveOutput(flags.get("output-dir") === true || !flags.has("output-dir")
  ? ".mimesis/owner-actions/proof-input-split"
  : String(flags.get("output-dir")));
const reportPath = resolveOutput(flags.get("report") === true || !flags.has("report")
  ? ".mimesis/owner-actions/proof-input-split-report.md"
  : String(flags.get("report")));
const requireReady = flags.has("require-ready");
const force = flags.has("force");

if (!fs.existsSync(recordPath) || !fs.statSync(recordPath).isFile()) {
  console.error(`Owner proof input record file does not exist: ${recordPath}`);
  process.exit(1);
}

const record = readJson(recordPath);
const { failures, warnings, submittedCount, ready } = validateProofInput(record);
let wroteRecords = false;

if (ready) {
  const sourceDisplay = displayPath(recordPath);
  writeJson(path.join(outputDir, "owner-decision-answer-record.json"), buildDecisionAnswerRecord(record, sourceDisplay), force);
  writeJson(path.join(outputDir, "owner-evidence-submission-record.json"), buildEvidenceSubmissionRecord(record, sourceDisplay), force);
  wroteRecords = true;
}

writeText(reportPath, report({
  ready,
  recordPath,
  outDir: outputDir,
  reportPath,
  failures,
  warnings,
  submittedCount,
  wroteRecords,
}));

console.log(`[owner-proof-input-split] ${displayPath(reportPath)}`);
if (wroteRecords) {
  console.log(`[owner-proof-input-split] ${displayPath(path.join(outputDir, "owner-decision-answer-record.json"))}`);
  console.log(`[owner-proof-input-split] ${displayPath(path.join(outputDir, "owner-evidence-submission-record.json"))}`);
}

if (!ready && requireReady) {
  console.error("\nOwner proof input split is not ready:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log(`Mimesis owner proof input split checked: ${ready ? "downstream record candidates written" : "not ready; report written only"}.`);

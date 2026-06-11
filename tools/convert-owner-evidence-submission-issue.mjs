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

const defaultInput = ".mimesis/owner-actions/fixture-owner-evidence-submission-issue.md";
const defaultSourceEvidenceRecord = ".mimesis/owner-actions/fixture-evidence-record.json";
const defaultSourceForm = ".mimesis/owner-actions/evidence-attachment-form.md";
const defaultOutput = ".mimesis/owner-actions/fixture-owner-evidence-submission-issue-record.json";
const defaultReport = ".mimesis/owner-actions/fixture-owner-evidence-submission-issue-conversion-report.md";
const ownerEvidenceFields = [
  "license_or_no_reuse",
  "weak_artifact_permission",
  "publication_scope",
  "package_action_plugin_scope",
  "benchmark_adoption_scope",
  "strict_sync_intent",
];
const placeholderPattern = /\bTBD\b|<fill|TODO|pending owner input|pending owner evidence|not provided|none yet|_No response_/i;
const secretPattern = /\b(api[_-]?key|secret|password|token|oauth[_-]?token)\b\s*[:=]\s*["']?[A-Za-z0-9._\-]{8,}/i;

function usage() {
  console.log(`Usage: mimesis owner:evidence-submission-issue-convert [path/to/github-issue.md] [--source-evidence-record path/to/record.json] [--output path/to/submission-record.json] [--report path/to/report.md] [--status draft|reviewed|rejected] [--source label]

Converts an owner evidence submission issue body into a draft owner evidence submission record.
Default output is not an owner decision, not attached evidence, not permission, not external proof, not publication, and not gate closure.
`);
}

function normalizeHeading(value) {
  return value
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeValue(value) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

function parseIssueBody(markdown) {
  const sections = new Map();
  const headingPattern = /^###\s+(.+?)\s*$/gm;
  const matches = [...markdown.matchAll(headingPattern)];

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const title = normalizeHeading(match[1]);
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? markdown.length;
    sections.set(title, normalizeValue(markdown.slice(start, end)));
  }

  return sections;
}

function getSection(sections, aliases) {
  for (const alias of aliases) {
    const value = sections.get(normalizeHeading(alias));
    if (value && !placeholderPattern.test(value)) {
      return value;
    }
  }
  return "";
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
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
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

function safetyCheckFor(fieldName, baseField) {
  if (fieldName === "weak_artifact_permission") {
    return "owner-provided permission required before public or proof use";
  }
  return baseField?.safetyCheck
    ?? "owner must confirm source, permission, redaction, and publication scope";
}

function buildField(fieldName, baseField, submittedText, sourceLabel) {
  const submitted = Boolean(submittedText);
  return {
    submissionStatus: submitted ? "submitted" : "missing",
    ownerSubmittedEvidence: submitted
      ? [
          submittedText,
          sourceLabel ? `Source: ${sourceLabel}` : "",
          "Boundary: draft owner evidence submission candidate only; does not close gates.",
        ].filter(Boolean).join("\n\n")
      : "not submitted owner evidence",
    blockedGateIds: baseField?.blockedGateIds ?? [],
    requiredAttachments: baseField?.requiredAttachments ?? ["owner-provided evidence required"],
    ownerAttachmentSlot: submitted ? `owner issue section: ${fieldName}` : "owner-provided evidence required",
    safetyCheck: safetyCheckFor(fieldName, baseField),
    boundary: submitted
      ? "does not submit evidence by itself, does not attach evidence by itself, and does not close gates"
      : "does not submit evidence or close gates",
  };
}

function buildRecord({ baseRecord, fields, sourceForm, sourceEvidenceRecord, sourceIssue, sourceLabel, status }) {
  const baseFields = baseRecord.fields ?? {};
  const recordFields = {};

  for (const fieldName of ownerEvidenceFields) {
    recordFields[fieldName] = buildField(fieldName, baseFields[fieldName], fields[fieldName], sourceLabel);
  }

  return {
    schemaVersion: "0.1.0",
    status,
    sourceForm,
    sourceEvidenceRecord,
    sourceIssue,
    sourceReview: sourceLabel || "owner evidence submission issue conversion",
    fieldLevelReadiness: {
      purpose: "Check one submitted owner evidence field before field-specific review movement.",
      defaultField: "weak_artifact_permission",
      supportedFields: ownerEvidenceFields,
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
    fields: recordFields,
    requiredGateIds: baseRecord.requiredGateIds ?? [],
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

function buildReport({ inputPath, outputPath, reportPath, record, fields, failures, warnings, isFixture }) {
  const submittedFields = ownerEvidenceFields.filter((fieldName) => record.fields[fieldName]?.submissionStatus === "submitted");
  const missingFields = ownerEvidenceFields.filter((fieldName) => record.fields[fieldName]?.submissionStatus !== "submitted");
  const fieldMovementReady =
    record.status === "reviewed" &&
    submittedFields.length > 0 &&
    failures.length === 0;
  const gateMovementReady =
    record.status === "reviewed" &&
    missingFields.length === 0 &&
    failures.length === 0;
  const statusLine = isFixture && record.status === "draft"
    ? "fixture issue converted to draft owner evidence submission record, not owner decision or proof."
    : `${record.status} owner evidence submission issue conversion, not owner decision or proof.`;

  return `# Mimesis Owner Evidence Submission Issue Conversion Report

Status: ${statusLine}

This report converts one owner evidence submission issue body into a local owner evidence submission record candidate.
It is not an owner decision, attached evidence, permission grant, external proof, proof approval, publication, or gate closure.

## Source

- issue body: \`${displayPath(inputPath)}\`
- output record: \`${displayPath(outputPath)}\`
- report: \`${displayPath(reportPath)}\`
- converted status: ${record.status}
- submitted fields: ${submittedFields.length}
- missing fields: ${missingFields.length}
- field movement ready: ${fieldMovementReady ? "yes" : "no"}
- ready for gate movement: ${gateMovementReady ? "yes" : "no"}

## Parsed Fields

${ownerEvidenceFields.map((fieldName) => `- ${fieldName}: ${fields[fieldName] ? "submitted" : "missing"}`).join("\n")}
- review_state: ${fields.review_state || "missing"}
- safety_confirmation: ${fields.safety_confirmation ? "present" : "missing"}

## Warnings

${list(warnings)}

## Failures

${list(failures)}

## Allowed Claim

Mimesis can convert an owner evidence submission issue body into a draft owner evidence submission record candidate.

## Disallowed Claim

This conversion does not choose a license, attach evidence, grant permission, publish, create external proof, prove adoption, prove benchmarked productivity, or close gates.

## Boundary

- does not choose a license
- does not submit evidence by itself
- does not attach evidence by itself
- does not grant permission
- does not publish
- does not create external proof
- does not close gates
`;
}

if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

const inputRelative = positional[0] || defaultInput;
const sourceEvidenceRelative = flags.get("source-evidence-record") || defaultSourceEvidenceRecord;
const outputRelative = flags.get("output") || defaultOutput;
const reportRelative = flags.get("report") || defaultReport;
const status = flags.get("status") || "draft";
const sourceLabel = flags.get("source") || "";

if (!["draft", "reviewed", "rejected"].includes(status)) {
  console.error("status must be draft, reviewed, or rejected");
  process.exit(1);
}

const inputPath = resolveInput(String(inputRelative));
const sourceEvidencePath = resolveInput(String(sourceEvidenceRelative));
const outputPath = resolveOutput(String(outputRelative));
const reportPath = resolveOutput(String(reportRelative));

if (!fs.existsSync(inputPath) || !fs.statSync(inputPath).isFile()) {
  console.error(`Owner evidence submission issue file does not exist: ${inputPath}`);
  process.exit(1);
}
if (!fs.existsSync(sourceEvidencePath) || !fs.statSync(sourceEvidencePath).isFile()) {
  console.error(`Owner evidence source record file does not exist: ${sourceEvidencePath}`);
  process.exit(1);
}

const markdown = fs.readFileSync(inputPath, "utf8");
const baseRecord = readJson(sourceEvidencePath);
const sections = parseIssueBody(markdown);
const fields = Object.fromEntries(
  ownerEvidenceFields.map((fieldName) => [fieldName, getSection(sections, [fieldName, fieldName.replaceAll("_", " ")])]),
);
fields.review_state = getSection(sections, ["review_state", "Review state"]);
fields.safety_confirmation = getSection(sections, ["safety_confirmation", "Safety confirmation"]);

const warnings = [];
const failures = [];
if (!fields.safety_confirmation) {
  warnings.push("safety confirmation is missing; generated record must remain draft");
}
if (!/^reviewed owner evidence/i.test(fields.review_state.trim())) {
  warnings.push("issue is not marked as reviewed owner evidence; generated record must remain draft");
}
if (secretPattern.test(markdown)) {
  failures.push("issue body appears to include a secret, token, password, OAuth token, or API key");
}
if (status === "reviewed" && failures.length === 0 && !/^reviewed owner evidence/i.test(fields.review_state.trim())) {
  failures.push("status reviewed requires review_state to start with Reviewed owner evidence");
}

const record = buildRecord({
  baseRecord,
  fields,
  sourceForm: defaultSourceForm,
  sourceEvidenceRecord: displayPath(sourceEvidencePath),
  sourceIssue: displayPath(inputPath),
  sourceLabel,
  status,
});
const report = buildReport({
  inputPath,
  outputPath,
  reportPath,
  record,
  fields,
  failures,
  warnings,
  isFixture: displayPath(inputPath) === defaultInput,
});

if (failures.length) {
  writeText(reportPath, report);
  console.error(report);
  process.exit(1);
}

writeText(outputPath, stableStringify(record));
writeText(reportPath, report);

console.log(`[owner-evidence-submission-issue-convert] ${displayPath(outputPath)}`);
console.log(`[owner-evidence-submission-issue-convert] ${displayPath(reportPath)}`);
console.log("Mimesis owner evidence submission issue converted: draft owner evidence submission record written; downstream gates remain blocked.");

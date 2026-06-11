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

const defaultInput = ".mimesis/owner-actions/fixture-owner-proof-input-issue.md";
const defaultOutput = ".mimesis/owner-actions/fixture-owner-proof-input-issue-record.json";
const defaultReport = ".mimesis/owner-actions/fixture-owner-proof-input-issue-conversion-report.md";
const requiredIssueFields = ["license_or_no_reuse", "weak_artifact_permission"];
const placeholderPattern = /\bTBD\b|<fill|TODO|pending owner input|not provided|none yet|_No response_/i;
const secretPattern = /\b(api[_-]?key|secret|password|token|oauth[_-]?token)\b\s*[:=]\s*["']?[A-Za-z0-9._\-]{8,}/i;

function usage() {
  console.log(`Usage: mimesis owner:proof-input-issue-convert [path/to/github-issue.md] [--output path/to/record.json] [--report path/to/report.md] [--status draft|reviewed|rejected] [--source label] [--require-complete]

Converts a GitHub owner proof input issue body into an owner proof input record.
Default output is a draft fixture record, not an owner decision, permission grant, external proof, publication, or gate closure.
`);
}

function normalizeHeading(value) {
  return value
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/^\d+\s+/, "");
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
  const headingPattern = /^#{2,3}\s+(.+?)\s*$/gm;
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

function buildRecord({ fields, inputDisplay, source, status }) {
  const licenseInput = [
    fields.license_or_no_reuse,
    fields.license_notes ? `Notes: ${fields.license_notes}` : "",
  ].filter(Boolean).join("\n\n");

  const weakArtifactInput = [
    fields.weak_artifact_permission,
    fields.artifact_owner ? `Artifact owner: ${fields.artifact_owner}` : "",
    fields.publication_preference ? `Publication preference: ${fields.publication_preference}` : "",
    fields.redaction_requirements ? `Redaction requirements: ${fields.redaction_requirements}` : "",
    fields.proof_boundary ? `Proof boundary: ${fields.proof_boundary}` : "",
    fields.safety_confirmation ? `Safety confirmation: ${fields.safety_confirmation}` : "",
  ].filter(Boolean).join("\n\n");

  return {
    schemaVersion: "0.1.0",
    status,
    sourceHandoff: ".github/ISSUE_TEMPLATE/owner-proof-input.yml",
    sourceIssue: inputDisplay,
    sourceReview: source,
    minimumInputs: {
      license_or_no_reuse: {
        inputStatus: licenseInput ? "submitted" : "pending_owner",
        ownerInput: licenseInput || "pending owner input",
        requiredEvidence: [
          "explicit owner license, split license, or no-reuse answer from owner issue",
          "owner confirmation that this is not legal advice from the framework",
          "source issue path, URL, or review note",
        ],
        reviewChecklist: [
          "issue answer is owner-provided or owner-reviewed",
          "answer is explicit enough to route into license:decision-from-owner-answer",
          "answer does not imply publication by itself",
        ],
        downstreamTarget: "owner decision answer record",
        boundary: "does not choose a license or provide legal advice",
      },
      weak_artifact_permission: {
        inputStatus: weakArtifactInput ? "submitted" : "pending_owner",
        ownerInput: weakArtifactInput || "pending owner input",
        requiredEvidence: [
          "weak artifact text, file path, URL, or redacted excerpt from owner issue",
          "artifact owner or submitter identity",
          "permission status and publication preference",
          "redaction requirements and private-data safety confirmation",
        ],
        reviewChecklist: [
          "artifact is owner-submitted, permissioned, or clearly redacted",
          "artifact has no secrets, API keys, OAuth tokens, passwords, or private customer data",
          "artifact can route into owner:evidence-submission-check --require-field weak_artifact_permission",
        ],
        downstreamTarget: "owner evidence submission record",
        boundary: "does not submit an artifact, grant permission, or create external proof",
      },
    },
    downstreamTargets: {
      ownerProofInputCheck: "npm run cli -- owner:proof-input-check path/to/owner-proof-input-record.json --require-ready",
      ownerProofInputSplit: "npm run cli -- owner:proof-input-split path/to/owner-proof-input-record.json --output-dir path/to/split-output --require-ready",
      ownerDecisionAnswerRecord: "npm run cli -- license:decision-from-owner-answer path/to/owner-decision-answer-record.json --output path/to/release-decision-record.json",
      ownerEvidenceSubmissionRecord: "npm run cli -- owner:evidence-submission-check path/to/owner-evidence-submission-record.json --require-field weak_artifact_permission",
    },
    sourceSignals: {
      issueBodyParsed: true,
      issueNamesLicenseField: Boolean(fields.license_or_no_reuse),
      issueNamesWeakArtifactField: Boolean(fields.weak_artifact_permission),
      issueHasSafetyConfirmation: Boolean(fields.safety_confirmation),
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
      "owner decision made by framework",
      "license chosen by framework",
      "artifact submitted by framework",
      "permission granted",
      "external proof exists",
      "proof approved",
      "publication happened",
      "adoption proven",
      "benchmark proven",
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
}

function buildReport({ inputPath, outputPath, reportPath, record, failures, warnings, isFixture }) {
  const ready = record.status === "reviewed"
    && requiredIssueFields.every((fieldName) => record.minimumInputs[fieldName].inputStatus === "submitted")
    && failures.length === 0;
  const statusLine = isFixture && record.status === "draft"
    ? "fixture issue converted to draft owner proof input record, not owner decision or proof."
    : `${record.status} owner proof input issue conversion, not owner decision or proof.`;

  return `# Mimesis Owner Proof Input Issue Conversion Report

Status: ${statusLine}

This report converts one GitHub owner proof input issue body into a local owner proof input record.
It is not an owner decision, submitted artifact, permission grant, external proof, proof approval, publication, or gate closure.

## Source

- issue body: \`${displayPath(inputPath)}\`
- output record: \`${displayPath(outputPath)}\`
- report: \`${displayPath(reportPath)}\`
- converted status: ${record.status}
- ready for downstream conversion: ${ready ? "yes" : "no"}

## Parsed Minimum Inputs

- license_or_no_reuse status: ${record.minimumInputs.license_or_no_reuse.inputStatus}
- weak_artifact_permission status: ${record.minimumInputs.weak_artifact_permission.inputStatus}
- issue has safety confirmation: ${record.sourceSignals.issueHasSafetyConfirmation ? "yes" : "no"}

## Warnings

${list(warnings)}

## Failures

${list(failures)}

## Allowed Claim

Mimesis can convert a reviewed GitHub owner proof input issue body into a local owner proof input record candidate.

## Disallowed Claim

The owner proof input issue convert step does not choose a license.
It does not submit an artifact.
It does not grant permission.
It does not create external proof.
It does not approve proof.
It does not publish.
It does not close gates.

## Boundary

The converted record must still pass \`owner:proof-input-check --require-ready\` and downstream split/review steps before stronger local movement.
`;
}

if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

const inputPath = resolveInput(positional[0] || defaultInput);
const outputPath = resolveOutput(flags.get("output") === true || !flags.has("output") ? defaultOutput : String(flags.get("output")));
const reportPath = resolveOutput(flags.get("report") === true || !flags.has("report") ? defaultReport : String(flags.get("report")));
const source = flags.get("source") === true || !flags.has("source") ? displayPath(inputPath) : String(flags.get("source"));
const status = flags.has("reviewed") ? "reviewed" : String(flags.get("status") || "draft");
const requireComplete = flags.has("require-complete");

if (!["draft", "reviewed", "rejected"].includes(status)) {
  console.error("Owner proof input issue convert status must be draft, reviewed, or rejected.");
  process.exit(1);
}

if (!fs.existsSync(inputPath) || !fs.statSync(inputPath).isFile()) {
  console.error(`Owner proof input issue body file does not exist: ${inputPath}`);
  process.exit(1);
}

const markdown = fs.readFileSync(inputPath, "utf8");
const sections = parseIssueBody(markdown);
const fields = {
  license_or_no_reuse: getSection(sections, ["license_or_no_reuse", "License or no-reuse"]),
  license_notes: getSection(sections, ["License or no-reuse notes", "license_notes"]),
  weak_artifact_permission: getSection(sections, ["weak_artifact_permission", "Weak artifact permission"]),
  artifact_owner: getSection(sections, ["Artifact owner", "artifact_owner"]),
  publication_preference: getSection(sections, ["Publication preference", "publication_preference"]),
  redaction_requirements: getSection(sections, ["Redaction requirements", "redaction_requirements"]),
  proof_boundary: getSection(sections, ["Proof boundary", "proof_boundary"]),
  safety_confirmation: getSection(sections, ["Safety confirmation", "safety_confirmation"]),
};

const failures = [];
const warnings = [];

for (const fieldName of requiredIssueFields) {
  if (!fields[fieldName]) {
    failures.push(`issue body missing ${fieldName}`);
  }
}
if (!fields.artifact_owner) {
  warnings.push("artifact owner is missing; downstream review should block public/proof use");
}
if (!fields.publication_preference) {
  warnings.push("publication preference is missing; downstream review should block publication");
}
if (!fields.redaction_requirements) {
  warnings.push("redaction requirements are missing; downstream review should block public/proof use");
}
if (!fields.safety_confirmation) {
  warnings.push("safety confirmation is missing; downstream review should block public/proof use");
}
if (secretPattern.test(markdown)) {
  failures.push("issue body appears to include a secret, token, password, OAuth token, or API key");
}

const record = buildRecord({
  fields,
  inputDisplay: displayPath(inputPath),
  source,
  status,
});
const isFixture = displayPath(inputPath).includes("fixture-owner-proof-input-issue.md");
const report = buildReport({
  inputPath,
  outputPath,
  reportPath,
  record,
  failures,
  warnings,
  isFixture,
});

writeText(outputPath, stableStringify(record));
writeText(reportPath, report);

console.log(`[owner-proof-input-issue-convert] ${displayPath(outputPath)}`);
console.log(`[owner-proof-input-issue-convert] ${displayPath(reportPath)}`);

if (failures.length && requireComplete) {
  console.error("\nOwner proof input issue conversion is incomplete:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log(`Mimesis owner proof input issue converted: ${record.status} record written; downstream gates remain blocked.`);

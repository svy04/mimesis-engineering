#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const positional = [];
const flags = new Map();

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg.startsWith("--")) {
    const key = arg.slice(2);
    const next = args[index + 1];
    const value = next && !next.startsWith("--") ? next : true;
    if (flags.has(key)) {
      const current = flags.get(key);
      flags.set(key, Array.isArray(current) ? [...current, value] : [current, value]);
    } else {
      flags.set(key, value);
    }
    if (value !== true) {
      index += 1;
    }
  } else {
    positional.push(arg);
  }
}

const secretPattern = /\b(api[_-]?key|secret|password|token|oauth[_-]?token)\b\s*[:=]\s*["']?[A-Za-z0-9._\-]{8,}/i;
const placeholderPattern = /\bTBD\b|<fill|TODO|not provided|none yet|not submitted owner evidence/i;
const defaultOwnerRecord = ".mimesis/owner-actions/fixture-evidence-submission-record.json";
const defaultReport = ".mimesis/proof-intake/from-owner-evidence-bridge.md";
const requiredStringFlags = [
  "submitter",
  "artifact-owner",
  "permission-status",
  "publication-preference",
  "redaction-requirements",
  "desired-transformation",
];

function usage() {
  console.log(`Usage: mimesis proof:intake-from-owner-evidence path/to/owner-evidence-submission-record.json --output path/to/proof-intake-record.json [options]

Bridges a reviewed owner evidence submission record into a schema-shaped proof intake record.
It only reads the submitted weak_artifact_permission field.

Required options for record output:
  --submitter "Name or source"
  --artifact-owner "Owner"
  --permission-status "Permission/redaction scope"
  --publication-preference public|anonymized|redacted|private only
  --redaction-requirements "What must be redacted"
  --reference reference-packs/github-readme.md
  --desired-transformation "Transformation goal"
  --confirm-no-secrets
  --confirm-no-private-customer-data
  --confirm-no-copied-protected-material

Default no-arg mode writes a blocked bridge report to ${defaultReport}.

Boundary:
  This does not grant permission, create external proof, publish, or close gates.
`);
}

function flagValue(name, fallback = "") {
  const value = flags.get(name);
  if (Array.isArray(value)) {
    return String(value[value.length - 1]);
  }
  return value === true || value === undefined ? fallback : String(value);
}

function flagValues(name) {
  const value = flags.get(name);
  if (value === undefined || value === true) {
    return [];
  }
  return (Array.isArray(value) ? value : [value]).map(String);
}

function resolvePath(inputPath) {
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

function displayPath(filePath) {
  const repoRelative = path.relative(repoRoot, filePath);
  if (!repoRelative.startsWith("..") && !path.isAbsolute(repoRelative)) {
    return repoRelative.replaceAll(path.sep, "/");
  }
  return path.relative(process.cwd(), filePath).replaceAll(path.sep, "/") || filePath;
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`Owner evidence submission record is not valid JSON: ${error.message}`);
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
  writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function list(items) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- none";
}

function bridgeReport(record, source) {
  const weakField = record.fields?.weak_artifact_permission ?? {};
  const reviewed = record.status === "reviewed";
  const submitted = weakField.submissionStatus === "submitted";
  const status = reviewed && submitted
    ? "reviewed weak_artifact_permission field can be checked for proof intake conversion."
    : "blocked: weak_artifact_permission is not submitted and reviewed.";

  return `# Proof Intake From Owner Evidence

Status: ${status}

This report describes the bridge from an owner evidence submission record into a proof intake record.
It is not a proof intake record by itself.

## Source

- owner evidence submission record: \`${source}\`
- record status: ${record.status ?? "missing"}
- weak_artifact_permission status: ${weakField.submissionStatus ?? "missing"}

## Bridge Rule

The bridge can create a schema-shaped proof intake record only when:

- the owner evidence submission record has \`status: reviewed\`
- \`fields.weak_artifact_permission.submissionStatus\` is \`submitted\`
- the operator supplies owner, permission, publication, redaction, reference, and transformation metadata
- the operator explicitly confirms no secrets, no private customer data, and no copied protected material

## Command Shape

\`\`\`bash
npm run cli -- proof:intake-from-owner-evidence path/to/owner-evidence-submission-record.json --output path/to/proof-intake-record.json --submitter "owner-reviewed weak artifact" --artifact-owner "owner-confirmed artifact owner" --permission-status "owner permits redacted framework review only" --publication-preference redacted --redaction-requirements "redact private details before public use" --reference reference-packs/github-readme.md --desired-transformation "Transform one weak artifact under Mimesis boundaries." --confirm-no-secrets --confirm-no-private-customer-data --confirm-no-copied-protected-material
\`\`\`

## Boundary

Proof intake from owner evidence does not grant permission.
It does not create external proof.
It does not publish.
It does not close gates.
It does not prove adoption, benchmarked productivity, customer outcomes, legal originality, or commercial outcomes.
`;
}

function failValidation(failures) {
  console.error("\nOwner evidence cannot become a proof intake record:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

function validateForConversion(record) {
  const failures = [];
  const weakField = record.fields?.weak_artifact_permission;

  if (record.schemaVersion !== "0.1.0") {
    failures.push("schemaVersion must be 0.1.0");
  }
  if (record.status !== "reviewed") {
    failures.push("record status must be reviewed");
  }
  if (!weakField) {
    failures.push("record missing fields.weak_artifact_permission");
  }
  if (weakField?.submissionStatus !== "submitted") {
    failures.push("fields.weak_artifact_permission.submissionStatus must be submitted");
  }
  if (!weakField?.ownerSubmittedEvidence || placeholderPattern.test(weakField.ownerSubmittedEvidence)) {
    failures.push("fields.weak_artifact_permission.ownerSubmittedEvidence must contain the weak artifact");
  }
  if (!weakField?.safetyCheck || placeholderPattern.test(weakField.safetyCheck)) {
    failures.push("fields.weak_artifact_permission.safetyCheck must be filled");
  }
  if (!weakField?.boundary || !/does not/i.test(weakField.boundary)) {
    failures.push("fields.weak_artifact_permission.boundary must preserve a does-not boundary");
  }

  for (const flag of requiredStringFlags) {
    if (!flagValue(flag).trim()) {
      failures.push(`missing --${flag}`);
    }
  }

  const publicationPreference = flagValue("publication-preference");
  if (publicationPreference && !["public", "anonymized", "redacted", "private only"].includes(publicationPreference)) {
    failures.push("--publication-preference must be public, anonymized, redacted, or private only");
  }

  if (!flagValues("reference").length) {
    failures.push("missing --reference");
  }

  for (const flag of [
    "confirm-no-secrets",
    "confirm-no-private-customer-data",
    "confirm-no-copied-protected-material",
  ]) {
    if (!flags.has(flag)) {
      failures.push(`missing --${flag}`);
    }
  }

  if (secretPattern.test(JSON.stringify(record))) {
    failures.push("owner evidence submission record appears to include a secret, token, password, OAuth token, or API key");
  }

  return failures;
}

function buildProofIntakeRecord(record) {
  const weakField = record.fields.weak_artifact_permission;
  const proofBoundary = [
    weakField.boundary,
    record.fieldLevelReadiness?.boundary,
    "Owner evidence field-level readiness is not external proof, publication, adoption proof, benchmark proof, or gate closure.",
    "This output proof intake record does not grant permission, create external proof, publish, or close gates.",
    "The proof intake record must not claim external adoption, benchmarked productivity, customer outcomes, legal originality, commercial outcomes, endorsement, or completed proof.",
  ].filter(Boolean);

  return {
    schemaVersion: "0.1.0",
    status: "reviewed",
    submitter: flagValue("submitter"),
    startingArtifact: weakField.ownerSubmittedEvidence,
    artifactOwner: flagValue("artifact-owner"),
    permissionStatus: flagValue("permission-status"),
    publicationPreference: flagValue("publication-preference"),
    redactionRequirements: flagValue("redaction-requirements"),
    referencesStudied: flagValues("reference"),
    desiredTransformation: flagValue("desired-transformation"),
    proofBoundary,
    safetyConfirmation: {
      noSecrets: true,
      noPrivateCustomerData: true,
      noCopiedProtectedMaterial: true,
    },
    prohibitedClaims: [
      "permission was granted",
      "external proof exists",
      "external adoption exists",
      "benchmarked productivity exists",
      "customer outcomes exist",
      "legal originality is proven",
      "commercial outcomes exist",
      "publication happened",
      "gates are closed",
    ],
  };
}

if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

const recordArg = positional[0] || flagValue("record");

if (!recordArg) {
  const reportPath = path.resolve(repoRoot, flagValue("default-report", defaultReport));
  const sourcePath = resolvePath(defaultOwnerRecord);
  const record = fs.existsSync(sourcePath) ? readJson(sourcePath) : {};
  writeText(reportPath, bridgeReport(record, displayPath(sourcePath)));
  console.log(`[proof-intake-from-owner-evidence] ${displayPath(reportPath)}`);
  process.exit(0);
}

const recordPath = resolvePath(recordArg);
if (!fs.existsSync(recordPath) || !fs.statSync(recordPath).isFile()) {
  console.error(`Owner evidence submission record file does not exist: ${recordPath}`);
  process.exit(1);
}

const outputArg = flagValue("output");
if (!outputArg) {
  console.error("Missing --output path for proof intake record.");
  usage();
  process.exit(1);
}

const record = readJson(recordPath);
const failures = validateForConversion(record);
if (failures.length) {
  failValidation(failures);
}

const proofIntakeRecord = buildProofIntakeRecord(record);
if (secretPattern.test(JSON.stringify(proofIntakeRecord))) {
  failValidation(["proof intake output appears to include a secret, token, password, OAuth token, or API key"]);
}

const outputPath = path.resolve(process.cwd(), outputArg);
writeJson(outputPath, proofIntakeRecord, flags.has("force"));
console.log(`[proof-intake-from-owner-evidence] ${displayPath(outputPath)}`);

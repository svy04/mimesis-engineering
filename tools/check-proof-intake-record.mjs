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

function usage() {
  console.log(`Usage: mimesis proof:intake-check [path/to/proof-intake-record.json] [--require-case-ready] [--write-report path/to/report.md]

Checks a schema-shaped proof intake record before it becomes a started case workspace.
It does not grant permission, create external proof, publish, redact files, or prove adoption.
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
    console.error(`Proof intake record is not valid JSON: ${error.message}`);
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

function hasPermissionSignal(value) {
  return /(own|permission|permitted|redact|anonym|public source|private only)/i.test(value ?? "");
}

function isFixture(record) {
  return /fixture/i.test(`${record.submitter ?? ""}\n${record.artifactOwner ?? ""}\n${record.permissionStatus ?? ""}`);
}

function validateRecord(record, requireCaseReady) {
  const failures = [];
  const warnings = [];
  const requiredKeys = [
    "schemaVersion",
    "status",
    "submitter",
    "startingArtifact",
    "artifactOwner",
    "permissionStatus",
    "publicationPreference",
    "redactionRequirements",
    "referencesStudied",
    "desiredTransformation",
    "proofBoundary",
    "safetyConfirmation",
    "prohibitedClaims",
  ];

  for (const key of requiredKeys) {
    if (!(key in record)) {
      failures.push(`record missing required property: ${key}`);
    }
  }

  if (record.schemaVersion !== "0.1.0") {
    failures.push("schemaVersion must be 0.1.0");
  }

  if (!["draft", "reviewed", "private only", "rejected"].includes(record.status)) {
    failures.push("status must be draft, reviewed, private only, or rejected");
  }

  if (!["public", "anonymized", "redacted", "private only"].includes(record.publicationPreference)) {
    failures.push("publicationPreference must be public, anonymized, redacted, or private only");
  }

  for (const key of [
    "submitter",
    "startingArtifact",
    "artifactOwner",
    "permissionStatus",
    "redactionRequirements",
    "desiredTransformation",
  ]) {
    if (typeof record[key] !== "string" || !record[key].trim() || placeholderPattern.test(record[key])) {
      failures.push(`${key} must be filled and not placeholder text`);
    }
  }

  if (!Array.isArray(record.referencesStudied) || !record.referencesStudied.length) {
    failures.push("referencesStudied must include at least one reference");
  }

  if (!Array.isArray(record.proofBoundary) || !record.proofBoundary.length) {
    failures.push("proofBoundary must include at least one boundary");
  }

  if (!Array.isArray(record.prohibitedClaims) || !record.prohibitedClaims.length) {
    failures.push("prohibitedClaims must include at least one forbidden claim");
  }

  const safety = record.safetyConfirmation ?? {};
  if (safety.noSecrets !== true) {
    failures.push("safetyConfirmation.noSecrets must be true");
  }
  if (safety.noPrivateCustomerData !== true) {
    failures.push("safetyConfirmation.noPrivateCustomerData must be true");
  }
  if (safety.noCopiedProtectedMaterial !== true) {
    failures.push("safetyConfirmation.noCopiedProtectedMaterial must be true");
  }

  if (secretPattern.test(JSON.stringify(record))) {
    failures.push("record appears to include a secret, token, password, OAuth token, or API key");
  }

  if (!hasPermissionSignal(record.permissionStatus)) {
    failures.push("permissionStatus must say whether the submitter owns it, has permission, needs redaction, or is private only");
  }

  const boundaryText = `${(record.proofBoundary ?? []).join("\n")}\n${(record.prohibitedClaims ?? []).join("\n")}`;
  for (const claim of ["external adoption", "benchmarked productivity", "customer outcomes", "legal originality"]) {
    if (!boundaryText.toLowerCase().includes(claim)) {
      warnings.push(`boundary text does not explicitly mention ${claim}`);
    }
  }

  if (requireCaseReady) {
    if (record.status !== "reviewed") {
      failures.push("record status must be reviewed before case creation");
    }
    if (record.publicationPreference === "private only") {
      failures.push("private only records cannot become publishable case workspaces");
    }
  }

  return { failures, warnings };
}

if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

const recordArg = positional[0] || flags.get("record") || ".mimesis/proof-intake/fixture-record.json";
const requireCaseReady = flags.has("require-case-ready");
const writeReport = flags.has("write-report");
const reportArg = flags.get("write-report") === true
  ? ".mimesis/proof-intake/fixture-check.md"
  : flags.get("write-report");

const recordPath = resolveInput(String(recordArg));
if (!fs.existsSync(recordPath) || !fs.statSync(recordPath).isFile()) {
  console.error(`Proof intake record file does not exist: ${recordPath}`);
  process.exit(1);
}

const record = readJson(recordPath);
const { failures, warnings } = validateRecord(record, requireCaseReady);
const fixture = isFixture(record);
const reportStatus = failures.length
  ? "not ready local proof intake record, not external proof."
  : fixture
    ? "reviewed local fixture record, not external proof."
    : "reviewed proof intake record, not external proof.";
const reportPath = reportArg ? path.resolve(process.cwd(), String(reportArg)) : null;
const source = displayPath(recordPath);

const report = `# Mimesis Proof Intake Check

Status: ${reportStatus}

This report checks a schema-shaped proof intake record before case creation.
It is not an owner permission decision, an external proof artifact, or publication.

## Source Record

- record: \`${source}\`
- schemaVersion: ${record.schemaVersion ?? "missing"}
- status: ${record.status ?? "missing"}
- submitter: ${record.submitter ?? "missing"}
- fixture boundary: ${fixture ? "not a real submitter artifact" : "not fixture-derived from local wording"}

## Schema Validation

- required fields: ${failures.some((failure) => failure.includes("missing required property")) ? "failed" : "present"}
- references studied: ${Array.isArray(record.referencesStudied) ? record.referencesStudied.length : 0}
- proof boundaries: ${Array.isArray(record.proofBoundary) ? record.proofBoundary.length : 0}
- prohibited claims: ${Array.isArray(record.prohibitedClaims) ? record.prohibitedClaims.length : 0}

## Safety Checks

- no secrets: ${record.safetyConfirmation?.noSecrets === true}
- no private customer data: ${record.safetyConfirmation?.noPrivateCustomerData === true}
- no copied protected material: ${record.safetyConfirmation?.noCopiedProtectedMaterial === true}
- heuristic secret scan: ${secretPattern.test(JSON.stringify(record)) ? "failed" : "clear"}

## Publication Gate

- publication preference: ${record.publicationPreference ?? "missing"}
- redaction requirements: ${record.redactionRequirements ?? "missing"}
- permission status: ${record.permissionStatus ?? "missing"}

## Case Creation Gate

- require case ready: ${requireCaseReady}
- case creation ready: ${failures.length ? "no" : "yes"}
- next command: \`npm run cli -- case:from-record ${source} --reference-pack ${record.referencesStudied?.[0] ?? "reference-packs/github-readme.md"}\`

## Warnings

${listStatus(warnings)}

## Failures

${listStatus(failures)}

## Allowed Claim

Mimesis can check a schema-shaped proof intake record before case creation.

## Disallowed Claim

The proof intake check does not create external proof.
It does not grant permission.
It does not redact files.
It does not publish.
It does not mean the artifact is safe for public release.
It does not prove adoption, benchmarked productivity, customer outcomes, commercial outcomes, legal originality, or endorsement.

## Boundary

This is a local intake check.
It does not replace human review, legal review, owner permission, the redaction packet, the case review gate, or completed before/after evidence.
`;

if (writeReport) {
  const outputPath = reportPath ?? path.resolve(process.cwd(), ".mimesis/proof-intake/fixture-check.md");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, report);
  console.log(`[proof-intake-check] ${displayPath(outputPath)}`);
}

if (failures.length) {
  console.error("\nProof intake record is not ready:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log(`Mimesis proof intake check passed: ${fixture ? "fixture record" : "record"} is case-checkable before proof creation.`);

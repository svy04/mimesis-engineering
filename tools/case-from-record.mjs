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

function usage() {
  console.log(`Usage: mimesis case:from-record path/to/proof-intake-record.json [--reference-pack reference-packs/github-readme.md] [--title "External Case"] [--out .mimesis/case-runs/external-case] [--force]

Creates a started Mimesis case workspace from a schema-shaped proof intake record.
It does not create completed before/after proof.
`);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "proof-intake-record";
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

function writeFile(filePath, content, force) {
  if (fs.existsSync(filePath) && !force) {
    throw new Error(`Refusing to overwrite existing file: ${filePath}`);
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`Proof intake record is not valid JSON: ${error.message}`);
    process.exit(1);
  }
}

function validateRecord(record) {
  const failures = [];
  for (const key of [
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
  ]) {
    if (!(key in record)) {
      failures.push(`record missing required property: ${key}`);
    }
  }

  if (record.schemaVersion !== "0.1.0") {
    failures.push("record schemaVersion must be 0.1.0");
  }

  if (record.status !== "reviewed") {
    failures.push("record status must be reviewed before a started case workspace is created");
  }

  if (record.publicationPreference === "private only") {
    failures.push("private only records cannot become publishable case workspaces");
  }

  if (!Array.isArray(record.referencesStudied) || !record.referencesStudied.length) {
    failures.push("record referencesStudied must include at least one reference");
  }

  if (!Array.isArray(record.proofBoundary) || !record.proofBoundary.length) {
    failures.push("record proofBoundary must include at least one boundary");
  }

  if (!Array.isArray(record.prohibitedClaims) || !record.prohibitedClaims.length) {
    failures.push("record prohibitedClaims must include at least one forbidden claim");
  }

  const safety = record.safetyConfirmation ?? {};
  if (!safety.noSecrets || !safety.noPrivateCustomerData || !safety.noCopiedProtectedMaterial) {
    failures.push("record safetyConfirmation must confirm no secrets, no private customer data, and no copied protected material");
  }

  if (failures.length) {
    console.error("\nProof intake record is not ready for case creation:");
    for (const failure of failures) {
      console.error(`[fail] ${failure}`);
    }
    process.exit(1);
  }
}

if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

const recordArg = positional[0] || flags.get("record");
const force = flags.has("force");

if (!recordArg) {
  console.error("Missing proof intake record file.");
  usage();
  process.exit(1);
}

const recordPath = resolveInput(String(recordArg));
if (!fs.existsSync(recordPath) || !fs.statSync(recordPath).isFile()) {
  console.error(`Proof intake record file does not exist: ${recordPath}`);
  process.exit(1);
}

const record = readJson(recordPath);
validateRecord(record);

const referencePackArg = flags.get("reference-pack") || record.referencesStudied[0];
const referencePackPath = resolveInput(String(referencePackArg));
if (!fs.existsSync(referencePackPath) || !fs.statSync(referencePackPath).isFile()) {
  console.error(`Reference pack file does not exist: ${referencePackPath}`);
  process.exit(1);
}

const title = String(flags.get("title") || "Proof Intake Record Case");
const slug = slugify(title);
const outArg = flags.get("out") || path.join(".mimesis", "case-runs", slug);
const outRoot = path.resolve(process.cwd(), String(outArg));
const date = new Date().toISOString().slice(0, 10);
const recordRelative = path.relative(outRoot, recordPath).replaceAll(path.sep, "/");
const referenceRelative = path.relative(outRoot, referencePackPath).replaceAll(path.sep, "/");
const fixtureDerived = /fixture/i.test(`${record.submitter}\n${record.artifactOwner}\n${record.permissionStatus}`);
const fixtureBoundary = fixtureDerived
  ? "This record is fixture-derived and is not a real submitter artifact."
  : "This record is submitter-provided or operator-provided; permission still remains bounded by the record.";
const proofBoundary = record.proofBoundary.join("\n");
const prohibitedClaims = record.prohibitedClaims.map((claim) => `- ${claim}`).join("\n");
const references = record.referencesStudied.map((reference) => `- ${reference}`).join("\n");

if (fs.existsSync(outRoot) && !force) {
  console.error(`Output already exists: ${outRoot}`);
  console.error("Re-run with --force to overwrite generated files.");
  process.exit(1);
}

const files = new Map([
  ["README.md", `# ${title}

Case Status: started.

This case workspace was created from a schema-shaped proof intake record.
It is not a completed before/after case yet.

## Boundary

- ${fixtureBoundary}
- The record was checked for required fields, publication preference, safety confirmations, and prohibited claims.
- This workspace does not prove improvement, external adoption, benchmarked outcomes, customer outcomes, commercial value, or legal originality.
`],
  ["proof-intake-record.json", `${JSON.stringify(record, null, 2)}\n`],
  ["weak-artifact.md", `# Weak Artifact

Source record: \`${recordRelative}\`

## Starting Artifact

${record.startingArtifact}

## Owner And Permission

- owner: ${record.artifactOwner}
- permission status: ${record.permissionStatus}
- publication preference: ${record.publicationPreference}
- redaction requirements: ${record.redactionRequirements}

## Safety Confirmation

- no secrets: ${record.safetyConfirmation.noSecrets}
- no private customer data: ${record.safetyConfirmation.noPrivateCustomerData}
- no copied protected material: ${record.safetyConfirmation.noCopiedProtectedMaterial}

## Fixture Boundary

${fixtureBoundary}
`],
  [".mimesis/spec_lock.md", `# Spec Lock

Case Status: started.

## Goal

Transform the weak artifact from proof intake record \`${recordRelative}\`.

## Standard

Give AI standards, not roles.
Bring one weak artifact.

## Permission Boundary

- owner: ${record.artifactOwner}
- permission status: ${record.permissionStatus}
- publication preference: ${record.publicationPreference}
- redaction requirements: ${record.redactionRequirements}
- fixture boundary: ${fixtureBoundary}

## Proof Boundary

${proofBoundary}

## Completion Standard

The case is not complete until the improved artifact, boundary check, case note, and run ledger contain concrete before/after evidence.
`],
  [".mimesis/procedure_tree.md", `# Procedure Tree

Case Status: started.

1. Import the schema-shaped proof intake record.
2. Distill owner, permission, publication, redaction, fixture, and proof boundaries.
3. Extract structure from references.
4. Transform the artifact under its own constraints.
5. Inspect surface, wording, proof, and permission risk.
6. Write the case note and run ledger.
`],
  [".mimesis/artifact-brief.md", `# Artifact Brief

Case Status: started.

## Artifact

Proof intake record \`${recordRelative}\`.

## Audience

Define from the record and artifact before transformation.

## Goal

${record.desiredTransformation}

## Current Weakness

To be distilled from the starting artifact.

## Constraint

Respect permission, redaction, fixture status, owner facts, and proof boundary.

## Success Looks Like

A clear before/after transformation with explicit claim limits.

## Proof Needed

Completed improved artifact, boundary check, case note, and proof intake record trail.
`],
  [".mimesis/reference-set.md", `# Reference Set

Case Status: started.

## Use Case

Transform a weak artifact from a proof intake record.

## References From Record

${references}

## References

| Source Type | Source / Reference | Why It Is Strong | What To Inspect | What Not To Copy | Claim Boundary |
| --- | --- | --- | --- | --- | --- |
| record reference | ${record.referencesStudied.join(", ")} | Submitted in the proof intake record | Structure, sequence, trust devices, proof boundary | Wording, protected layout, unsupported authority | Record does not prove endorsement |
| reference pack | \`${referenceRelative}\` | Selected as starting standard field | Transferable structure | Surface wording or layout | Local structure support only |

## Source-First Check

- Proof intake record is preserved.
- Reference pack is visible.
- References must be used for structure, not surface copying.
`],
  [".mimesis/structure-map.md", `# Structure Map

Case Status: started.

## Knowledge Structure

Not extracted yet.

## User Flow

Not extracted yet.

## Trust Devices

Permission, redaction, fixture status, proof boundary, and before/after evidence must remain visible.

## Claim Boundary

${proofBoundary}
`],
  [".mimesis/transformation-plan.md", `# Transformation Plan

Case Status: started.

## Transfer

Transfer structure from references after inspection.

## Change

${record.desiredTransformation}

## Reject

Reject copied surface, hidden references, fake proof, private data, and unsupported outcome claims.

## Proof Needed

Improved artifact, boundary check, case note, and run ledger.
`],
  [".mimesis/improved-artifact.md", `# Improved Artifact

Case Status: started.

## Improved Version

Not produced yet.

## Why It Is Stronger

Not proven yet.

## What Remains Unproven

Improvement, external adoption, customer outcomes, benchmarked productivity, commercial value, and legal originality remain unproven.
`],
  [".mimesis/boundary-check.md", `# Boundary Check

Case Status: started.

## Permission Risk

- owner: ${record.artifactOwner}
- permission status: ${record.permissionStatus}
- publication preference: ${record.publicationPreference}
- redaction requirements: ${record.redactionRequirements}
- fixture boundary: ${fixtureBoundary}

## Surface Similarity Risk

Not inspected yet.

## Wording Risk

Not inspected yet.

## Proof Risk

${proofBoundary}

## Prohibited Claims

${prohibitedClaims}

## What Remains Unproven?

The transformation has not been completed yet.
`],
  [".mimesis/case-note.md", `# Case Note

Case Status: started.

## Starting Artifact

See \`weak-artifact.md\`.

## Problem

To be distilled from the record and weak artifact.

## Reference Artifacts

${references}
- \`${referenceRelative}\`

## Extracted Structure

Not extracted yet.

## Transformation

Not transformed yet.

## Before / After

Before:
See \`weak-artifact.md\`.

After:
Not produced yet.

## What Improved

Not proven yet.

## What Remains Unproven

${proofBoundary}

## Next Proof Artifact

Complete the improved artifact and boundary check.
`],
  [".mimesis/run_ledger.md", `# Run Ledger

Case Status: started.

## Run

Date: ${date}

Operator: Mimesis CLI

Artifact: proof intake record \`${recordRelative}\`

## Import

- Imported proof intake record.
- Imported reference pack: \`${referenceRelative}\`

## Distill

- Permission, publication, redaction, fixture status, and proof boundary were copied into the case workspace.

## Capsule

- Created a started Mimesis case workspace from a schema-shaped record.

## Shard

- Created \`.mimesis\` protocol files.
- Created \`weak-artifact.md\`.
- Preserved \`proof-intake-record.json\`.

## Verify

- Record passed local required-field and safety checks.
- Completion is intentionally unproven.

## Remember

- This is a started case workspace, not completed proof.
`],
]);

try {
  for (const [relativePath, content] of files) {
    writeFile(path.join(outRoot, relativePath), content, force);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

console.log(`[case-from-record] ${path.relative(process.cwd(), outRoot).replaceAll(path.sep, "/")}`);
console.log(`[record] ${recordRelative}`);
console.log(`[reference-pack] ${referenceRelative}`);
console.log("\nNext:");
console.log(`  cd ${path.relative(process.cwd(), outRoot).replaceAll(path.sep, "/") || "."}`);
console.log("  complete .mimesis/improved-artifact.md");
console.log("  complete .mimesis/boundary-check.md");
console.log("  complete .mimesis/case-note.md");
console.log("  mimesis case:check .");

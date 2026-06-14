#!/usr/bin/env node

import { spawnSync } from "node:child_process";
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
  console.log(`Usage: mimesis case:from-intake path/to/permissioned-case.md --reference-pack reference-packs/github-readme.md [--title "External Case"] [--out .mimesis/case-runs/external-case] [--force]

Reviews a permissioned external case intake and creates a started Mimesis case workspace.
It does not create completed before/after proof.
`);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "permissioned-case";
}

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function extractHeadingSection(content, aliases) {
  const lines = content.split(/\r?\n/);
  let start = -1;
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^#{1,6}\s+(.+)$/);
    if (!match) {
      continue;
    }
    const heading = normalize(match[1]);
    if (aliases.some((alias) => {
      const normalizedAlias = normalize(alias);
      return heading === normalizedAlias || heading.startsWith(`${normalizedAlias} `) || heading.endsWith(` ${normalizedAlias}`);
    })) {
      start = index + 1;
      break;
    }
  }

  if (start < 0) {
    return "";
  }

  const collected = [];
  for (const line of lines.slice(start)) {
    if (/^#{1,6}\s+/.test(line)) {
      break;
    }
    collected.push(line);
  }
  return collected.join("\n").trim();
}

function sectionValue(content, aliases) {
  return extractHeadingSection(content, aliases);
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

if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

const intakeArg = positional[0] || flags.get("intake");
const referencePackArg = flags.get("reference-pack");
const force = flags.has("force");

if (!intakeArg) {
  console.error("Missing permissioned case intake file.");
  usage();
  process.exit(1);
}

if (!referencePackArg) {
  console.error("Missing required --reference-pack path.");
  usage();
  process.exit(1);
}

const intakePath = resolveInput(String(intakeArg));
const referencePackPath = resolveInput(String(referencePackArg));

if (!fs.existsSync(intakePath) || !fs.statSync(intakePath).isFile()) {
  console.error(`Permissioned case intake file does not exist: ${intakePath}`);
  process.exit(1);
}

if (!fs.existsSync(referencePackPath) || !fs.statSync(referencePackPath).isFile()) {
  console.error(`Reference pack file does not exist: ${referencePackPath}`);
  process.exit(1);
}

const review = spawnSync(process.execPath, [
  path.join(repoRoot, "tools", "check-permissioned-case.mjs"),
  intakePath,
  "--require-public",
], {
  cwd: process.cwd(),
  encoding: "utf8",
});

if (review.status !== 0) {
  console.error(review.stderr || review.stdout);
  process.exit(review.status ?? 1);
}

const intake = fs.readFileSync(intakePath, "utf8");
const title = String(flags.get("title") || path.basename(intakePath, path.extname(intakePath)));
const slug = slugify(title);
const outArg = flags.get("out") || path.join(".mimesis", "case-runs", slug);
const outRoot = path.resolve(process.cwd(), String(outArg));
const date = new Date().toISOString().slice(0, 10);
const intakeRelative = path.relative(outRoot, intakePath).replaceAll(path.sep, "/");
const referenceRelative = path.relative(outRoot, referencePackPath).replaceAll(path.sep, "/");

if (fs.existsSync(outRoot) && !force) {
  console.error(`Output already exists: ${outRoot}`);
  console.error("Re-run with --force to overwrite generated files.");
  process.exit(1);
}

const startingArtifact = sectionValue(intake, ["starting artifact"]);
const owner = sectionValue(intake, ["artifact owner", "owner"]);
const permission = sectionValue(intake, ["permission status"]);
const publication = sectionValue(intake, ["publication preference"]);
const redaction = sectionValue(intake, ["redaction requirements"]);
const references = sectionValue(intake, ["references studied"]);
const transformation = sectionValue(intake, ["desired transformation"]);
const proofBoundary = sectionValue(intake, ["proof boundary"]);
const safety = sectionValue(intake, ["safety confirmation"]);

const files = new Map([
  ["README.md", `# ${title}

Case Status: started.

This permissioned external case workspace was created from an intake file.
It is not a completed before/after case yet.

## Boundary

- Permission was reviewed by \`case:review --require-public\`.
- Publication preference and redaction requirements are recorded.
- This workspace does not prove improvement, adoption, benchmarked outcomes, commercial outcomes, or legal originality.
`],
  ["permissioned-intake.md", intake],
  ["weak-artifact.md", `# Weak Artifact

Source intake: \`${intakeRelative}\`

## Starting Artifact

${startingArtifact}

## Owner And Permission

- owner: ${owner}
- permission status: ${permission}
- publication preference: ${publication}
- redaction requirements: ${redaction}

## Safety Confirmation

${safety}
`],
  [".mimesis/spec_lock.md", `# Spec Lock

Case Status: started.

## Goal

Transform the permissioned external weak artifact from \`${intakeRelative}\`.

## Standard

Give AI standards, not roles.
Bring one weak artifact.

## Permission Boundary

- owner: ${owner}
- permission status: ${permission}
- publication preference: ${publication}
- redaction requirements: ${redaction}

## Proof Boundary

${proofBoundary}

## Completion Standard

The case is not complete until the improved artifact, boundary check, case note, and run ledger contain concrete before/after evidence.
`],
  [".mimesis/procedure_tree.md", `# Procedure Tree

Case Status: started.

1. Import the permissioned intake and weak artifact.
2. Distill owner, permission, publication, redaction, and proof boundaries.
3. Extract structure from references.
4. Transform the artifact under its own constraints.
5. Inspect surface, wording, proof, and permission risk.
6. Write the case note and run ledger.
`],
  [".mimesis/artifact-brief.md", `# Artifact Brief

Case Status: started.

## Artifact

Permissioned external weak artifact from \`${intakeRelative}\`.

## Audience

Define from the intake before transformation.

## Goal

${transformation}

## Current Weakness

To be distilled from the starting artifact.

## Constraint

Respect permission, redaction, owner facts, and proof boundary.

## Success Looks Like

A clear before/after transformation with explicit claim limits.

## Proof Needed

Completed improved artifact, boundary check, case note, and permissioned-case review trail.
`],
  [".mimesis/reference-set.md", `# Reference Set

Case Status: started.

## Use Case

Transform a permissioned external weak artifact.

## References

| Source Type | Source / Reference | Why It Is Strong | What To Inspect | What Not To Copy | Claim Boundary |
| --- | --- | --- | --- | --- | --- |
| intake reference | ${references} | Submitted as the reference field | Structure, sequence, trust devices, proof boundary | Wording, protected layout, unsupported authority | Intake does not prove endorsement |
| reference pack | \`${referenceRelative}\` | Selected as starting standard field | Transferable structure | Surface wording or layout | Local structure support only |

## Source-First Check

- Permissioned intake is recorded.
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

Permission, redaction, proof boundary, and before/after evidence must remain visible.

## Claim Boundary

${proofBoundary}
`],
  [".mimesis/transformation-plan.md", `# Transformation Plan

Case Status: started.

## Transfer

Transfer structure from references after inspection.

## Change

${transformation}

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

- owner: ${owner}
- permission status: ${permission}
- publication preference: ${publication}
- redaction requirements: ${redaction}

## Surface Similarity Risk

Not inspected yet.

## Wording Risk

Not inspected yet.

## Proof Risk

${proofBoundary}

## What Remains Unproven?

The transformation has not been completed yet.
`],
  [".mimesis/case-note.md", `# Case Note

Case Status: started.

## Starting Artifact

See \`weak-artifact.md\`.

## Problem

To be distilled from the intake and weak artifact.

## Reference Artifacts

- ${references}
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

Artifact: permissioned external intake \`${intakeRelative}\`

## Import

- Imported permissioned intake.
- Imported reference pack: \`${referenceRelative}\`

## Distill

- Permission, publication, redaction, and proof boundary were copied into the case workspace.

## Capsule

- Created a started Mimesis case workspace.

## Shard

- Created \`.mimesis\` protocol files.
- Created \`weak-artifact.md\`.
- Preserved \`permissioned-intake.md\`.

## Verify

- Intake passed \`case:review --require-public\`.
- Completion is intentionally unproven.

## Remember

- This is a started external case workspace, not completed proof.
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

console.log(`[case-from-intake] ${path.relative(process.cwd(), outRoot).replaceAll(path.sep, "/")}`);
console.log(`[intake] ${intakeRelative}`);
console.log(`[reference-pack] ${referenceRelative}`);
console.log("\nNext:");
console.log(`  cd ${path.relative(process.cwd(), outRoot).replaceAll(path.sep, "/") || "."}`);
console.log("  complete .mimesis/improved-artifact.md");
console.log("  complete .mimesis/boundary-check.md");
console.log("  complete .mimesis/case-note.md");
console.log("  mimesis case:check .");

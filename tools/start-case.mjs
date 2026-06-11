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
  console.log(`Usage: mimesis case:start --artifact path/to/file --reference-pack reference-packs/github-readme.md [--title "Case Title"] [--out .mimesis/case-runs/case-title] [--force]

Creates a started Mimesis case workspace from one weak artifact.
It does not create a completed proof artifact.
`);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "mimesis-case";
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

const artifactArg = flags.get("artifact") || positional[0];
const referencePackArg = flags.get("reference-pack");
const force = flags.has("force");

if (!artifactArg) {
  console.error("Missing required --artifact path.");
  usage();
  process.exit(1);
}

if (!referencePackArg) {
  console.error("Missing required --reference-pack path.");
  usage();
  process.exit(1);
}

const artifactPath = resolveInput(String(artifactArg));
const referencePackPath = resolveInput(String(referencePackArg));

if (!fs.existsSync(artifactPath) || !fs.statSync(artifactPath).isFile()) {
  console.error(`Weak artifact file does not exist: ${artifactPath}`);
  process.exit(1);
}

if (!fs.existsSync(referencePackPath) || !fs.statSync(referencePackPath).isFile()) {
  console.error(`Reference pack file does not exist: ${referencePackPath}`);
  process.exit(1);
}

const title = String(flags.get("title") || path.basename(artifactPath, path.extname(artifactPath)));
const slug = slugify(title);
const outArg = flags.get("out") || path.join(".mimesis", "case-runs", slug);
const outRoot = path.resolve(process.cwd(), String(outArg));
const mimesisDir = path.join(outRoot, ".mimesis");
const date = new Date().toISOString().slice(0, 10);
const artifactRelative = path.relative(outRoot, artifactPath).replaceAll(path.sep, "/");
const referenceRelative = path.relative(outRoot, referencePackPath).replaceAll(path.sep, "/");
const weakArtifact = fs.readFileSync(artifactPath, "utf8");

if (fs.existsSync(outRoot) && !force) {
  console.error(`Output already exists: ${outRoot}`);
  console.error("Re-run with --force to overwrite generated files.");
  process.exit(1);
}

const files = new Map([
  ["README.md", `# ${title}

Case Status: started.

This folder was created by \`mimesis case:start\` from one weak artifact.
Complete the files under \`.mimesis/\`, then run:

\`\`\`bash
mimesis workspace:check .
\`\`\`

Boundary:
This folder is not a completed case note yet.
It does not prove improvement, external adoption, originality, or outcomes.
`],
  ["weak-artifact.md", `# Weak Artifact

Source: \`${artifactRelative}\`

\`\`\`text
${weakArtifact}
\`\`\`
`],
  [".mimesis/spec_lock.md", `# Spec Lock

Case Status: started.

## Goal

Improve \`${artifactRelative}\` through one Mimesis loop.

## Standard

Give AI standards, not roles.
Bring one weak artifact.

## Boundaries

- Do not hide references.
- Do not copy protected surface.
- Do not invent proof.
- Do not claim external outcomes from this starter workspace.

## Proof Standard

The case is not complete until the improved artifact, boundary check, case note, and run ledger are filled with concrete evidence.
`],
  [".mimesis/procedure_tree.md", `# Procedure Tree

Case Status: started.

1. Import the weak artifact and reference pack.
2. Distill the goal, audience, constraints, and forbidden claims.
3. Capsule the transformation into small changes.
4. Shard the work into artifact sections or files.
5. Verify the improved artifact and boundary check.
6. Remember the result in the run ledger and case note.
`],
  [".mimesis/artifact-brief.md", `# Artifact Brief

Case Status: started.

## Artifact

\`${artifactRelative}\`

## Audience

Define the real reader or operator before transforming.

## Goal

Make the artifact stronger without copying reference surface.

## Current Weakness

Record the weakness after inspecting the artifact.

## Constraint

Preserve the owner's facts, context, permissions, and proof boundary.

## Success Looks Like

A concrete before/after change with named proof limits.

## Proof Needed

Completed improved artifact, boundary check, and case note.
`],
  [".mimesis/reference-set.md", `# Reference Set

Case Status: started.

## Use Case

Improve \`${artifactRelative}\` using a source-first reference pack.

## References

| Source Type | Source / Reference | Why It Is Strong | What To Inspect | What Not To Copy | Claim Boundary |
| --- | --- | --- | --- | --- | --- |
| reference pack | \`${referenceRelative}\` | Selected as the starting standard field | Structure, sequence, trust devices, proof language | Wording, protected layout, unsupported authority | This starter proves only reference selection |

## Selection Standard

Reference selection must prefer original sources, official docs, source repos, papers, patents, standards, or other primary artifacts where relevant.

## Missing References

Add missing strong references before making a stronger public claim.

## Attribution Notes

Name references used for structure extraction.

## Source-First Check

- Start from local repo/runtime truth where relevant.
- Prefer official docs, source repos, papers, patents, standards, or other primary/original sources.
- Do not treat secondary commentary as proof.
- Separate structure extraction from copying.
`],
  [".mimesis/structure-map.md", `# Structure Map

Case Status: started.

## Knowledge Structure

Map what the reference pack teaches before rewriting.

## User Flow

Map how the reader moves through the artifact.

## Trust Devices

Map how proof, examples, limits, and next actions create trust.

## Claim Boundary

Mark what the weak artifact can and cannot claim.

## Failure Handling

Name where the artifact might overclaim, confuse, or copy.
`],
  [".mimesis/transformation-plan.md", `# Transformation Plan

Case Status: started.

## Transfer

Transfer structure, sequence, checks, and proof discipline.

## Change

Rewrite the weak artifact under its own facts and constraints.

## Reject

Reject copied wording, unsupported claims, hidden references, and fake proof.

## Proof Needed

The final case needs a concrete improved artifact, boundary check, and case note.
`],
  [".mimesis/improved-artifact.md", `# Improved Artifact

Case Status: started.

## Improved Version

Not produced yet.

## Why It Is Stronger

Not proven yet.

## What Remains Unproven

Improvement, external adoption, originality, and outcomes remain unproven until the loop is completed and checked.
`],
  [".mimesis/boundary-check.md", `# Boundary Check

Case Status: started.

## Surface Similarity Risk

Not inspected yet.

## Wording Risk

Not inspected yet.

## Layout Risk

Not inspected yet.

## Authority Borrowing Risk

Not inspected yet.

## Proof Risk

Do not claim improvement from this starter workspace.

## Attribution Needed?

Reference pack: \`${referenceRelative}\`

## What Was Actually Transformed?

Not transformed yet.

## What Remains Unproven?

All outcome and improvement claims remain unproven.
`],
  [".mimesis/case-note.md", `# Case Note

Case Status: started.

## Starting Artifact

\`${artifactRelative}\`

## Problem

Record the artifact's weakness after inspection.

## Reference Artifacts

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

All improvement, adoption, benchmark, and originality claims remain unproven.

## Next Proof Artifact

Complete the improved artifact and boundary check.
`],
  [".mimesis/run_ledger.md", `# Run Ledger

Case Status: started.

## Run

Date: ${date}

Operator: Mimesis CLI

Artifact: \`${artifactRelative}\`

## Import

- Imported weak artifact: \`${artifactRelative}\`
- Imported reference pack: \`${referenceRelative}\`

## Distill

- Goal and boundaries are started but not complete.

## Capsule

- Case workspace created for one Mimesis loop.

## Shard

- Created \`.mimesis\` protocol files.
- Created \`weak-artifact.md\`.

## Verify

- Starter workspace created.
- Completion is intentionally unproven.

## Remember

- This is a starter ledger.
- It must be updated after the improved artifact, boundary check, and case note are completed.
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

console.log(`[case-start] ${path.relative(process.cwd(), outRoot).replaceAll(path.sep, "/")}`);
console.log(`[artifact] ${artifactRelative}`);
console.log(`[reference-pack] ${referenceRelative}`);
console.log("\nNext:");
console.log(`  cd ${path.relative(process.cwd(), outRoot).replaceAll(path.sep, "/") || "."}`);
console.log("  complete .mimesis/improved-artifact.md");
console.log("  complete .mimesis/boundary-check.md");
console.log("  complete .mimesis/case-note.md");
console.log("  mimesis workspace:check .");

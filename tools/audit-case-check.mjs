#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function runNode(script, args, cwd) {
  return spawnSync(process.execPath, [path.join(root, "tools", script), ...args], {
    cwd,
    encoding: "utf8",
  });
}

const packageJson = JSON.parse(read("package.json"));
const cli = read("bin/mimesis.mjs");
const doc = read("docs/CASE-CHECK.md");

for (const scriptName of ["case:check", "audit:case-check"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!packageJson.scripts?.["release:check"]?.includes("case:check")) {
  failures.push("release:check must include npm run case:check");
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:case-check")) {
  failures.push("release:check must include npm run audit:case-check");
}

if (!cli.includes('"case:check"')) {
  failures.push("CLI missing case:check command");
}

for (const text of [
  "completed case note",
  "does not prove external adoption",
  "--write-report",
]) {
  if (!doc.includes(text)) {
    failures.push(`docs/CASE-CHECK.md missing text: ${text}`);
  }
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-case-check-"));
const weakArtifactPath = path.join(tempRoot, "weak-readme.md");
fs.writeFileSync(weakArtifactPath, "# Weak README\n\nThis repo does something useful, probably.\n");

try {
  const start = runNode("start-case.mjs", [
    "--artifact",
    weakArtifactPath,
    "--reference-pack",
    "reference-packs/github-readme.md",
    "--title",
    "Smoke README",
    "--out",
    "smoke-case",
  ], tempRoot);

  if (start.status !== 0) {
    failures.push(`case:start smoke failed: ${start.stderr || start.stdout}`);
  }

  const outRoot = path.join(tempRoot, "smoke-case");
  const startedCheck = runNode("check-case.mjs", [outRoot], tempRoot);
  if (startedCheck.status === 0) {
    failures.push("case:check must not pass a newly started case");
  }

  const replacements = new Map([
    [".mimesis/artifact-brief.md", `# Artifact Brief

## Artifact

weak-readme.md

## Audience

New repository visitors.

## Goal

Help them understand and try the project.

## Current Weakness

The current text is vague and unsupported.

## Constraint

Do not claim adoption or benchmarked outcomes.

## Success Looks Like

The README has a clear promise, first action, and proof boundary.

## Proof Needed

Completed before/after case note and boundary check.
`],
    [".mimesis/reference-set.md", `# Reference Set

## Use Case

Improve weak-readme.md with README structure.

## References

| Source Type | Source / Reference | Why It Is Strong | What To Inspect | What Not To Copy | Claim Boundary |
| --- | --- | --- | --- | --- | --- |
| reference pack | reference-packs/github-readme.md | Gives README structure standards | Promise, quickstart, proof limits | Wording or implied adoption | Local structure only |

## Source-First Check

- Local artifact was inspected.
- Reference pack was named.
- Secondary commentary was not used as proof.
`],
    [".mimesis/structure-map.md", `# Structure Map

## Knowledge Structure

Promise, first action, evidence, boundary.

## User Flow

Reader sees what it is, tries a command, then checks limits.

## Trust Devices

Before/after note and explicit unproven claims.

## Claim Boundary

No adoption or outcome proof.
`],
    [".mimesis/transformation-plan.md", `# Transformation Plan

## Transfer

Fast promise and first action structure.

## Change

Rewrite vague text into concrete onboarding.

## Reject

No copied language or unsupported proof.

## Proof Needed

Case note and boundary check.
`],
    [".mimesis/improved-artifact.md", `# Improved Artifact

## Improved Version

# Smoke README

This README now names the project, shows a first action, and states its limits.

## Why It Is Stronger

It is stronger because the reader can understand the artifact and see what is unproven.

## What Remains Unproven

External adoption, outcomes, and originality guarantees remain unproven.
`],
    [".mimesis/boundary-check.md", `# Boundary Check

## Surface Similarity Risk

Low; the output uses generic README structure.

## Wording Risk

Low; no reference wording is copied.

## Layout Risk

Low; headings are conventional.

## Authority Borrowing Risk

Medium; reference packs should not imply endorsement.

## Proof Risk

No external adoption, benchmark, or customer outcome proof.

## What Remains Unproven

External results, originality guarantees, and adoption remain unproven.
`],
    [".mimesis/case-note.md", `# Case Note

## Starting Artifact

weak-readme.md

## Problem

The starting artifact was vague.

## Reference Artifacts

- reference-packs/github-readme.md

## Extracted Structure

Promise, first action, proof boundary.

## Transformation

The README was rewritten around concrete onboarding.

## Before / After

Before:
The README said the project did something useful.

After:
The README names the project, first action, and proof boundary.

## What Improved

The artifact is clearer and more bounded.

## What Remains Unproven

External adoption, benchmarked productivity, customer outcomes, and legal originality remain unproven.

## Next Proof Artifact

Run this on a permissioned external artifact.
`],
    [".mimesis/run_ledger.md", `# Run Ledger

## Run

Date: 2026-06-10

Operator: audit

Artifact: weak-readme.md

## Import

- Imported weak artifact and reference pack.

## Distill

- Locked goal and proof boundary.

## Capsule

- Split the README into promise, first action, and boundary.

## Shard

- Updated improved artifact and case note.

## Verify

- Ran case check.

## Remember

- Recorded remaining proof gap.
`],
  ]);

  for (const [relativePath, content] of replacements) {
    fs.writeFileSync(path.join(outRoot, relativePath), content);
  }

  const finishedCheck = runNode("check-case.mjs", [outRoot, "--write-report"], tempRoot);
  if (finishedCheck.status !== 0) {
    failures.push(`case:check finished smoke failed: ${finishedCheck.stderr || finishedCheck.stdout}`);
  }

  if (!fs.existsSync(path.join(outRoot, ".mimesis", "case-proof.md"))) {
    failures.push("case:check --write-report must create .mimesis/case-proof.md");
  }
} finally {
  if (tempRoot.startsWith(os.tmpdir())) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

if (failures.length) {
  console.error("\nMimesis case-check audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis case-check audit passed: started cases fail and completed evidence cases pass.");

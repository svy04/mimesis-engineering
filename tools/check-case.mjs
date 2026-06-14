#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const writeReport = args.includes("--write-report");
const targetArg = args.find((arg) => !arg.startsWith("--")) ?? ".";
const targetRoot = path.resolve(process.cwd(), targetArg);
const mimesisDir = path.join(targetRoot, ".mimesis");
const failures = [];

const requiredFiles = [
  "artifact-brief.md",
  "reference-set.md",
  "structure-map.md",
  "transformation-plan.md",
  "improved-artifact.md",
  "boundary-check.md",
  "case-note.md",
  "run_ledger.md",
];

const sectionChecks = [
  ["artifact-brief.md", ["## Artifact", "## Audience", "## Goal", "## Current Weakness", "## Constraint", "## Success Looks Like", "## Proof Needed"]],
  ["reference-set.md", ["Source / Reference", "Claim Boundary", "Source-First Check"]],
  ["structure-map.md", ["## Knowledge Structure", "## User Flow", "## Trust Devices", "## Claim Boundary"]],
  ["transformation-plan.md", ["## Proof Needed"]],
  ["improved-artifact.md", ["## Improved Version", "## Why It Is Stronger", "## What Remains Unproven"]],
  ["boundary-check.md", ["## Surface Similarity Risk", "## Wording Risk", "## Authority Borrowing Risk", "## Proof Risk", "## What Remains Unproven"]],
  ["case-note.md", ["## Starting Artifact", "## Problem", "## Reference Artifacts", "## Extracted Structure", "## Transformation", "## Before / After", "## What Improved", "## What Remains Unproven", "## Next Proof Artifact"]],
  ["run_ledger.md", ["## Import", "## Distill", "## Capsule", "## Shard", "## Verify", "## Remember"]],
];

const unfinishedPatterns = [
  /\bTBD\b/i,
  /<fill/i,
  /\bTODO\b/i,
  /^Case Status:\s*started/im,
  /Not produced yet/i,
  /Not proven yet/i,
  /Not inspected yet/i,
  /Not transformed yet/i,
  /Not extracted yet/i,
  /Record the artifact's weakness/i,
  /Define the real reader/i,
  /Map what the reference pack teaches/i,
];

function usage() {
  console.log(`Usage: mimesis case:check [target-dir] [--write-report]

Checks whether a Mimesis case workspace has enough local evidence to be treated as a completed case note.
This does not prove external adoption, benchmarked outcomes, legal originality, or customer proof.
`);
}

function read(relativePath) {
  const fullPath = path.join(mimesisDir, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`missing .mimesis/${relativePath}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function requireText(file, content, text) {
  if (!content.includes(text)) {
    failures.push(`.mimesis/${file} missing ${text}`);
  }
}

if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

if (!fs.existsSync(targetRoot)) {
  console.error(`Target directory does not exist: ${targetRoot}`);
  process.exit(1);
}

if (!fs.existsSync(mimesisDir)) {
  console.error(`Target does not contain a .mimesis directory: ${targetRoot}`);
  process.exit(1);
}

const contents = new Map();
for (const file of requiredFiles) {
  const content = read(file);
  contents.set(file, content);
  for (const pattern of unfinishedPatterns) {
    if (pattern.test(content)) {
      failures.push(`.mimesis/${file} still contains unfinished case evidence: ${pattern.source}`);
      break;
    }
  }
}

for (const [file, sections] of sectionChecks) {
  const content = contents.get(file) ?? "";
  for (const section of sections) {
    requireText(file, content, section);
  }
}

const caseNote = contents.get("case-note.md") ?? "";
if (!/Before:\s*[\s\S]+After:/i.test(caseNote)) {
  failures.push(".mimesis/case-note.md must include both Before and After evidence");
}

const boundaryCheck = contents.get("boundary-check.md") ?? "";
if (!/not|unproven|unsupported|boundary|risk/i.test(boundaryCheck)) {
  failures.push(".mimesis/boundary-check.md must include explicit proof or claim limits");
}

const improvedArtifact = contents.get("improved-artifact.md") ?? "";
if (!/stronger|improved|changed|transformed/i.test(improvedArtifact)) {
  failures.push(".mimesis/improved-artifact.md must describe what became stronger or changed");
}

const transformationPlan = contents.get("transformation-plan.md") ?? "";
const hasSimplePlanSections = /## Transfer/i.test(transformationPlan) && /## Change/i.test(transformationPlan) && /## Reject/i.test(transformationPlan);
const hasPatternPlanSections = /## Extracted Patterns/i.test(transformationPlan) && /## Patterns To Transform/i.test(transformationPlan) && /## Patterns To Reject/i.test(transformationPlan);
if (!hasSimplePlanSections && !hasPatternPlanSections) {
  failures.push(".mimesis/transformation-plan.md must include transfer/change/reject or extracted/transform/reject sections");
}

const referenceSet = contents.get("reference-set.md") ?? "";
if (!/\|.*Source.*\|.*Reference.*\|/i.test(referenceSet) && !/Source Type/i.test(referenceSet)) {
  failures.push(".mimesis/reference-set.md must include source/reference evidence");
}

if (failures.length) {
  console.error("\nMimesis case check failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

if (writeReport) {
  const reportPath = path.join(mimesisDir, "case-proof.md");
  const report = `# Case Proof Report

Status: local case evidence checked.

Target: \`${path.relative(process.cwd(), targetRoot).replaceAll(path.sep, "/") || "."}\`

## Evidence Checked

- artifact brief
- reference set
- structure map
- transformation plan
- improved artifact
- boundary check
- case note
- run ledger

## Allowed Claim

This local case workspace contains the minimum Mimesis case evidence expected by \`case:check\`.

## Not Proven

- external adoption
- benchmarked productivity
- customer outcomes
- legal originality
- marketplace or package release

## Boundary

This report is generated from local files only.
`;
  fs.writeFileSync(reportPath, report);
  console.log(`[case-proof] ${path.relative(process.cwd(), reportPath).replaceAll(path.sep, "/")}`);
}

console.log(`Mimesis case check passed: ${requiredFiles.length} case evidence files checked at ${path.relative(process.cwd(), mimesisDir) || mimesisDir}.`);

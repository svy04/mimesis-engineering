#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const targetArg = args.find((arg) => !arg.startsWith("--")) ?? ".";
const targetRoot = path.resolve(process.cwd(), targetArg);
const mimesisDir = path.join(targetRoot, ".mimesis");
const failures = [];

const requiredFiles = [
  "spec_lock.md",
  "procedure_tree.md",
  "artifact-brief.md",
  "reference-set.md",
  "structure-map.md",
  "transformation-plan.md",
  "improved-artifact.md",
  "boundary-check.md",
  "case-note.md",
  "run_ledger.md",
];

function read(relativePath) {
  const fullPath = path.join(mimesisDir, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`missing .mimesis/${relativePath}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

if (args.includes("--help") || args.includes("-h")) {
  console.log(`Usage: mimesis workspace:check [target-dir]

Checks that a target repository has a completed .mimesis artifact trail.
This validates local file-protocol evidence only.
`);
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

for (const file of requiredFiles) {
  const content = read(file);
  if (/\bTBD\b|<fill|TODO/i.test(content)) {
    failures.push(`.mimesis/${file} still contains placeholder text`);
  }
  if (/^Case Status:\s*started/im.test(content)) {
    failures.push(`.mimesis/${file} is still marked Case Status: started`);
  }
  if (/Not produced yet|Not proven yet|Not inspected yet|Not transformed yet|Not extracted yet/i.test(content)) {
    failures.push(`.mimesis/${file} still contains starter-only evidence text`);
  }
}

const boundaryCheck = read("boundary-check.md").toLowerCase();
if (!boundaryCheck.includes("claim") && !boundaryCheck.includes("boundary")) {
  failures.push(".mimesis/boundary-check.md must mention claim or boundary inspection");
}

const referenceSet = read("reference-set.md").toLowerCase();
for (const phrase of ["source", "reference", "claim"]) {
  if (!referenceSet.includes(phrase)) {
    failures.push(`.mimesis/reference-set.md must mention ${phrase}`);
  }
}

const runLedger = read("run_ledger.md").toLowerCase();
for (const step of ["import", "distill", "capsule", "shard", "verify", "remember"]) {
  if (!runLedger.includes(step)) {
    failures.push(`.mimesis/run_ledger.md must include ${step}`);
  }
}

if (failures.length) {
  console.error("\nMimesis workspace check failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log(`Mimesis workspace check passed: ${requiredFiles.length} protocol files checked at ${path.relative(process.cwd(), mimesisDir) || mimesisDir}.`);

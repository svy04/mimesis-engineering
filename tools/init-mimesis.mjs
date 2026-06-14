#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const force = args.includes("--force");
const targetArg = args.find((arg) => !arg.startsWith("--")) ?? ".";
const targetRoot = path.resolve(process.cwd(), targetArg);
const outputDir = path.join(targetRoot, ".mimesis");

const fileMap = [
  ["spec-lock.md", "spec_lock.md"],
  ["procedure-tree.md", "procedure_tree.md"],
  ["artifact-brief.md", "artifact-brief.md"],
  ["reference-set.md", "reference-set.md"],
  ["structure-map.md", "structure-map.md"],
  ["transformation-plan.md", "transformation-plan.md"],
  ["improved-artifact.md", "improved-artifact.md"],
  ["boundary-check.md", "boundary-check.md"],
  ["case-note.md", "case-note.md"],
  ["run-ledger.md", "run_ledger.md"],
];

function usage() {
  console.log(`Usage: node tools/init-mimesis.mjs [target-dir] [--force]

Creates a .mimesis protocol folder from templates.

Options:
  --force   overwrite existing .mimesis files
`);
}

if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

if (!fs.existsSync(targetRoot)) {
  console.error(`Target directory does not exist: ${targetRoot}`);
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });

const created = [];
const skipped = [];

for (const [templateName, outputName] of fileMap) {
  const source = path.join(repoRoot, "templates", templateName);
  const destination = path.join(outputDir, outputName);

  if (!fs.existsSync(source)) {
    console.error(`Missing template: ${path.relative(repoRoot, source)}`);
    process.exit(1);
  }

  if (fs.existsSync(destination) && !force) {
    skipped.push(path.relative(targetRoot, destination));
    continue;
  }

  fs.copyFileSync(source, destination);
  created.push(path.relative(targetRoot, destination));
}

for (const file of created) {
  console.log(`[created] ${file}`);
}

for (const file of skipped) {
  console.log(`[skipped] ${file}`);
}

console.log(`\nMimesis protocol initialized at ${path.relative(process.cwd(), outputDir) || outputDir}`);
if (skipped.length) {
  console.log("Existing files were preserved. Re-run with --force to overwrite.");
}

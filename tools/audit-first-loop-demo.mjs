#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const demoRoot = path.join(root, ".mimesis", "first-loop-demo");
const failures = [];

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function readJson(relativePath) {
  const content = read(relativePath);
  if (!content) {
    return {};
  }
  try {
    return JSON.parse(content);
  } catch (error) {
    failures.push(`${relativePath} is not valid JSON: ${error.message}`);
    return {};
  }
}

function runNode(script, args = []) {
  return spawnSync(process.execPath, [path.join(root, "tools", script), ...args], {
    cwd: root,
    encoding: "utf8",
  });
}

const packageJson = readJson("package.json");
const cli = read("bin/mimesis.mjs");
const quickstart = read("docs/QUICKSTART.md");
const activation = read("docs/ACTIVATION-SURFACE.md");
const toolsReadme = read("tools/README.md");

for (const scriptName of ["first-loop:demo", "audit:first-loop"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!packageJson.scripts?.["release:check"]?.includes("first-loop:demo")) {
  failures.push("release:check must generate npm run first-loop:demo");
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:first-loop")) {
  failures.push("release:check must include npm run audit:first-loop");
}

if (!cli.includes('"first-loop:demo"') || !cli.includes('"audit:first-loop"')) {
  failures.push("CLI missing first-loop:demo or audit:first-loop command");
}

for (const text of [
  "first-loop demo",
  "case:check",
  "workspace:check",
  "does not prove external adoption",
]) {
  const combined = `${quickstart}\n${activation}\n${toolsReadme}`.toLowerCase();
  if (!combined.includes(text.toLowerCase())) {
    failures.push(`first-loop docs missing text: ${text}`);
  }
}

if (!failures.length) {
  const generated = runNode("create-first-loop-demo.mjs");
  if (generated.status !== 0) {
    failures.push(`first-loop demo generation failed:\n${generated.stdout}\n${generated.stderr}`.trim());
  }
}

for (const relativePath of [
  "examples/weak-readme.md",
  "docs/FIRST-LOOP-DEMO.md",
  ".mimesis/first-loop-demo/README.md",
  ".mimesis/first-loop-demo/weak-artifact.md",
  ".mimesis/first-loop-demo/.mimesis/artifact-brief.md",
  ".mimesis/first-loop-demo/.mimesis/reference-set.md",
  ".mimesis/first-loop-demo/.mimesis/structure-map.md",
  ".mimesis/first-loop-demo/.mimesis/transformation-plan.md",
  ".mimesis/first-loop-demo/.mimesis/improved-artifact.md",
  ".mimesis/first-loop-demo/.mimesis/boundary-check.md",
  ".mimesis/first-loop-demo/.mimesis/case-note.md",
  ".mimesis/first-loop-demo/.mimesis/run_ledger.md",
]) {
  read(relativePath);
}

if (!failures.length) {
  const workspace = runNode("check-workspace.mjs", [demoRoot]);
  if (workspace.status !== 0) {
    failures.push(`workspace:check failed for first-loop demo:\n${workspace.stdout}\n${workspace.stderr}`.trim());
  }

  const caseCheck = runNode("check-case.mjs", [demoRoot, "--write-report"]);
  if (caseCheck.status !== 0) {
    failures.push(`case:check failed for first-loop demo:\n${caseCheck.stdout}\n${caseCheck.stderr}`.trim());
  }

  const proofPath = path.join(demoRoot, ".mimesis", "case-proof.md");
  if (!fs.existsSync(proofPath)) {
    failures.push("first-loop demo must produce .mimesis/first-loop-demo/.mimesis/case-proof.md");
  }
}

if (!failures.length) {
  const caseNote = fs.readFileSync(path.join(demoRoot, ".mimesis", "case-note.md"), "utf8");
  const normalizedCaseNote = caseNote.toLowerCase();
  for (const text of [
    "Before:",
    "After:",
    "What Improved",
    "What Remains Unproven",
    "external adoption",
  ]) {
    if (!normalizedCaseNote.includes(text.toLowerCase())) {
      failures.push(`first-loop demo case note missing text: ${text}`);
    }
  }
}

if (failures.length) {
  console.error("\nMimesis first-loop demo audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis first-loop demo audit passed: generated demo completes workspace and case checks.");

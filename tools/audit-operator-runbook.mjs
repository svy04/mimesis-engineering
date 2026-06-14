#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runbookPath = path.join(root, ".mimesis", "operator-runbooks", "current-runbook.md");
const failures = [];

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

const packageJson = read("package.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/OPERATOR-RUNBOOK.md");
const releaseCheck = packageJson.match(/"release:check":\s*"([^"]+)"/)?.[1] ?? "";

for (const scriptName of ["operator:runbook", "audit:operator-runbook"]) {
  if (!packageJson.includes(`"${scriptName}"`)) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const command of ["operator:runbook", "audit:operator-runbook"]) {
  if (!cli.includes(`"${command}"`)) {
    failures.push(`bin/mimesis.mjs missing command: ${command}`);
  }
}

for (const requiredScript of ["operator:runbook", "audit:operator-runbook"]) {
  if (!releaseCheck.includes(requiredScript)) {
    failures.push(`release:check must include npm run ${requiredScript}`);
  }
}

for (const text of [
  "mimesis-engineering",
  "mimesis-canvas",
  "mimesis-casebook",
  "does not prove external adoption",
  "does not publish",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/OPERATOR-RUNBOOK.md missing text: ${text}`);
  }
}

if (!fs.existsSync(runbookPath)) {
  failures.push("missing .mimesis/operator-runbooks/current-runbook.md; run npm run operator:runbook");
} else {
  const runbook = fs.readFileSync(runbookPath, "utf8");
  const requiredSections = [
    "# Mimesis Operator Runbook",
    "## 30-Second Orientation",
    "## Repository Roles",
    "## 5-Minute First Loop",
    "## First External Proof Loop",
    "## Publication Readiness Loop",
    "## Evidence Commands",
    "## Stop Conditions",
    "## Boundary",
  ];

  for (const section of requiredSections) {
    if (!runbook.includes(section)) {
      failures.push(`operator runbook missing section: ${section}`);
    }
  }

  for (const requiredText of [
    "mimesis-engineering",
    "mimesis-canvas",
    "mimesis-casebook",
    "npm run release:check:public",
    "npm run audit:ecosystem",
    "npm run ecosystem:resources",
    "npm run proof:intake",
    "npm run gate:board",
    "case:review",
    "case:from-intake",
    "case:check",
    "evidence:check",
    "does not prove external adoption",
    "does not choose a license",
    "does not publish",
    "does not copy neighboring repository content",
  ]) {
    if (!runbook.toLowerCase().includes(requiredText.toLowerCase())) {
      failures.push(`operator runbook missing required text: ${requiredText}`);
    }
  }
}

if (failures.length) {
  console.error("\nMimesis operator runbook audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis operator runbook audit passed: ecosystem run path is generated and bounded.");

#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const kitPath = path.join(root, ".mimesis", "proof-intake", "first-external-proof-kit.md");
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
const doc = read("docs/PROOF-INTAKE-KIT.md");

for (const scriptName of ["proof:intake", "audit:proof-intake"]) {
  if (!packageJson.includes(`"${scriptName}"`)) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const command of ["proof:intake", "audit:proof-intake"]) {
  if (!cli.includes(`"${command}"`)) {
    failures.push(`bin/mimesis.mjs missing command: ${command}`);
  }
}

if (!/proof:intake/.test(packageJson.match(/"release:check":\s*"([^"]+)"/)?.[1] ?? "")) {
  failures.push("release:check must include npm run proof:intake");
}

if (!/audit:proof-intake/.test(packageJson.match(/"release:check":\s*"([^"]+)"/)?.[1] ?? "")) {
  failures.push("release:check must include npm run audit:proof-intake");
}

for (const text of [
  "does not create external proof",
  "permissioned external weak artifact",
  "redaction",
  "case:review",
  "case:from-intake",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/PROOF-INTAKE-KIT.md missing text: ${text}`);
  }
}

if (!fs.existsSync(kitPath)) {
  failures.push("missing .mimesis/proof-intake/first-external-proof-kit.md; run npm run proof:intake");
} else {
  const kit = fs.readFileSync(kitPath, "utf8");
  const requiredSections = [
    "# Mimesis First External Proof Intake Kit",
    "## Submitter Checklist",
    "## Intake Template",
    "## Required Command Path",
    "## Evidence Packet Requirements",
    "## Stop Conditions",
    "## Allowed Claim",
    "## Disallowed Claim",
    "## Boundary",
  ];

  for (const section of requiredSections) {
    if (!kit.includes(section)) {
      failures.push(`proof intake kit missing section: ${section}`);
    }
  }

  for (const requiredText of [
    "permissioned external weak artifact",
    "Artifact owner",
    "Permission status",
    "Publication preference",
    "Redaction requirements",
    "Safety confirmation",
    "npm run cli -- case:review",
    "npm run cli -- case:from-intake",
    "npm run cli -- case:check",
    "npm run cli -- evidence:check",
    "does not create external proof",
    "does not prove adoption",
    "does not choose a license",
  ]) {
    if (!kit.toLowerCase().includes(requiredText.toLowerCase())) {
      failures.push(`proof intake kit missing boundary text: ${requiredText}`);
    }
  }
}

if (failures.length) {
  console.error("\nMimesis proof intake kit audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis proof intake kit audit passed: first external proof intake is generated and bounded.");

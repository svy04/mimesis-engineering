#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packetPath = path.join(root, ".mimesis", "gates", "current-gateboard.md");
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
const gateDoc = read("docs/GATEBOARD.md");

for (const scriptName of ["gate:board", "audit:gateboard"]) {
  if (!packageJson.includes(`"${scriptName}"`)) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const command of ["gate:board", "audit:gateboard"]) {
  if (!cli.includes(`"${command}"`)) {
    failures.push(`bin/mimesis.mjs missing command: ${command}`);
  }
}

for (const text of ["does not choose a license", "does not", "prove external adoption"]) {
  if (!gateDoc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/GATEBOARD.md missing boundary text: ${text}`);
  }
}

if (!fs.existsSync(packetPath)) {
  failures.push("missing .mimesis/gates/current-gateboard.md; run npm run gate:board");
} else {
  const board = fs.readFileSync(packetPath, "utf8");
  const requiredSections = [
    "# Mimesis Current Gate Board",
    "## Git Snapshot",
    "## Gate Table",
    "## Current Sync Report",
    "## Allowed Claim",
    "## Disallowed Claim",
    "## Boundary",
  ];

  for (const section of requiredSections) {
    if (!board.includes(section)) {
      failures.push(`gate board missing section: ${section}`);
    }
  }

  for (const gate of [
    "v0.1 local framework preflight",
    "strict publish sync",
    "owner license decision",
    "first permissioned external proof",
    "package publication",
    "action publication",
    "shipped plugin claim",
    "benchmark or adoption claim",
  ]) {
    if (!board.includes(gate)) {
      failures.push(`gate board missing gate: ${gate}`);
    }
  }

  for (const boundaryText of [
    "local gate board, not completion proof",
    "does not choose a license",
    "create external proof",
    "stage files",
    "create a commit",
    "push",
    "tag",
    "publish to npm",
    "GitHub Marketplace action",
    "prove remote freshness",
    "benchmarked productivity",
    "external adoption",
  ]) {
    if (!board.toLowerCase().includes(boundaryText.toLowerCase())) {
      failures.push(`gate board missing boundary text: ${boundaryText}`);
    }
  }
}

if (failures.length) {
  console.error("\nMimesis gate board audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis gate board audit passed: current gates are generated and bounded.");

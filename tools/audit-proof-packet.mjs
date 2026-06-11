#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packetPath = path.join(root, ".mimesis", "proof-packets", "v0.2-first-proof.md");
const failures = [];

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

const packageJson = JSON.parse(read("package.json"));
const cli = read("bin/mimesis.mjs");
const doc = read("docs/FIRST-PROOF-PACKET.md");

if (!packageJson.scripts?.["proof:packet"]) {
  failures.push("package.json missing script: proof:packet");
}

if (!packageJson.scripts?.["audit:proof-packet"]) {
  failures.push("package.json missing script: audit:proof-packet");
}

if (!packageJson.scripts?.["release:check"]?.includes("proof:packet")) {
  failures.push("release:check must generate npm run proof:packet");
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:proof-packet")) {
  failures.push("release:check must include npm run audit:proof-packet");
}

if (!cli.includes('"proof:packet"') || !cli.includes('"audit:proof-packet"')) {
  failures.push("CLI missing proof:packet or audit:proof-packet command");
}

if (!/does not create external proof/i.test(doc)) {
  failures.push("first proof packet doc must keep proof-creation boundary visible");
}

if (!fs.existsSync(packetPath)) {
  failures.push("missing .mimesis/proof-packets/v0.2-first-proof.md; run npm run proof:packet");
} else {
  const packet = fs.readFileSync(packetPath, "utf8");
  for (const section of [
    "# Mimesis Engineering v0.2 First Proof Packet",
    "## Purpose",
    "## Current Queue State",
    "## Submitter Intake Checklist",
    "## First Proof Candidate Requirements",
    "## Required Command Path",
    "## Evidence Packet Checklist",
    "## Stop Conditions",
    "## Exit Claim",
    "## Boundary",
  ]) {
    if (!packet.includes(section)) {
      failures.push(`proof packet missing section: ${section}`);
    }
  }

  for (const text of [
    "not completed proof",
    "does not prove external adoption",
    "case:review",
    "case:from-intake",
    "case:check",
    "evidence:check",
    "release:check:public",
    "Permissioned Case Intake Template",
    "Evidence Packet Template",
  ]) {
    if (!packet.includes(text)) {
      failures.push(`proof packet missing boundary text: ${text}`);
    }
  }

  if (/externally adopted|commercially proven|universally effective/i.test(packet) && !/Not allowed yet|must not|does not/i.test(packet)) {
    failures.push("proof packet contains unsafe proof claim outside a boundary context");
  }
}

if (failures.length) {
  console.error("\nMimesis proof packet audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis proof packet audit passed: first-proof handoff packet is generated and bounded.");

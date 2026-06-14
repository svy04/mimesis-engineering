#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packetPath = path.join(root, ".mimesis", "proof-runs", "readiness.md");
const failures = [];

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

const packageJson = JSON.parse(read("package.json") || "{}");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/PROOF-READINESS-PACKET.md");

if (!packageJson.scripts?.["proof:readiness"]) {
  failures.push("package.json missing script: proof:readiness");
}

if (!packageJson.scripts?.["audit:proof-readiness"]) {
  failures.push("package.json missing script: audit:proof-readiness");
}

if (!packageJson.scripts?.["release:check"]?.includes("proof:readiness")) {
  failures.push("release:check must generate npm run proof:readiness");
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:proof-readiness")) {
  failures.push("release:check must include npm run audit:proof-readiness");
}

if (!cli.includes('"proof:readiness"') || !cli.includes('"audit:proof-readiness"')) {
  failures.push("CLI missing proof:readiness or audit:proof-readiness command");
}

for (const text of [
  "first weak artifact readiness",
  "Bring one weak artifact",
  "does not create external proof",
  "does not bypass owner gates",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/PROOF-READINESS-PACKET.md missing text: ${text}`);
  }
}

if (!fs.existsSync(packetPath)) {
  failures.push("missing .mimesis/proof-runs/readiness.md; run npm run proof:readiness");
} else {
  const packet = fs.readFileSync(packetPath, "utf8");

  for (const section of [
    "# Mimesis v0.2 Proof Readiness Packet",
    "## Readiness State",
    "## What Is Ready",
    "## What Is Still Blocked",
    "## One Weak Artifact Intake Card",
    "## Operator Command Path",
    "## Claim Boundary",
    "## Next Non-Bypassing Action",
    "## Boundary",
  ]) {
    if (!packet.includes(section)) {
      failures.push(`proof readiness packet missing section: ${section}`);
    }
  }

  for (const text of [
    "No permissioned external weak artifact has been submitted yet",
    "Bring one weak artifact",
    "case:review",
    "case:from-intake",
    "case:check",
    "evidence:review",
    "claim:from-evidence",
    "release:check:public",
    "does not create external proof",
    "does not choose a license",
    "does not publish",
    "does not prove external adoption",
  ]) {
    if (!packet.includes(text)) {
      failures.push(`proof readiness packet missing boundary text: ${text}`);
    }
  }
}

if (failures.length) {
  console.error("\nMimesis proof readiness packet audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis proof readiness packet audit passed: first weak artifact readiness is generated and bounded.");

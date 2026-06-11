#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packetPath = path.join(root, ".mimesis", "proof-runs", "v0.2-first-run.md");
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
const doc = read("docs/PROOF-RUN-PACKET.md");

if (!packageJson.scripts?.["proof:run-packet"]) {
  failures.push("package.json missing script: proof:run-packet");
}

if (!packageJson.scripts?.["audit:proof-run"]) {
  failures.push("package.json missing script: audit:proof-run");
}

if (!packageJson.scripts?.["release:check"]?.includes("proof:run-packet")) {
  failures.push("release:check must generate npm run proof:run-packet");
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:proof-run")) {
  failures.push("release:check must include npm run audit:proof-run");
}

if (!cli.includes('"proof:run-packet"') || !cli.includes('"audit:proof-run"')) {
  failures.push("CLI missing proof:run-packet or audit:proof-run command");
}

for (const text of [
  "operator proof run",
  "case:review -> case:from-intake -> case:check -> evidence:check",
  "owner:evidence-submission-check -> proof:intake-from-owner-evidence -> proof:intake-check -> case:from-record -> case:check -> evidence:check",
  "does not create external proof",
  "does not publish",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/PROOF-RUN-PACKET.md missing text: ${text}`);
  }
}

if (!fs.existsSync(packetPath)) {
  failures.push("missing .mimesis/proof-runs/v0.2-first-run.md; run npm run proof:run-packet");
} else {
  const packet = fs.readFileSync(packetPath, "utf8");
  for (const section of [
    "# Mimesis v0.2 First Proof Run Packet",
    "## Purpose",
    "## Inputs To Collect",
    "## Operator Command Path",
    "## Evidence Board",
    "## Stop Conditions",
    "## Allowed Claim",
    "## Disallowed Claim",
    "## Boundary",
  ]) {
    if (!packet.includes(section)) {
      failures.push(`proof run packet missing section: ${section}`);
    }
  }

  for (const text of [
    "case:review",
    "case:from-intake",
    "proof:intake-from-owner-evidence",
    "case:from-record",
    "docs/PROOF-INTAKE-FROM-OWNER-EVIDENCE.md",
    "case:check",
    "evidence:check",
    "release:check:public",
    "docs/V0.2-PROOF-QUEUE.md",
    "docs/PROOF-INTAKE-KIT.md",
    "docs/PERMISSIONED-CASE-CHECK.md",
    "docs/EVIDENCE-PACKET.md",
    "does not create external proof",
    "does not prove external adoption",
    "does not publish",
  ]) {
    if (!packet.includes(text)) {
      failures.push(`proof run packet missing boundary text: ${text}`);
    }
  }
}

if (failures.length) {
  console.error("\nMimesis proof run packet audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis proof run packet audit passed: first proof run packet is generated and bounded.");

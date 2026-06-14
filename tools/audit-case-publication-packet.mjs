#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packetPath = path.join(root, ".mimesis", "case-publication-packets", "current-casebook-candidate.md");
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
const doc = read("docs/CASE-PUBLICATION-PACKET.md");

if (!packageJson.scripts?.["case:publish-packet"]) {
  failures.push("package.json missing script: case:publish-packet");
}

if (!packageJson.scripts?.["audit:case-publication"]) {
  failures.push("package.json missing script: audit:case-publication");
}

if (!packageJson.scripts?.["release:check"]?.includes("case:publish-packet")) {
  failures.push("release:check must generate npm run case:publish-packet");
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:case-publication")) {
  failures.push("release:check must include npm run audit:case-publication");
}

if (!cli.includes('"case:publish-packet"') || !cli.includes('"audit:case-publication"')) {
  failures.push("CLI missing case:publish-packet or audit:case-publication command");
}

for (const text of [
  "casebook candidate",
  "does not publish",
  "does not prove external adoption",
  "does not prove benchmarked productivity",
  "does not grant permission",
]) {
  if (!doc.toLowerCase().includes(text)) {
    failures.push(`case publication doc missing boundary text: ${text}`);
  }
}

if (!fs.existsSync(packetPath)) {
  failures.push("missing .mimesis/case-publication-packets/current-casebook-candidate.md; run npm run case:publish-packet");
} else {
  const packet = fs.readFileSync(packetPath, "utf8");
  for (const section of [
    "# Mimesis Case Publication Packet",
    "## Case Check Result",
    "## Casebook Shape",
    "## Evidence To Copy",
    "## Publication Checklist",
    "## Allowed Claim",
    "## Disallowed Claim",
    "## Boundary",
  ]) {
    if (!packet.includes(section)) {
      failures.push(`case publication packet missing section: ${section}`);
    }
  }

  for (const text of [
    "case:check",
    "docs/CASEBOOK-PROTOCOL.md",
    "docs/CASE-REVIEW-CHECKLIST.md",
    "docs/PERMISSIONED-CASE-PACKET.md",
    "does not publish",
    "does not prove external adoption",
    "does not prove benchmarked productivity",
    "does not grant permission",
    "does not choose a license",
  ]) {
    if (!packet.includes(text)) {
      failures.push(`case publication packet missing boundary text: ${text}`);
    }
  }
}

if (failures.length) {
  console.error("\nMimesis case publication packet audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis case publication packet audit passed: casebook candidate packet is generated and bounded.");

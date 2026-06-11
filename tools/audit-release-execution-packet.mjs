#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packetPath = path.join(root, ".mimesis", "release-execution", "v0.1-owner-handoff.md");
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
const doc = read("docs/RELEASE-EXECUTION-PACKET.md");

if (!packageJson.scripts?.["release:execution-packet"]) {
  failures.push("package.json missing script: release:execution-packet");
}

if (!packageJson.scripts?.["audit:release-execution"]) {
  failures.push("package.json missing script: audit:release-execution");
}

if (!packageJson.scripts?.["release:check"]?.includes("release:execution-packet")) {
  failures.push("release:check must generate npm run release:execution-packet");
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:release-execution")) {
  failures.push("release:check must include npm run audit:release-execution");
}

if (!cli.includes('"release:execution-packet"') || !cli.includes('"audit:release-execution"')) {
  failures.push("CLI missing release:execution-packet or audit:release-execution command");
}

for (const text of [
  "owner release execution handoff",
  "does not publish",
  "does not stage files",
  "does not choose a license",
  "does not create a tag",
]) {
  if (!doc.toLowerCase().includes(text)) {
    failures.push(`release execution doc missing boundary text: ${text}`);
  }
}

if (!fs.existsSync(packetPath)) {
  failures.push("missing .mimesis/release-execution/v0.1-owner-handoff.md; run npm run release:execution-packet");
} else {
  const packet = fs.readFileSync(packetPath, "utf8");
  for (const section of [
    "# Mimesis Release Execution Packet",
    "## Current Git Boundary",
    "## Required Preflight",
    "## Owner Decisions",
    "## Release Sequence",
    "## Publication Gates",
    "## Allowed Claim",
    "## Disallowed Claim",
    "## Boundary",
  ]) {
    if (!packet.includes(section)) {
      failures.push(`release execution packet missing section: ${section}`);
    }
  }

  for (const text of [
    "npm run release:check:public",
    "npm run audit:sync:strict",
    "docs/LICENSE-PACKET.md",
    "docs/RELEASE-DECISION-RECORD.md",
    "docs/PUBLISH-HANDOFF-PACKET.md",
    "docs/PACKAGE-RELEASE-CANDIDATE.md",
    "docs/ACTION-RELEASE-CANDIDATE.md",
    "does not publish",
    "does not stage files",
    "does not create a commit",
    "does not push",
    "does not create a tag",
    "does not choose a license",
  ]) {
    if (!packet.includes(text)) {
      failures.push(`release execution packet missing boundary text: ${text}`);
    }
  }
}

if (failures.length) {
  console.error("\nMimesis release execution packet audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis release execution packet audit passed: owner release handoff is generated and bounded.");

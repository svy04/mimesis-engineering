#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packetPath = path.join(root, ".mimesis", "license-packets", "owner-decision.md");
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
const doc = read("docs/LICENSE-PACKET.md");

if (!packageJson.scripts?.["license:packet"]) {
  failures.push("package.json missing script: license:packet");
}

if (!packageJson.scripts?.["audit:license-packet"]) {
  failures.push("package.json missing script: audit:license-packet");
}

if (!packageJson.scripts?.["release:check"]?.includes("license:packet")) {
  failures.push("release:check must generate npm run license:packet");
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:license-packet")) {
  failures.push("release:check must include npm run audit:license-packet");
}

if (!cli.includes('"license:packet"') || !cli.includes('"audit:license-packet"')) {
  failures.push("CLI missing license:packet or audit:license-packet command");
}

if (!/does not choose a license/i.test(doc) || !/not legal advice/i.test(doc)) {
  failures.push("license packet doc must keep owner-decision and legal-advice boundaries visible");
}

if (!fs.existsSync(packetPath)) {
  failures.push("missing .mimesis/license-packets/owner-decision.md; run npm run license:packet");
} else {
  const packet = fs.readFileSync(packetPath, "utf8");
  for (const section of [
    "# Mimesis Engineering License Decision Packet",
    "## Current Package Boundary",
    "## Current License Boundary",
    "## Owner Decision Questions",
    "## Decision Directions",
    "## Package Publish Gates",
    "## Safe Claim Before Decision",
    "## Unsafe Claim Before Decision",
    "## Stop Conditions",
    "## Boundary",
  ]) {
    if (!packet.includes(section)) {
      failures.push(`license packet missing section: ${section}`);
    }
  }

  for (const text of [
    "owner decision required",
    "UNLICENSED",
    "private",
    "does not choose a license",
    "grant reuse rights",
    "not legal advice",
    "open-source reuse readiness",
  ]) {
    if (!packet.includes(text)) {
      failures.push(`license packet missing boundary text: ${text}`);
    }
  }

  if (/open-source and freely reusable/i.test(packet) && !/Unsafe Claim Before Decision/i.test(packet)) {
    failures.push("license packet contains unsafe open-source claim outside unsafe-claim section");
  }
}

if (failures.length) {
  console.error("\nMimesis license packet audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis license packet audit passed: owner license decision packet is generated and bounded.");

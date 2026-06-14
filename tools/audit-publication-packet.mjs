#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packetPath = path.join(root, ".mimesis", "publication-packets", "v0.1.md");
const failures = [];

if (!fs.existsSync(packetPath)) {
  failures.push("missing .mimesis/publication-packets/v0.1.md; run npm run release:packet");
} else {
  const packet = fs.readFileSync(packetPath, "utf8");
  const requiredSections = [
    "# Mimesis Engineering v0.1.0 Publication Packet",
    "## Release Summary",
    "## Required Preflight",
    "## Allowed Claim",
    "## Publication Copy",
    "## Evidence",
    "## Stop Conditions",
    "## Disallowed Claim",
    "## Remaining Gates",
    "## Boundary",
  ];

  for (const section of requiredSections) {
    if (!packet.includes(section)) {
      failures.push(`publication packet missing section: ${section}`);
    }
  }

  const lowerPacket = packet.toLowerCase();
  for (const requiredText of [
    "npm run release:check",
    "npm run release:check:workspace",
    "not yet: user-submitted external case proof",
    "owner chooses a license",
    "evidence packet",
    "does not prove hosted deployment",
    "shipped plugins",
  ]) {
    if (!lowerPacket.includes(requiredText.toLowerCase())) {
      failures.push(`publication packet missing boundary text: ${requiredText}`);
    }
  }

  if (/fully proven|externally adopted|production-ready/i.test(packet) && !/Disallowed Claim/i.test(packet)) {
    failures.push("publication packet contains unsafe maturity claim outside a disallowed-claim context");
  }
}

if (failures.length) {
  console.error("\nMimesis publication packet audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis publication packet audit passed.");

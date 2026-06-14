#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packetPath = path.join(root, ".mimesis", "benchmark-packets", "v0.2-first-benchmark.md");
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
const doc = read("docs/BENCHMARK-PACKET.md");

if (!packageJson.scripts?.["benchmark:packet"]) {
  failures.push("package.json missing script: benchmark:packet");
}

if (!packageJson.scripts?.["audit:benchmark-packet"]) {
  failures.push("package.json missing script: audit:benchmark-packet");
}

if (!packageJson.scripts?.["release:check"]?.includes("benchmark:packet")) {
  failures.push("release:check must generate npm run benchmark:packet");
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:benchmark-packet")) {
  failures.push("release:check must include npm run audit:benchmark-packet");
}

if (!cli.includes('"benchmark:packet"') || !cli.includes('"audit:benchmark-packet"')) {
  failures.push("CLI missing benchmark:packet or audit:benchmark-packet command");
}

for (const text of [
  "measurement protocol",
  "does not prove benchmarked productivity",
  "does not prove external adoption",
  "does not create evidence",
  "requires evidence:check",
]) {
  if (!doc.toLowerCase().includes(text)) {
    failures.push(`benchmark packet doc missing boundary text: ${text}`);
  }
}

if (!fs.existsSync(packetPath)) {
  failures.push("missing .mimesis/benchmark-packets/v0.2-first-benchmark.md; run npm run benchmark:packet");
} else {
  const packet = fs.readFileSync(packetPath, "utf8");
  for (const section of [
    "# Mimesis Benchmark Packet",
    "## Claim Under Test",
    "## Measurement Design",
    "## Required Evidence",
    "## Adoption Evidence",
    "## Evidence Packet Path",
    "## Allowed Claim",
    "## Disallowed Claim",
    "## Boundary",
  ]) {
    if (!packet.includes(section)) {
      failures.push(`benchmark packet missing section: ${section}`);
    }
  }

  for (const text of [
    "benchmark study, not a claim by itself",
    "external adoption, not a claim by itself",
    "templates/evidence-packet.md",
    "evidence:check --require-reviewed",
    "does not prove benchmarked productivity",
    "does not prove external adoption",
    "does not create evidence",
    "does not publish",
  ]) {
    if (!packet.includes(text)) {
      failures.push(`benchmark packet missing boundary text: ${text}`);
    }
  }
}

if (failures.length) {
  console.error("\nMimesis benchmark packet audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis benchmark packet audit passed: benchmark/adoption measurement packet is generated and bounded.");

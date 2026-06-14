#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packetPath = path.join(root, ".mimesis", "ecosystem-resources", "current-resource-packet.md");
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
const doc = read("docs/ECOSYSTEM-RESOURCE-PACKET.md");

if (!packageJson.scripts?.["ecosystem:resources"]) {
  failures.push("package.json missing script: ecosystem:resources");
}

if (!packageJson.scripts?.["audit:ecosystem-resources"]) {
  failures.push("package.json missing script: audit:ecosystem-resources");
}

if (!packageJson.scripts?.["release:check"]?.includes("ecosystem:resources")) {
  failures.push("release:check must generate npm run ecosystem:resources");
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:ecosystem-resources")) {
  failures.push("release:check must include npm run audit:ecosystem-resources");
}

for (const command of ["ecosystem:resources", "audit:ecosystem-resources"]) {
  if (!cli.includes(`"${command}"`)) {
    failures.push(`CLI missing command: ${command}`);
  }
}

for (const text of [
  "ecosystem resource packet",
  "mimesis-canvas",
  "mimesis-casebook",
  "does not prove external adoption",
  "does not copy neighboring repository content",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`ecosystem resource packet doc missing text: ${text}`);
  }
}

if (!fs.existsSync(packetPath)) {
  failures.push("missing .mimesis/ecosystem-resources/current-resource-packet.md; run npm run ecosystem:resources");
} else {
  const packet = fs.readFileSync(packetPath, "utf8");

  for (const section of [
    "# Mimesis Ecosystem Resource Packet",
    "## Repository Inventory",
    "## Canvas Resources",
    "## Casebook Resources",
    "## Recommended Use",
    "## Allowed Claim",
    "## Disallowed Claim",
    "## Boundary",
  ]) {
    if (!packet.includes(section)) {
      failures.push(`ecosystem resource packet missing section: ${section}`);
    }
  }

  for (const text of [
    "mimesis-engineering",
    "mimesis-canvas",
    "mimesis-casebook",
    "canvas.en.md",
    "canvas.ko.md",
    "notion-template.md",
    "examples/product.md",
    "cases/001-quantflow-alpha-court.md",
    "cases/004-linkedin-positioning-mimesis.md",
    "npm run audit:ecosystem",
    "npm run operator:runbook",
    "does not prove external adoption",
    "does not publish",
    "does not copy neighboring repository content",
  ]) {
    if (!packet.includes(text)) {
      failures.push(`ecosystem resource packet missing required text: ${text}`);
    }
  }
}

if (failures.length) {
  console.error("\nMimesis ecosystem resource packet audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis ecosystem resource packet audit passed: neighboring resources are indexed and bounded.");

#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function requireText(relativePath, content, pattern, label) {
  if (!pattern.test(content)) {
    failures.push(`${relativePath}: missing ${label}`);
  }
}

const sourceProtocol = read("docs/SOURCE-FIRST-PROTOCOL.md");
requireText("docs/SOURCE-FIRST-PROTOCOL.md", sourceProtocol, /W3C PROV-DM/i, "W3C PROV-DM prior art");
requireText("docs/SOURCE-FIRST-PROTOCOL.md", sourceProtocol, /FAIR Principles/i, "FAIR prior art");
requireText("docs/SOURCE-FIRST-PROTOCOL.md", sourceProtocol, /FORCE11 Software Citation Principles/i, "FORCE11 prior art");
requireText("docs/SOURCE-FIRST-PROTOCOL.md", sourceProtocol, /Claim Boundary/i, "claim boundary field");

const requiredReferenceFields = [
  "Source Type",
  "Source / Reference",
  "Why It Is Strong",
  "What To Inspect",
  "What Not To Copy",
  "Claim Boundary",
];

for (const file of ["templates/reference-set.md", ".mimesis/reference-set.md"]) {
  const content = read(file);
  for (const field of requiredReferenceFields) {
    if (!content.includes(field)) {
      failures.push(`${file}: missing reference-set field ${field}`);
    }
  }
}

const packsDir = path.join(root, "reference-packs");
const packFiles = fs
  .readdirSync(packsDir)
  .filter((name) => name.endsWith(".md") && name !== "README.md");

for (const file of packFiles) {
  const relative = `reference-packs/${file}`;
  const content = read(relative);
  console.log(`[source-pack] ${relative}`);

  requireText(relative, content, /^## Source Quality/m, "Source Quality section");
  requireText(relative, content, /^## What (Good Artifacts|Good Research Notes|Good Profile Positioning)/m, "good-artifact section");
  requireText(relative, content, /^## What [Tt]o Inspect/m, "inspection section");
  requireText(relative, content, /^## Transferable Patterns/m, "transferable patterns section");
  requireText(relative, content, /^## Do Not Copy/m, "do-not-copy section");
  requireText(relative, content, /^## Starter Prompt/m, "starter prompt section");

  if (!/official docs|source repos?|papers?|patents?|standards?|primary sources?|public artifacts?|local artifacts?/i.test(content)) {
    failures.push(`${relative}: source quality must name acceptable source types`);
  }
}

const issueForm = read(".github/ISSUE_TEMPLATE/reference-pack.yml");
for (const id of ["source-quality", "candidate-references", "what-not-to-copy"]) {
  if (!issueForm.includes(`id: ${id}`)) {
    failures.push(`reference-pack.yml: missing id ${id}`);
  }
}

if (failures.length) {
  console.error("\nMimesis source-first audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log(`\nMimesis source-first audit passed: ${packFiles.length} reference packs checked.`);

#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const claimPackPath = path.join(root, ".mimesis", "claim-packs", "public-v0.1.md");
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
const doc = read("docs/PUBLIC-CLAIM-PACK.md");
const completionAudit = read("docs/COMPLETION-AUDIT.md");

function countRequirementRows(markdown) {
  const section = markdown.split("## Requirement Matrix", 2)[1]?.split("## Allowed Completion Claim", 1)[0] ?? "";
  return section
    .split(/\r?\n/)
    .filter((line) => line.startsWith("| "))
    .filter((line) => !line.includes("---"))
    .filter((line) => !line.includes("Requirement | Current Status"))
    .length;
}

if (!packageJson.scripts?.["claim:pack"]) {
  failures.push("package.json missing script: claim:pack");
}

if (!packageJson.scripts?.["audit:claim-pack"]) {
  failures.push("package.json missing script: audit:claim-pack");
}

if (!packageJson.scripts?.["release:check"]?.includes("claim:pack")) {
  failures.push("release:check must generate npm run claim:pack");
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:claim-pack")) {
  failures.push("release:check must include npm run audit:claim-pack");
}

if (!cli.includes('"claim:pack"') || !cli.includes('"audit:claim-pack"')) {
  failures.push("CLI missing claim:pack or audit:claim-pack command");
}

for (const text of [
  "allowed public claims",
  "disallowed public claims",
  "does not prove external adoption",
  "does not prove benchmarked productivity",
  "does not publish",
]) {
  if (!doc.toLowerCase().includes(text)) {
    failures.push(`claim pack doc missing boundary text: ${text}`);
  }
}

if (!fs.existsSync(claimPackPath)) {
  failures.push("missing .mimesis/claim-packs/public-v0.1.md; run npm run claim:pack");
} else {
  const claimPack = fs.readFileSync(claimPackPath, "utf8");
  for (const section of [
    "# Mimesis Public Claim Pack",
    "## Allowed Public Claims",
    "## Disallowed Public Claims",
    "## Evidence To Cite",
    "## Copy Snippets",
    "## Stop Conditions",
    "## Boundary",
  ]) {
    if (!claimPack.includes(section)) {
      failures.push(`public claim pack missing section: ${section}`);
    }
  }

  for (const text of [
    "Give AI standards, not roles",
    "Bring one weak artifact",
    "npm run release:check:public",
    "docs/ACTIVATION-SURFACE.md",
    "docs/COMPLETION-AUDIT.md",
    "docs/PROOF-BOUNDARY.md",
    "does not prove external adoption",
    "does not prove benchmarked productivity",
    "does not choose a license",
    "does not publish",
  ]) {
    if (!claimPack.includes(text)) {
      failures.push(`public claim pack missing boundary text: ${text}`);
    }
  }

  const actualRows = countRequirementRows(completionAudit);
  const claimPackRows = Number(claimPack.match(/completion matrix currently tracks (\d+) requirement rows/i)?.[1]);
  if (!Number.isFinite(claimPackRows)) {
    failures.push("public claim pack missing completion matrix row count");
  } else if (claimPackRows !== actualRows) {
    failures.push(`public claim pack row count drift: expected ${actualRows}, found ${claimPackRows}`);
  }
}

if (failures.length) {
  console.error("\nMimesis public claim pack audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis public claim pack audit passed: public claims are generated and bounded.");

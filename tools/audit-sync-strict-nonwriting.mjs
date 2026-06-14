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

function readJson(relativePath) {
  const content = read(relativePath);
  if (!content) {
    return {};
  }
  try {
    return JSON.parse(content);
  } catch (error) {
    failures.push(`${relativePath} is not valid JSON: ${error.message}`);
    return {};
  }
}

const packageJson = readJson("package.json");
const releaseCheck = packageJson.scripts?.["release:check"] ?? "";
const cli = read("bin/mimesis.mjs");
const syncTool = read("tools/audit-sync-status.mjs");
const syncDoc = read("docs/PUBLISH-SYNC-GATE.md");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const releaseOrder = read("docs/RELEASE-CHECK-ORDER.md");
const validator = read("tools/validate-mimesis.mjs");

if (packageJson.scripts?.["audit:sync:strict"] !== "node tools/audit-sync-status.mjs --strict --no-write") {
  failures.push("package.json audit:sync:strict must use --strict --no-write");
}

if (packageJson.scripts?.["audit:sync:strict-nonwriting"] !== "node tools/audit-sync-strict-nonwriting.mjs") {
  failures.push("package.json missing script: audit:sync:strict-nonwriting");
}

if (!releaseCheck.includes("audit:sync:strict-nonwriting")) {
  failures.push("release:check must include npm run audit:sync:strict-nonwriting");
}

if (!cli.includes('"audit:sync:strict-nonwriting"')) {
  failures.push("CLI missing audit:sync:strict-nonwriting command");
}

for (const text of [
  "const noWrite = process.argv.includes(\"--no-write\")",
  "if (!noWrite)",
  "not written (--no-write)",
  "head matches upstream",
]) {
  if (!syncTool.includes(text)) {
    failures.push(`tools/audit-sync-status.mjs missing non-writing/stable text: ${text}`);
  }
}

for (const forbidden of ["- head: `", "- upstream head: `"]) {
  if (syncTool.includes(forbidden)) {
    failures.push(`tools/audit-sync-status.mjs must not write dynamic hash line: ${forbidden}`);
  }
}

for (const text of [
  "non-writing",
  "--no-write",
  "head matches upstream",
  "does not mutate the worktree",
]) {
  if (!syncDoc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/PUBLISH-SYNC-GATE.md missing sync strict boundary text: ${text}`);
  }
}

for (const text of [
  "audit:sync:strict-nonwriting",
  "non-writing strict sync",
  "PUBLISH-SYNC-GATE.md",
]) {
  for (const [name, content] of [
    ["README.md", readme],
    ["tools/README.md", toolsReadme],
    ["docs/RELEASE-CHECK-ORDER.md", releaseOrder],
  ]) {
    if (!content.includes(text)) {
      failures.push(`${name} missing strict sync non-writing text: ${text}`);
    }
  }
}

if (!validator.includes("tools/audit-sync-strict-nonwriting.mjs")) {
  failures.push("validator required files missing tools/audit-sync-strict-nonwriting.mjs");
}

if (failures.length) {
  console.error("\nMimesis sync strict non-writing audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis sync strict non-writing audit passed: strict sync can be checked without mutating the worktree.");

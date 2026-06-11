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
const cli = read("bin/mimesis.mjs");
const generator = read("tools/create-gap-register.mjs");
const gapAudit = read("tools/audit-gap-register.mjs");
const releaseOrderAudit = read("tools/audit-release-check-order.mjs");
const validator = read("tools/validate-mimesis.mjs");
const frameworkManifestGenerator = read("tools/create-framework-manifest.mjs");
const frameworkManifestAudit = read("tools/audit-framework-manifest.mjs");
const releaseArtifactGenerator = read("tools/create-release-artifact-manifest.mjs");
const releaseArtifactAudit = read("tools/audit-release-artifact-manifest.mjs");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const gapDoc = read("docs/GAP-REGISTER.md");
const releaseOrderDoc = read("docs/RELEASE-CHECK-ORDER.md");
const register = readJson(".mimesis/gaps/current-gap-register.json");
const syncStatus = read(".mimesis/sync-status.md");
const gateBoard = read(".mimesis/gates/current-gateboard.md");
const releaseCheck = packageJson.scripts?.["release:check"] ?? "";

if (packageJson.scripts?.["audit:gap-register-sync-closure"] !== "node tools/audit-gap-register-sync-closure.mjs") {
  failures.push("package.json missing script: audit:gap-register-sync-closure");
}

if (!releaseCheck.includes("npm run audit:gap-register-sync-closure")) {
  failures.push("release:check must include npm run audit:gap-register-sync-closure");
}

if (!cli.includes('"audit:gap-register-sync-closure"')) {
  failures.push("CLI missing audit:gap-register-sync-closure command");
}

for (const text of [
  "syncReady",
  "strictSyncGap",
  "Status: synced",
  "clean and synced:\\s*yes",
  "...(syncReady ? [] : [strictSyncGap])",
]) {
  if (!generator.includes(text)) {
    failures.push(`tools/create-gap-register.mjs missing sync closure contract: ${text}`);
  }
}

for (const text of [
  "syncReady",
  "strict_publish_sync",
  "Status: synced",
  "clean and synced:\\s*yes",
]) {
  if (!gapAudit.includes(text)) {
    failures.push(`tools/audit-gap-register.mjs missing sync-aware audit text: ${text}`);
  }
}

for (const text of [
  "audit:gap-register-sync-closure",
  "audit:gap-register",
  "audit:gap-closure-plan",
]) {
  if (!releaseOrderAudit.includes(text)) {
    failures.push(`tools/audit-release-check-order.mjs missing release-order text: ${text}`);
  }
}

for (const text of [
  "tools/audit-gap-register-sync-closure.mjs",
  "audit:gap-register-sync-closure",
]) {
  if (!validator.includes(text)) {
    failures.push(`tools/validate-mimesis.mjs missing ${text}`);
  }
  if (!frameworkManifestGenerator.includes(text)) {
    failures.push(`tools/create-framework-manifest.mjs missing ${text}`);
  }
  if (!frameworkManifestAudit.includes(text)) {
    failures.push(`tools/audit-framework-manifest.mjs missing ${text}`);
  }
  if (!releaseArtifactGenerator.includes(text)) {
    failures.push(`tools/create-release-artifact-manifest.mjs missing ${text}`);
  }
  if (!releaseArtifactAudit.includes(text)) {
    failures.push(`tools/audit-release-artifact-manifest.mjs missing ${text}`);
  }
}

for (const [name, content] of [
  ["README.md", readme],
  ["tools/README.md", toolsReadme],
  ["docs/GAP-REGISTER.md", gapDoc],
  ["docs/RELEASE-CHECK-ORDER.md", releaseOrderDoc],
]) {
  for (const text of [
    "strict sync gap",
    "sync-ready",
    "audit:gap-register-sync-closure",
  ]) {
    if (!content.toLowerCase().includes(text.toLowerCase())) {
      failures.push(`${name} missing sync closure text: ${text}`);
    }
  }
}

const syncReady =
  /Status:\s*synced/i.test(syncStatus) &&
  /clean and synced:\s*yes/i.test(gateBoard);
const strictGapPresent = Array.isArray(register.gaps)
  ? register.gaps.some((gap) => gap.id === "strict_publish_sync")
  : false;

if (syncReady && strictGapPresent) {
  failures.push("sync-ready register must omit strict_publish_sync from open gaps");
}

if (!syncReady && !strictGapPresent) {
  failures.push("non-sync-ready register must keep strict_publish_sync visible as an open gap");
}

if (failures.length) {
  console.error("\nMimesis gap register sync-closure audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis gap register sync-closure audit passed: strict sync closes only when sync-ready evidence exists.");

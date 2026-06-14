#!/usr/bin/env node

import { spawnSync } from "node:child_process";
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
const index = readJson(".mimesis/reference-packs/index.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/REFERENCE-PACK-INDEX.md");
const referenceReadme = read("reference-packs/README.md");
const toolsReadme = read("tools/README.md");
const completionAudit = read("docs/COMPLETION-AUDIT.md");

for (const relativePath of [
  "tools/create-reference-pack-index.mjs",
  "tools/audit-reference-pack-index.mjs",
  "docs/REFERENCE-PACK-INDEX.md",
  ".mimesis/reference-packs/index.json",
]) {
  read(relativePath);
}

for (const scriptName of ["reference:index", "audit:reference-index"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

const releaseCheck = packageJson.scripts?.["release:check"] ?? "";
if (!releaseCheck.includes("reference:index")) {
  failures.push("release:check must generate npm run reference:index");
}

if (!releaseCheck.includes("audit:reference-index")) {
  failures.push("release:check must include npm run audit:reference-index");
}

if (!cli.includes('"reference:index"') || !cli.includes('"audit:reference-index"')) {
  failures.push("CLI missing reference:index or audit:reference-index command");
}

const combinedDocs = `${doc}\n${referenceReadme}\n${toolsReadme}\n${completionAudit}`.toLowerCase();
for (const text of [
  "reference pack index",
  "give ai standards, not roles",
  "source-first",
  "what not to copy",
  "does not prove external adoption",
  "does not prove package publication",
]) {
  if (!combinedDocs.includes(text.toLowerCase())) {
    failures.push(`reference pack index docs missing text: ${text}`);
  }
}

if (index.name !== "mimesis-reference-pack-index") {
  failures.push("reference pack index name must be mimesis-reference-pack-index");
}

if (index.version !== packageJson.version) {
  failures.push("reference pack index version must match package.json");
}

if (index.status !== "local-source-first-index-v0.1") {
  failures.push("reference pack index status must be local-source-first-index-v0.1");
}

if (!Array.isArray(index.packs) || index.packs.length < 7) {
  failures.push("reference pack index must include at least 7 packs");
}

for (const pack of index.packs ?? []) {
  for (const key of ["id", "title", "path", "useWhen", "sourceQuality", "inspect", "transferablePatterns", "doNotCopy", "starterPrompt"]) {
    if (!pack[key] || (Array.isArray(pack[key]) && pack[key].length === 0)) {
      failures.push(`reference pack ${pack.id || pack.path || "unknown"} missing ${key}`);
    }
  }

  if (pack.path && !fs.existsSync(path.join(root, pack.path))) {
    failures.push(`reference pack path missing: ${pack.path}`);
  }

  if (!pack.sourceQuality?.toLowerCase().match(/official|source|paper|patent|standard|public|local/)) {
    failures.push(`reference pack ${pack.id || pack.path} must keep source-first sourceQuality`);
  }

  if (!Array.isArray(pack.doNotCopy) || pack.doNotCopy.length < 3) {
    failures.push(`reference pack ${pack.id || pack.path} must preserve at least 3 doNotCopy boundaries`);
  }
}

for (const expectedId of [
  "github-readme",
  "landing-page",
  "product-page",
  "blog-post",
  "ai-workflow",
  "research-note",
  "profile-positioning",
]) {
  if (!index.packs?.some((pack) => pack.id === expectedId)) {
    failures.push(`reference pack index missing pack: ${expectedId}`);
  }
}

for (const boundary of [
  "local index only",
  "not a source-quality guarantee",
  "does not prove external adoption",
  "does not prove package publication",
]) {
  if (!index.boundary?.some((entry) => entry.toLowerCase().includes(boundary.toLowerCase()))) {
    failures.push(`reference pack index boundary missing: ${boundary}`);
  }
}

if (!failures.length) {
  const check = spawnSync(process.execPath, [path.join(root, "tools", "create-reference-pack-index.mjs"), "--check"], {
    cwd: root,
    encoding: "utf8",
  });
  if (check.status !== 0) {
    failures.push(`reference pack index check failed:\n${check.stdout}\n${check.stderr}`.trim());
  }
}

if (failures.length) {
  console.error("\nMimesis reference pack index audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis reference pack index audit passed: source-first standards are indexed and bounded.");

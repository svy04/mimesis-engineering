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
const doc = read("docs/GAP-REGISTER.md");
const register = readJson(".mimesis/gaps/current-gap-register.json");
const readme = read("README.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const toolsReadme = read("tools/README.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseCheck = packageJson.scripts?.["release:check"] ?? "";
const strictSyncBoundary = "runtime-only non-writing strict sync";

if (!packageJson.scripts?.["gap:register"]) {
  failures.push("package.json missing script: gap:register");
}

if (!packageJson.scripts?.["audit:gap-register"]) {
  failures.push("package.json missing script: audit:gap-register");
}

if (!releaseCheck.includes("gap:register")) {
  failures.push("release:check must generate npm run gap:register");
}

if (!releaseCheck.includes("audit:gap-register")) {
  failures.push("release:check must include npm run audit:gap-register");
}

if (!cli.includes('"gap:register"') || !cli.includes('"audit:gap-register"')) {
  failures.push("CLI missing gap:register or audit:gap-register command");
}

for (const text of [
  "gap register",
  "open gates remain",
  "does not prove completion",
  "does not publish",
  "does not create external proof",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/GAP-REGISTER.md missing text: ${text}`);
  }
}

if (register.schema !== "mimesis.gap-register.v0.1") {
  failures.push("gap register schema must be mimesis.gap-register.v0.1");
}

if (register.status !== "open_gates_remain") {
  failures.push("gap register status must be open_gates_remain");
}

if (register.completionAllowed !== false) {
  failures.push("gap register completionAllowed must be false");
}

if (!register.generatedAt) {
  failures.push("gap register missing generatedAt");
}

if (!Array.isArray(register.gaps) || register.gaps.length < 8) {
  failures.push("gap register must include at least 8 gaps");
}

const gaps = Array.isArray(register.gaps) ? register.gaps : [];
const gapIds = new Set(gaps.map((gap) => gap.id));

const expectedGapIds = [
  "strict_publish_sync",
  "owner_license_decision",
  "permissioned_external_artifact",
  "completed_external_case",
  "package_publication",
  "action_publication",
  "shipped_plugin",
  "benchmark_study",
  "external_adoption",
];

for (const id of expectedGapIds) {
  if (!gapIds.has(id)) {
    failures.push(`gap register missing gap id: ${id}`);
  }
}

const strictSyncGap = gaps.find((gap) => gap.id === "strict_publish_sync");
if (!strictSyncGap) {
  failures.push("gap register must keep strict_publish_sync visible because strict sync is runtime-only");
} else {
  if (!strictSyncGap.requiredEvidence?.includes("npm run audit:sync:strict")) {
    failures.push("strict_publish_sync must require npm run audit:sync:strict");
  }
  if (!`${strictSyncGap.nextAction} ${strictSyncGap.boundary}`.toLowerCase().includes(strictSyncBoundary.toLowerCase())) {
    failures.push("strict_publish_sync must explain the runtime-only non-writing strict sync boundary");
  }
}

for (const gap of gaps) {
  if (!gap.id || !gap.title || !gap.kind || !gap.status || !gap.requiredEvidence || !gap.nextAction || !gap.boundary) {
    failures.push(`gap register gap missing required fields: ${gap.id ?? "unknown"}`);
  }

  if (gap.status === "closed") {
    failures.push(`gap register must not mark open v0.1/v0.2 gaps as closed: ${gap.id}`);
  }
}

for (const boundary of [
  "does_not_prove_completion",
  "does_not_publish",
  "does_not_stage_commit_push_tag_release",
  "does_not_choose_license",
  "does_not_create_external_proof",
  "does_not_prove_adoption",
]) {
  if (!register.boundaries?.includes(boundary)) {
    failures.push(`gap register missing boundary: ${boundary}`);
  }
}

for (const source of [
  ".mimesis/gates/current-gateboard.md",
  ".mimesis/release-decisions/owner-decision-record.json",
  "docs/COMPLETION-AUDIT.md",
  "STATUS.md",
  "ROADMAP.md",
]) {
  if (!register.sourceFiles?.includes(source)) {
    failures.push(`gap register missing source file: ${source}`);
  }
}

for (const text of [
  "Gap Register",
  "GAP-REGISTER.md",
  "../.mimesis/gaps/current-gap-register.json",
  "../tools/create-gap-register.mjs",
  "../tools/audit-gap-register.mjs",
]) {
  if (!completion.includes(text)) {
    failures.push(`docs/COMPLETION-AUDIT.md missing gap register evidence: ${text}`);
  }
}

for (const contentCheck of [
  ["README.md", readme],
  ["tools/README.md", toolsReadme],
  ["STATUS.md", status],
  ["ROADMAP.md", roadmap],
]) {
  const [name, content] = contentCheck;
  if (!content.toLowerCase().includes("gap register")) {
    failures.push(`${name} missing gap register text`);
  }
}

if (!frameworkManifest.commands?.some((entry) => entry.name === "gap:register")) {
  failures.push(".mimesis/framework-manifest.json commands missing gap:register");
}

if (!frameworkManifest.commands?.some((entry) => entry.name === "audit:gap-register")) {
  failures.push(".mimesis/framework-manifest.json commands missing audit:gap-register");
}

if (failures.length) {
  console.error("\nMimesis gap register audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis gap register audit passed: remaining gates are machine-readable and bounded.");

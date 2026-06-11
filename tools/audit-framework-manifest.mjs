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
const manifest = readJson(".mimesis/framework-manifest.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/FRAMEWORK-MANIFEST.md");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const status = read("STATUS.md");
const completionAudit = read("docs/COMPLETION-AUDIT.md");

for (const relativePath of [
  "tools/create-framework-manifest.mjs",
  "tools/audit-framework-manifest.mjs",
  "docs/FRAMEWORK-MANIFEST.md",
  ".mimesis/framework-manifest.json",
]) {
  read(relativePath);
}

for (const scriptName of ["framework:manifest", "audit:framework-manifest"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

const releaseCheck = packageJson.scripts?.["release:check"] ?? "";
if (!releaseCheck.includes("framework:manifest")) {
  failures.push("release:check must generate npm run framework:manifest");
}

if (!releaseCheck.includes("audit:framework-manifest")) {
  failures.push("release:check must include npm run audit:framework-manifest");
}

if (!cli.includes('"framework:manifest"') || !cli.includes('"audit:framework-manifest"')) {
  failures.push("CLI missing framework:manifest or audit:framework-manifest command");
}

const combinedDocs = `${doc}\n${readme}\n${toolsReadme}\n${status}\n${completionAudit}`.toLowerCase();
for (const text of [
  "framework manifest",
  "ai-native",
  "give ai standards, not roles",
  "bring one weak artifact",
  "no proof, no claim",
  "does not prove external adoption",
  "does not prove package publication",
  "goal completion audit",
]) {
  if (!combinedDocs.includes(text.toLowerCase())) {
    failures.push(`framework manifest docs missing text: ${text}`);
  }
}

for (const text of [
  "proof intake from owner evidence",
  "proof:intake-from-owner-evidence",
  "audit:proof-intake-from-owner-evidence",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/FRAMEWORK-MANIFEST.md missing bridge text: ${text}`);
  }
}

if (manifest.name !== "mimesis-engineering") {
  failures.push("framework manifest name must be mimesis-engineering");
}

if (manifest.version !== packageJson.version) {
  failures.push("framework manifest version must match package.json");
}

if (manifest.status !== "public-working-framework-v0.1") {
  failures.push("framework manifest status must be public-working-framework-v0.1");
}

for (const phrase of [
  "Give AI standards, not roles.",
  "Bring one weak artifact.",
  "No proof, no claim.",
]) {
  if (!manifest.corePhrases?.includes(phrase)) {
    failures.push(`framework manifest missing core phrase: ${phrase}`);
  }
}

for (const key of [
  "entrypoints",
  "commands",
  "artifacts",
  "gates",
  "boundaries",
  "generatedFrom",
]) {
  if (!Array.isArray(manifest[key]) || manifest[key].length < 3) {
    failures.push(`framework manifest ${key} must list at least 3 items`);
  }
}

for (const sourcePath of [
  "tools/audit-gap-register-sync-closure.mjs",
]) {
  if (!manifest.generatedFrom?.includes(sourcePath)) {
    failures.push(`framework manifest generatedFrom missing ${sourcePath}`);
  }
}

for (const command of [
  "validate",
  "first-loop:demo",
  "audit:first-loop",
  "gap:register",
  "audit:gap-register",
  "audit:gap-register-sync-closure",
  "gap:closure-plan",
  "audit:gap-closure-plan",
  "gate:evidence-packet",
  "audit:gate-evidence-packet",
  "gate:closure-readiness",
  "audit:gate-closure-readiness",
  "gate:closure-review",
  "audit:gate-closure-review",
  "framework:manifest",
  "audit:framework-manifest",
  "reference:index",
  "audit:reference-index",
  "audit:spec-index",
  "audit:proof-intake-schema",
  "proof:intake-record",
  "proof:intake-check",
  "proof:intake-from-owner-evidence",
  "audit:proof-intake-record",
  "audit:proof-intake-check",
  "audit:proof-intake-from-owner-evidence",
  "proof:redaction-packet",
  "audit:proof-redaction-packet",
  "proof:submission-packet",
  "audit:proof-submission-packet",
  "proof:acceptance-packet",
  "audit:proof-acceptance-packet",
  "proof:execution-report",
  "audit:proof-execution-report",
  "proof:candidate-packet",
  "audit:proof-candidate-packet",
  "proof:readiness",
  "audit:proof-readiness",
  "case:from-record",
  "audit:case-from-record",
  "evidence:from-case",
  "audit:evidence-from-case",
  "evidence:review",
  "audit:evidence-review",
  "claim:from-evidence",
  "audit:claim-from-evidence",
  "plugin:install-packet",
  "audit:plugin-install-packet",
  "release:decision-record",
  "audit:release-decision-record",
  "release:evidence-report",
  "audit:release-evidence-report",
  "publication:evidence-packet",
  "audit:publication-evidence-packet",
  "adoption:packet",
  "audit:adoption-packet",
  "owner:queue",
  "audit:owner-queue",
  "owner:decision-intake",
  "audit:owner-decision-intake",
  "owner:decision-answer-record",
  "audit:owner-decision-answer-record",
  "owner:answer-review",
  "audit:owner-answer-review",
  "owner:evidence-attachment-form",
  "audit:owner-evidence-attachment-form",
  "owner:evidence-submission-record",
  "audit:owner-evidence-submission-record",
  "owner:evidence-submission-check",
  "audit:owner-evidence-submission-check",
  "owner:evidence-bundle",
  "audit:owner-evidence-bundle",
  "owner:evidence-intake-record",
  "audit:owner-evidence-intake-record",
  "owner:evidence-review",
  "audit:owner-evidence-review",
  "state:summary",
  "audit:state-summary",
  "worktree:packet",
  "audit:worktree-packet",
  "release:review-bundle",
  "audit:release-review-bundle",
  "goal:completion-audit",
  "audit:goal-completion-audit",
  "release:artifact-manifest",
  "audit:release-artifact-manifest",
  "audit:status-roadmap",
  "audit:sync:strict-nonwriting",
  "mcp:resources",
  "audit:mcp-stdio",
  "release:check:public",
]) {
  if (!manifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`framework manifest commands missing ${command}`);
  }
}

for (const artifact of [
  "spec/",
  ".mimesis file protocol",
  "templates/",
  "reference-packs/",
  "cases/",
  "prompts/",
  "adapters/",
  "plugins/",
]) {
  if (!manifest.artifacts?.some((entry) => entry.name === artifact)) {
    failures.push(`framework manifest artifacts missing ${artifact}`);
  }
}

for (const boundary of [
  "not external adoption proof",
  "not benchmark proof",
  "not package publication proof",
  "not a legal originality guarantee",
]) {
  if (!manifest.boundaries?.some((entry) => entry.name === boundary)) {
    failures.push(`framework manifest boundaries missing ${boundary}`);
  }
}

if (!failures.length) {
  const check = spawnSync(process.execPath, [path.join(root, "tools", "create-framework-manifest.mjs"), "--check"], {
    cwd: root,
    encoding: "utf8",
  });
  if (check.status !== 0) {
    failures.push(`framework manifest check failed:\n${check.stdout}\n${check.stderr}`.trim());
  }
}

if (failures.length) {
  console.error("\nMimesis framework manifest audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis framework manifest audit passed: AI-native manifest is generated, wired, and bounded.");

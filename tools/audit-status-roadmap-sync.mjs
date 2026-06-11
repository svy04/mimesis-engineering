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
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const readme = read("README.md");
const doc = read("docs/STATUS-ROADMAP-SYNC.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const toolsReadme = read("tools/README.md");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseCheck = packageJson.scripts?.["release:check"] ?? "";
const combinedPublicDocs = `${status}\n${roadmap}\n${readme}\n${completion}\n${toolsReadme}`;

if (!packageJson.scripts?.["audit:status-roadmap"]) {
  failures.push("package.json missing script: audit:status-roadmap");
}

if (!releaseCheck.includes("audit:status-roadmap")) {
  failures.push("release:check must include npm run audit:status-roadmap");
}

if (!cli.includes('"audit:status-roadmap"')) {
  failures.push("CLI missing audit:status-roadmap command");
}

for (const text of [
  "status roadmap sync",
  "release artifact manifest",
  "publication evidence packet",
  "current state summary",
  "state snapshot boundary",
  "worktree review packet",
  "release review bundle",
  "gap closure plan",
  "gate evidence packet",
  "gate evidence issue",
  "gate evidence issue convert",
  "gate closure readiness",
  "adoption packet",
  "first proof candidate packet",
  "proof redaction packet",
  "proof submission packet",
  "proof acceptance packet",
  "proof execution report",
  "spec index audit",
  "owner action queue",
  "owner issue queue",
  "owner issue remote sync",
  "owner issue remote create",
  "owner proof handoff",
  "owner proof input",
  "owner proof input remote issue",
  "owner proof input remote issue snapshot",
  "owner proof input remote issue export",
  "owner proof input remote issue export candidate",
  "owner proof input review",
  "owner proof input split",
  "owner decision intake",
  "owner decision answer record",
  "owner answer review",
  "owner evidence attachment form",
  "owner evidence submission record",
  "owner evidence submission check",
  "owner evidence bundle",
  "owner evidence intake record",
  "owner evidence review",
  "goal completion audit",
  "does not prove completion",
  "does not publish",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/STATUS-ROADMAP-SYNC.md missing text: ${text}`);
  }
}

for (const text of [
  "gap register",
  "gap closure plan",
  "gate evidence packet",
  "gate evidence issue",
  "gate evidence issue convert",
  "gate closure readiness",
  "first proof candidate packet",
  "proof redaction packet",
  "proof submission packet",
  "proof acceptance packet",
  "proof execution report",
  "owner action queue",
  "owner issue queue",
  "owner issue remote sync",
  "owner issue remote create",
  "owner proof handoff",
  "owner proof input",
  "owner proof input remote issue",
  "owner proof input remote issue snapshot",
  "owner proof input remote issue export",
  "owner proof input remote issue export candidate",
  "owner proof input review",
  "owner proof input split",
  "owner decision intake",
  "owner decision answer record",
  "owner answer review",
  "owner evidence attachment form",
  "owner evidence submission record",
  "owner evidence submission check",
  "owner evidence bundle",
  "owner evidence intake record",
  "owner evidence review",
  "proof intake check report",
  "adoption packet",
  "publication evidence packet",
  "release artifact manifest",
  "current state summary",
  "state snapshot boundary",
  "worktree review packet",
  "release review bundle",
  "goal completion audit",
  "release evidence report",
  "spec index audit",
  "status roadmap sync audit",
]) {
  if (!status.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`STATUS.md missing current capability: ${text}`);
  }

  if (!roadmap.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`ROADMAP.md missing v0.1 capability: ${text}`);
  }
}

for (const text of [
  "Status roadmap sync",
  "STATUS-ROADMAP-SYNC.md",
  "../tools/audit-status-roadmap-sync.mjs",
]) {
  if (!completion.includes(text)) {
    failures.push(`docs/COMPLETION-AUDIT.md missing status-roadmap evidence: ${text}`);
  }
}

if (!readme.includes("docs/STATUS-ROADMAP-SYNC.md")) {
  failures.push("README.md missing docs/STATUS-ROADMAP-SYNC.md");
}

if (!readme.includes("docs/CURRENT-STATE-SUMMARY.md")) {
  failures.push("README.md missing docs/CURRENT-STATE-SUMMARY.md");
}

if (!toolsReadme.includes("audit:status-roadmap")) {
  failures.push("tools/README.md missing audit:status-roadmap");
}

if (!frameworkManifest.commands?.some((entry) => entry.name === "audit:status-roadmap")) {
  failures.push(".mimesis/framework-manifest.json commands missing audit:status-roadmap");
}

for (const text of [
  "release:artifact-manifest",
  "audit:release-artifact-manifest",
  "state:summary",
  "audit:state-summary",
  "adoption:packet",
  "audit:adoption-packet",
  "publication:evidence-packet",
  "audit:publication-evidence-packet",
  "owner:queue",
  "audit:owner-queue",
  "owner:issue-queue",
  "audit:owner-issue-queue",
  "owner:issue-remote-sync",
  "audit:owner-issue-remote-sync",
  "owner:issue-remote-create",
  "audit:owner-issue-remote-create",
  "owner:proof-handoff",
  "audit:owner-proof-handoff",
  "owner:proof-input-issue",
  "owner:proof-input-request",
  "owner:proof-input-remote-issue",
  "owner:proof-input-issue-convert",
  "owner:proof-input-review",
  "owner:proof-input-template",
  "owner:proof-input-check",
  "owner:proof-input-split",
  "audit:owner-proof-input",
  "audit:owner-proof-input-issue",
  "audit:owner-proof-input-request",
  "audit:owner-proof-input-remote-issue",
  "audit:owner-proof-input-issue-convert",
  "audit:owner-proof-input-review",
  "audit:owner-proof-input-split",
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
  "gate:closure-readiness",
  "audit:gate-closure-readiness",
  "gate:closure-review",
  "audit:gate-closure-review",
  "audit:gate-evidence-issue-form",
  "gate:evidence-issue-convert",
  "audit:gate-evidence-issue-convert",
  "worktree:packet",
  "audit:worktree-packet",
  "release:review-bundle",
  "audit:release-review-bundle",
  "goal:completion-audit",
  "audit:goal-completion-audit",
  "audit:spec-index",
  "audit:status-roadmap",
]) {
  if (!combinedPublicDocs.includes(text)) {
    failures.push(`public docs missing command text: ${text}`);
  }
}

if (failures.length) {
  console.error("\nMimesis status/roadmap sync audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis status/roadmap sync audit passed: public status and roadmap match the local v0.1 surface.");

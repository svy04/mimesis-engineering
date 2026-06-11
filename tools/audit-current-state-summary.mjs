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
  const text = read(relativePath);
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`invalid JSON in ${relativePath}: ${error.message}`);
    return {};
  }
}

const packageJson = readJson("package.json");
const summary = readJson(".mimesis/state/current-state.json");
const gapRegister = readJson(".mimesis/gaps/current-gap-register.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/CURRENT-STATE-SUMMARY.md");
const specReadme = read("spec/README.md");
const schema = readJson("spec/current-state-summary.schema.json");

if (packageJson.scripts?.["state:summary"] !== "node tools/create-current-state-summary.mjs") {
  failures.push("package.json missing script: state:summary");
}

if (packageJson.scripts?.["audit:state-summary"] !== "node tools/audit-current-state-summary.mjs") {
  failures.push("package.json missing script: audit:state-summary");
}

if (!packageJson.scripts?.["release:check"]?.includes("state:summary")) {
  failures.push("release:check must include npm run state:summary");
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:state-summary")) {
  failures.push("release:check must include npm run audit:state-summary");
}

if (!cli.includes('"state:summary"')) {
  failures.push("CLI missing state:summary command");
}

if (!cli.includes('"audit:state-summary"')) {
  failures.push("CLI missing audit:state-summary command");
}

for (const text of [
  "current state summary",
  "does not close gates",
  "does not prove completion",
  "does not publish",
  "does not create external proof",
  "does not prove adoption",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`current state summary doc missing text: ${text}`);
  }
}

if (!specReadme.includes("current-state-summary.schema.json")) {
  failures.push("spec README must index current-state-summary schema");
}

if (schema?.title !== "Mimesis Current State Summary") {
  failures.push("current-state-summary schema must have the expected title");
}

if (summary.schema !== "mimesis.current-state-summary.v0.1") {
  failures.push("current state summary must use schema mimesis.current-state-summary.v0.1");
}

if (summary.snapshotKind !== "generated_local_state_snapshot") {
  failures.push("current state summary must identify itself as a generated local state snapshot");
}

if (summary.status !== "open_gates_remain") {
  failures.push("current state summary must keep status open_gates_remain");
}

if (summary.completionAllowed !== false) {
  failures.push("current state summary must keep completionAllowed false");
}

if (summary.gapCount !== gapRegister.gapCount) {
  failures.push("current state summary gapCount must match gap register");
}

const summaryGateIds = new Set((summary.gates ?? []).map((gate) => gate.id));
for (const gap of gapRegister.gaps ?? []) {
  if (!summaryGateIds.has(gap.id)) {
    failures.push(`current state summary missing gate: ${gap.id}`);
  }
}

for (const boundary of [
  "does_not_close_gates",
  "does_not_prove_completion",
  "does_not_publish",
  "does_not_stage_commit_push_tag_release",
  "does_not_choose_license",
  "does_not_create_external_proof",
  "does_not_prove_adoption",
]) {
  if (!summary.boundaries?.includes(boundary)) {
    failures.push(`current state summary missing boundary: ${boundary}`);
  }
}

for (const sourceFile of [
  ".mimesis/gaps/current-gap-register.json",
  ".mimesis/gaps/closure-plan.json",
  ".mimesis/gates/current-gateboard.md",
  ".mimesis/owner-actions/current-action-queue.md",
  ".mimesis/release-evidence/v0.1-report.md",
]) {
  if (!summary.sourceFiles?.includes(sourceFile)) {
    failures.push(`current state summary missing source file: ${sourceFile}`);
  }
}

if (!/does not close gates/i.test(summary.disallowedClaim ?? "")) {
  failures.push("current state summary disallowed claim must say it does not close gates");
}

if (!/not proof/i.test(summary.allowedClaim ?? "")) {
  failures.push("current state summary allowed claim must keep not-proof wording");
}

if (summary.git?.freshness !== "generation_time_only") {
  failures.push("current state summary git.freshness must be generation_time_only");
}

if (summary.git?.committedSnapshotCanGoStale !== true) {
  failures.push("current state summary git.committedSnapshotCanGoStale must be true");
}

if (summary.git?.liveVerificationCommand !== "npm run audit:sync:strict") {
  failures.push("current state summary git.liveVerificationCommand must be npm run audit:sync:strict");
}

if (!/not live git freshness proof/i.test(summary.disallowedClaim ?? "")) {
  failures.push("current state summary disallowed claim must say it is not live git freshness proof");
}

if (failures.length) {
  console.error("\nMimesis current state summary audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis current state summary audit passed: open gates are summarized without closing or proving them.");

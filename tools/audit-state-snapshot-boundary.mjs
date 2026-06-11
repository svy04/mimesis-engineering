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

function releaseCommands(packageJson) {
  return (packageJson.scripts?.["release:check"] ?? "")
    .split("&&")
    .map((part) => part.trim())
    .map((part) => part.replace(/^npm\s+run\s+/, "").trim())
    .filter(Boolean);
}

function requireBefore(commands, earlier, later) {
  const earlierIndex = commands.indexOf(earlier);
  const laterIndex = commands.indexOf(later);
  if (earlierIndex < 0 || laterIndex < 0) {
    return;
  }
  if (earlierIndex >= laterIndex) {
    failures.push(`release:check must run npm run ${earlier} before npm run ${later}`);
  }
}

function requireIncludes(label, content, needles) {
  for (const needle of needles) {
    if (!content.includes(needle)) {
      failures.push(`${label}: missing ${needle}`);
    }
  }
}

const packageJson = readJson("package.json");
const commands = releaseCommands(packageJson);
const state = readJson(".mimesis/state/current-state.json");
const goalAudit = readJson(".mimesis/completion/goal-completion-audit.json");
const doc = read("docs/CURRENT-STATE-SUMMARY.md");
const schema = readJson("spec/current-state-summary.schema.json");
const cli = read("bin/mimesis.mjs");
const validator = read("tools/validate-mimesis.mjs");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const releaseOrderDoc = read("docs/RELEASE-CHECK-ORDER.md");
const completionDoc = read("docs/COMPLETION-AUDIT.md");

for (const scriptName of ["audit:state-snapshot-boundary"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
  if (!commands.includes(scriptName)) {
    failures.push(`release:check missing npm run ${scriptName}`);
  }
  if (!cli.includes(`"${scriptName}"`)) {
    failures.push(`CLI missing ${scriptName}`);
  }
}

for (const [earlier, later] of [
  ["state:summary", "audit:state-snapshot-boundary"],
  ["audit:state-summary", "audit:state-snapshot-boundary"],
  ["goal:completion-audit", "audit:state-snapshot-boundary"],
  ["release:artifact-manifest", "audit:state-snapshot-boundary"],
  ["audit:state-snapshot-boundary", "audit:goal-completion-audit"],
  ["audit:state-snapshot-boundary", "audit:release"],
]) {
  requireBefore(commands, earlier, later);
}

if (state.snapshotKind !== "generated_local_state_snapshot") {
  failures.push(".mimesis/state/current-state.json snapshotKind must be generated_local_state_snapshot");
}

if (state.git?.freshness !== "generation_time_only") {
  failures.push(".mimesis/state/current-state.json git.freshness must be generation_time_only");
}

if (state.git?.committedSnapshotCanGoStale !== true) {
  failures.push(".mimesis/state/current-state.json git.committedSnapshotCanGoStale must be true");
}

if (state.git?.liveVerificationCommand !== "npm run audit:sync:strict") {
  failures.push(".mimesis/state/current-state.json git.liveVerificationCommand must point to npm run audit:sync:strict");
}

requireIncludes(".mimesis/state/current-state.json allowed/disallowed claims", JSON.stringify(state), [
  "generation-time snapshot",
  "not live git freshness proof",
  "npm run audit:sync:strict",
]);

if (!goalAudit.freshVerificationRequiredBeforeCompletion?.includes("npm run audit:state-snapshot-boundary")) {
  failures.push(".mimesis/completion/goal-completion-audit.json must require audit:state-snapshot-boundary before completion");
}

requireIncludes("docs/CURRENT-STATE-SUMMARY.md", doc, [
  "generation-time snapshot",
  "not live git freshness proof",
  "npm run audit:sync:strict",
  "committed snapshot",
]);

if (!schema.properties?.snapshotKind) {
  failures.push("spec/current-state-summary.schema.json missing snapshotKind property");
}

if (!schema.properties?.git?.properties?.freshness) {
  failures.push("spec/current-state-summary.schema.json missing git.freshness property");
}

if (!schema.properties?.git?.properties?.committedSnapshotCanGoStale) {
  failures.push("spec/current-state-summary.schema.json missing git.committedSnapshotCanGoStale property");
}

if (!schema.properties?.git?.properties?.liveVerificationCommand) {
  failures.push("spec/current-state-summary.schema.json missing git.liveVerificationCommand property");
}

for (const relativePath of [
  "tools/audit-state-snapshot-boundary.mjs",
  "docs/CURRENT-STATE-SUMMARY.md",
  ".mimesis/state/current-state.json",
  "spec/current-state-summary.schema.json",
]) {
  if (!validator.includes(relativePath)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${relativePath}`);
  }
}

if (!frameworkManifest.commands?.some((entry) => entry.name === "audit:state-snapshot-boundary")) {
  failures.push(".mimesis/framework-manifest.json commands missing audit:state-snapshot-boundary");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
if (!releaseArtifacts.has("tools/audit-state-snapshot-boundary.mjs")) {
  failures.push("release artifact manifest missing tools/audit-state-snapshot-boundary.mjs");
}

for (const [label, content] of [
  ["README.md", readme],
  ["tools/README.md", toolsReadme],
  ["STATUS.md", status],
  ["ROADMAP.md", roadmap],
  ["docs/V0.1-RELEASE-PACKET.md", releasePacket],
  ["docs/RELEASE-CHECK-ORDER.md", releaseOrderDoc],
  ["docs/COMPLETION-AUDIT.md", completionDoc],
]) {
  if (!content.toLowerCase().includes("state snapshot boundary")) {
    failures.push(`${label}: missing state snapshot boundary text`);
  }
}

if (failures.length) {
  console.error("\nMimesis state snapshot boundary audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis state snapshot boundary audit passed: committed state snapshots are bounded as generation-time evidence only.");

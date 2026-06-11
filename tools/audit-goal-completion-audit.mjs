#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const auditRelativePath = ".mimesis/completion/goal-completion-audit.json";
const objectiveText = "전 레포 자원과 잘사용해서 프레임워크 완성할때까지 달리자";

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

const packageJson = readJson("package.json");
const commands = releaseCommands(packageJson);
const cli = read("bin/mimesis.mjs");
const doc = read("docs/GOAL-COMPLETION-AUDIT.md");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const completionDoc = read("docs/COMPLETION-AUDIT.md");
const releaseOrderDoc = read("docs/RELEASE-CHECK-ORDER.md");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");
const validator = read("tools/validate-mimesis.mjs");
const audit = readJson(auditRelativePath);

if (packageJson.scripts?.["goal:completion-audit"] !== "node tools/create-goal-completion-audit.mjs") {
  failures.push("package.json missing script: goal:completion-audit");
}

if (packageJson.scripts?.["audit:goal-completion-audit"] !== "node tools/audit-goal-completion-audit.mjs") {
  failures.push("package.json missing script: audit:goal-completion-audit");
}

if (!commands.includes("goal:completion-audit")) {
  failures.push("release:check must generate npm run goal:completion-audit");
}

if (!commands.includes("audit:goal-completion-audit")) {
  failures.push("release:check must include npm run audit:goal-completion-audit");
}

for (const [earlier, later] of [
  ["gate:closure-review", "goal:completion-audit"],
  ["state:summary", "goal:completion-audit"],
  ["release:review-bundle", "goal:completion-audit"],
  ["goal:completion-audit", "release:artifact-manifest"],
  ["goal:completion-audit", "audit:goal-completion-audit"],
  ["audit:gate-closure-review", "audit:goal-completion-audit"],
  ["audit:release-review-bundle", "audit:goal-completion-audit"],
  ["audit:goal-completion-audit", "audit:release-order"],
  ["audit:goal-completion-audit", "audit:release"],
]) {
  requireBefore(commands, earlier, later);
}

if (!cli.includes('"goal:completion-audit"') || !cli.includes('"audit:goal-completion-audit"')) {
  failures.push("CLI missing goal:completion-audit or audit:goal-completion-audit command");
}

for (const text of [
  "goal completion audit",
  "does not prove completion",
  "completionAllowed: false",
  "open gates remain",
  "objective evidence",
  "no completion claim",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/GOAL-COMPLETION-AUDIT.md missing text: ${text}`);
  }
}

if (audit.schema !== "mimesis.goal-completion-audit.v0.1") {
  failures.push(`${auditRelativePath} schema must be mimesis.goal-completion-audit.v0.1`);
}

if (audit.objective !== objectiveText) {
  failures.push(`${auditRelativePath} objective must preserve the active goal text`);
}

if (audit.status !== "not_complete_open_gates_remain") {
  failures.push(`${auditRelativePath} status must be not_complete_open_gates_remain`);
}

if (audit.completionAllowed !== false) {
  failures.push(`${auditRelativePath} completionAllowed must remain false`);
}

if (audit.goalComplete !== false) {
  failures.push(`${auditRelativePath} goalComplete must remain false`);
}

if (!Array.isArray(audit.requirements) || audit.requirements.length < 10) {
  failures.push(`${auditRelativePath} must include at least 10 requirement checks`);
}

const requirementIds = new Set((audit.requirements ?? []).map((item) => item.id));
for (const id of [
  "readme_30_second",
  "five_minute_execution",
  "mimesis_protocol",
  "ai_native_structure",
  "proof_boundary",
  "release_preflight",
  "strict_publish_sync",
  "owner_license_decision",
  "permissioned_external_artifact",
  "completed_external_case",
  "package_publication",
  "action_publication",
  "shipped_plugin",
  "benchmark_study",
  "external_adoption",
]) {
  if (!requirementIds.has(id)) {
    failures.push(`${auditRelativePath} missing requirement id: ${id}`);
  }
}

const openGateIds = new Set(audit.openGateIds ?? []);
for (const id of [
  "strict_publish_sync",
  "owner_license_decision",
  "permissioned_external_artifact",
  "completed_external_case",
  "package_publication",
  "action_publication",
  "shipped_plugin",
  "benchmark_study",
  "external_adoption",
]) {
  if (!openGateIds.has(id)) {
    failures.push(`${auditRelativePath} openGateIds missing ${id}`);
  }
}

for (const text of [
  ".mimesis/gaps/current-gap-register.json",
  ".mimesis/gates/closure-review.json",
  ".mimesis/state/current-state.json",
  ".mimesis/release-review/v0.1-bundle.json",
  "docs/COMPLETION-AUDIT.md",
  "npm run release:check",
]) {
  if (!JSON.stringify(audit).includes(text)) {
    failures.push(`${auditRelativePath} missing evidence text: ${text}`);
  }
}

for (const text of [
  "does_not_mark_goal_complete",
  "does_not_close_gates",
  "does_not_publish",
  "does_not_choose_license",
  "does_not_create_external_proof",
  "does_not_prove_adoption",
]) {
  if (!JSON.stringify(audit.boundaries ?? []).includes(text)) {
    failures.push(`${auditRelativePath} missing boundary: ${text}`);
  }
}

for (const text of [
  "goal:completion-audit",
  "audit:goal-completion-audit",
  "GOAL-COMPLETION-AUDIT.md",
  auditRelativePath,
]) {
  for (const [name, content] of [
    ["README.md", readme],
    ["tools/README.md", toolsReadme],
    ["STATUS.md", status],
    ["ROADMAP.md", roadmap],
    ["docs/V0.1-RELEASE-PACKET.md", releasePacket],
    ["docs/COMPLETION-AUDIT.md", completionDoc],
    ["docs/RELEASE-CHECK-ORDER.md", releaseOrderDoc],
  ]) {
    if (!content.includes(text)) {
      failures.push(`${name} missing goal completion audit text: ${text}`);
    }
  }
}

for (const command of ["goal:completion-audit", "audit:goal-completion-audit"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === auditRelativePath)) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing goal completion audit");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/GOAL-COMPLETION-AUDIT.md",
  auditRelativePath,
  "tools/create-goal-completion-audit.mjs",
  "tools/audit-goal-completion-audit.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing ${artifactPath}`);
  }
  if (!validator.includes(artifactPath)) {
    failures.push(`validator required files missing ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis goal completion audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis goal completion audit passed: active goal completion is audited without closing gates or claiming completion.");

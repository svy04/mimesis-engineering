#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const fixturePath = ".mimesis/owner-actions/fixture-owner-proof-input-remote-issue-candidate.json";
const privateOutput = ".mimesis/private/audit/remote-proof-input-issue-candidate.md";
const privateReport = ".mimesis/private/audit/remote-proof-input-issue-candidate-export.md";

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

function cleanupPrivateAudit() {
  fs.rmSync(path.join(root, ".mimesis", "private", "audit"), {
    recursive: true,
    force: true,
  });
}

function runCandidateExportSmoke() {
  cleanupPrivateAudit();
  const result = spawnSync(process.execPath, [
    path.join(root, "tools", "export-owner-proof-input-remote-issue.mjs"),
    "--issue-json",
    fixturePath,
    "--output",
    privateOutput,
    "--report",
    privateReport,
  ], {
    cwd: root,
    encoding: "utf8",
  });

  const output = `${result.stdout}\n${result.stderr}`;

  if (result.status !== 0) {
    failures.push(`candidate fixture export smoke failed:\n${output.trim()}`);
    cleanupPrivateAudit();
    return;
  }

  const outputPath = path.join(root, privateOutput);
  const reportPath = path.join(root, privateReport);
  if (!fs.existsSync(outputPath)) {
    failures.push(`candidate fixture export did not write ${privateOutput}`);
  }
  if (!fs.existsSync(reportPath)) {
    failures.push(`candidate fixture export did not write ${privateReport}`);
  }

  const exportedBody = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8") : "";
  const report = fs.existsSync(reportPath) ? fs.readFileSync(reportPath, "utf8") : "";

  requireIncludes("candidate exported body", exportedBody, [
    "## 1. license_or_no_reuse",
    "## 2. weak_artifact_permission",
    "- [x] Reuse allowed after adding a new license",
    "- [x] Anonymized",
    "- [x] I did not include secrets, passwords, tokens, or private customer data.",
  ]);

  if (/\[owner to fill\b|api[_-]?key\s*[:=]|password\s*[:=]|oauth[_-]?token\s*[:=]|secret\s*[:=]/i.test(exportedBody)) {
    failures.push("candidate exported body must be filled fixture content without placeholders or secret-like text");
  }

  requireIncludes("candidate export report", report, [
    "owner input status: candidate_owner_input",
    "ready for local conversion: yes",
    "body export written: yes",
    "private output path",
    "It does not close gates",
  ]);

  const ignored = spawnSync("git", ["check-ignore", privateOutput], {
    cwd: root,
    encoding: "utf8",
  });
  if (ignored.status !== 0) {
    failures.push(`${privateOutput} must be ignored by git`);
  }

  cleanupPrivateAudit();
}

const packageJson = readJson("package.json");
const commands = releaseCommands(packageJson);
const cli = read("bin/mimesis.mjs");
const generator = read("tools/export-owner-proof-input-remote-issue.mjs");
const doc = read("docs/OWNER-PROOF-INPUT-REMOTE-ISSUE-EXPORT.md");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const releaseOrderDoc = read("docs/RELEASE-CHECK-ORDER.md");
const validator = read("tools/validate-mimesis.mjs");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");
const fixture = readJson(fixturePath);

const scriptName = "audit:owner-proof-input-remote-issue-export-candidate";
if (!packageJson.scripts?.[scriptName]) {
  failures.push(`package.json missing script: ${scriptName}`);
}
if (!cli.includes(`"${scriptName}"`)) {
  failures.push(`CLI missing ${scriptName}`);
}
if (!commands.includes(scriptName)) {
  failures.push(`release:check missing npm run ${scriptName}`);
}
if (commands.includes("owner:proof-input-remote-issue-export")) {
  failures.push("release:check must not run the live raw-body export command");
}

for (const [earlier, later] of [
  ["audit:owner-proof-input-remote-issue-export", scriptName],
  [scriptName, "audit:owner-proof-input-issue-convert"],
  [scriptName, "audit:release-artifact-manifest"],
]) {
  requireBefore(commands, earlier, later);
}

requireIncludes("generator", generator, [
  "--issue-json",
  "issueJsonPath",
  "fixture_candidate_owner_input",
  "candidate_owner_input",
]);

if (fixture.schema !== "mimesis.owner-proof-input-remote-issue-candidate-fixture.v0.1") {
  failures.push(`${fixturePath} schema must be mimesis.owner-proof-input-remote-issue-candidate-fixture.v0.1`);
}
if (fixture.fixtureKind !== "fixture_candidate_owner_input") {
  failures.push(`${fixturePath} fixtureKind must be fixture_candidate_owner_input`);
}
if (fixture.number !== 7) {
  failures.push(`${fixturePath} must model issue #7`);
}
if (!Array.isArray(fixture.labels) || !fixture.labels.some((label) => label.name === "owner-proof-input")) {
  failures.push(`${fixturePath} must include owner-proof-input label`);
}
if (!String(fixture.body || "").includes("## 1. license_or_no_reuse") || !String(fixture.body || "").includes("## 2. weak_artifact_permission")) {
  failures.push(`${fixturePath} body must include the two owner proof input sections`);
}
if (/\[owner to fill\b|api[_-]?key\s*[:=]|password\s*[:=]|oauth[_-]?token\s*[:=]|secret\s*[:=]/i.test(String(fixture.body || ""))) {
  failures.push(`${fixturePath} body must not include placeholders or secret-like text`);
}

requireIncludes("doc", doc, [
  "--issue-json",
  "fixture candidate",
  "candidate export smoke",
]);

for (const relativePath of [
  fixturePath,
  "tools/audit-owner-proof-input-remote-issue-export-candidate.mjs",
]) {
  if (!validator.includes(relativePath)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${relativePath}`);
  }
}

if (!frameworkManifest.commands?.some((entry) => entry.name === scriptName)) {
  failures.push(`.mimesis/framework-manifest.json commands missing ${scriptName}`);
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  fixturePath,
  "tools/audit-owner-proof-input-remote-issue-export-candidate.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

for (const [label, content] of [
  ["README.md", readme],
  ["tools/README.md", toolsReadme],
  ["docs/COMPLETION-AUDIT.md", completion],
  ["STATUS.md", status],
  ["ROADMAP.md", roadmap],
  ["docs/V0.1-RELEASE-PACKET.md", releasePacket],
  ["docs/RELEASE-CHECK-ORDER.md", releaseOrderDoc],
]) {
  if (!content.toLowerCase().includes("owner proof input remote issue export candidate")) {
    failures.push(`${label}: missing owner proof input remote issue export candidate text`);
  }
}

if (!failures.length) {
  runCandidateExportSmoke();
}

if (failures.length) {
  cleanupPrivateAudit();
  console.error("\nMimesis owner proof input remote issue export candidate audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner proof input remote issue export candidate audit passed: candidate fixture exports only to a private ignored path.");

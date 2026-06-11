#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
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

function commandList(packageJson) {
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
const releaseCommands = commandList(packageJson);
const cli = read("bin/mimesis.mjs");
const cliAudit = read("tools/audit-cli.mjs");
const converter = read("tools/convert-gate-evidence-issue.mjs");
const doc = read("docs/GATE-EVIDENCE-ISSUE-CONVERT.md");
const issueDoc = read("docs/GATE-EVIDENCE-ISSUE.md");
const fixtureIssue = read(".mimesis/gates/fixture-gate-evidence-issue.md");
const fixturePacket = read(".mimesis/gates/fixture-gate-evidence-packet.md");
const fixtureReport = read(".mimesis/gates/fixture-gate-evidence-issue-conversion-report.md");
const evidenceChecker = read("tools/check-evidence-packet.mjs");
const evidenceTemplate = read("templates/evidence-packet.md");
const validator = read("tools/validate-mimesis.mjs");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const statusRoadmap = read("docs/STATUS-ROADMAP-SYNC.md");
const releaseOrderDoc = read("docs/RELEASE-CHECK-ORDER.md");
const releaseOrderAudit = read("tools/audit-release-check-order.mjs");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");

for (const scriptName of ["gate:evidence-issue-convert", "audit:gate-evidence-issue-convert"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
  if (!releaseCommands.includes(scriptName)) {
    failures.push(`release:check missing npm run ${scriptName}`);
  }
  if (!cli.includes(`"${scriptName}"`)) {
    failures.push(`CLI missing ${scriptName}`);
  }
  if (!cliAudit.includes(`"${scriptName}"`)) {
    failures.push(`tools/audit-cli.mjs missing ${scriptName}`);
  }
}

for (const [earlier, later] of [
  ["gate:evidence-packet", "gate:evidence-issue-convert"],
  ["gate:evidence-issue-convert", "proof:candidate-packet"],
  ["gate:evidence-issue-convert", "release:artifact-manifest"],
  ["audit:gate-evidence-issue-form", "audit:gate-evidence-issue-convert"],
  ["audit:gate-evidence-issue-convert", "audit:proof-candidate-packet"],
  ["audit:gate-evidence-issue-convert", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

requireIncludes("converter", converter, [
  "parseIssueBody",
  "gate_id",
  "evidence_links",
  "buildEvidencePacket",
  "Review Decision",
  "draft.",
  "does_not_close_gates",
]);

requireIncludes("doc", doc, [
  "# Gate Evidence Issue Convert",
  "gate:evidence-issue-convert",
  "audit:gate-evidence-issue-convert",
  "fixture-gate-evidence-issue.md",
  "fixture-gate-evidence-packet.md",
  "does not close gates",
  "does not create proof",
]);

requireIncludes("gate evidence issue doc", issueDoc, [
  "gate:evidence-issue-convert",
  "draft evidence packet",
]);

requireIncludes("fixture issue", fixtureIssue, [
  "### Gate ID",
  "### Evidence type",
  "### Evidence links",
  "### Evidence summary",
  "### Permission and publication boundary",
  "### Review state",
  "### Allowed claim",
  "### Disallowed claim",
  "### Safety confirmation",
  "fixture only",
]);

requireIncludes("fixture packet", fixturePacket, [
  "# Evidence Packet",
  "Status: draft.",
  "## Claim Under Review",
  "## Evidence Type",
  "## Source / Artifact Links",
  "## Review Decision",
  "draft.",
  "does not close gates",
]);

requireIncludes("fixture report", fixtureReport, [
  "# Gate Evidence Issue Conversion Report",
  "Status: fixture gate evidence issue converted to draft evidence packet, not proof.",
  "ready for evidence review: no",
  "does not close gates",
  "does not create proof",
]);

for (const text of ["owner decision", "sync verification", "gate evidence"]) {
  if (!evidenceChecker.toLowerCase().includes(text) || !evidenceTemplate.toLowerCase().includes(text)) {
    failures.push(`evidence checker/template must allow gate evidence class: ${text}`);
  }
}

for (const relativePath of [
  "docs/GATE-EVIDENCE-ISSUE-CONVERT.md",
  ".mimesis/gates/fixture-gate-evidence-issue.md",
  ".mimesis/gates/fixture-gate-evidence-packet.md",
  ".mimesis/gates/fixture-gate-evidence-issue-conversion-report.md",
  "tools/convert-gate-evidence-issue.mjs",
  "tools/audit-gate-evidence-issue-convert.mjs",
]) {
  if (!validator.includes(relativePath)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${relativePath}`);
  }
}

for (const command of ["gate:evidence-issue-convert", "audit:gate-evidence-issue-convert"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/gates/fixture-gate-evidence-packet.md")) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing converted gate evidence packet");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/GATE-EVIDENCE-ISSUE-CONVERT.md",
  ".mimesis/gates/fixture-gate-evidence-issue.md",
  ".mimesis/gates/fixture-gate-evidence-packet.md",
  ".mimesis/gates/fixture-gate-evidence-issue-conversion-report.md",
  "tools/convert-gate-evidence-issue.mjs",
  "tools/audit-gate-evidence-issue-convert.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

for (const [label, content] of [
  ["README.md", readme],
  ["tools/README.md", toolsReadme],
  ["STATUS.md", status],
  ["ROADMAP.md", roadmap],
  ["docs/COMPLETION-AUDIT.md", completion],
  ["docs/V0.1-RELEASE-PACKET.md", releasePacket],
  ["docs/STATUS-ROADMAP-SYNC.md", statusRoadmap],
  ["docs/RELEASE-CHECK-ORDER.md", releaseOrderDoc],
]) {
  if (!content.toLowerCase().includes("gate evidence issue convert")) {
    failures.push(`${label}: missing gate evidence issue convert text`);
  }
}

if (!releaseOrderAudit.includes("gate:evidence-issue-convert") || !releaseOrderAudit.includes("audit:gate-evidence-issue-convert")) {
  failures.push("tools/audit-release-check-order.mjs missing gate evidence issue convert order checks");
}

if (fs.existsSync(path.join(root, "tools", "convert-gate-evidence-issue.mjs"))
  && fs.existsSync(path.join(root, ".mimesis", "gates", "fixture-gate-evidence-issue.md"))) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-gate-evidence-issue-convert-"));
  const outputPath = path.join(tmpDir, "evidence-packet.md");
  const reportPath = path.join(tmpDir, "report.md");
  const convertResult = spawnSync(
    process.execPath,
    [
      "tools/convert-gate-evidence-issue.mjs",
      ".mimesis/gates/fixture-gate-evidence-issue.md",
      "--output",
      outputPath,
      "--report",
      reportPath,
      "--source",
      "audit smoke",
    ],
    { cwd: root, encoding: "utf8" },
  );
  if (convertResult.status !== 0) {
    failures.push(`converter smoke failed: ${convertResult.stderr || convertResult.stdout}`);
  } else {
    const smokePacket = fs.readFileSync(outputPath, "utf8");
    const smokeReport = fs.readFileSync(reportPath, "utf8");
    if (!smokePacket.includes("Status: draft.") || !smokePacket.includes("Review Decision")) {
      failures.push("converter smoke packet must stay draft with Review Decision");
    }
    if (!smokeReport.includes("ready for evidence review: no")) {
      failures.push("converter smoke report must keep default draft not ready");
    }
    const checkResult = spawnSync(
      process.execPath,
      ["tools/check-evidence-packet.mjs", outputPath],
      { cwd: root, encoding: "utf8" },
    );
    if (checkResult.status !== 0) {
      failures.push(`generated evidence packet smoke check failed: ${checkResult.stderr || checkResult.stdout}`);
    }
  }
}

if (failures.length) {
  console.error("\nMimesis gate evidence issue convert audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis gate evidence issue convert audit passed: issue intake can become a bounded draft evidence packet candidate.");

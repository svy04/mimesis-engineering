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

const packageJson = readJson("package.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/PROOF-EXECUTION-REPORT.md");
const report = read(".mimesis/proof-runs/execution-report.md");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");
const releaseCommands = commandList(packageJson);

for (const scriptName of ["proof:execution-report", "audit:proof-execution-report"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!cli.includes('"proof:execution-report"') || !cli.includes('"audit:proof-execution-report"')) {
  failures.push("CLI missing proof:execution-report or audit:proof-execution-report command");
}

for (const command of ["proof:execution-report", "audit:proof-execution-report"]) {
  if (!releaseCommands.includes(command)) {
    failures.push(`release:check missing npm run ${command}`);
  }
}

for (const [earlier, later] of [
  ["proof:run-packet", "proof:execution-report"],
  ["proof:acceptance-packet", "proof:execution-report"],
  ["proof:execution-report", "release:artifact-manifest"],
  ["proof:execution-report", "audit:proof-execution-report"],
  ["audit:proof-run", "audit:proof-execution-report"],
  ["audit:proof-acceptance-packet", "audit:proof-execution-report"],
  ["audit:proof-execution-report", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

for (const text of [
  "proof execution report",
  "command evidence ledger",
  "execution states",
  "not executed proof",
  "does not execute commands",
  "does not create external proof",
  "does not publish",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/PROOF-EXECUTION-REPORT.md missing text: ${text}`);
  }
}

for (const section of [
  "# Mimesis Proof Execution Report",
  "Status: execution report packet, not executed proof.",
  "## Report Inputs",
  "## Execution States",
  "## Command Evidence Ledger",
  "## Required Attachments",
  "## Stop Conditions",
  "## Allowed Claim",
  "## Disallowed Claim",
  "## Boundary",
]) {
  if (!report.includes(section)) {
    failures.push(`proof execution report missing section: ${section}`);
  }
}

for (const text of [
  ".mimesis/proof-intake/acceptance-packet.md",
  ".mimesis/proof-runs/v0.2-first-run.md",
  "case:review",
  "case:from-intake",
  "case:check",
  "evidence:from-case",
  "evidence:review",
  "evidence:check",
  "claim:from-evidence",
  "release:check:public",
  "not_started",
  "running",
  "stopped",
  "complete_local_run",
  "does not execute commands",
  "does not create external proof",
  "does not publish",
]) {
  if (!report.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`proof execution report missing text: ${text}`);
  }
}

for (const [name, content] of [
  ["README.md", readme],
  ["tools/README.md", toolsReadme],
  ["docs/COMPLETION-AUDIT.md", completion],
  ["STATUS.md", status],
  ["ROADMAP.md", roadmap],
  ["docs/V0.1-RELEASE-PACKET.md", releasePacket],
]) {
  if (!content.toLowerCase().includes("proof execution report")) {
    failures.push(`${name} missing proof execution report text`);
  }
}

for (const command of ["proof:execution-report", "audit:proof-execution-report"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/PROOF-EXECUTION-REPORT.md",
  ".mimesis/proof-runs/execution-report.md",
  "tools/create-proof-execution-report.mjs",
  "tools/audit-proof-execution-report.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis proof execution report audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis proof execution report audit passed: execution evidence ledger is explicit without claiming proof.");

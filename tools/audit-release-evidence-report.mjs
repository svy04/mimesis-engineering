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
const doc = read("docs/RELEASE-EVIDENCE-REPORT.md");
const report = read(".mimesis/release-evidence/v0.1-report.md");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");
const releaseCommands = commandList(packageJson);

for (const scriptName of ["release:evidence-report", "audit:release-evidence-report"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!cli.includes('"release:evidence-report"') || !cli.includes('"audit:release-evidence-report"')) {
  failures.push("CLI missing release:evidence-report or audit:release-evidence-report command");
}

for (const command of ["release:evidence-report", "audit:release-evidence-report"]) {
  if (!releaseCommands.includes(command)) {
    failures.push(`release:check missing npm run ${command}`);
  }
}

for (const [earlier, later] of [
  ["release:execution-packet", "release:evidence-report"],
  ["release:decision-record", "release:evidence-report"],
  ["publish:packet", "release:evidence-report"],
  ["release:evidence-report", "release:artifact-manifest"],
  ["release:evidence-report", "audit:release-evidence-report"],
  ["audit:release-execution", "audit:release-evidence-report"],
  ["audit:release-decision-record", "audit:release-evidence-report"],
  ["audit:publish-packet", "audit:release-evidence-report"],
  ["audit:release-evidence-report", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

for (const text of [
  "release evidence report",
  "publication evidence table",
  "required release evidence",
  "does not publish",
  "does not create a tag",
  "does not publish to npm",
  "does not publish a GitHub Marketplace action",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/RELEASE-EVIDENCE-REPORT.md missing text: ${text}`);
  }
}

for (const section of [
  "# Mimesis Release Evidence Report",
  "Status: release evidence report packet, not publication.",
  "## Report Inputs",
  "## Publication Evidence Table",
  "## Required Release Evidence",
  "## Stop Conditions",
  "## Allowed Claim",
  "## Disallowed Claim",
  "## Boundary",
]) {
  if (!report.includes(section)) {
    failures.push(`release evidence report missing section: ${section}`);
  }
}

for (const text of [
  "docs/RELEASE-EXECUTION-PACKET.md",
  ".mimesis/release-execution/v0.1-owner-handoff.md",
  ".mimesis/release-decisions/owner-decision-record.json",
  ".mimesis/publish-packets/local-sync-handoff.md",
  "git commit",
  "git tag",
  "GitHub release URL",
  "npm package URL",
  "GitHub Marketplace URL",
  "plugin release URL",
  "release:check:public",
  "audit:sync:strict",
  "does not publish",
  "does not create a tag",
  "does not publish to npm",
  "does not create external proof",
]) {
  if (!report.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`release evidence report missing text: ${text}`);
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
  if (!content.toLowerCase().includes("release evidence report")) {
    failures.push(`${name} missing release evidence report text`);
  }
}

for (const command of ["release:evidence-report", "audit:release-evidence-report"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/RELEASE-EVIDENCE-REPORT.md",
  ".mimesis/release-evidence/v0.1-report.md",
  "tools/create-release-evidence-report.mjs",
  "tools/audit-release-evidence-report.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis release evidence report audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis release evidence report audit passed: publication evidence requirements are explicit without publishing.");

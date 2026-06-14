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
const doc = read("docs/PROOF-SUBMISSION-PACKET.md");
const packet = read(".mimesis/proof-intake/submission-packet.md");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");
const releaseCommands = commandList(packageJson);

for (const scriptName of ["proof:submission-packet", "audit:proof-submission-packet"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!cli.includes('"proof:submission-packet"') || !cli.includes('"audit:proof-submission-packet"')) {
  failures.push("CLI missing proof:submission-packet or audit:proof-submission-packet command");
}

for (const command of ["proof:submission-packet", "audit:proof-submission-packet"]) {
  if (!releaseCommands.includes(command)) {
    failures.push(`release:check missing npm run ${command}`);
  }
}

for (const [earlier, later] of [
  ["proof:intake", "proof:submission-packet"],
  ["proof:redaction-packet", "proof:submission-packet"],
  ["proof:candidate-packet", "proof:submission-packet"],
  ["proof:submission-packet", "release:artifact-manifest"],
  ["proof:submission-packet", "audit:proof-submission-packet"],
  ["audit:proof-redaction-packet", "audit:proof-submission-packet"],
  ["audit:proof-submission-packet", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

for (const text of [
  "proof submission packet",
  "submitter checklist",
  "permissioned external weak artifact",
  "GitHub issue form",
  "does not submit an artifact",
  "does not create external proof",
  "does not grant permission",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/PROOF-SUBMISSION-PACKET.md missing text: ${text}`);
  }
}

for (const section of [
  "# Mimesis Proof Submission Packet",
  "Status: submission handoff packet, not submitted artifact.",
  "## Submission Surfaces",
  "## Submitter Checklist",
  "## Issue Form Fields",
  "## Operator Command Path",
  "## Stop Conditions",
  "## Allowed Claim",
  "## Disallowed Claim",
  "## Boundary",
]) {
  if (!packet.includes(section)) {
    failures.push(`proof submission packet missing section: ${section}`);
  }
}

for (const text of [
  ".github/ISSUE_TEMPLATE/permissioned-external-case.yml",
  "templates/permissioned-case-intake.md",
  "docs/PROOF-INTAKE-KIT.md",
  ".mimesis/proof-intake/redaction-packet.md",
  "Starting artifact",
  "Artifact owner",
  "Permission status",
  "Publication preference",
  "Redaction requirements",
  "References studied",
  "Desired transformation",
  "Proof boundary",
  "Safety confirmation",
  "case:review",
  "case:from-intake",
  "case:check",
  "does not submit an artifact",
  "does not create external proof",
  "does not grant permission",
  "does not publish",
]) {
  if (!packet.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`proof submission packet missing text: ${text}`);
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
  if (!content.toLowerCase().includes("proof submission packet")) {
    failures.push(`${name} missing proof submission packet text`);
  }
}

for (const command of ["proof:submission-packet", "audit:proof-submission-packet"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/PROOF-SUBMISSION-PACKET.md",
  ".mimesis/proof-intake/submission-packet.md",
  "tools/create-proof-submission-packet.mjs",
  "tools/audit-proof-submission-packet.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis proof submission packet audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis proof submission packet audit passed: submission handoff is explicit without claiming proof.");

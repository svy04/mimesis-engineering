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
const doc = read("docs/PROOF-ACCEPTANCE-PACKET.md");
const packet = read(".mimesis/proof-intake/acceptance-packet.md");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");
const releaseCommands = commandList(packageJson);

for (const scriptName of ["proof:acceptance-packet", "audit:proof-acceptance-packet"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!cli.includes('"proof:acceptance-packet"') || !cli.includes('"audit:proof-acceptance-packet"')) {
  failures.push("CLI missing proof:acceptance-packet or audit:proof-acceptance-packet command");
}

for (const command of ["proof:acceptance-packet", "audit:proof-acceptance-packet"]) {
  if (!releaseCommands.includes(command)) {
    failures.push(`release:check missing npm run ${command}`);
  }
}

for (const [earlier, later] of [
  ["proof:submission-packet", "proof:acceptance-packet"],
  ["proof:acceptance-packet", "release:artifact-manifest"],
  ["proof:acceptance-packet", "audit:proof-acceptance-packet"],
  ["audit:proof-submission-packet", "audit:proof-acceptance-packet"],
  ["audit:proof-acceptance-packet", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

for (const text of [
  "proof acceptance packet",
  "accept / revise / reject",
  "case creation gate",
  "does not accept an artifact",
  "does not create external proof",
  "does not run a transformation",
  "does not publish",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/PROOF-ACCEPTANCE-PACKET.md missing text: ${text}`);
  }
}

for (const section of [
  "# Mimesis Proof Acceptance Packet",
  "Status: acceptance gate packet, not accepted artifact.",
  "## Gate Inputs",
  "## Acceptance States",
  "## Acceptance Checklist",
  "## Operator Command Path",
  "## Stop Conditions",
  "## Allowed Claim",
  "## Disallowed Claim",
  "## Boundary",
]) {
  if (!packet.includes(section)) {
    failures.push(`proof acceptance packet missing section: ${section}`);
  }
}

for (const text of [
  ".mimesis/proof-intake/submission-packet.md",
  ".mimesis/proof-intake/redaction-packet.md",
  ".mimesis/proof-candidates/first-candidate.md",
  "accept",
  "revise",
  "reject",
  "case:review",
  "case:from-intake",
  "case:check",
  "does not accept an artifact",
  "does not create external proof",
  "does not run a transformation",
  "does not publish",
]) {
  if (!packet.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`proof acceptance packet missing text: ${text}`);
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
  if (!content.toLowerCase().includes("proof acceptance packet")) {
    failures.push(`${name} missing proof acceptance packet text`);
  }
}

for (const command of ["proof:acceptance-packet", "audit:proof-acceptance-packet"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/PROOF-ACCEPTANCE-PACKET.md",
  ".mimesis/proof-intake/acceptance-packet.md",
  "tools/create-proof-acceptance-packet.mjs",
  "tools/audit-proof-acceptance-packet.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis proof acceptance packet audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis proof acceptance packet audit passed: case acceptance gate is explicit without claiming proof.");

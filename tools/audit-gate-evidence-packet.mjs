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

function commandIndex(commands, command) {
  return commands.indexOf(command);
}

function requireBefore(commands, earlier, later) {
  const earlierIndex = commandIndex(commands, earlier);
  const laterIndex = commandIndex(commands, later);

  if (earlierIndex < 0 || laterIndex < 0) {
    return;
  }

  if (earlierIndex >= laterIndex) {
    failures.push(`release:check must run npm run ${earlier} before npm run ${later}`);
  }
}

const requiredGapIds = [
  "strict_publish_sync",
  "owner_license_decision",
  "permissioned_external_artifact",
  "completed_external_case",
  "package_publication",
  "action_publication",
  "shipped_plugin",
  "benchmark_study",
  "external_adoption",
];

const packageJson = readJson("package.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/GATE-EVIDENCE-PACKET.md");
const packet = read(".mimesis/gates/evidence-packet.md");
const readme = read("README.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const toolsReadme = read("tools/README.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");
const releaseCheck = packageJson.scripts?.["release:check"] ?? "";
const releaseCommands = releaseCheck
  .split("&&")
  .map((part) => part.trim())
  .map((part) => part.replace(/^npm\s+run\s+/, "").trim())
  .filter(Boolean);

if (!packageJson.scripts?.["gate:evidence-packet"]) {
  failures.push("package.json missing script: gate:evidence-packet");
}

if (!packageJson.scripts?.["audit:gate-evidence-packet"]) {
  failures.push("package.json missing script: audit:gate-evidence-packet");
}

if (!releaseCheck.includes("gate:evidence-packet")) {
  failures.push("release:check must generate npm run gate:evidence-packet");
}

if (!releaseCheck.includes("audit:gate-evidence-packet")) {
  failures.push("release:check must include npm run audit:gate-evidence-packet");
}

for (const [earlier, later] of [
  ["gap:closure-plan", "gate:evidence-packet"],
  ["gate:evidence-packet", "release:artifact-manifest"],
  ["gate:evidence-packet", "audit:gate-evidence-packet"],
  ["audit:gap-closure-plan", "audit:gate-evidence-packet"],
  ["audit:gate-evidence-packet", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

if (!cli.includes('"gate:evidence-packet"') || !cli.includes('"audit:gate-evidence-packet"')) {
  failures.push("CLI missing gate:evidence-packet or audit:gate-evidence-packet command");
}

for (const text of [
  "gate evidence packet",
  "evidence intake packet",
  "No proof, no claim",
  "does not close gates",
  "does not create evidence",
  "does not prove completion",
  "does not publish",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/GATE-EVIDENCE-PACKET.md missing text: ${text}`);
  }
}

for (const section of [
  "# Mimesis Gate Evidence Packet",
  "Status: evidence intake packet, not evidence.",
  "## Evidence Intake Matrix",
  "## Evidence Packet Template Bridge",
  "## Command Path",
  "## Allowed Claim",
  "## Disallowed Claim",
  "## Boundary",
]) {
  if (!packet.includes(section)) {
    failures.push(`gate evidence packet missing section: ${section}`);
  }
}

for (const text of [
  "No proof, no claim",
  "templates/evidence-packet.md",
  "npm run cli -- evidence:check",
  "npm run cli -- evidence:review",
  "does not close gates",
  "does not create evidence",
  "does not prove completion",
  "does not publish",
  "does not choose a license",
  "does not create external proof",
  "does not prove adoption",
]) {
  if (!packet.includes(text)) {
    failures.push(`gate evidence packet missing text: ${text}`);
  }
}

for (const id of requiredGapIds) {
  if (!packet.includes(id)) {
    failures.push(`gate evidence packet missing gap id: ${id}`);
  }
}

for (const text of [
  "Gate Evidence Packet",
  "GATE-EVIDENCE-PACKET.md",
  "../.mimesis/gates/evidence-packet.md",
  "../tools/create-gate-evidence-packet.mjs",
  "../tools/audit-gate-evidence-packet.mjs",
]) {
  if (!completion.includes(text)) {
    failures.push(`docs/COMPLETION-AUDIT.md missing gate evidence packet evidence: ${text}`);
  }
}

for (const [name, content] of [
  ["README.md", readme],
  ["tools/README.md", toolsReadme],
  ["STATUS.md", status],
  ["ROADMAP.md", roadmap],
]) {
  if (!content.toLowerCase().includes("gate evidence packet")) {
    failures.push(`${name} missing gate evidence packet text`);
  }
}

for (const command of ["gate:evidence-packet", "audit:gate-evidence-packet"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/GATE-EVIDENCE-PACKET.md",
  ".mimesis/gates/evidence-packet.md",
  "tools/create-gate-evidence-packet.mjs",
  "tools/audit-gate-evidence-packet.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis gate evidence packet audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis gate evidence packet audit passed: open gates have an evidence intake packet without claiming evidence.");

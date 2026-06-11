#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const packetRelativePath = ".mimesis/release-evidence/publication-evidence-packet.md";

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

const packageJson = readJson("package.json");
const releaseCheck = packageJson.scripts?.["release:check"] ?? "";
const releaseCommands = releaseCheck
  .split("&&")
  .map((part) => part.trim())
  .map((part) => part.replace(/^npm\s+run\s+/, "").trim())
  .filter(Boolean);
const cli = read("bin/mimesis.mjs");
const doc = read("docs/PUBLICATION-EVIDENCE-PACKET.md");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");
const validator = read("tools/validate-mimesis.mjs");

if (packageJson.scripts?.["publication:evidence-packet"] !== "node tools/create-publication-evidence-packet.mjs") {
  failures.push("package.json missing script: publication:evidence-packet");
}

if (packageJson.scripts?.["audit:publication-evidence-packet"] !== "node tools/audit-publication-evidence-packet.mjs") {
  failures.push("package.json missing script: audit:publication-evidence-packet");
}

if (!releaseCheck.includes("publication:evidence-packet")) {
  failures.push("release:check must generate npm run publication:evidence-packet");
}

if (!releaseCheck.includes("audit:publication-evidence-packet")) {
  failures.push("release:check must include npm run audit:publication-evidence-packet");
}

for (const [earlier, later] of [
  ["release:evidence-report", "publication:evidence-packet"],
  ["publication:evidence-packet", "owner:queue"],
  ["publication:evidence-packet", "release:artifact-manifest"],
  ["publication:evidence-packet", "audit:publication-evidence-packet"],
  ["audit:release-evidence-report", "audit:publication-evidence-packet"],
  ["audit:publication-evidence-packet", "audit:owner-queue"],
  ["audit:publication-evidence-packet", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

if (!cli.includes('"publication:evidence-packet"') || !cli.includes('"audit:publication-evidence-packet"')) {
  failures.push("CLI missing publication:evidence-packet or audit:publication-evidence-packet command");
}

for (const text of [
  "publication evidence packet",
  "not publication proof",
  "direct publication evidence",
  "npm publication evidence",
  "GitHub Marketplace action evidence",
  "plugin release or installation evidence",
  "does not publish",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/PUBLICATION-EVIDENCE-PACKET.md missing text: ${text}`);
  }
}

const packet = read(packetRelativePath);
for (const section of [
  "# Mimesis Publication Evidence Packet",
  "## Current Publication Gates",
  "## Required Direct Evidence",
  "## Submission Paths",
  "## Review Path",
  "## Allowed Claim",
  "## Disallowed Claim",
  "## Boundary",
]) {
  if (!packet.includes(section)) {
    failures.push(`${packetRelativePath} missing section: ${section}`);
  }
}

for (const text of [
  "publication evidence packet, not publication proof",
  "templates/evidence-packet.md",
  "evidence:check --require-reviewed",
  "owner-controlled npm publish evidence",
  "tag or Marketplace release evidence",
  "installation or release evidence packet",
  "does not publish",
  "does not stage",
  "does not commit",
  "does not push",
  "does not create tag",
  "does not publish to npm",
  "does not publish a GitHub Marketplace action",
  "does not ship a plugin",
  "does not close gates",
]) {
  if (!packet.includes(text)) {
    failures.push(`${packetRelativePath} missing boundary text: ${text}`);
  }
}

for (const text of [
  "publication:evidence-packet",
  "audit:publication-evidence-packet",
  "PUBLICATION-EVIDENCE-PACKET.md",
  packetRelativePath,
]) {
  for (const [name, content] of [
    ["README.md", readme],
    ["tools/README.md", toolsReadme],
    ["STATUS.md", status],
    ["ROADMAP.md", roadmap],
    ["docs/V0.1-RELEASE-PACKET.md", releasePacket],
    ["docs/COMPLETION-AUDIT.md", completion],
  ]) {
    if (!content.includes(text)) {
      failures.push(`${name} missing publication evidence packet text: ${text}`);
    }
  }
}

for (const command of ["publication:evidence-packet", "audit:publication-evidence-packet"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === packetRelativePath)) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing publication evidence packet");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/PUBLICATION-EVIDENCE-PACKET.md",
  packetRelativePath,
  "tools/create-publication-evidence-packet.mjs",
  "tools/audit-publication-evidence-packet.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing ${artifactPath}`);
  }
  if (!validator.includes(artifactPath)) {
    failures.push(`validator required files missing ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis publication evidence packet audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis publication evidence packet audit passed: publication gates have a bounded evidence intake packet without publication claims.");

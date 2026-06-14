#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const packetRelativePath = ".mimesis/adoption-packets/v0.2-first-adoption.md";

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
const doc = read("docs/ADOPTION-PACKET.md");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");
const validator = read("tools/validate-mimesis.mjs");

if (packageJson.scripts?.["adoption:packet"] !== "node tools/create-adoption-packet.mjs") {
  failures.push("package.json missing script: adoption:packet");
}

if (packageJson.scripts?.["audit:adoption-packet"] !== "node tools/audit-adoption-packet.mjs") {
  failures.push("package.json missing script: audit:adoption-packet");
}

if (!releaseCheck.includes("adoption:packet")) {
  failures.push("release:check must generate npm run adoption:packet");
}

if (!releaseCheck.includes("audit:adoption-packet")) {
  failures.push("release:check must include npm run audit:adoption-packet");
}

for (const [earlier, later] of [
  ["benchmark:packet", "adoption:packet"],
  ["adoption:packet", "release:execution-packet"],
  ["adoption:packet", "owner:queue"],
  ["adoption:packet", "release:artifact-manifest"],
  ["adoption:packet", "audit:adoption-packet"],
  ["audit:benchmark-packet", "audit:adoption-packet"],
  ["audit:adoption-packet", "audit:release-execution"],
  ["audit:adoption-packet", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

if (!cli.includes('"adoption:packet"') || !cli.includes('"audit:adoption-packet"')) {
  failures.push("CLI missing adoption:packet or audit:adoption-packet command");
}

for (const text of [
  "adoption packet",
  "external adoption evidence",
  "not adoption proof",
  "does not prove external adoption",
  "does not create evidence",
  "reviewed evidence packet",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/ADOPTION-PACKET.md missing text: ${text}`);
  }
}

const packet = read(packetRelativePath);
for (const section of [
  "# Mimesis Adoption Packet",
  "## Current Gap",
  "## Adoption Event Types",
  "## Required Evidence",
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
  "external adoption, not a claim by itself",
  "templates/evidence-packet.md",
  "evidence:check --require-reviewed",
  "does not prove external adoption",
  "does not create evidence",
  "does not publish",
  "does not close gates",
]) {
  if (!packet.includes(text)) {
    failures.push(`${packetRelativePath} missing boundary text: ${text}`);
  }
}

for (const text of [
  "adoption:packet",
  "audit:adoption-packet",
  "ADOPTION-PACKET.md",
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
      failures.push(`${name} missing adoption packet text: ${text}`);
    }
  }
}

for (const command of ["adoption:packet", "audit:adoption-packet"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === packetRelativePath)) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing adoption packet");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/ADOPTION-PACKET.md",
  packetRelativePath,
  "tools/create-adoption-packet.mjs",
  "tools/audit-adoption-packet.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing ${artifactPath}`);
  }
  if (!validator.includes(artifactPath)) {
    failures.push(`validator required files missing ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis adoption packet audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis adoption packet audit passed: external adoption evidence has a bounded intake packet without adoption claims.");

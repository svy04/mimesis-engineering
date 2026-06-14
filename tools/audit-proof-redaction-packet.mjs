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
const cli = read("bin/mimesis.mjs");
const doc = read("docs/PROOF-REDACTION-PACKET.md");
const packet = read(".mimesis/proof-intake/redaction-packet.md");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");
const commands = releaseCommands(packageJson);

for (const scriptName of ["proof:redaction-packet", "audit:proof-redaction-packet"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!cli.includes('"proof:redaction-packet"') || !cli.includes('"audit:proof-redaction-packet"')) {
  failures.push("CLI missing proof:redaction-packet or audit:proof-redaction-packet command");
}

for (const command of ["proof:redaction-packet", "audit:proof-redaction-packet"]) {
  if (!commands.includes(command)) {
    failures.push(`release:check missing npm run ${command}`);
  }
}

for (const [earlier, later] of [
  ["proof:intake", "proof:redaction-packet"],
  ["proof:intake-record", "proof:redaction-packet"],
  ["audit:secrets", "audit:proof-redaction-packet"],
  ["proof:redaction-packet", "release:artifact-manifest"],
  ["proof:redaction-packet", "audit:proof-redaction-packet"],
  ["audit:proof-redaction-packet", "audit:release-artifact-manifest"],
]) {
  requireBefore(commands, earlier, later);
}

for (const text of [
  "proof redaction packet",
  "redaction checklist",
  "permissioned external weak artifact",
  "does not redact files",
  "does not create external proof",
  "does not guarantee complete private-data removal",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/PROOF-REDACTION-PACKET.md missing text: ${text}`);
  }
}

for (const section of [
  "# Mimesis Proof Redaction Packet",
  "Status: redaction checklist packet, not proof.",
  "## Intake Source",
  "## Redaction Checklist",
  "## Operator Review",
  "## Stop Conditions",
  "## Allowed Claim",
  "## Disallowed Claim",
  "## Boundary",
]) {
  if (!packet.includes(section)) {
    failures.push(`proof redaction packet missing section: ${section}`);
  }
}

for (const text of [
  "No permissioned external weak artifact has been submitted yet",
  "secrets",
  "tokens",
  "passwords",
  "private customer data",
  "copied protected material",
  "publication preference",
  "redaction requirements",
  "case:review",
  "audit:secrets",
  "does not redact files",
  "does not create external proof",
  "does not grant permission",
  "does not guarantee complete private-data removal",
]) {
  if (!packet.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`proof redaction packet missing text: ${text}`);
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
  if (!content.toLowerCase().includes("proof redaction packet")) {
    failures.push(`${name} missing proof redaction packet text`);
  }
}

for (const command of ["proof:redaction-packet", "audit:proof-redaction-packet"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/PROOF-REDACTION-PACKET.md",
  ".mimesis/proof-intake/redaction-packet.md",
  "tools/create-proof-redaction-packet.mjs",
  "tools/audit-proof-redaction-packet.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis proof redaction packet audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis proof redaction packet audit passed: redaction intake is explicit without claiming proof.");

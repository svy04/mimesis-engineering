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

const packageJson = readJson("package.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/FIRST-PROOF-CANDIDATE-PACKET.md");
const packet = read(".mimesis/proof-candidates/first-candidate.md");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const completion = read("docs/COMPLETION-AUDIT.md");
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

if (!packageJson.scripts?.["proof:candidate-packet"]) {
  failures.push("package.json missing script: proof:candidate-packet");
}

if (!packageJson.scripts?.["audit:proof-candidate-packet"]) {
  failures.push("package.json missing script: audit:proof-candidate-packet");
}

if (!releaseCheck.includes("proof:candidate-packet")) {
  failures.push("release:check must generate npm run proof:candidate-packet");
}

if (!releaseCheck.includes("audit:proof-candidate-packet")) {
  failures.push("release:check must include npm run audit:proof-candidate-packet");
}

for (const [earlier, later] of [
  ["proof:readiness", "proof:candidate-packet"],
  ["gate:evidence-packet", "proof:candidate-packet"],
  ["proof:candidate-packet", "release:artifact-manifest"],
  ["proof:candidate-packet", "audit:proof-candidate-packet"],
  ["audit:gate-evidence-packet", "audit:proof-candidate-packet"],
  ["audit:proof-candidate-packet", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

if (!cli.includes('"proof:candidate-packet"') || !cli.includes('"audit:proof-candidate-packet"')) {
  failures.push("CLI missing proof:candidate-packet or audit:proof-candidate-packet command");
}

for (const text of [
  "first proof candidate packet",
  "candidate selection packet",
  "Bring one weak artifact",
  "No permissioned external weak artifact has been submitted yet",
  "does not create external proof",
  "does not select a candidate",
  "does not prove completion",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/FIRST-PROOF-CANDIDATE-PACKET.md missing text: ${text}`);
  }
}

for (const section of [
  "# Mimesis First Proof Candidate Packet",
  "Status: candidate selection packet, not external proof.",
  "## Current Candidate State",
  "## Candidate Selection Rubric",
  "## Candidate Intake Card",
  "## Non-Bypassing Command Path",
  "## Allowed Claim",
  "## Disallowed Claim",
  "## Boundary",
]) {
  if (!packet.includes(section)) {
    failures.push(`first proof candidate packet missing section: ${section}`);
  }
}

for (const text of [
  "No permissioned external weak artifact has been submitted yet",
  "Bring one weak artifact",
  "reference-packs/github-readme.md",
  "reference-packs/landing-page.md",
  "reference-packs/product-page.md",
  "reference-packs/ai-workflow.md",
  "npm run cli -- case:review",
  "npm run cli -- case:from-intake",
  "npm run cli -- case:check",
  "npm run cli -- evidence:review",
  "npm run release:check:public",
  "does not create external proof",
  "does not select a candidate",
  "does not publish",
  "does not prove external adoption",
]) {
  if (!packet.includes(text)) {
    failures.push(`first proof candidate packet missing text: ${text}`);
  }
}

for (const text of [
  "First Proof Candidate Packet",
  "FIRST-PROOF-CANDIDATE-PACKET.md",
  "../.mimesis/proof-candidates/first-candidate.md",
  "../tools/create-proof-candidate-packet.mjs",
  "../tools/audit-proof-candidate-packet.mjs",
]) {
  if (!completion.includes(text)) {
    failures.push(`docs/COMPLETION-AUDIT.md missing first proof candidate packet evidence: ${text}`);
  }
}

for (const [name, content] of [
  ["README.md", readme],
  ["tools/README.md", toolsReadme],
  ["STATUS.md", status],
  ["ROADMAP.md", roadmap],
]) {
  if (!content.toLowerCase().includes("first proof candidate packet")) {
    failures.push(`${name} missing first proof candidate packet text`);
  }
}

for (const command of ["proof:candidate-packet", "audit:proof-candidate-packet"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/FIRST-PROOF-CANDIDATE-PACKET.md",
  ".mimesis/proof-candidates/first-candidate.md",
  "tools/create-proof-candidate-packet.mjs",
  "tools/audit-proof-candidate-packet.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis first proof candidate packet audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis first proof candidate packet audit passed: candidate selection is explicit without claiming proof.");

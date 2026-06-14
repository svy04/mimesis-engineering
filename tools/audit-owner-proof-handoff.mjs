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
const doc = read("docs/OWNER-PROOF-HANDOFF.md");
const handoff = read(".mimesis/owner-actions/proof-run-handoff.md");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const releaseOrderDoc = read("docs/RELEASE-CHECK-ORDER.md");
const validator = read("tools/validate-mimesis.mjs");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");
const releaseCommands = commandList(packageJson);

for (const scriptName of ["owner:proof-handoff", "audit:owner-proof-handoff"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const command of ["owner:proof-handoff", "audit:owner-proof-handoff"]) {
  if (!cli.includes(`"${command}"`)) {
    failures.push(`CLI missing ${command}`);
  }
  if (!releaseCommands.includes(command)) {
    failures.push(`release:check missing npm run ${command}`);
  }
}

for (const [earlier, later] of [
  ["owner:queue", "owner:proof-handoff"],
  ["owner:decision-intake", "owner:proof-handoff"],
  ["owner:evidence-attachment-form", "owner:proof-handoff"],
  ["proof:run-packet", "owner:proof-handoff"],
  ["proof:execution-report", "owner:proof-handoff"],
  ["owner:proof-handoff", "owner:evidence-submission-record"],
  ["owner:proof-handoff", "release:artifact-manifest"],
  ["audit:owner-queue", "audit:owner-proof-handoff"],
  ["audit:owner-decision-intake", "audit:owner-proof-handoff"],
  ["audit:owner-evidence-attachment-form", "audit:owner-proof-handoff"],
  ["audit:proof-run", "audit:owner-proof-handoff"],
  ["audit:proof-execution-report", "audit:owner-proof-handoff"],
  ["audit:owner-proof-handoff", "audit:owner-evidence-submission-record"],
  ["audit:owner-proof-handoff", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

for (const text of [
  "owner proof handoff",
  "license_or_no_reuse",
  "weak_artifact_permission",
  "Bring one weak artifact",
  "proof execution record",
  "does not choose a license",
  "does not grant permission",
  "does not create external proof",
  "does not approve proof",
  "does not publish",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/OWNER-PROOF-HANDOFF.md missing text: ${text}`);
  }
}

for (const section of [
  "# Mimesis Owner Proof Handoff",
  "Status: owner proof handoff packet, not owner decision or proof.",
  "## Source Packets",
  "## Minimum Owner Inputs",
  "## Owner Fill Targets",
  "## Fastest Safe Command Path",
  "## Candidate Review Outputs",
  "## Stop Conditions",
  "## Allowed Claim",
  "## Disallowed Claim",
  "## Boundary",
]) {
  if (!handoff.includes(section)) {
    failures.push(`owner proof handoff missing section: ${section}`);
  }
}

for (const text of [
  ".mimesis/owner-actions/current-action-queue.md",
  ".mimesis/owner-actions/decision-intake.md",
  ".mimesis/owner-actions/evidence-attachment-form.md",
  ".mimesis/proof-runs/v0.2-first-run.md",
  ".mimesis/proof-runs/execution-report.md",
  "license_or_no_reuse",
  "weak_artifact_permission",
  "owner decision answer record",
  "owner evidence submission record",
  "proof execution record",
  "npm run cli -- owner:evidence-submission-check path/to/owner-evidence-submission-record.json --require-field weak_artifact_permission",
  "npm run cli -- proof:intake-from-owner-evidence path/to/owner-evidence-submission-record.json --output path/to/proof-intake-record.json",
  "npm run cli -- proof:execution-report --execution-record path/to/proof-execution-record.json --output path/to/proof-execution-candidate.md",
  "proofApproved: false",
  "completionAllowed: false",
  "does not choose a license",
  "does not grant permission",
  "does not create external proof",
  "does not approve proof",
  "does not publish",
]) {
  if (!handoff.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`owner proof handoff missing text: ${text}`);
  }
}

for (const [name, content] of [
  ["README.md", readme],
  ["tools/README.md", toolsReadme],
  ["docs/COMPLETION-AUDIT.md", completion],
  ["STATUS.md", status],
  ["ROADMAP.md", roadmap],
  ["docs/V0.1-RELEASE-PACKET.md", releasePacket],
  ["docs/RELEASE-CHECK-ORDER.md", releaseOrderDoc],
]) {
  if (!content.toLowerCase().includes("owner proof handoff")) {
    failures.push(`${name} missing owner proof handoff text`);
  }
}

for (const relativePath of [
  "docs/OWNER-PROOF-HANDOFF.md",
  ".mimesis/owner-actions/proof-run-handoff.md",
  "tools/create-owner-proof-handoff.mjs",
  "tools/audit-owner-proof-handoff.mjs",
]) {
  if (!validator.includes(relativePath)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${relativePath}`);
  }
}

for (const command of ["owner:proof-handoff", "audit:owner-proof-handoff"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/owner-actions/proof-run-handoff.md")) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing owner proof handoff");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/OWNER-PROOF-HANDOFF.md",
  ".mimesis/owner-actions/proof-run-handoff.md",
  "tools/create-owner-proof-handoff.mjs",
  "tools/audit-owner-proof-handoff.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis owner proof handoff audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner proof handoff audit passed: the minimum owner proof inputs are explicit without claiming decision or proof.");

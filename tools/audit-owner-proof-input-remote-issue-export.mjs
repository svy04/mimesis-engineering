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

function requireIncludes(label, content, needles) {
  for (const needle of needles) {
    if (!content.includes(needle)) {
      failures.push(`${label}: missing ${needle}`);
    }
  }
}

const packageJson = readJson("package.json");
const commands = releaseCommands(packageJson);
const cli = read("bin/mimesis.mjs");
const gitignore = read(".gitignore");
const doc = read("docs/OWNER-PROOF-INPUT-REMOTE-ISSUE-EXPORT.md");
const generator = read("tools/export-owner-proof-input-remote-issue.mjs");
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

for (const scriptName of [
  "owner:proof-input-remote-issue-export",
  "audit:owner-proof-input-remote-issue-export",
]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
  if (!cli.includes(`"${scriptName}"`)) {
    failures.push(`CLI missing ${scriptName}`);
  }
}

if (commands.includes("owner:proof-input-remote-issue-export")) {
  failures.push("release:check must not run the live raw-body export command");
}

if (!commands.includes("audit:owner-proof-input-remote-issue-export")) {
  failures.push("release:check missing npm run audit:owner-proof-input-remote-issue-export");
}

for (const [earlier, later] of [
  ["audit:owner-proof-input-remote-issue-snapshot", "audit:owner-proof-input-remote-issue-export"],
  ["audit:owner-proof-input-remote-issue-export", "audit:owner-proof-input-issue-convert"],
  ["audit:owner-proof-input-remote-issue-export", "audit:release-artifact-manifest"],
]) {
  requireBefore(commands, earlier, later);
}

requireIncludes(".gitignore", gitignore, [
  ".mimesis/private/",
]);

requireIncludes("generator", generator, [
  "gh",
  "issue",
  "view",
  "body",
  "bodySha256",
  "readyForLocalConversion",
  "candidate_owner_input",
  "request_only_pending_owner",
  "secretLikePatternDetected",
  "refuses_to_export_request_only_issue",
  "privateIgnoredPath",
  "does_not_commit_issue_body",
]);

requireIncludes("doc", doc, [
  "Owner Proof Input Remote Issue Export",
  "owner:proof-input-remote-issue-export",
  "audit:owner-proof-input-remote-issue-export",
  ".mimesis/private/",
  "gitignored",
  "refuses request-only issue bodies",
  "does not commit issue body",
  "does not choose a license",
  "does not grant permission",
  "does not create external proof",
  "does not close gates",
]);

for (const relativePath of [
  ".gitignore",
  "docs/OWNER-PROOF-INPUT-REMOTE-ISSUE-EXPORT.md",
  "tools/export-owner-proof-input-remote-issue.mjs",
  "tools/audit-owner-proof-input-remote-issue-export.mjs",
]) {
  if (!validator.includes(relativePath)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${relativePath}`);
  }
}

for (const command of [
  "owner:proof-input-remote-issue-export",
  "audit:owner-proof-input-remote-issue-export",
]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  ".gitignore",
  "docs/OWNER-PROOF-INPUT-REMOTE-ISSUE-EXPORT.md",
  "tools/export-owner-proof-input-remote-issue.mjs",
  "tools/audit-owner-proof-input-remote-issue-export.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

for (const [label, content] of [
  ["README.md", readme],
  ["tools/README.md", toolsReadme],
  ["docs/COMPLETION-AUDIT.md", completion],
  ["STATUS.md", status],
  ["ROADMAP.md", roadmap],
  ["docs/V0.1-RELEASE-PACKET.md", releasePacket],
  ["docs/RELEASE-CHECK-ORDER.md", releaseOrderDoc],
]) {
  if (!content.toLowerCase().includes("owner proof input remote issue export")) {
    failures.push(`${label}: missing owner proof input remote issue export text`);
  }
}

if (failures.length) {
  console.error("\nMimesis owner proof input remote issue export audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner proof input remote issue export audit passed: raw issue body export is private, ignored, and gated.");

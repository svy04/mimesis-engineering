#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
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

function runTool(args, options = {}) {
  return spawnSync(process.execPath, [path.join(root, "tools", "check-proof-intake-record.mjs"), ...args], {
    cwd: options.cwd ?? root,
    encoding: "utf8",
  });
}

const packageJson = readJson("package.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/PROOF-INTAKE-CHECK.md");
const toolsReadme = read("tools/README.md");
const completionAudit = read("docs/COMPLETION-AUDIT.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const readme = read("README.md");
const validator = read("tools/validate-mimesis.mjs");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");
const report = read(".mimesis/proof-intake/fixture-check.md");
const releaseCommands = commandList(packageJson);

for (const scriptName of ["proof:intake-check", "audit:proof-intake-check"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const command of ["proof:intake-check", "audit:proof-intake-check"]) {
  if (!cli.includes(`"${command}"`)) {
    failures.push(`CLI missing ${command} command`);
  }
  if (!releaseCommands.includes(command)) {
    failures.push(`release:check missing npm run ${command}`);
  }
}

for (const [earlier, later] of [
  ["proof:intake-record", "proof:intake-check"],
  ["proof:intake-check", "proof:redaction-packet"],
  ["audit:proof-intake-record", "audit:proof-intake-check"],
  ["audit:proof-intake-check", "audit:proof-redaction-packet"],
  ["proof:intake-check", "release:artifact-manifest"],
  ["audit:proof-intake-check", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

for (const [name, content] of [
  ["docs/PROOF-INTAKE-CHECK.md", doc],
  ["tools/README.md", toolsReadme],
  ["docs/COMPLETION-AUDIT.md", completionAudit],
  ["STATUS.md", status],
  ["ROADMAP.md", roadmap],
  ["README.md", readme],
]) {
  for (const text of ["proof intake check", "does not create external proof", "does not grant permission"]) {
    if (!content.toLowerCase().includes(text.toLowerCase())) {
      failures.push(`${name} missing text: ${text}`);
    }
  }
}

for (const section of [
  "# Mimesis Proof Intake Check",
  "Status: reviewed local fixture record, not external proof.",
  "## Source Record",
  "## Schema Validation",
  "## Safety Checks",
  "## Publication Gate",
  "## Case Creation Gate",
  "## Allowed Claim",
  "## Disallowed Claim",
  "## Boundary",
]) {
  if (!report.includes(section)) {
    failures.push(`proof intake check report missing section: ${section}`);
  }
}

for (const text of [
  ".mimesis/proof-intake/fixture-record.json",
  "schemaVersion: 0.1.0",
  "status: reviewed",
  "publication preference: public",
  "no secrets: true",
  "no private customer data: true",
  "no copied protected material: true",
  "not a real submitter artifact",
  "does not create external proof",
  "does not grant permission",
  "does not prove adoption",
]) {
  if (!report.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`proof intake check report missing text: ${text}`);
  }
}

for (const text of [
  "docs/PROOF-INTAKE-CHECK.md",
  ".mimesis/proof-intake/fixture-check.md",
  "tools/check-proof-intake-record.mjs",
  "tools/audit-proof-intake-check.mjs",
]) {
  if (!validator.includes(text)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${text}`);
  }
}

for (const command of ["proof:intake-check", "audit:proof-intake-check"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/proof-intake/fixture-check.md")) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing proof intake check report");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/PROOF-INTAKE-CHECK.md",
  ".mimesis/proof-intake/fixture-check.md",
  "tools/check-proof-intake-record.mjs",
  "tools/audit-proof-intake-check.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (!failures.length) {
  const ok = runTool([
    ".mimesis/proof-intake/fixture-record.json",
    "--require-case-ready",
    "--write-report",
    path.join(os.tmpdir(), `mimesis-proof-intake-check-${process.pid}.md`),
  ]);
  if (ok.status !== 0) {
    failures.push(`proof intake check fixture command failed:\n${ok.stdout}\n${ok.stderr}`.trim());
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-bad-proof-intake-"));
  const badRecord = path.join(tmpDir, "bad-record.json");
  fs.writeFileSync(
    badRecord,
    `${JSON.stringify(
      {
        schemaVersion: "0.1.0",
        status: "draft",
        submitter: "unsafe fixture",
        startingArtifact: "password: abcdefghijk",
        artifactOwner: "unknown",
        permissionStatus: "unclear",
        publicationPreference: "private only",
        redactionRequirements: "none yet",
        referencesStudied: [],
        desiredTransformation: "",
        proofBoundary: [],
        safetyConfirmation: {
          noSecrets: false,
          noPrivateCustomerData: false,
          noCopiedProtectedMaterial: false,
        },
        prohibitedClaims: [],
      },
      null,
      2,
    )}\n`,
  );

  const bad = runTool([badRecord, "--require-case-ready"], { cwd: tmpDir });
  if (bad.status === 0) {
    failures.push("proof intake check must reject unsafe draft/private-only records");
  }
  if (!`${bad.stdout}\n${bad.stderr}`.toLowerCase().includes("not ready")) {
    failures.push("proof intake check rejection output must say not ready");
  }
}

if (failures.length) {
  console.error("\nMimesis proof intake check audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis proof intake check audit passed: schema-shaped proof intake records are checkable before case creation.");

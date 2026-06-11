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

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function runNode(args, cwd = root) {
  return spawnSync(process.execPath, args, {
    cwd,
    encoding: "utf8",
  });
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
const doc = read("docs/OWNER-PROOF-INPUT-SPLIT.md");
const splitReport = read(".mimesis/owner-actions/proof-input-split-report.md");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const releaseOrderDoc = read("docs/RELEASE-CHECK-ORDER.md");
const statusRoadmapDoc = read("docs/STATUS-ROADMAP-SYNC.md");
const validator = read("tools/validate-mimesis.mjs");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");
const proofInputTemplate = readJson(".mimesis/owner-actions/proof-input-template.json");
const commands = releaseCommands(packageJson);

for (const scriptName of [
  "owner:proof-input-split",
  "audit:owner-proof-input-split",
]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
  if (!cli.includes(`"${scriptName}"`)) {
    failures.push(`CLI missing ${scriptName}`);
  }
  if (!commands.includes(scriptName)) {
    failures.push(`release:check missing npm run ${scriptName}`);
  }
}

for (const [earlier, later] of [
  ["owner:proof-input-check", "owner:proof-input-split"],
  ["owner:proof-input-split", "owner:evidence-submission-record"],
  ["owner:proof-input-split", "release:artifact-manifest"],
  ["audit:owner-proof-input", "audit:owner-proof-input-split"],
  ["audit:owner-proof-input-split", "audit:owner-evidence-submission-record"],
  ["audit:owner-proof-input-split", "audit:release-artifact-manifest"],
]) {
  requireBefore(commands, earlier, later);
}

for (const text of [
  "Status: not ready owner proof input split",
  "license_or_no_reuse",
  "weak_artifact_permission",
  "does not choose a license",
  "does not submit an artifact",
  "does not grant permission",
  "does not create external proof",
  "does not close gates",
]) {
  if (!splitReport.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`default split report missing text: ${text}`);
  }
}

for (const [name, content] of [
  ["docs/OWNER-PROOF-INPUT-SPLIT.md", doc],
  ["README.md", readme],
  ["tools/README.md", toolsReadme],
  ["docs/COMPLETION-AUDIT.md", completion],
  ["STATUS.md", status],
  ["ROADMAP.md", roadmap],
  ["docs/V0.1-RELEASE-PACKET.md", releasePacket],
  ["docs/RELEASE-CHECK-ORDER.md", releaseOrderDoc],
  ["docs/STATUS-ROADMAP-SYNC.md", statusRoadmapDoc],
]) {
  if (!content.toLowerCase().includes("owner proof input split")) {
    failures.push(`${name} missing owner proof input split text`);
  }
}

for (const relativePath of [
  "docs/OWNER-PROOF-INPUT-SPLIT.md",
  ".mimesis/owner-actions/proof-input-split-report.md",
  "tools/split-owner-proof-input-record.mjs",
  "tools/audit-owner-proof-input-split.mjs",
]) {
  if (!validator.includes(relativePath)) {
    failures.push(`tools/validate-mimesis.mjs missing required path: ${relativePath}`);
  }
}

for (const command of [
  "owner:proof-input-split",
  "audit:owner-proof-input-split",
]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`framework manifest commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/owner-actions/proof-input-split-report.md")) {
  failures.push("framework manifest entrypoints missing owner proof input split report");
}

const artifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/OWNER-PROOF-INPUT-SPLIT.md",
  ".mimesis/owner-actions/proof-input-split-report.md",
  "tools/split-owner-proof-input-record.mjs",
  "tools/audit-owner-proof-input-split.mjs",
]) {
  if (!artifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-proof-input-split-"));

try {
  const readyInput = structuredClone(proofInputTemplate);
  readyInput.status = "reviewed";
  readyInput.minimumInputs.license_or_no_reuse = {
    ...readyInput.minimumInputs.license_or_no_reuse,
    inputStatus: "submitted",
    ownerInput: "Owner chooses to keep the no-reuse boundary for v0.1 until a later explicit license decision.",
  };
  readyInput.minimumInputs.weak_artifact_permission = {
    ...readyInput.minimumInputs.weak_artifact_permission,
    inputStatus: "submitted",
    ownerInput: [
      "# Weak Artifact",
      "",
      "This is an owner-submitted weak README excerpt for a local Mimesis case.",
      "It contains no secrets, no private customer data, and no copied protected material.",
      "The owner permits redacted framework review only.",
    ].join("\n"),
  };

  const readyPath = path.join(tempRoot, "reviewed-owner-proof-input.json");
  const outDir = path.join(tempRoot, "split");
  const decisionPath = path.join(outDir, "owner-decision-answer-record.json");
  const evidencePath = path.join(outDir, "owner-evidence-submission-record.json");
  writeJson(readyPath, readyInput);

  const readyCheck = runNode([
    path.join(root, "tools", "check-owner-proof-input-record.mjs"),
    readyPath,
    "--require-ready",
  ], tempRoot);
  if (readyCheck.status !== 0) {
    failures.push(`reviewed owner proof input fixture must pass ready check: ${readyCheck.stderr || readyCheck.stdout}`);
  }

  const split = runNode([
    path.join(root, "tools", "split-owner-proof-input-record.mjs"),
    readyPath,
    "--output-dir",
    outDir,
  ], tempRoot);
  if (split.status !== 0) {
    failures.push(`owner proof input split smoke failed: ${split.stderr || split.stdout}`.trim());
  }

  if (fs.existsSync(decisionPath)) {
    const decision = JSON.parse(fs.readFileSync(decisionPath, "utf8"));
    if (decision.status !== "reviewed") {
      failures.push("split owner decision answer record must be reviewed");
    }
    if (decision.fields?.license_or_no_reuse?.answerStatus !== "answered") {
      failures.push("split decision record license_or_no_reuse must be answered");
    }
    if (!decision.fields?.license_or_no_reuse?.ownerAnswer?.includes("no-reuse boundary")) {
      failures.push("split decision record must preserve owner license/no-reuse answer");
    }
    if (decision.safetyConfirmation?.noRealOwnerDecision !== false) {
      failures.push("split decision record must mark a real owner answer as present without choosing it by framework");
    }
  } else {
    failures.push("split did not write owner decision answer record");
  }

  if (fs.existsSync(evidencePath)) {
    const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
    if (evidence.status !== "reviewed") {
      failures.push("split owner evidence submission record must be reviewed");
    }
    if (evidence.fields?.weak_artifact_permission?.submissionStatus !== "submitted") {
      failures.push("split evidence record weak_artifact_permission must be submitted");
    }
    if (!evidence.fields?.weak_artifact_permission?.ownerSubmittedEvidence?.includes("owner-submitted weak README excerpt")) {
      failures.push("split evidence record must preserve weak artifact text");
    }
    if (!evidence.fields?.weak_artifact_permission?.boundary?.toLowerCase().includes("does not grant permission")) {
      failures.push("split evidence record must preserve no-permission boundary");
    }
  } else {
    failures.push("split did not write owner evidence submission record");
  }

  const decisionBridge = runNode([
    path.join(root, "tools", "license-decision-from-owner-answer.mjs"),
    decisionPath,
    "--output",
    path.join(tempRoot, "release-decision-record.json"),
    "--decision",
    "no_reuse_boundary",
    "--owner-confirmation",
    "Owner explicitly chose the no-reuse boundary for v0.1.",
    "--decision-evidence",
    "reviewed-owner-proof-input.json",
    "--confirm-owner-reviewed",
    "--confirm-not-legal-advice",
    "--confirm-no-publication",
  ], tempRoot);
  if (decisionBridge.status !== 0) {
    failures.push(`split decision output must pass license bridge: ${decisionBridge.stderr || decisionBridge.stdout}`.trim());
  }

  const fieldCheck = runNode([
    path.join(root, "tools", "check-owner-evidence-submission-record.mjs"),
    evidencePath,
    "--require-field",
    "weak_artifact_permission",
  ], tempRoot);
  if (fieldCheck.status !== 0) {
    failures.push(`split evidence output must pass weak artifact field check: ${fieldCheck.stderr || fieldCheck.stdout}`.trim());
  }

  const proofBridge = runNode([
    path.join(root, "tools", "proof-intake-from-owner-evidence.mjs"),
    evidencePath,
    "--output",
    path.join(tempRoot, "proof-intake-record.json"),
    "--submitter",
    "owner-reviewed proof input split audit",
    "--artifact-owner",
    "owner-confirmed weak artifact owner",
    "--permission-status",
    "owner permits redacted framework review only; this is not publication permission",
    "--publication-preference",
    "redacted",
    "--redaction-requirements",
    "redact identifying and private details before any public use",
    "--reference",
    "reference-packs/github-readme.md",
    "--desired-transformation",
    "Transform the submitted weak artifact while preserving Mimesis proof boundaries.",
    "--confirm-no-secrets",
    "--confirm-no-private-customer-data",
    "--confirm-no-copied-protected-material",
  ], tempRoot);
  if (proofBridge.status !== 0) {
    failures.push(`split evidence output must pass proof intake bridge: ${proofBridge.stderr || proofBridge.stdout}`.trim());
  }

  const defaultReject = runNode([
    path.join(root, "tools", "split-owner-proof-input-record.mjs"),
    path.join(root, ".mimesis", "owner-actions", "proof-input-template.json"),
    "--output-dir",
    path.join(tempRoot, "default-split"),
    "--require-ready",
  ], tempRoot);
  if (defaultReject.status === 0) {
    failures.push("split must reject default template when --require-ready is set");
  }
  if (!`${defaultReject.stderr}\n${defaultReject.stdout}`.toLowerCase().includes("not ready")) {
    failures.push("split default rejection must explain not ready status");
  }
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

if (failures.length) {
  console.error("\nMimesis owner proof input split audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis owner proof input split audit passed: reviewed owner input can route into downstream records without claiming proof.");

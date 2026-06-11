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

function runReadiness(args, options = {}) {
  return spawnSync(process.execPath, [path.join(root, "tools", "create-gate-closure-readiness.mjs"), ...args], {
    cwd: options.cwd ?? root,
    encoding: "utf8",
  });
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

const requiredBoundaries = [
  "does_not_close_gates",
  "does_not_create_evidence",
  "does_not_attach_evidence",
  "does_not_submit_evidence",
  "does_not_prove_completion",
  "does_not_publish",
  "does_not_stage_commit_push_tag_release",
  "does_not_choose_license",
  "does_not_create_external_proof",
  "does_not_prove_adoption",
];

const packageJson = readJson("package.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/GATE-CLOSURE-READINESS.md");
const specIndex = read("spec/README.md");
const schema = readJson("spec/gate-closure-readiness.schema.json");
const report = readJson(".mimesis/gates/closure-readiness.json");
const gapRegister = readJson(".mimesis/gaps/current-gap-register.json");
const readme = read("README.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const toolsReadme = read("tools/README.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const releaseOrderDoc = read("docs/RELEASE-CHECK-ORDER.md");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");
const validator = read("tools/validate-mimesis.mjs");
const generator = read("tools/create-gate-closure-readiness.mjs");
const releaseCheck = packageJson.scripts?.["release:check"] ?? "";
const releaseCommands = releaseCheck
  .split("&&")
  .map((part) => part.trim())
  .map((part) => part.replace(/^npm\s+run\s+/, "").trim())
  .filter(Boolean);

if (packageJson.scripts?.["gate:closure-readiness"] !== "node tools/create-gate-closure-readiness.mjs") {
  failures.push("package.json missing script: gate:closure-readiness");
}

if (packageJson.scripts?.["audit:gate-closure-readiness"] !== "node tools/audit-gate-closure-readiness.mjs") {
  failures.push("package.json missing script: audit:gate-closure-readiness");
}

if (!releaseCheck.includes("gate:closure-readiness")) {
  failures.push("release:check must generate npm run gate:closure-readiness");
}

if (!releaseCheck.includes("audit:gate-closure-readiness")) {
  failures.push("release:check must include npm run audit:gate-closure-readiness");
}

for (const [earlier, later] of [
  ["owner:evidence-submission-record", "gate:closure-readiness"],
  ["state:summary", "gate:closure-readiness"],
  ["gate:closure-readiness", "worktree:packet"],
  ["gate:closure-readiness", "release:artifact-manifest"],
  ["gate:closure-readiness", "audit:gate-closure-readiness"],
  ["audit:state-summary", "audit:gate-closure-readiness"],
  ["audit:owner-evidence-submission-record", "audit:gate-closure-readiness"],
  ["audit:gate-closure-readiness", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

if (!cli.includes('"gate:closure-readiness"') || !cli.includes('"audit:gate-closure-readiness"')) {
  failures.push("CLI missing gate:closure-readiness or audit:gate-closure-readiness command");
}

for (const text of [
  "gate closure readiness",
  "readiness report, not closure",
  "canCloseNow",
  "--owner-evidence-submission",
  "--output",
  "real owner evidence submission",
  "does not close gates",
  "does not create evidence",
  "does not attach evidence",
  "does not publish",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/GATE-CLOSURE-READINESS.md missing text: ${text}`);
  }
}

if (!specIndex.includes("gate-closure-readiness.schema.json")) {
  failures.push("spec/README.md missing gate-closure-readiness schema");
}

if (schema?.title !== "Mimesis Gate Closure Readiness") {
  failures.push("gate closure readiness schema must have the expected title");
}

if (report.schema !== "mimesis.gate-closure-readiness.v0.1") {
  failures.push("gate closure readiness schema must be mimesis.gate-closure-readiness.v0.1");
}

if (report.status !== "open_gates_not_ready") {
  failures.push("gate closure readiness status must be open_gates_not_ready");
}

if (!report.inputMode || typeof report.inputMode !== "object") {
  failures.push("gate closure readiness missing inputMode");
}

if (report.inputMode?.ownerEvidenceSubmissionRecord !== ".mimesis/owner-actions/fixture-evidence-submission-record.json") {
  failures.push("gate closure readiness default inputMode must name the fixture owner evidence submission record");
}

if (report.inputMode?.candidateMode !== false) {
  failures.push("gate closure readiness default inputMode candidateMode must be false");
}

if (report.completionAllowed !== false) {
  failures.push("gate closure readiness completionAllowed must be false");
}

if (report.gateCount !== gapRegister.gapCount) {
  failures.push("gate closure readiness gateCount must match gap register");
}

if (!report.readinessCounts || typeof report.readinessCounts !== "object") {
  failures.push("gate closure readiness missing readinessCounts");
}

const gates = Array.isArray(report.gates) ? report.gates : [];
const gateIds = new Set(gates.map((gate) => gate.id));
for (const id of requiredGapIds) {
  if (!gateIds.has(id)) {
    failures.push(`gate closure readiness missing gate id: ${id}`);
  }
}

for (const gate of gates) {
  for (const field of [
    "id",
    "title",
    "kind",
    "status",
    "readiness",
    "canCloseNow",
    "requiredEvidence",
    "missingEvidence",
    "firstCommand",
    "stopConditions",
    "nextAction",
    "boundary",
  ]) {
    if (gate[field] === undefined || gate[field] === null || (Array.isArray(gate[field]) && gate[field].length === 0)) {
      failures.push(`gate closure readiness gate ${gate.id ?? "unknown"} missing field: ${field}`);
    }
  }

  if (gate.canCloseNow !== false) {
    failures.push(`gate closure readiness must not mark gate closable now: ${gate.id}`);
  }

  if (gate.ownerEvidenceReviewReady !== false) {
    failures.push(`default gate closure readiness must not mark owner evidence review ready: ${gate.id}`);
  }

  if (!Array.isArray(gate.missingEvidence) || gate.missingEvidence.length === 0) {
    failures.push(`gate closure readiness gate ${gate.id ?? "unknown"} must list missing evidence`);
  }
}

for (const sourceFile of [
  ".mimesis/gaps/current-gap-register.json",
  ".mimesis/gaps/closure-plan.json",
  ".mimesis/owner-actions/evidence-bundle.md",
  ".mimesis/owner-actions/fixture-evidence-submission-record.json",
  ".mimesis/owner-actions/evidence-review.md",
  ".mimesis/state/current-state.json",
]) {
  if (!report.sourceFiles?.includes(sourceFile)) {
    failures.push(`gate closure readiness missing source file: ${sourceFile}`);
  }
}

for (const boundary of requiredBoundaries) {
  if (!report.boundaries?.includes(boundary)) {
    failures.push(`gate closure readiness missing boundary: ${boundary}`);
  }
}

if (!/readiness report/i.test(report.allowedClaim ?? "")) {
  failures.push("gate closure readiness allowedClaim must name readiness report");
}

if (!/does not close gates/i.test(report.disallowedClaim ?? "")) {
  failures.push("gate closure readiness disallowedClaim must say it does not close gates");
}

for (const text of [
  "Gate Closure Readiness",
  "GATE-CLOSURE-READINESS.md",
  "../.mimesis/gates/closure-readiness.json",
  "../spec/gate-closure-readiness.schema.json",
  "../tools/create-gate-closure-readiness.mjs",
  "../tools/audit-gate-closure-readiness.mjs",
]) {
  if (!completion.includes(text)) {
    failures.push(`docs/COMPLETION-AUDIT.md missing gate closure readiness evidence: ${text}`);
  }
}

for (const [name, content] of [
  ["README.md", readme],
  ["tools/README.md", toolsReadme],
  ["STATUS.md", status],
  ["ROADMAP.md", roadmap],
  ["docs/V0.1-RELEASE-PACKET.md", releasePacket],
  ["docs/RELEASE-CHECK-ORDER.md", releaseOrderDoc],
]) {
  if (!content.toLowerCase().includes("gate closure readiness")) {
    failures.push(`${name} missing gate closure readiness text`);
  }
}

for (const command of ["gate:closure-readiness", "audit:gate-closure-readiness"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/gates/closure-readiness.json")) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing gate closure readiness report");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/GATE-CLOSURE-READINESS.md",
  "spec/gate-closure-readiness.schema.json",
  ".mimesis/gates/closure-readiness.json",
  "tools/create-gate-closure-readiness.mjs",
  "tools/audit-gate-closure-readiness.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (!validator.includes("docs/GATE-CLOSURE-READINESS.md")) {
  failures.push("tools/validate-mimesis.mjs missing docs/GATE-CLOSURE-READINESS.md");
}

if (!validator.includes(".mimesis/gates/closure-readiness.json")) {
  failures.push("tools/validate-mimesis.mjs missing .mimesis/gates/closure-readiness.json");
}

if (!validator.includes("tools/audit-gate-closure-readiness.mjs")) {
  failures.push("tools/validate-mimesis.mjs missing tools/audit-gate-closure-readiness.mjs");
}

for (const text of ["--owner-evidence-submission", "--output", "candidateMode", "ownerEvidenceReviewReady"]) {
  if (!generator.includes(text)) {
    failures.push(`tools/create-gate-closure-readiness.mjs missing option or field text: ${text}`);
  }
}

if (!failures.length) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-gate-readiness-input-"));
  const fixtureRecord = readJson(".mimesis/owner-actions/fixture-evidence-submission-record.json");
  const reviewedRecord = path.join(tmpDir, "reviewed-owner-evidence.json");
  const outputRecord = path.join(tmpDir, "closure-readiness-candidate.json");
  fixtureRecord.status = "reviewed";
  fixtureRecord.fields.weak_artifact_permission = {
    ...fixtureRecord.fields.weak_artifact_permission,
    submissionStatus: "submitted",
    ownerSubmittedEvidence: "permissioned or clearly redacted weak artifact attached for gate-specific review only",
    ownerAttachmentSlot: "examples/permissioned-case-intake.md",
    safetyCheck: "owner confirms permission, redaction, submitter scope, and publication scope before case movement",
    boundary: "does not create external proof, close gates, publish, or prove adoption",
  };
  fs.writeFileSync(reviewedRecord, `${JSON.stringify(fixtureRecord, null, 2)}\n`);

  const result = runReadiness(["--owner-evidence-submission", reviewedRecord, "--output", outputRecord], { cwd: tmpDir });
  if (result.status !== 0) {
    failures.push(`gate closure readiness must accept a reviewed owner evidence submission input:\n${result.stdout}\n${result.stderr}`.trim());
  }

  const candidate = fs.existsSync(outputRecord) ? JSON.parse(fs.readFileSync(outputRecord, "utf8")) : {};
  if (candidate.inputMode?.candidateMode !== true) {
    failures.push("gate closure readiness candidate output must set inputMode.candidateMode true");
  }
  if (candidate.inputMode?.ownerEvidenceSubmissionRecord !== reviewedRecord.replaceAll(path.sep, "/")) {
    failures.push("gate closure readiness candidate output must record the supplied owner evidence submission path");
  }

  const permissionedGate = candidate.gates?.find((gate) => gate.id === "permissioned_external_artifact") ?? {};
  if (permissionedGate.ownerEvidenceReviewReady !== true) {
    failures.push("permissioned external artifact gate should be ownerEvidenceReviewReady for reviewed submitted weak_artifact_permission");
  }
  if (permissionedGate.canCloseNow !== false) {
    failures.push("permissioned external artifact gate must still have canCloseNow false in candidate mode");
  }
  if (permissionedGate.missingEvidence?.some((item) => item.includes("weak_artifact_permission: not submitted owner evidence"))) {
    failures.push("permissioned external artifact candidate missingEvidence must not say weak_artifact_permission is not submitted");
  }

  const completedCaseGate = candidate.gates?.find((gate) => gate.id === "completed_external_case") ?? {};
  if (completedCaseGate.ownerEvidenceReviewReady !== true) {
    failures.push("completed external case gate should show ownerEvidenceReviewReady while still requiring case evidence");
  }
  if (completedCaseGate.canCloseNow !== false) {
    failures.push("completed external case gate must still have canCloseNow false");
  }
  if (!completedCaseGate.missingEvidence?.some((item) => item.includes("case:check"))) {
    failures.push("completed external case gate must still list case evidence as missing");
  }
}

if (failures.length) {
  console.error("\nMimesis gate closure readiness audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis gate closure readiness audit passed: open gates have machine-readable readiness without closure claims.");

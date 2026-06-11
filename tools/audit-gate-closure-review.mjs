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

function runNode(script, args, options = {}) {
  return spawnSync(process.execPath, [path.join(root, "tools", script), ...args], {
    cwd: options.cwd ?? root,
    encoding: "utf8",
  });
}

const requiredGateIds = [
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
  "does_not_approve_gate_closure",
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
const doc = read("docs/GATE-CLOSURE-REVIEW.md");
const specIndex = read("spec/README.md");
const schema = readJson("spec/gate-closure-review.schema.json");
const report = readJson(".mimesis/gates/closure-review.json");
const readiness = readJson(".mimesis/gates/closure-readiness.json");
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
const generator = read("tools/create-gate-closure-review.mjs");
const releaseCheck = packageJson.scripts?.["release:check"] ?? "";
const releaseCommands = releaseCheck
  .split("&&")
  .map((part) => part.trim())
  .map((part) => part.replace(/^npm\s+run\s+/, "").trim())
  .filter(Boolean);

if (packageJson.scripts?.["gate:closure-review"] !== "node tools/create-gate-closure-review.mjs") {
  failures.push("package.json missing script: gate:closure-review");
}

if (packageJson.scripts?.["audit:gate-closure-review"] !== "node tools/audit-gate-closure-review.mjs") {
  failures.push("package.json missing script: audit:gate-closure-review");
}

if (!releaseCheck.includes("gate:closure-review")) {
  failures.push("release:check must generate npm run gate:closure-review");
}

if (!releaseCheck.includes("audit:gate-closure-review")) {
  failures.push("release:check must include npm run audit:gate-closure-review");
}

for (const [earlier, later] of [
  ["gate:closure-readiness", "gate:closure-review"],
  ["owner:evidence-submission-check", "gate:closure-review"],
  ["state:summary", "gate:closure-review"],
  ["gate:closure-review", "worktree:packet"],
  ["gate:closure-review", "release:artifact-manifest"],
  ["gate:closure-review", "audit:gate-closure-review"],
  ["audit:gate-closure-readiness", "audit:gate-closure-review"],
  ["audit:owner-evidence-submission-check", "audit:gate-closure-review"],
  ["audit:gate-closure-review", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

if (!cli.includes('"gate:closure-review"') || !cli.includes('"audit:gate-closure-review"')) {
  failures.push("CLI missing gate:closure-review or audit:gate-closure-review command");
}

for (const text of [
  "gate closure review",
  "review record, not closure",
  "keep_open",
  "closureApproved",
  "--readiness",
  "--owner-evidence-submission-check",
  "--owner-evidence-submission",
  "--output",
  "candidate review",
  "does not approve gate closure",
  "does not close gates",
  "does not publish",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/GATE-CLOSURE-REVIEW.md missing text: ${text}`);
  }
}

if (!specIndex.includes("gate-closure-review.schema.json")) {
  failures.push("spec/README.md missing gate-closure-review schema");
}

if (schema?.title !== "Mimesis Gate Closure Review") {
  failures.push("gate closure review schema must have the expected title");
}

if (report.schema !== "mimesis.gate-closure-review.v0.1") {
  failures.push("gate closure review schema must be mimesis.gate-closure-review.v0.1");
}

if (report.status !== "blocked_no_gate_closure") {
  failures.push("gate closure review status must be blocked_no_gate_closure");
}

if (report.completionAllowed !== false) {
  failures.push("gate closure review completionAllowed must be false");
}

if (report.closureApproved !== false) {
  failures.push("gate closure review closureApproved must be false");
}

if (!report.inputMode || typeof report.inputMode !== "object") {
  failures.push("gate closure review missing inputMode");
}

if (report.inputMode?.readinessReport !== ".mimesis/gates/closure-readiness.json") {
  failures.push("gate closure review default inputMode must name the fixture readiness report");
}

if (report.inputMode?.ownerEvidenceSubmissionCheck !== ".mimesis/owner-actions/fixture-evidence-submission-check.md") {
  failures.push("gate closure review default inputMode must name the fixture owner evidence submission check");
}

if (report.inputMode?.ownerEvidenceSubmissionRecord !== ".mimesis/owner-actions/fixture-evidence-submission-record.json") {
  failures.push("gate closure review default inputMode must name the fixture owner evidence submission record");
}

if (report.inputMode?.candidateMode !== false) {
  failures.push("gate closure review default inputMode candidateMode must be false");
}

if (report.reviewCount !== readiness.gateCount) {
  failures.push("gate closure review reviewCount must match readiness gateCount");
}

const reviews = Array.isArray(report.reviews) ? report.reviews : [];
const reviewIds = new Set(reviews.map((review) => review.id));
for (const id of requiredGateIds) {
  if (!reviewIds.has(id)) {
    failures.push(`gate closure review missing gate id: ${id}`);
  }
}

for (const review of reviews) {
  for (const field of [
    "id",
    "title",
    "status",
    "readiness",
    "decision",
    "closureApproved",
    "canCloseNow",
    "ownerEvidenceReviewReady",
    "reviewReason",
    "requiredBeforeClosure",
    "forbiddenClaim",
    "nextAction",
    "boundary",
  ]) {
    if (review[field] === undefined || review[field] === null || (Array.isArray(review[field]) && review[field].length === 0)) {
      failures.push(`gate closure review ${review.id ?? "unknown"} missing field: ${field}`);
    }
  }

  if (review.decision !== "keep_open") {
    failures.push(`gate closure review must keep gate open: ${review.id}`);
  }

  if (review.closureApproved !== false || review.canCloseNow !== false) {
    failures.push(`gate closure review must not approve closure: ${review.id}`);
  }

  if (review.ownerEvidenceReviewReady !== false) {
    failures.push(`default gate closure review must not mark owner evidence review ready: ${review.id}`);
  }
}

for (const sourceFile of [
  ".mimesis/gates/closure-readiness.json",
  ".mimesis/owner-actions/fixture-evidence-submission-check.md",
  ".mimesis/owner-actions/fixture-evidence-submission-record.json",
  ".mimesis/gaps/current-gap-register.json",
  ".mimesis/state/current-state.json",
]) {
  if (!report.sourceFiles?.includes(sourceFile)) {
    failures.push(`gate closure review missing source file: ${sourceFile}`);
  }
}

for (const boundary of requiredBoundaries) {
  if (!report.boundaries?.includes(boundary)) {
    failures.push(`gate closure review missing boundary: ${boundary}`);
  }
}

if (!/review record/i.test(report.allowedClaim ?? "")) {
  failures.push("gate closure review allowedClaim must name review record");
}

if (!/does not approve gate closure/i.test(report.disallowedClaim ?? "")) {
  failures.push("gate closure review disallowedClaim must say it does not approve gate closure");
}

for (const text of [
  "Gate Closure Review",
  "GATE-CLOSURE-REVIEW.md",
  "../.mimesis/gates/closure-review.json",
  "../spec/gate-closure-review.schema.json",
  "../tools/create-gate-closure-review.mjs",
  "../tools/audit-gate-closure-review.mjs",
]) {
  if (!completion.includes(text)) {
    failures.push(`docs/COMPLETION-AUDIT.md missing gate closure review evidence: ${text}`);
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
  if (!content.toLowerCase().includes("gate closure review")) {
    failures.push(`${name} missing gate closure review text`);
  }
}

for (const command of ["gate:closure-review", "audit:gate-closure-review"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

if (!frameworkManifest.entrypoints?.some((entry) => entry.path === ".mimesis/gates/closure-review.json")) {
  failures.push(".mimesis/framework-manifest.json entrypoints missing gate closure review report");
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/GATE-CLOSURE-REVIEW.md",
  "spec/gate-closure-review.schema.json",
  ".mimesis/gates/closure-review.json",
  "tools/create-gate-closure-review.mjs",
  "tools/audit-gate-closure-review.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing ${artifactPath}`);
  }
}

for (const pathNeedle of [
  "docs/GATE-CLOSURE-REVIEW.md",
  "spec/gate-closure-review.schema.json",
  ".mimesis/gates/closure-review.json",
  "tools/create-gate-closure-review.mjs",
  "tools/audit-gate-closure-review.mjs",
]) {
  if (!validator.includes(pathNeedle)) {
    failures.push(`validator required files missing ${pathNeedle}`);
  }
}

for (const text of [
  "--readiness",
  "--owner-evidence-submission-check",
  "--owner-evidence-submission",
  "--output",
  "candidateMode",
  "ownerEvidenceReviewReady",
]) {
  if (!generator.includes(text)) {
    failures.push(`tools/create-gate-closure-review.mjs missing option or field text: ${text}`);
  }
}

if (!failures.length) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-gate-review-input-"));
  const fixtureRecord = readJson(".mimesis/owner-actions/fixture-evidence-submission-record.json");
  const reviewedRecord = path.join(tmpDir, "reviewed-owner-evidence.json");
  const readinessCandidate = path.join(tmpDir, "closure-readiness-candidate.json");
  const checkReport = path.join(tmpDir, "owner-evidence-field-check.md");
  const reviewCandidate = path.join(tmpDir, "closure-review-candidate.json");

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

  const readinessResult = runNode("create-gate-closure-readiness.mjs", [
    "--owner-evidence-submission",
    reviewedRecord,
    "--output",
    readinessCandidate,
  ]);
  if (readinessResult.status !== 0) {
    failures.push(`gate closure readiness candidate setup failed:\n${readinessResult.stdout}\n${readinessResult.stderr}`.trim());
  }

  const checkResult = runNode("check-owner-evidence-submission-record.mjs", [
    reviewedRecord,
    "--require-field",
    "weak_artifact_permission",
    "--write-report",
    checkReport,
  ]);
  if (checkResult.status !== 0) {
    failures.push(`owner evidence field check candidate setup failed:\n${checkResult.stdout}\n${checkResult.stderr}`.trim());
  }

  const reviewResult = runNode("create-gate-closure-review.mjs", [
    "--readiness",
    readinessCandidate,
    "--owner-evidence-submission-check",
    checkReport,
    "--owner-evidence-submission",
    reviewedRecord,
    "--output",
    reviewCandidate,
  ]);
  if (reviewResult.status !== 0) {
    failures.push(`gate closure review must accept candidate readiness/check inputs:\n${reviewResult.stdout}\n${reviewResult.stderr}`.trim());
  }

  const candidate = fs.existsSync(reviewCandidate) ? JSON.parse(fs.readFileSync(reviewCandidate, "utf8")) : {};
  if (candidate.inputMode?.candidateMode !== true) {
    failures.push("gate closure review candidate output must set inputMode.candidateMode true");
  }
  if (candidate.inputMode?.readinessReport !== readinessCandidate.replaceAll(path.sep, "/")) {
    failures.push("gate closure review candidate must record the supplied readiness path");
  }
  if (candidate.inputMode?.ownerEvidenceSubmissionCheck !== checkReport.replaceAll(path.sep, "/")) {
    failures.push("gate closure review candidate must record the supplied owner evidence submission check path");
  }
  if (candidate.closureApproved !== false || candidate.completionAllowed !== false) {
    failures.push("gate closure review candidate must not approve closure or completion");
  }

  const permissionedReview = candidate.reviews?.find((review) => review.id === "permissioned_external_artifact") ?? {};
  if (permissionedReview.ownerEvidenceReviewReady !== true) {
    failures.push("permissioned external artifact review should show ownerEvidenceReviewReady for reviewed submitted weak_artifact_permission");
  }
  if (permissionedReview.decision !== "keep_open" || permissionedReview.closureApproved !== false || permissionedReview.canCloseNow !== false) {
    failures.push("permissioned external artifact candidate review must keep the gate open");
  }
  if (!permissionedReview.reviewReason?.toLowerCase().includes("ready for gate-specific review")) {
    failures.push("permissioned external artifact candidate review must explain gate-specific review readiness");
  }

  const completedCaseReview = candidate.reviews?.find((review) => review.id === "completed_external_case") ?? {};
  if (completedCaseReview.ownerEvidenceReviewReady !== true) {
    failures.push("completed external case review should carry ownerEvidenceReviewReady while still requiring case evidence");
  }
  if (!completedCaseReview.requiredBeforeClosure?.some((item) => item.includes("case:check"))) {
    failures.push("completed external case candidate review must still require case evidence before closure");
  }
  if (completedCaseReview.closureApproved !== false || completedCaseReview.canCloseNow !== false) {
    failures.push("completed external case candidate review must remain open");
  }
}

if (failures.length) {
  console.error("Mimesis gate closure review audit failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis gate closure review audit passed: gate closure attempts remain reviewable and blocked without evidence.");

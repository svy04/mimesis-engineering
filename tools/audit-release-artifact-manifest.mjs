#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, ".mimesis", "release-artifacts", "v0.1-manifest.json");
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

const packageJson = readJson("package.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/RELEASE-ARTIFACT-MANIFEST.md");
const releaseCheck = packageJson.scripts?.["release:check"] ?? "";

if (!packageJson.scripts?.["release:artifact-manifest"]) {
  failures.push("package.json missing script: release:artifact-manifest");
}

if (!packageJson.scripts?.["audit:release-artifact-manifest"]) {
  failures.push("package.json missing script: audit:release-artifact-manifest");
}

if (!releaseCheck.includes("release:artifact-manifest")) {
  failures.push("release:check must generate npm run release:artifact-manifest");
}

if (!releaseCheck.includes("audit:release-artifact-manifest")) {
  failures.push("release:check must include npm run audit:release-artifact-manifest");
}

if (!cli.includes('"release:artifact-manifest"') || !cli.includes('"audit:release-artifact-manifest"')) {
  failures.push("CLI missing release:artifact-manifest or audit:release-artifact-manifest command");
}

for (const text of [
  "release artifact manifest",
  "sha256",
  "does not publish",
  "does not stage",
  "does not create external proof",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/RELEASE-ARTIFACT-MANIFEST.md missing text: ${text}`);
  }
}

if (!fs.existsSync(manifestPath)) {
  failures.push("missing .mimesis/release-artifacts/v0.1-manifest.json; run npm run release:artifact-manifest");
} else {
  const manifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");

  if (manifest.schema !== "mimesis.release-artifact-manifest.v0.1") {
    failures.push("release artifact manifest schema must be mimesis.release-artifact-manifest.v0.1");
  }

  if (manifest.status !== "local_manifest_not_publication") {
    failures.push("release artifact manifest status must be local_manifest_not_publication");
  }

  if (manifest.package?.version !== packageJson.version) {
    failures.push("release artifact manifest package.version must match package.json");
  }

  if (!manifest.generatedAt) {
    failures.push("release artifact manifest missing generatedAt");
  }

  if (!Number.isInteger(manifest.artifactCount) || manifest.artifactCount < 30) {
    failures.push("release artifact manifest artifactCount must be at least 30");
  }

  if (!Array.isArray(manifest.artifacts) || manifest.artifacts.length !== manifest.artifactCount) {
    failures.push("release artifact manifest artifacts must match artifactCount");
  }

  const artifacts = Array.isArray(manifest.artifacts) ? manifest.artifacts : [];
  const byPath = new Map(artifacts.map((artifact) => [artifact.path, artifact]));

  for (const requiredPath of [
    "README.md",
    "spec/README.md",
    "docs/COMPLETION-AUDIT.md",
    "docs/GOAL-COMPLETION-AUDIT.md",
    "docs/LICENSE-DECISION-FROM-OWNER-ANSWER.md",
    "docs/GAP-REGISTER.md",
    "docs/GAP-CLOSURE-PLAN.md",
    "docs/GATE-EVIDENCE-PACKET.md",
    "docs/GATE-CLOSURE-READINESS.md",
    "docs/GATE-CLOSURE-REVIEW.md",
    "docs/FIRST-PROOF-CANDIDATE-PACKET.md",
    "docs/PROOF-INTAKE-CHECK.md",
    "docs/PROOF-INTAKE-FROM-OWNER-EVIDENCE.md",
    "docs/PROOF-REDACTION-PACKET.md",
    "docs/PROOF-SUBMISSION-PACKET.md",
    "docs/PROOF-ACCEPTANCE-PACKET.md",
    "docs/PROOF-EXECUTION-REPORT.md",
    "docs/V0.1-RELEASE-PACKET.md",
    "docs/RELEASE-ARTIFACT-MANIFEST.md",
    "docs/RELEASE-EVIDENCE-REPORT.md",
    "docs/PUBLICATION-EVIDENCE-PACKET.md",
    "docs/ADOPTION-PACKET.md",
    "docs/OWNER-ACTION-QUEUE.md",
    "docs/OWNER-DECISION-INTAKE.md",
    "docs/OWNER-DECISION-ANSWER-RECORD.md",
    "docs/OWNER-ANSWER-REVIEW.md",
    "docs/OWNER-EVIDENCE-ATTACHMENT-FORM.md",
    "docs/OWNER-EVIDENCE-SUBMISSION-RECORD.md",
    "docs/OWNER-EVIDENCE-SUBMISSION-CHECK.md",
    "docs/OWNER-EVIDENCE-BUNDLE.md",
    "docs/OWNER-EVIDENCE-INTAKE-RECORD.md",
    "docs/OWNER-EVIDENCE-REVIEW.md",
    "docs/OWNER-PROOF-INPUT-ISSUE.md",
    "docs/OWNER-PROOF-INPUT-REQUEST.md",
    "docs/OWNER-PROOF-INPUT-REMOTE-ISSUE.md",
    "docs/OWNER-PROOF-INPUT-ISSUE-CONVERT.md",
    "docs/OWNER-PROOF-INPUT-REVIEW.md",
    "docs/CURRENT-STATE-SUMMARY.md",
    "docs/WORKTREE-REVIEW-PACKET.md",
    "docs/RELEASE-REVIEW-BUNDLE.md",
    "docs/STATUS-ROADMAP-SYNC.md",
    "docs/SUPERPOWERS-ADAPTER.md",
    ".mimesis/publication-packets/v0.1.md",
    ".mimesis/adapter-packets/superpowers.md",
    ".mimesis/release-decisions/from-owner-answer-bridge.md",
    ".mimesis/release-decisions/owner-decision-record.json",
    ".mimesis/release-evidence/v0.1-report.md",
    ".mimesis/release-evidence/publication-evidence-packet.md",
    ".mimesis/owner-actions/current-action-queue.md",
    ".mimesis/owner-actions/decision-intake.md",
    ".mimesis/owner-actions/fixture-answer-record.json",
    ".mimesis/owner-actions/answer-review.md",
    ".mimesis/owner-actions/evidence-attachment-form.md",
    ".mimesis/owner-actions/fixture-evidence-submission-record.json",
    ".mimesis/owner-actions/fixture-evidence-submission-check.md",
    ".mimesis/owner-actions/evidence-bundle.md",
    ".mimesis/owner-actions/fixture-evidence-record.json",
    ".mimesis/owner-actions/evidence-review.md",
    ".mimesis/owner-actions/proof-input-issue-packet.md",
    ".mimesis/owner-actions/proof-input-request.md",
    ".mimesis/owner-actions/remote-proof-input-issue-anchor.md",
    ".mimesis/owner-actions/fixture-owner-proof-input-issue.md",
    ".mimesis/owner-actions/fixture-owner-proof-input-issue-record.json",
    ".mimesis/owner-actions/fixture-owner-proof-input-issue-conversion-report.md",
    ".mimesis/owner-actions/fixture-proof-input-review.md",
    ".mimesis/state/current-state.json",
    ".mimesis/gates/closure-readiness.json",
    ".mimesis/gates/closure-review.json",
    ".mimesis/worktree/review-packet.json",
    ".mimesis/release-review/v0.1-bundle.json",
    ".mimesis/completion/goal-completion-audit.json",
    ".mimesis/gates/evidence-packet.md",
    ".mimesis/proof-candidates/first-candidate.md",
    ".mimesis/proof-intake/fixture-check.md",
    ".mimesis/proof-intake/from-owner-evidence-bridge.md",
    ".mimesis/proof-intake/redaction-packet.md",
    ".mimesis/proof-intake/submission-packet.md",
    ".mimesis/proof-intake/acceptance-packet.md",
    ".mimesis/proof-runs/execution-report.md",
    ".mimesis/gaps/current-gap-register.json",
    ".mimesis/gaps/closure-plan.json",
    ".mimesis/plugin-install-packets/codex-local.md",
    ".mimesis/proof-runs/readiness.md",
    ".mimesis/adoption-packets/v0.2-first-adoption.md",
    "tools/validate-mimesis.mjs",
    "tools/audit-superpowers-adapter.mjs",
    "tools/create-gap-register.mjs",
    "tools/audit-gap-register.mjs",
    // npm run audit:gap-register-sync-closure
    "tools/audit-gap-register-sync-closure.mjs",
    "tools/create-gap-closure-plan.mjs",
    "tools/audit-gap-closure-plan.mjs",
    "tools/create-gate-evidence-packet.mjs",
    "tools/audit-gate-evidence-packet.mjs",
    "tools/create-gate-closure-readiness.mjs",
    "tools/audit-gate-closure-readiness.mjs",
    "tools/create-gate-closure-review.mjs",
    "tools/audit-gate-closure-review.mjs",
    "tools/check-proof-intake-record.mjs",
    "tools/proof-intake-from-owner-evidence.mjs",
    "tools/audit-proof-intake-check.mjs",
    "tools/audit-proof-intake-from-owner-evidence.mjs",
    "tools/create-proof-candidate-packet.mjs",
    "tools/audit-proof-candidate-packet.mjs",
    "tools/create-proof-redaction-packet.mjs",
    "tools/audit-proof-redaction-packet.mjs",
    "tools/create-proof-submission-packet.mjs",
    "tools/audit-proof-submission-packet.mjs",
    "tools/create-proof-acceptance-packet.mjs",
    "tools/audit-proof-acceptance-packet.mjs",
    "tools/create-proof-execution-report.mjs",
    "tools/audit-proof-execution-report.mjs",
    "tools/create-release-evidence-report.mjs",
    "tools/audit-release-evidence-report.mjs",
    "tools/create-publication-evidence-packet.mjs",
    "tools/audit-publication-evidence-packet.mjs",
    "tools/create-goal-completion-audit.mjs",
    "tools/audit-goal-completion-audit.mjs",
    "tools/create-adoption-packet.mjs",
    "tools/audit-adoption-packet.mjs",
    "tools/create-owner-action-queue.mjs",
    "tools/audit-owner-action-queue.mjs",
    "tools/create-owner-proof-input-issue-packet.mjs",
    "tools/audit-owner-proof-input-issue.mjs",
    "tools/create-owner-proof-input-request.mjs",
    "tools/audit-owner-proof-input-request.mjs",
    "tools/create-owner-proof-input-remote-issue-anchor.mjs",
    "tools/audit-owner-proof-input-remote-issue.mjs",
    "tools/convert-owner-proof-input-issue.mjs",
    "tools/audit-owner-proof-input-issue-convert.mjs",
    "tools/review-owner-proof-input-record.mjs",
    "tools/audit-owner-proof-input-review.mjs",
    ".github/ISSUE_TEMPLATE/owner-proof-input.yml",
    "tools/create-owner-decision-intake.mjs",
    "tools/audit-owner-decision-intake.mjs",
    "tools/create-owner-decision-answer-record.mjs",
    "tools/audit-owner-decision-answer-record.mjs",
    "tools/review-owner-decision-answer-record.mjs",
    "tools/audit-owner-answer-review.mjs",
    "tools/license-decision-from-owner-answer.mjs",
    "tools/audit-license-decision-from-owner-answer.mjs",
    "tools/create-owner-evidence-attachment-form.mjs",
    "tools/audit-owner-evidence-attachment-form.mjs",
    "tools/create-owner-evidence-submission-record.mjs",
    "tools/audit-owner-evidence-submission-record.mjs",
    "tools/check-owner-evidence-submission-record.mjs",
    "tools/audit-owner-evidence-submission-check.mjs",
    "tools/create-owner-evidence-bundle.mjs",
    "tools/audit-owner-evidence-bundle.mjs",
    "tools/create-owner-evidence-intake-record.mjs",
    "tools/audit-owner-evidence-intake-record.mjs",
    "tools/review-owner-evidence-intake-record.mjs",
    "tools/audit-owner-evidence-review.mjs",
    "spec/owner-decision-answer.schema.json",
    "spec/current-state-summary.schema.json",
    "spec/gate-closure-readiness.schema.json",
    "spec/gate-closure-review.schema.json",
    "spec/worktree-review-packet.schema.json",
    "spec/release-review-bundle.schema.json",
    "spec/owner-evidence-intake.schema.json",
    "spec/owner-evidence-submission.schema.json",
    "tools/create-release-artifact-manifest.mjs",
    "tools/audit-release-artifact-manifest.mjs",
    "tools/audit-spec-index.mjs",
    "tools/create-current-state-summary.mjs",
    "tools/audit-current-state-summary.mjs",
    "tools/create-worktree-review-packet.mjs",
    "tools/audit-worktree-review-packet.mjs",
    "tools/create-release-review-bundle.mjs",
    "tools/audit-release-review-bundle.mjs",
    "tools/audit-status-roadmap-sync.mjs",
    "tools/audit-sync-strict-nonwriting.mjs",
    "prompts/superpowers-mimesis.md",
    "adapters/superpowers.md",
    "package.json",
  ]) {
    if (!byPath.has(requiredPath)) {
      failures.push(`release artifact manifest missing artifact: ${requiredPath}`);
    }
  }

  for (const artifact of artifacts) {
    if (!artifact.path || !artifact.category || !artifact.sourceType) {
      failures.push(`release artifact manifest artifact missing path/category/sourceType: ${artifact.path ?? "unknown"}`);
    }

    if (!/^[a-f0-9]{64}$/.test(artifact.sha256 ?? "")) {
      failures.push(`release artifact manifest artifact has invalid sha256: ${artifact.path ?? "unknown"}`);
    }

    if (!Number.isInteger(artifact.bytes) || artifact.bytes <= 0) {
      failures.push(`release artifact manifest artifact has invalid byte count: ${artifact.path ?? "unknown"}`);
    }
  }

  for (const boundary of [
    "does_not_publish",
    "does_not_stage_commit_push_tag_release",
    "does_not_choose_license",
    "does_not_create_external_proof",
    "does_not_prove_adoption",
  ]) {
    if (!manifest.boundaries?.includes(boundary)) {
      failures.push(`release artifact manifest missing boundary: ${boundary}`);
    }
  }
}

if (failures.length) {
  console.error("\nMimesis release artifact manifest audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis release artifact manifest audit passed: local release artifacts are inventoried and bounded.");

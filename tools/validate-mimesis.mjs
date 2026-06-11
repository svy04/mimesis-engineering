#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const passes = [];

const requiredPaths = [
  "README.md",
  ".gitignore",
  "PROOF-BOUNDARY.md",
  "CONTRIBUTING.md",
  "STATUS.md",
  "ROADMAP.md",
  "CHANGELOG.md",
  "LICENSE.md",
  "action.yml",
  "docs/LICENSE-DECISION.md",
  "docs/LICENSE-DECISION-FROM-OWNER-ANSWER.md",
  "docs/ACTIVATION-SURFACE.md",
  "docs/FRAMEWORK-MANIFEST.md",
  "docs/FRAMEWORK-MANIFEST-SCHEMA.md",
  "docs/LICENSE-PACKET.md",
  "docs/FIRST-LOOP-DEMO.md",
  "docs/FIRST-PROOF-CANDIDATE-PACKET.md",
  "docs/PROOF-REDACTION-PACKET.md",
  "docs/PROOF-SUBMISSION-PACKET.md",
  "docs/PROOF-ACCEPTANCE-PACKET.md",
  "docs/OPERATOR-RUNBOOK.md",
  "docs/BENCHMARK-PACKET.md",
  "docs/ADOPTION-PACKET.md",
  "docs/V0.1-RELEASE-PACKET.md",
  "docs/V0.2-PROOF-QUEUE.md",
  "docs/FIRST-PROOF-PACKET.md",
  "docs/PROOF-INTAKE-KIT.md",
  "docs/PROOF-INTAKE-CHECK.md",
  "docs/PROOF-INTAKE-FROM-OWNER-EVIDENCE.md",
  "docs/PROOF-INTAKE-RECORD.md",
  "docs/PROOF-INTAKE-SCHEMA.md",
  "docs/PROOF-READINESS-PACKET.md",
  "docs/PROOF-RUN-PACKET.md",
  "docs/PROOF-EXECUTION-REPORT.md",
  "docs/PROOF-RUN-DRY-AUDIT.md",
  "docs/COMPLETION-AUDIT.md",
  "docs/GOAL-COMPLETION-AUDIT.md",
  "docs/GAP-REGISTER.md",
  "docs/GAP-CLOSURE-PLAN.md",
  "docs/GATE-EVIDENCE-PACKET.md",
  "docs/GATE-CLOSURE-READINESS.md",
  "docs/GATE-CLOSURE-REVIEW.md",
  "docs/GATEBOARD.md",
  "docs/CASE-START.md",
  "docs/CASE-CHECK.md",
  "docs/CASE-FROM-INTAKE.md",
  "docs/CASE-FROM-RECORD.md",
  "docs/CASE-PUBLICATION-PACKET.md",
  "docs/EVIDENCE-PACKET.md",
  "docs/EVIDENCE-FROM-CASE.md",
  "docs/EVIDENCE-REVIEW.md",
  "docs/PACKAGE-RELEASE-CANDIDATE.md",
  "docs/ACTION-RELEASE-CANDIDATE.md",
  "docs/PLUGIN-INSTALL-PACKET.md",
  "docs/PLUGIN-RELEASE-PACKET.md",
  "docs/PUBLIC-CLAIM-PACK.md",
  "docs/CLAIM-FROM-EVIDENCE.md",
  "docs/PUBLISH-HANDOFF-PACKET.md",
  "docs/PUBLISH-SYNC-GATE.md",
  "docs/REFERENCE-PACK-INDEX.md",
  "docs/SOURCE-FIRST-PROTOCOL.md",
  "docs/PERMISSIONED-CASE-PACKET.md",
  "docs/PERMISSIONED-CASE-CHECK.md",
  "docs/PERMISSIONED-CASE-FIXTURE.md",
  "docs/CASE-REVIEW-CHECKLIST.md",
  "SECURITY.md",
  "package.json",
  "bin/mimesis.mjs",
  ".github/workflows/validate-mimesis.yml",
  ".github/ISSUE_TEMPLATE/owner-proof-input.yml",
  ".github/actions/release-check/action.yml",
  ".github/ISSUE_TEMPLATE/permissioned-external-case.yml",
  "spec/README.md",
  "spec/mimesis-v0.1.md",
  "spec/file-protocol.md",
  "spec/framework-manifest.schema.json",
  "spec/current-state-summary.schema.json",
  "spec/gate-closure-readiness.schema.json",
  "spec/gate-closure-review.schema.json",
  "spec/worktree-review-packet.schema.json",
  "spec/release-review-bundle.schema.json",
  "spec/proof-intake.schema.json",
  "spec/proof-execution-record.schema.json",
  "spec/owner-decision-answer.schema.json",
  "spec/owner-evidence-intake.schema.json",
  "spec/owner-evidence-submission.schema.json",
  "spec/owner-proof-input.schema.json",
  "spec/quality-bar.md",
  "spec/adapter-contract.md",
  "docs/ECOSYSTEM.md",
  "docs/ECOSYSTEM-RESOURCE-PACKET.md",
  "docs/CASEBOOK-PROTOCOL.md",
  "docs/REMOTE-ECOSYSTEM-AUDIT.md",
  "docs/SECRET-SAFETY-GATE.md",
  "docs/STATUS-ROADMAP-SYNC.md",
  "docs/SUPERPOWERS-ADAPTER.md",
  "docs/RELEASE-DECISION-RECORD.md",
  "docs/RELEASE-ARTIFACT-MANIFEST.md",
  "docs/RELEASE-EVIDENCE-REPORT.md",
  "docs/PUBLICATION-EVIDENCE-PACKET.md",
  "docs/RELEASE-EXECUTION-PACKET.md",
  "docs/OWNER-ACTION-QUEUE.md",
  "docs/OWNER-ISSUE-QUEUE.md",
  "docs/OWNER-ISSUE-REMOTE-SYNC.md",
  "docs/OWNER-DECISION-INTAKE.md",
  "docs/OWNER-DECISION-ANSWER-RECORD.md",
  "docs/OWNER-ANSWER-REVIEW.md",
  "docs/OWNER-PROOF-HANDOFF.md",
  "docs/OWNER-PROOF-INPUT.md",
  "docs/OWNER-PROOF-INPUT-ISSUE.md",
  "docs/OWNER-PROOF-INPUT-REQUEST.md",
  "docs/OWNER-PROOF-INPUT-REMOTE-ISSUE.md",
  "docs/OWNER-PROOF-INPUT-REMOTE-ISSUE-SNAPSHOT.md",
  "docs/OWNER-PROOF-INPUT-REMOTE-ISSUE-EXPORT.md",
  "docs/OWNER-PROOF-INPUT-ISSUE-CONVERT.md",
  "docs/OWNER-PROOF-INPUT-REVIEW.md",
  "docs/OWNER-PROOF-INPUT-SPLIT.md",
  "docs/OWNER-EVIDENCE-ATTACHMENT-FORM.md",
  "docs/OWNER-EVIDENCE-SUBMISSION-RECORD.md",
  "docs/OWNER-EVIDENCE-SUBMISSION-CHECK.md",
  "docs/OWNER-EVIDENCE-BUNDLE.md",
  "docs/OWNER-EVIDENCE-INTAKE-RECORD.md",
  "docs/OWNER-EVIDENCE-REVIEW.md",
  "docs/CURRENT-STATE-SUMMARY.md",
  "docs/WORKTREE-REVIEW-PACKET.md",
  "docs/RELEASE-REVIEW-BUNDLE.md",
  "docs/RELEASE-CHECK-ORDER.md",
  ".mimesis/README.md",
  ".mimesis/spec_lock.md",
  ".mimesis/procedure_tree.md",
  ".mimesis/artifact-brief.md",
  ".mimesis/reference-set.md",
  ".mimesis/structure-map.md",
  ".mimesis/transformation-plan.md",
  ".mimesis/improved-artifact.md",
  ".mimesis/boundary-check.md",
  ".mimesis/case-note.md",
  ".mimesis/run_ledger.md",
  ".mimesis/sync-status.md",
  ".mimesis/framework-manifest.json",
  ".mimesis/publication-packets/v0.1.md",
  ".mimesis/proof-packets/v0.2-first-proof.md",
  ".mimesis/proof-intake/first-external-proof-kit.md",
  ".mimesis/proof-intake/fixture-check.md",
  ".mimesis/proof-intake/fixture-record.json",
  ".mimesis/proof-intake/from-owner-evidence-bridge.md",
  ".mimesis/proof-intake/redaction-packet.md",
  ".mimesis/proof-intake/submission-packet.md",
  ".mimesis/proof-intake/acceptance-packet.md",
  ".mimesis/proof-candidates/first-candidate.md",
  ".mimesis/proof-runs/readiness.md",
  ".mimesis/proof-runs/v0.2-first-run.md",
  ".mimesis/proof-runs/execution-report.md",
  ".mimesis/proof-runs/dry-run-report.md",
  ".mimesis/license-packets/owner-decision.md",
  ".mimesis/plugin-install-packets/codex-local.md",
  ".mimesis/plugin-release-packets/v0.1-action-candidate.md",
  ".mimesis/claim-packs/public-v0.1.md",
  ".mimesis/case-publication-packets/current-casebook-candidate.md",
  ".mimesis/evidence-packets/local-case-draft.md",
  ".mimesis/publish-packets/local-sync-handoff.md",
  ".mimesis/gates/current-gateboard.md",
  ".mimesis/gates/evidence-packet.md",
  ".mimesis/gates/closure-readiness.json",
  ".mimesis/gates/closure-review.json",
  ".mimesis/gaps/current-gap-register.json",
  ".mimesis/gaps/closure-plan.json",
  ".mimesis/operator-runbooks/current-runbook.md",
  ".mimesis/owner-actions/current-action-queue.md",
  ".mimesis/owner-actions/v0.2-issue-queue.md",
  ".mimesis/owner-actions/remote-issue-sync.json",
  ".mimesis/owner-actions/remote-issue-sync.md",
  ".mimesis/owner-actions/decision-intake.md",
  ".mimesis/owner-actions/fixture-answer-record.json",
  ".mimesis/owner-actions/answer-review.md",
  ".mimesis/owner-actions/proof-run-handoff.md",
  ".mimesis/owner-actions/proof-input-template.json",
  ".mimesis/owner-actions/fixture-proof-input-check.md",
  ".mimesis/owner-actions/proof-input-issue-packet.md",
  ".mimesis/owner-actions/proof-input-request.md",
  ".mimesis/owner-actions/remote-proof-input-issue-anchor.md",
  ".mimesis/owner-actions/remote-proof-input-issue-snapshot.json",
  ".mimesis/owner-actions/remote-proof-input-issue-snapshot.md",
  ".mimesis/owner-actions/fixture-owner-proof-input-remote-issue-candidate.json",
  ".mimesis/owner-actions/fixture-owner-proof-input-issue.md",
  ".mimesis/owner-actions/fixture-owner-proof-input-issue-record.json",
  ".mimesis/owner-actions/fixture-owner-proof-input-issue-conversion-report.md",
  ".mimesis/owner-actions/fixture-proof-input-review.md",
  ".mimesis/owner-actions/proof-input-split-report.md",
  ".mimesis/owner-actions/evidence-attachment-form.md",
  ".mimesis/owner-actions/fixture-evidence-submission-record.json",
  ".mimesis/owner-actions/fixture-evidence-submission-check.md",
  ".mimesis/owner-actions/evidence-bundle.md",
  ".mimesis/owner-actions/fixture-evidence-record.json",
  ".mimesis/owner-actions/evidence-review.md",
  ".mimesis/ecosystem-resources/current-resource-packet.md",
  ".mimesis/benchmark-packets/v0.2-first-benchmark.md",
  ".mimesis/adoption-packets/v0.2-first-adoption.md",
  ".mimesis/release-decisions/owner-decision-record.json",
  ".mimesis/release-decisions/from-owner-answer-bridge.md",
  ".mimesis/release-artifacts/v0.1-manifest.json",
  ".mimesis/release-evidence/v0.1-report.md",
  ".mimesis/release-evidence/publication-evidence-packet.md",
  ".mimesis/state/current-state.json",
  ".mimesis/worktree/review-packet.json",
  ".mimesis/release-review/v0.1-bundle.json",
  ".mimesis/completion/goal-completion-audit.json",
  ".mimesis/release-execution/v0.1-owner-handoff.md",
  ".mimesis/security/secret-safety-report.md",
  ".mimesis/reference-packs/index.json",
  ".mimesis/first-loop-demo/README.md",
  ".mimesis/first-loop-demo/weak-artifact.md",
  ".mimesis/first-loop-demo/.mimesis/case-proof.md",
  ".mimesis/mcp/resource-index.json",
  "templates/README.md",
  "templates/spec-lock.md",
  "templates/procedure-tree.md",
  "templates/canvas.md",
  "templates/artifact-brief.md",
  "templates/reference-set.md",
  "templates/structure-map.md",
  "templates/transformation-plan.md",
  "templates/improved-artifact.md",
  "templates/boundary-check.md",
  "templates/case-note.md",
  "templates/permissioned-case-intake.md",
  "templates/evidence-packet.md",
  "templates/run-ledger.md",
  "reference-packs/README.md",
  "reference-packs/github-readme.md",
  "reference-packs/landing-page.md",
  "reference-packs/product-page.md",
  "reference-packs/blog-post.md",
  "reference-packs/ai-workflow.md",
  "reference-packs/research-note.md",
  "reference-packs/profile-positioning.md",
  "cases/README.md",
  "cases/EXTERNAL-CASEBOOK.md",
  "cases/002-blog-homepage-mimesis.md",
  "cases/003-github-profile-mimesis.md",
  "cases/005-lovable-ai-app-builder-public-source-specimen.md",
  "examples/README.md",
  "examples/weak-readme.md",
  "examples/permissioned-case-intake.md",
  "examples/product-workflow.md",
  "examples/blog-homepage.md",
  "prompts/README.md",
  "prompts/superpowers-mimesis.md",
  "adapters/README.md",
  "adapters/superpowers.md",
  "plugins/README.md",
  "plugins/mimesis-codex/.codex-plugin/plugin.json",
  "plugins/mimesis-codex/README.md",
  "plugins/mimesis-codex/skills/mimesis-loop/SKILL.md",
  "plugins/mimesis-mcp/manifest.json",
  "plugins/mimesis-mcp/resources.json",
  "plugins/mimesis-mcp/tools.json",
  "plugins/mimesis-mcp/README.md",
  "tools/README.md",
  "tools/audit-action-release-candidate.mjs",
  "tools/audit-activation-surface.mjs",
  "tools/audit-adapters.mjs",
  "tools/audit-benchmark-packet.mjs",
  "tools/audit-case-check.mjs",
  "tools/audit-case-from-intake.mjs",
  "tools/audit-case-from-record.mjs",
  "tools/audit-case-publication-packet.mjs",
  "tools/audit-case-start.mjs",
  "tools/audit-public-claim-pack.mjs",
  "tools/audit-claim-from-evidence.mjs",
  "tools/audit-cli.mjs",
  "tools/audit-codex-plugin-scaffold.mjs",
  "tools/audit-completion-matrix.mjs",
  "tools/audit-completion-row-count.mjs",
  "tools/create-goal-completion-audit.mjs",
  "tools/audit-goal-completion-audit.mjs",
  "tools/audit-ecosystem.mjs",
  "tools/audit-ecosystem-resource-packet.mjs",
  "tools/audit-evidence-packet.mjs",
  "tools/audit-evidence-from-case.mjs",
  "tools/audit-evidence-review.mjs",
  "tools/audit-first-loop-demo.mjs",
  "tools/audit-gap-register.mjs",
  // npm run audit:gap-register-sync-closure
  "tools/audit-gap-register-sync-closure.mjs",
  "tools/audit-gap-closure-plan.mjs",
  "tools/audit-gate-evidence-packet.mjs",
  "tools/audit-gate-closure-readiness.mjs",
  "tools/audit-gate-closure-review.mjs",
  "tools/audit-framework-manifest.mjs",
  "tools/audit-framework-manifest-schema.mjs",
  "tools/audit-gateboard.mjs",
  "tools/audit-issue-forms.mjs",
  "tools/audit-license.mjs",
  "tools/license-decision-from-owner-answer.mjs",
  "tools/audit-license-decision-from-owner-answer.mjs",
  "tools/audit-license-packet.mjs",
  "tools/audit-mcp-server-scaffold.mjs",
  "tools/audit-mcp-stdio-runtime.mjs",
  "tools/audit-operator-runbook.mjs",
  "tools/audit-owner-action-queue.mjs",
  "tools/audit-owner-issue-queue.mjs",
  "tools/audit-owner-issue-remote-sync.mjs",
  "tools/audit-owner-decision-intake.mjs",
  "tools/audit-owner-decision-answer-record.mjs",
  "tools/audit-owner-answer-review.mjs",
  "tools/audit-owner-proof-handoff.mjs",
  "tools/audit-owner-proof-input.mjs",
  "tools/audit-owner-proof-input-issue.mjs",
  "tools/audit-owner-proof-input-request.mjs",
  "tools/audit-owner-proof-input-remote-issue.mjs",
  "tools/audit-owner-proof-input-remote-issue-snapshot.mjs",
  "tools/audit-owner-proof-input-remote-issue-export.mjs",
  "tools/audit-owner-proof-input-remote-issue-export-candidate.mjs",
  "tools/audit-owner-proof-input-issue-convert.mjs",
  "tools/audit-owner-proof-input-review.mjs",
  "tools/audit-owner-proof-input-split.mjs",
  "tools/audit-owner-evidence-attachment-form.mjs",
  "tools/audit-owner-evidence-submission-record.mjs",
  "tools/audit-owner-evidence-submission-check.mjs",
  "tools/audit-owner-evidence-bundle.mjs",
  "tools/audit-owner-evidence-intake-record.mjs",
  "tools/audit-owner-evidence-review.mjs",
  "tools/audit-package-surface.mjs",
  "tools/audit-permissioned-case-check.mjs",
  "tools/audit-permissioned-fixture.mjs",
  "tools/audit-plugin-install-packet.mjs",
  "tools/audit-plugin-release-packet.mjs",
  "tools/audit-plugins.mjs",
  "tools/audit-proof-intake-kit.mjs",
  "tools/audit-proof-intake-check.mjs",
  "tools/audit-proof-intake-from-owner-evidence.mjs",
  "tools/audit-proof-intake-record.mjs",
  "tools/audit-proof-intake-schema.mjs",
  "tools/audit-proof-redaction-packet.mjs",
  "tools/audit-proof-submission-packet.mjs",
  "tools/audit-proof-acceptance-packet.mjs",
  "tools/audit-proof-packet.mjs",
  "tools/audit-proof-candidate-packet.mjs",
  "tools/audit-proof-queue.mjs",
  "tools/audit-proof-readiness-packet.mjs",
  "tools/audit-proof-run-packet.mjs",
  "tools/audit-proof-execution-report.mjs",
  "tools/audit-proof-run-dry.mjs",
  "tools/audit-publish-handoff-packet.mjs",
  "tools/audit-publication-packet.mjs",
  "tools/audit-reference-pack-index.mjs",
  "tools/audit-release-decision-record.mjs",
  "tools/audit-release-artifact-manifest.mjs",
  "tools/audit-release-evidence-report.mjs",
  "tools/audit-publication-evidence-packet.mjs",
  "tools/audit-release-readiness.mjs",
  "tools/audit-release-execution-packet.mjs",
  "tools/audit-release-check-order.mjs",
  "tools/audit-remote-ecosystem.mjs",
  "tools/audit-remote-fallback.mjs",
  "tools/audit-secret-safety.mjs",
  "tools/audit-spec-index.mjs",
  "tools/audit-current-state-summary.mjs",
  "tools/audit-state-snapshot-boundary.mjs",
  "tools/create-worktree-review-packet.mjs",
  "tools/audit-worktree-review-packet.mjs",
  "tools/create-release-review-bundle.mjs",
  "tools/audit-release-review-bundle.mjs",
  "tools/audit-status-roadmap-sync.mjs",
  "tools/audit-superpowers-adapter.mjs",
  "tools/audit-source-first.mjs",
  "tools/audit-sync-status.mjs",
  "tools/audit-sync-strict-nonwriting.mjs",
  "tools/check-case.mjs",
  "tools/check-evidence-packet.mjs",
  "tools/review-evidence-packet.mjs",
  "tools/check-permissioned-case.mjs",
  "tools/check-proof-intake-record.mjs",
  "tools/proof-intake-from-owner-evidence.mjs",
  "tools/check-owner-proof-input-record.mjs",
  "tools/split-owner-proof-input-record.mjs",
  "tools/convert-owner-proof-input-issue.mjs",
  "tools/review-owner-proof-input-record.mjs",
  "tools/check-owner-evidence-submission-record.mjs",
  "tools/check-workspace.mjs",
  "tools/case-from-intake.mjs",
  "tools/case-from-record.mjs",
  "tools/create-cli-packet.mjs",
  "tools/create-ecosystem-resource-packet.mjs",
  "tools/create-first-loop-demo.mjs",
  "tools/create-gap-register.mjs",
  "tools/create-gap-closure-plan.mjs",
  "tools/create-gate-evidence-packet.mjs",
  "tools/create-gate-closure-readiness.mjs",
  "tools/create-gate-closure-review.mjs",
  "tools/create-framework-manifest.mjs",
  "tools/create-case-publication-packet.mjs",
  "tools/create-evidence-from-case.mjs",
  "tools/create-benchmark-packet.mjs",
  "tools/create-adoption-packet.mjs",
  "tools/audit-adoption-packet.mjs",
  "tools/create-gateboard.mjs",
  "tools/create-license-packet.mjs",
  "tools/create-mcp-resource-index.mjs",
  "tools/mcp-stdio-server.mjs",
  "tools/create-operator-runbook.mjs",
  "tools/create-owner-action-queue.mjs",
  "tools/create-owner-issue-queue.mjs",
  "tools/create-owner-issue-remote-sync.mjs",
  "tools/create-owner-decision-intake.mjs",
  "tools/create-owner-decision-answer-record.mjs",
  "tools/review-owner-decision-answer-record.mjs",
  "tools/create-owner-proof-handoff.mjs",
  "tools/create-owner-proof-input-issue-packet.mjs",
  "tools/create-owner-proof-input-request.mjs",
  "tools/create-owner-proof-input-remote-issue-anchor.mjs",
  "tools/create-owner-proof-input-remote-issue-snapshot.mjs",
  "tools/export-owner-proof-input-remote-issue.mjs",
  "tools/create-owner-proof-input-template.mjs",
  "tools/create-owner-evidence-attachment-form.mjs",
  "tools/create-owner-evidence-submission-record.mjs",
  "tools/create-owner-evidence-bundle.mjs",
  "tools/create-owner-evidence-intake-record.mjs",
  "tools/review-owner-evidence-intake-record.mjs",
  "tools/create-current-state-summary.mjs",
  "tools/create-plugin-install-packet.mjs",
  "tools/create-plugin-release-packet.mjs",
  "tools/create-public-claim-pack.mjs",
  "tools/create-claim-from-evidence.mjs",
  "tools/create-proof-intake-kit.mjs",
  "tools/create-proof-intake-record.mjs",
  "tools/create-proof-redaction-packet.mjs",
  "tools/create-proof-submission-packet.mjs",
  "tools/create-proof-acceptance-packet.mjs",
  "tools/create-proof-candidate-packet.mjs",
  "tools/create-proof-readiness-packet.mjs",
  "tools/create-proof-run-packet.mjs",
  "tools/create-proof-execution-report.mjs",
  "tools/create-proof-packet.mjs",
  "tools/create-publish-handoff-packet.mjs",
  "tools/create-reference-pack-index.mjs",
  "tools/create-release-decision-record.mjs",
  "tools/create-release-artifact-manifest.mjs",
  "tools/create-release-evidence-report.mjs",
  "tools/create-publication-evidence-packet.mjs",
  "tools/create-release-execution-packet.mjs",
  "tools/create-publication-packet.mjs",
  "tools/init-mimesis.mjs",
  "tools/start-case.mjs",
  "tools/validate-mimesis.mjs",
  ".mimesis/adapter-packets/claude-code.md",
  ".mimesis/adapter-packets/gemini-cli.md",
  ".mimesis/adapter-packets/superpowers.md",
];

const readmeSections = [
  "# Mimesis Engineering",
  "## Understand In 30 Seconds",
  "## Bring One Weak Artifact",
  "## The Seven Artifacts",
  "## 5-Minute First Loop",
  "## Framework v0.1",
  "## The MIMESIS Loop",
  "## The Boundary",
  "## Casebook",
  "## Reference Packs",
  "## Examples",
  "## Contribute",
];

const corePhrases = [
  "Give AI standards, not roles.",
  "Bring one weak artifact.",
  "Weak Mimesis copies surface.",
  "Strong Mimesis extracts structure.",
  "No proof, no claim.",
];

const claimRiskPatterns = [
  /\bis proven\b/i,
  /\bindustry standard\b/i,
  /\bbenchmarked productivity\b/i,
  /\bexternal adoption\b/i,
  /\bshipped plugins?\b/i,
  /\bverified integrations?\b/i,
  /\bcustomer outcome proof\b/i,
  /\blegal originality guarantee\b/i,
  /\bguarantees? originality\b/i,
];

const boundaryMarkers = [
  "does not",
  "do not",
  "not ",
  "not yet",
  "not claim",
  "not allowed",
  "not safe",
  "not prove",
  "not evidence",
  "not shipped",
  "not verified",
  "not benchmarked",
  "not guaranteed",
  "no ",
  "without",
  "unsafe",
  "forbidden",
  "boundary",
  "claims not allowed",
  "limits",
  "unproven",
  "remain",
  "remaining",
  "claim-risk",
];

function relPath(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, "/");
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, results);
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

function pass(message) {
  passes.push(message);
}

function fail(message) {
  failures.push(message);
}

for (const filePath of requiredPaths) {
  if (!exists(filePath)) {
    fail(`missing required file: ${filePath}`);
  }
}
if (!failures.some((item) => item.startsWith("missing required file"))) {
  pass(`required files present: ${requiredPaths.length}`);
}

const readme = exists("README.md") ? read("README.md") : "";
let lastIndex = -1;
for (const section of readmeSections) {
  const index = readme.indexOf(section);
  if (index < 0) {
    fail(`README missing section: ${section}`);
  } else if (index <= lastIndex) {
    fail(`README section out of order: ${section}`);
  }
  lastIndex = index;
}
if (!failures.some((item) => item.startsWith("README"))) {
  pass(`README sections present and ordered: ${readmeSections.length}`);
}

const specText = exists("spec/mimesis-v0.1.md") ? read("spec/mimesis-v0.1.md") : "";
for (const phrase of corePhrases) {
  if (!readme.includes(phrase) && !specText.includes(phrase)) {
    fail(`missing core phrase: ${phrase}`);
  }
}
if (!failures.some((item) => item.startsWith("missing core phrase"))) {
  pass(`core phrases present: ${corePhrases.length}`);
}

const mimesisFiles = fs
  .readdirSync(path.join(root, ".mimesis"))
  .filter((name) => name.endsWith(".md"));
for (const file of mimesisFiles) {
  const content = read(path.join(".mimesis", file));
  if (content.includes("TBD")) {
    fail(`.mimesis file still contains TBD: ${file}`);
  }
}
if (!failures.some((item) => item.startsWith(".mimesis file"))) {
  pass(`.mimesis files have no TBD placeholders: ${mimesisFiles.length}`);
}

for (const folder of ["adapters", "plugins"]) {
  const files = fs
    .readdirSync(path.join(root, folder))
    .filter((name) => name.endsWith(".md") && name !== "README.md" && name !== "status.md");
  for (const file of files) {
    const content = read(path.join(folder, file));
    if (!content.includes("Status: `")) {
      fail(`${folder}/${file} missing status label`);
    }
  }
  pass(`${folder} status labels checked: ${files.length}`);
}

const issueDir = path.join(root, ".github", "ISSUE_TEMPLATE");
const issueForms = fs.existsSync(issueDir)
  ? fs.readdirSync(issueDir).filter((name) => name.endsWith(".yml"))
  : [];
for (const form of issueForms) {
  const content = fs.readFileSync(path.join(issueDir, form), "utf8");
  for (const key of ["name:", "description:", "title:", "labels:", "body:"]) {
    if (!content.includes(key)) {
      fail(`${form} missing ${key}`);
    }
  }
  if (!content.includes("- type:") || !content.includes("attributes:")) {
    fail(`${form} missing issue form body structure`);
  }
}
if (issueForms.length === 0) {
  fail("no GitHub issue forms found");
} else if (!failures.some((item) => item.includes(".yml") || item.endsWith("issue form body structure"))) {
  pass(`issue forms basic schema checked: ${issueForms.length}`);
}

const markdownFiles = walk(root).filter((file) => file.endsWith(".md"));
const linkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g;
let checkedLinks = 0;
for (const file of markdownFiles) {
  const content = fs.readFileSync(file, "utf8");
  for (const match of content.matchAll(linkPattern)) {
    let target = match[1].trim();
    if (
      !target ||
      target.startsWith("#") ||
      target.startsWith("http://") ||
      target.startsWith("https://") ||
      target.startsWith("mailto:")
    ) {
      continue;
    }
    if (target.startsWith("<") && target.endsWith(">")) {
      target = target.slice(1, -1);
    }
    target = target.split("#", 1)[0];
    if (!target || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(target)) {
      continue;
    }
    checkedLinks += 1;
    const resolved = path.resolve(path.dirname(file), target);
    if (!fs.existsSync(resolved)) {
      fail(`broken local link: ${relPath(file)} -> ${target}`);
    }
  }
}
if (!failures.some((item) => item.startsWith("broken local link"))) {
  pass(`local markdown links checked: ${checkedLinks}`);
}

let checkedClaimLines = 0;
for (const file of markdownFiles) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const matched = claimRiskPatterns.some((pattern) => pattern.test(line));
    if (!matched) {
      continue;
    }
    checkedClaimLines += 1;
    const context = lines
      .slice(Math.max(0, index - 5), Math.min(lines.length, index + 3))
      .join(" ")
      .toLowerCase();
    const isBoundaryContext = boundaryMarkers.some((marker) => context.includes(marker));
    if (!isBoundaryContext) {
      fail(`claim-risk phrase without nearby boundary: ${relPath(file)}:${index + 1}`);
    }
  }
}
if (!failures.some((item) => item.startsWith("claim-risk phrase"))) {
  pass(`claim-risk lines checked with boundary context: ${checkedClaimLines}`);
}

const caseDir = path.join(root, "cases");
const caseFiles = fs
  .readdirSync(caseDir)
  .filter((name) => name.endsWith(".md") && name !== "README.md");
for (const file of caseFiles) {
  const content = fs.readFileSync(path.join(caseDir, file), "utf8");
  const hasChangeSignal = /(Before|After|Transformation|Shift|Repair|Starting Artifact|Failure Pattern|What Changed)/i.test(
    content,
  );
  const hasBoundarySignal = /(Boundary|What Remains Unproven|not proof|proof boundary|claim boundary|unproven)/i.test(
    content,
  );
  if (!hasChangeSignal) {
    fail(`case missing change signal: cases/${file}`);
  }
  if (!hasBoundarySignal) {
    fail(`case missing boundary signal: cases/${file}`);
  }
}
if (!failures.some((item) => item.startsWith("case missing"))) {
  pass(`case files checked for change and boundary signals: ${caseFiles.length}`);
}

for (const message of passes) {
  console.log(`[ok] ${message}`);
}

if (failures.length) {
  console.error("\nMimesis validation failed:");
  for (const message of failures) {
    console.error(`[fail] ${message}`);
  }
  process.exit(1);
}

console.log("\nMimesis validation passed.");

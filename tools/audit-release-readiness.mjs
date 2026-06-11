#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const requiredReadyFiles = [
  "README.md",
  "STATUS.md",
  "ROADMAP.md",
  "PROOF-BOUNDARY.md",
  "action.yml",
  "docs/LICENSE-DECISION.md",
  "docs/ACTIVATION-SURFACE.md",
  "docs/FRAMEWORK-MANIFEST.md",
  "docs/FRAMEWORK-MANIFEST-SCHEMA.md",
  "docs/FIRST-LOOP-DEMO.md",
  "docs/FIRST-PROOF-CANDIDATE-PACKET.md",
  "docs/PROOF-REDACTION-PACKET.md",
  "docs/PROOF-SUBMISSION-PACKET.md",
  "docs/PROOF-ACCEPTANCE-PACKET.md",
  "docs/LICENSE-PACKET.md",
  "docs/OPERATOR-RUNBOOK.md",
  "docs/BENCHMARK-PACKET.md",
  "docs/V0.1-RELEASE-PACKET.md",
  "docs/V0.2-PROOF-QUEUE.md",
  "docs/FIRST-PROOF-PACKET.md",
  "docs/PROOF-INTAKE-KIT.md",
  "docs/PROOF-INTAKE-CHECK.md",
  "docs/PROOF-INTAKE-RECORD.md",
  "docs/PROOF-INTAKE-SCHEMA.md",
  "docs/PROOF-READINESS-PACKET.md",
  "docs/PROOF-RUN-PACKET.md",
  "docs/PROOF-EXECUTION-REPORT.md",
  "docs/PROOF-RUN-DRY-AUDIT.md",
  "docs/COMPLETION-AUDIT.md",
  "docs/GAP-REGISTER.md",
  "docs/GAP-CLOSURE-PLAN.md",
  "docs/GATE-EVIDENCE-PACKET.md",
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
  "docs/REMOTE-ECOSYSTEM-AUDIT.md",
  "docs/ECOSYSTEM-RESOURCE-PACKET.md",
  "docs/SECRET-SAFETY-GATE.md",
  "docs/STATUS-ROADMAP-SYNC.md",
  "docs/RELEASE-DECISION-RECORD.md",
  "docs/RELEASE-ARTIFACT-MANIFEST.md",
  "docs/RELEASE-EVIDENCE-REPORT.md",
  "docs/OWNER-ACTION-QUEUE.md",
  "docs/OWNER-PROOF-HANDOFF.md",
  "docs/OWNER-PROOF-INPUT.md",
  "docs/OWNER-PROOF-INPUT-SPLIT.md",
  "docs/OWNER-DECISION-INTAKE.md",
  "docs/OWNER-DECISION-ANSWER-RECORD.md",
  "docs/OWNER-ANSWER-REVIEW.md",
  "docs/OWNER-EVIDENCE-ATTACHMENT-FORM.md",
  "docs/OWNER-EVIDENCE-SUBMISSION-RECORD.md",
  "docs/OWNER-EVIDENCE-BUNDLE.md",
  "docs/OWNER-EVIDENCE-INTAKE-RECORD.md",
  "docs/OWNER-EVIDENCE-REVIEW.md",
  "docs/CURRENT-STATE-SUMMARY.md",
  "docs/WORKTREE-REVIEW-PACKET.md",
  "docs/RELEASE-REVIEW-BUNDLE.md",
  "docs/RELEASE-EXECUTION-PACKET.md",
  "docs/RELEASE-CHECK-ORDER.md",
  ".github/actions/release-check/action.yml",
  ".github/ISSUE_TEMPLATE/permissioned-external-case.yml",
  "tools/validate-mimesis.mjs",
  "tools/check-case.mjs",
  "tools/check-permissioned-case.mjs",
  "tools/check-workspace.mjs",
  "tools/case-from-intake.mjs",
  "tools/case-from-record.mjs",
  "tools/check-evidence-packet.mjs",
  "tools/create-evidence-from-case.mjs",
  "tools/review-evidence-packet.mjs",
  "tools/audit-first-loop-demo.mjs",
  "tools/audit-gap-register.mjs",
  "tools/audit-gap-closure-plan.mjs",
  "tools/audit-gate-evidence-packet.mjs",
  "tools/audit-framework-manifest.mjs",
  "tools/audit-framework-manifest-schema.mjs",
  "tools/start-case.mjs",
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
  "tools/audit-evidence-packet.mjs",
  "tools/audit-evidence-from-case.mjs",
  "tools/audit-evidence-review.mjs",
  "tools/audit-gateboard.mjs",
  "tools/audit-plugins.mjs",
  "tools/audit-proof-intake-kit.mjs",
  "tools/audit-proof-intake-check.mjs",
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
  "tools/audit-publication-packet.mjs",
  "tools/audit-reference-pack-index.mjs",
  "tools/audit-release-decision-record.mjs",
  "tools/audit-release-evidence-report.mjs",
  "tools/audit-owner-decision-intake.mjs",
  "tools/audit-owner-proof-handoff.mjs",
  "tools/audit-owner-proof-input.mjs",
  "tools/audit-owner-proof-input-split.mjs",
  "tools/audit-owner-decision-answer-record.mjs",
  "tools/audit-owner-answer-review.mjs",
  "tools/audit-owner-evidence-attachment-form.mjs",
  "tools/audit-owner-evidence-submission-record.mjs",
  "tools/audit-owner-evidence-bundle.mjs",
  "tools/audit-owner-evidence-intake-record.mjs",
  "tools/audit-owner-evidence-review.mjs",
  "tools/audit-release-artifact-manifest.mjs",
  "tools/audit-issue-forms.mjs",
  "tools/audit-source-first.mjs",
  "tools/audit-remote-ecosystem.mjs",
  "tools/audit-release-execution-packet.mjs",
  "tools/audit-release-check-order.mjs",
  "tools/audit-secret-safety.mjs",
  "tools/audit-spec-index.mjs",
  "tools/audit-current-state-summary.mjs",
  "tools/audit-worktree-review-packet.mjs",
  "tools/audit-release-review-bundle.mjs",
  "tools/audit-status-roadmap-sync.mjs",
  "tools/audit-sync-status.mjs",
  "tools/audit-remote-fallback.mjs",
  "tools/audit-license.mjs",
  "tools/audit-license-packet.mjs",
  "tools/audit-mcp-stdio-runtime.mjs",
  "tools/audit-mcp-server-scaffold.mjs",
  "tools/audit-operator-runbook.mjs",
  "tools/audit-package-surface.mjs",
  "tools/audit-permissioned-case-check.mjs",
  "tools/audit-permissioned-fixture.mjs",
  "tools/audit-plugin-install-packet.mjs",
  "tools/audit-plugin-release-packet.mjs",
  "tools/audit-publish-handoff-packet.mjs",
  "tools/audit-ecosystem.mjs",
  "tools/audit-ecosystem-resource-packet.mjs",
  "tools/create-publication-packet.mjs",
  "tools/create-ecosystem-resource-packet.mjs",
  "tools/create-first-loop-demo.mjs",
  "tools/create-gap-register.mjs",
  "tools/create-gap-closure-plan.mjs",
  "tools/create-gate-evidence-packet.mjs",
  "tools/create-framework-manifest.mjs",
  "tools/create-case-publication-packet.mjs",
  "tools/create-benchmark-packet.mjs",
  "tools/create-gateboard.mjs",
  "tools/create-license-packet.mjs",
  "tools/create-mcp-resource-index.mjs",
  "tools/mcp-stdio-server.mjs",
  "tools/create-operator-runbook.mjs",
  "tools/create-plugin-install-packet.mjs",
  "tools/create-plugin-release-packet.mjs",
  "tools/create-public-claim-pack.mjs",
  "tools/create-claim-from-evidence.mjs",
  "tools/create-proof-intake-kit.mjs",
  "tools/check-proof-intake-record.mjs",
  "tools/create-proof-redaction-packet.mjs",
  "tools/create-proof-submission-packet.mjs",
  "tools/create-proof-acceptance-packet.mjs",
  "tools/create-proof-candidate-packet.mjs",
  "tools/create-proof-intake-record.mjs",
  "tools/create-proof-readiness-packet.mjs",
  "tools/create-proof-run-packet.mjs",
  "tools/create-proof-execution-report.mjs",
  "tools/create-publish-handoff-packet.mjs",
  "tools/create-reference-pack-index.mjs",
  "tools/create-release-decision-record.mjs",
  "tools/create-release-evidence-report.mjs",
  "tools/create-owner-action-queue.mjs",
  "tools/create-owner-proof-handoff.mjs",
  "tools/create-owner-proof-input-template.mjs",
  "tools/check-owner-proof-input-record.mjs",
  "tools/split-owner-proof-input-record.mjs",
  "tools/create-owner-decision-intake.mjs",
  "tools/create-owner-decision-answer-record.mjs",
  "tools/review-owner-decision-answer-record.mjs",
  "tools/create-owner-evidence-attachment-form.mjs",
  "tools/create-owner-evidence-submission-record.mjs",
  "tools/review-owner-evidence-intake-record.mjs",
  "tools/create-release-artifact-manifest.mjs",
  "tools/create-owner-evidence-intake-record.mjs",
  "tools/create-release-execution-packet.mjs",
  "tools/create-current-state-summary.mjs",
  "tools/create-worktree-review-packet.mjs",
  "tools/create-release-review-bundle.mjs",
  "tools/create-proof-packet.mjs",
  "bin/mimesis.mjs",
  "examples/permissioned-case-intake.md",
  "examples/weak-readme.md",
  ".mimesis/first-loop-demo/README.md",
  ".mimesis/first-loop-demo/.mimesis/case-proof.md",
  "plugins/mimesis-codex/.codex-plugin/plugin.json",
  "plugins/mimesis-codex/README.md",
  "plugins/mimesis-codex/skills/mimesis-loop/SKILL.md",
  "plugins/mimesis-mcp/manifest.json",
  "plugins/mimesis-mcp/resources.json",
  "plugins/mimesis-mcp/tools.json",
  "plugins/mimesis-mcp/README.md",
  "spec/framework-manifest.schema.json",
  "spec/current-state-summary.schema.json",
  "spec/worktree-review-packet.schema.json",
  "spec/release-review-bundle.schema.json",
  "spec/proof-intake.schema.json",
  "spec/owner-decision-answer.schema.json",
  "spec/owner-evidence-intake.schema.json",
  "spec/owner-evidence-submission.schema.json",
  "spec/owner-proof-input.schema.json",
  "package.json",
  ".mimesis/framework-manifest.json",
  ".mimesis/publication-packets/v0.1.md",
  ".mimesis/proof-packets/v0.2-first-proof.md",
  ".mimesis/proof-intake/first-external-proof-kit.md",
  ".mimesis/proof-intake/fixture-check.md",
  ".mimesis/proof-intake/fixture-record.json",
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
  ".mimesis/gaps/current-gap-register.json",
  ".mimesis/gaps/closure-plan.json",
  ".mimesis/operator-runbooks/current-runbook.md",
  ".mimesis/owner-actions/current-action-queue.md",
  ".mimesis/owner-actions/proof-input-template.json",
  ".mimesis/owner-actions/fixture-proof-input-check.md",
  ".mimesis/owner-actions/proof-input-split-report.md",
  ".mimesis/owner-actions/decision-intake.md",
  ".mimesis/owner-actions/fixture-answer-record.json",
  ".mimesis/owner-actions/answer-review.md",
  ".mimesis/owner-actions/evidence-bundle.md",
  ".mimesis/owner-actions/fixture-evidence-record.json",
  ".mimesis/ecosystem-resources/current-resource-packet.md",
  ".mimesis/benchmark-packets/v0.2-first-benchmark.md",
  ".mimesis/release-decisions/owner-decision-record.json",
  ".mimesis/release-evidence/v0.1-report.md",
  ".mimesis/release-artifacts/v0.1-manifest.json",
  ".mimesis/state/current-state.json",
  ".mimesis/worktree/review-packet.json",
  ".mimesis/release-review/v0.1-bundle.json",
  ".mimesis/release-execution/v0.1-owner-handoff.md",
  ".mimesis/security/secret-safety-report.md",
  ".mimesis/reference-packs/index.json",
  ".mimesis/mcp/resource-index.json",
  ".mimesis/sync-status.md",
  ".mimesis/run_ledger.md",
];

const requiredExplicitGaps = [
  "user-submitted external case",
  "license",
  "shipped plugins",
  "benchmarked productivity",
];

const failures = [];

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

for (const file of requiredReadyFiles) {
  read(file);
}

const status = read("STATUS.md").toLowerCase();
const roadmap = read("ROADMAP.md").toLowerCase();
const ledger = read(".mimesis/run_ledger.md").toLowerCase();
const combined = `${status}\n${roadmap}\n${ledger}`;

for (const gap of requiredExplicitGaps) {
  if (!combined.includes(gap)) {
    failures.push(`missing explicit remaining-gap language: ${gap}`);
  }
}

if (!/public working framework/i.test(read("STATUS.md"))) {
  failures.push("STATUS.md must state current working-framework status");
}

if (!/owner decision required/i.test(read("docs/LICENSE-DECISION.md"))) {
  failures.push("license decision must remain owner-gated");
}

if (!/permission/i.test(read("docs/PERMISSIONED-CASE-PACKET.md"))) {
  failures.push("permissioned case packet must mention permission");
}

if (!/permissioned external case/i.test(read("docs/PERMISSIONED-CASE-CHECK.md"))) {
  failures.push("permissioned case check doc must describe permissioned external case review");
}

const permissionedFixture = read("docs/PERMISSIONED-CASE-FIXTURE.md");
if (!/does not create external proof/i.test(permissionedFixture)) {
  failures.push("permissioned fixture doc must keep proof-creation boundary visible");
}

if (!/not a real submitter artifact/i.test(permissionedFixture)) {
  failures.push("permissioned fixture doc must keep submitter boundary visible");
}

if (!/redaction/i.test(read(".github/ISSUE_TEMPLATE/permissioned-external-case.yml"))) {
  failures.push("permissioned external case form must mention redaction");
}

if (!/publication decision/i.test(read("docs/CASE-REVIEW-CHECKLIST.md"))) {
  failures.push("case review checklist must include a publication decision section");
}

const packageJson = read("package.json");
if (!/"release:check"/.test(packageJson)) {
  failures.push("package.json must expose npm run release:check");
}

if (!/"cli"/.test(packageJson)) {
  failures.push("package.json must expose npm run cli");
}

if (!/"audit:cli"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:cli");
}

if (!/"audit:activation"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:activation");
}

if (!/"workspace:check"/.test(packageJson)) {
  failures.push("package.json must expose npm run workspace:check");
}

if (!/"case:start"/.test(packageJson)) {
  failures.push("package.json must expose npm run case:start");
}

if (!/"case:check"/.test(packageJson)) {
  failures.push("package.json must expose npm run case:check");
}

if (!/"audit:case-start"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:case-start");
}

if (!/"audit:case-check"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:case-check");
}

if (!/"case:review"/.test(packageJson)) {
  failures.push("package.json must expose npm run case:review");
}

if (!/"case:from-intake"/.test(packageJson)) {
  failures.push("package.json must expose npm run case:from-intake");
}

if (!/"case:from-record"/.test(packageJson)) {
  failures.push("package.json must expose npm run case:from-record");
}

if (!/"case:publish-packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run case:publish-packet");
}

if (!/"audit:permissioned-case"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:permissioned-case");
}

if (!/"audit:permissioned-fixture"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:permissioned-fixture");
}

if (!/"audit:case-from-intake"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:case-from-intake");
}

if (!/"audit:case-from-record"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:case-from-record");
}

if (!/"audit:case-publication"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:case-publication");
}

if (!/"evidence:check"/.test(packageJson)) {
  failures.push("package.json must expose npm run evidence:check");
}

if (!/"first-loop:demo"/.test(packageJson)) {
  failures.push("package.json must expose npm run first-loop:demo");
}

if (!/"audit:first-loop"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:first-loop");
}

if (!/"framework:manifest"/.test(packageJson)) {
  failures.push("package.json must expose npm run framework:manifest");
}

if (!/"audit:framework-manifest"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:framework-manifest");
}

if (!/"audit:framework-manifest-schema"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:framework-manifest-schema");
}

if (!/"reference:index"/.test(packageJson)) {
  failures.push("package.json must expose npm run reference:index");
}

if (!/"audit:reference-index"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:reference-index");
}

if (!/"gate:board"/.test(packageJson)) {
  failures.push("package.json must expose npm run gate:board");
}

if (!/"gap:register"/.test(packageJson)) {
  failures.push("package.json must expose npm run gap:register");
}

if (!/"audit:gap-register"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:gap-register");
}

if (!/"gap:closure-plan"/.test(packageJson)) {
  failures.push("package.json must expose npm run gap:closure-plan");
}

if (!/"audit:gap-closure-plan"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:gap-closure-plan");
}

if (!/"audit:gateboard"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:gateboard");
}

if (!/"gate:evidence-packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run gate:evidence-packet");
}

if (!/"audit:gate-evidence-packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:gate-evidence-packet");
}

if (!/"operator:runbook"/.test(packageJson)) {
  failures.push("package.json must expose npm run operator:runbook");
}

if (!/"audit:operator-runbook"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:operator-runbook");
}

if (!/"ecosystem:resources"/.test(packageJson)) {
  failures.push("package.json must expose npm run ecosystem:resources");
}

if (!/"audit:ecosystem-resources"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:ecosystem-resources");
}

if (!/"audit:evidence"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:evidence");
}

if (!/"evidence:from-case"/.test(packageJson)) {
  failures.push("package.json must expose npm run evidence:from-case");
}

if (!/"audit:evidence-from-case"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:evidence-from-case");
}

if (!/"evidence:review"/.test(packageJson)) {
  failures.push("package.json must expose npm run evidence:review");
}

if (!/"audit:evidence-review"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:evidence-review");
}

if (!/"audit:proof-queue"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:proof-queue");
}

if (!/"benchmark:packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run benchmark:packet");
}

if (!/"audit:benchmark-packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:benchmark-packet");
}

if (!/"proof:intake"/.test(packageJson)) {
  failures.push("package.json must expose npm run proof:intake");
}

if (!/"proof:intake-record"/.test(packageJson)) {
  failures.push("package.json must expose npm run proof:intake-record");
}

if (!/"proof:intake-check"/.test(packageJson)) {
  failures.push("package.json must expose npm run proof:intake-check");
}

if (!/"audit:proof-intake"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:proof-intake");
}

if (!/"audit:proof-intake-record"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:proof-intake-record");
}

if (!/"audit:proof-intake-check"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:proof-intake-check");
}

if (!/"audit:proof-intake-schema"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:proof-intake-schema");
}

if (!/"proof:run-packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run proof:run-packet");
}

if (!/"proof:execution-report"/.test(packageJson)) {
  failures.push("package.json must expose npm run proof:execution-report");
}

if (!/"proof:candidate-packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run proof:candidate-packet");
}

if (!/"proof:redaction-packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run proof:redaction-packet");
}

if (!/"proof:submission-packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run proof:submission-packet");
}

if (!/"proof:acceptance-packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run proof:acceptance-packet");
}

if (!/"audit:proof-run"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:proof-run");
}

if (!/"audit:proof-execution-report"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:proof-execution-report");
}

if (!/"audit:proof-candidate-packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:proof-candidate-packet");
}

if (!/"audit:proof-redaction-packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:proof-redaction-packet");
}

if (!/"audit:proof-submission-packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:proof-submission-packet");
}

if (!/"audit:proof-acceptance-packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:proof-acceptance-packet");
}

if (!/"audit:proof-run-dry"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:proof-run-dry");
}

if (!/"proof:packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run proof:packet");
}

if (!/"audit:proof-packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:proof-packet");
}

if (!/"license:packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run license:packet");
}

if (!/"audit:license-packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:license-packet");
}

if (!/"mcp:resources"/.test(packageJson)) {
  failures.push("package.json must expose npm run mcp:resources");
}

if (!/"mcp:serve"/.test(packageJson)) {
  failures.push("package.json must expose npm run mcp:serve");
}

if (!/"audit:mcp-server"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:mcp-server");
}

if (!/"audit:mcp-stdio"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:mcp-stdio");
}

if (!/"plugin:packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run plugin:packet");
}

if (!/"audit:plugin-packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:plugin-packet");
}

if (!/"audit:codex-plugin"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:codex-plugin");
}

if (!/"claim:pack"/.test(packageJson)) {
  failures.push("package.json must expose npm run claim:pack");
}

if (!/"audit:claim-pack"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:claim-pack");
}

if (!/"claim:from-evidence"/.test(packageJson)) {
  failures.push("package.json must expose npm run claim:from-evidence");
}

if (!/"audit:claim-from-evidence"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:claim-from-evidence");
}

if (!/"publish:packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run publish:packet");
}

if (!/"audit:publish-packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:publish-packet");
}

if (!/"release:execution-packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run release:execution-packet");
}

if (!/"release:artifact-manifest"/.test(packageJson)) {
  failures.push("package.json must expose npm run release:artifact-manifest");
}

if (!/"state:summary"/.test(packageJson)) {
  failures.push("package.json must expose npm run state:summary");
}

if (!/"worktree:packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run worktree:packet");
}

if (!/"release:review-bundle"/.test(packageJson)) {
  failures.push("package.json must expose npm run release:review-bundle");
}

if (!/"release:evidence-report"/.test(packageJson)) {
  failures.push("package.json must expose npm run release:evidence-report");
}

if (!/"owner:queue"/.test(packageJson)) {
  failures.push("package.json must expose npm run owner:queue");
}

if (!/"owner:proof-handoff"/.test(packageJson)) {
  failures.push("package.json must expose npm run owner:proof-handoff");
}

if (!/"owner:proof-input-template"/.test(packageJson)) {
  failures.push("package.json must expose npm run owner:proof-input-template");
}

if (!/"owner:proof-input-check"/.test(packageJson)) {
  failures.push("package.json must expose npm run owner:proof-input-check");
}

if (!/"owner:proof-input-split"/.test(packageJson)) {
  failures.push("package.json must expose npm run owner:proof-input-split");
}

if (!/"audit:owner-proof-input"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:owner-proof-input");
}

if (!/"audit:owner-proof-input-split"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:owner-proof-input-split");
}

if (!/"owner:decision-intake"/.test(packageJson)) {
  failures.push("package.json must expose npm run owner:decision-intake");
}

if (!/"owner:decision-answer-record"/.test(packageJson)) {
  failures.push("package.json must expose npm run owner:decision-answer-record");
}

if (!/"owner:answer-review"/.test(packageJson)) {
  failures.push("package.json must expose npm run owner:answer-review");
}

if (!/"owner:evidence-attachment-form"/.test(packageJson)) {
  failures.push("package.json must expose npm run owner:evidence-attachment-form");
}

if (!/"owner:evidence-submission-record"/.test(packageJson)) {
  failures.push("package.json must expose npm run owner:evidence-submission-record");
}

if (!/"owner:evidence-submission-check"/.test(packageJson)) {
  failures.push("package.json must expose npm run owner:evidence-submission-check");
}

if (!/"owner:evidence-bundle"/.test(packageJson)) {
  failures.push("package.json must expose npm run owner:evidence-bundle");
}

if (!/"owner:evidence-intake-record"/.test(packageJson)) {
  failures.push("package.json must expose npm run owner:evidence-intake-record");
}

if (!/"owner:evidence-review"/.test(packageJson)) {
  failures.push("package.json must expose npm run owner:evidence-review");
}

if (!/"audit:release-artifact-manifest"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:release-artifact-manifest");
}

if (!/"audit:release-evidence-report"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:release-evidence-report");
}

if (!/"audit:owner-queue"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:owner-queue");
}

if (!/"audit:owner-proof-handoff"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:owner-proof-handoff");
}

if (!/"audit:owner-decision-intake"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:owner-decision-intake");
}

if (!/"audit:owner-decision-answer-record"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:owner-decision-answer-record");
}

if (!/"audit:owner-answer-review"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:owner-answer-review");
}

if (!/"audit:owner-evidence-attachment-form"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:owner-evidence-attachment-form");
}

if (!/"audit:owner-evidence-submission-record"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:owner-evidence-submission-record");
}

if (!/"audit:owner-evidence-bundle"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:owner-evidence-bundle");
}

if (!/"audit:owner-evidence-intake-record"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:owner-evidence-intake-record");
}

if (!/"audit:owner-evidence-review"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:owner-evidence-review");
}

if (!/"audit:release-execution"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:release-execution");
}

if (!/"audit:release-order"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:release-order");
}

if (!/"audit:package"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:package");
}

if (!/"audit:action"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:action");
}

if (!/"release:check:workspace"/.test(packageJson)) {
  failures.push("package.json must expose npm run release:check:workspace");
}

if (!/"release:check:public"/.test(packageJson)) {
  failures.push("package.json must expose npm run release:check:public");
}

if (!/"release:check:public":\s*"[^"]*audit:remote-fallback/.test(packageJson)) {
  failures.push("release:check:public must include npm run audit:remote-fallback");
}

if (!/"release:ready:publish"/.test(packageJson)) {
  failures.push("package.json must expose npm run release:ready:publish");
}

if (!/"audit:remote"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:remote");
}

if (!/"audit:remote-fallback"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:remote-fallback");
}

if (!/"audit:secrets"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:secrets");
}

if (!/"audit:status-roadmap"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:status-roadmap");
}

if (!/"audit:spec-index"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:spec-index");
}

if (!/"audit:state-summary"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:state-summary");
}

if (!/"audit:worktree-packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:worktree-packet");
}

if (!/"audit:release-review-bundle"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:release-review-bundle");
}

if (!/"audit:sync"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:sync");
}

if (!/"audit:sync:strict"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:sync:strict");
}

const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
if (!/npm run release:check/.test(releasePacket)) {
  failures.push("release packet must name npm run release:check");
}

if (!/npm run release:packet/.test(releasePacket)) {
  failures.push("release packet must name npm run release:packet");
}

if (!/Not allowed/i.test(releasePacket)) {
  failures.push("release packet must include not-allowed claim boundaries");
}

if (!/Source-First Protocol/i.test(read("docs/SOURCE-FIRST-PROTOCOL.md"))) {
  failures.push("source-first protocol must be present");
}

if (!/5-minute first loop/i.test(read("docs/ACTIVATION-SURFACE.md"))) {
  failures.push("activation surface doc must preserve 5-minute first loop");
}

if (!/does not prove external adoption/i.test(read("docs/ACTIVATION-SURFACE.md"))) {
  failures.push("activation surface doc must keep external-adoption boundary visible");
}

if (!/"audit:sources"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:sources");
}

if (!/"audit:completion"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:completion");
}

if (!/"audit:completion-row-count"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:completion-row-count");
}

if (!/"release:packet"/.test(packageJson)) {
  failures.push("package.json must expose npm run release:packet");
}

if (!/"audit:publication"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:publication");
}

const releaseCheck = packageJson.match(/"release:check":\s*"([^"]+)"/)?.[1] ?? "";
if (!/audit:cli/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:cli");
}

if (!/audit:activation/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:activation");
}

if (!/workspace:check/.test(releaseCheck)) {
  failures.push("release:check must include npm run workspace:check");
}

if (!/audit:case-start/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:case-start");
}

if (!/audit:case-check/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:case-check");
}

if (!/case:check/.test(releaseCheck)) {
  failures.push("release:check must include npm run case:check");
}

if (!/audit:permissioned-case/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:permissioned-case");
}

if (!/audit:permissioned-fixture/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:permissioned-fixture");
}

if (!/audit:case-from-intake/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:case-from-intake");
}

if (!/audit:case-from-record/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:case-from-record");
}

if (!/case:publish-packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run case:publish-packet");
}

if (!/evidence:from-case/.test(releaseCheck)) {
  failures.push("release:check must include npm run evidence:from-case");
}

if (!/audit:case-publication/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:case-publication");
}

if (!/audit:evidence-from-case/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:evidence-from-case");
}

if (!/audit:evidence-review/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:evidence-review");
}

if (!/audit:evidence/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:evidence");
}

if (!/first-loop:demo/.test(releaseCheck)) {
  failures.push("release:check must include npm run first-loop:demo");
}

if (!/audit:first-loop/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:first-loop");
}

if (!/framework:manifest/.test(releaseCheck)) {
  failures.push("release:check must include npm run framework:manifest");
}

if (!/audit:framework-manifest/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:framework-manifest");
}

if (!/audit:framework-manifest-schema/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:framework-manifest-schema");
}

if (!/reference:index/.test(releaseCheck)) {
  failures.push("release:check must include npm run reference:index");
}

if (!/audit:reference-index/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:reference-index");
}

if (!/gate:board/.test(releaseCheck)) {
  failures.push("release:check must include npm run gate:board");
}

if (!/gap:register/.test(releaseCheck)) {
  failures.push("release:check must include npm run gap:register");
}

if (!/audit:gap-register/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:gap-register");
}

if (!/gap:closure-plan/.test(releaseCheck)) {
  failures.push("release:check must include npm run gap:closure-plan");
}

if (!/audit:gap-closure-plan/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:gap-closure-plan");
}

if (!/audit:gateboard/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:gateboard");
}

if (!/gate:evidence-packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run gate:evidence-packet");
}

if (!/audit:gate-evidence-packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:gate-evidence-packet");
}

if (!/operator:runbook/.test(releaseCheck)) {
  failures.push("release:check must include npm run operator:runbook");
}

if (!/audit:operator-runbook/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:operator-runbook");
}

if (!/ecosystem:resources/.test(releaseCheck)) {
  failures.push("release:check must include npm run ecosystem:resources");
}

if (!/audit:ecosystem-resources/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:ecosystem-resources");
}

if (!/audit:proof-queue/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:proof-queue");
}

if (!/benchmark:packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run benchmark:packet");
}

if (!/audit:benchmark-packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:benchmark-packet");
}

if (!/proof:intake/.test(releaseCheck)) {
  failures.push("release:check must include npm run proof:intake");
}

if (!/proof:intake-record/.test(releaseCheck)) {
  failures.push("release:check must include npm run proof:intake-record");
}

if (!/proof:intake-check/.test(releaseCheck)) {
  failures.push("release:check must include npm run proof:intake-check");
}

if (!/audit:proof-intake/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:proof-intake");
}

if (!/audit:proof-intake-record/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:proof-intake-record");
}

if (!/audit:proof-intake-check/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:proof-intake-check");
}

if (!/audit:proof-intake-schema/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:proof-intake-schema");
}

if (!/proof:run-packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run proof:run-packet");
}

if (!/proof:execution-report/.test(releaseCheck)) {
  failures.push("release:check must include npm run proof:execution-report");
}

if (!/proof:candidate-packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run proof:candidate-packet");
}

if (!/proof:redaction-packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run proof:redaction-packet");
}

if (!/proof:submission-packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run proof:submission-packet");
}

if (!/proof:acceptance-packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run proof:acceptance-packet");
}

if (!/audit:proof-run/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:proof-run");
}

if (!/audit:proof-execution-report/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:proof-execution-report");
}

if (!/audit:proof-candidate-packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:proof-candidate-packet");
}

if (!/audit:proof-redaction-packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:proof-redaction-packet");
}

if (!/audit:proof-submission-packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:proof-submission-packet");
}

if (!/audit:proof-acceptance-packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:proof-acceptance-packet");
}

if (!/audit:proof-run-dry/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:proof-run-dry");
}

if (!/proof:packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run proof:packet");
}

if (!/audit:proof-packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:proof-packet");
}

if (!/license:packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run license:packet");
}

if (!/audit:license-packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:license-packet");
}

if (!/mcp:resources/.test(releaseCheck)) {
  failures.push("release:check must include npm run mcp:resources");
}

if (!/audit:mcp-server/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:mcp-server");
}

if (!/audit:mcp-stdio/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:mcp-stdio");
}

if (!/plugin:packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run plugin:packet");
}

if (!/audit:plugin-packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:plugin-packet");
}

if (!/audit:codex-plugin/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:codex-plugin");
}

if (!/claim:pack/.test(releaseCheck)) {
  failures.push("release:check must include npm run claim:pack");
}

if (!/audit:claim-pack/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:claim-pack");
}

if (!/audit:claim-from-evidence/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:claim-from-evidence");
}

if (!/publish:packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run publish:packet");
}

if (!/audit:publish-packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:publish-packet");
}

if (!/release:execution-packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run release:execution-packet");
}

if (!/release:artifact-manifest/.test(releaseCheck)) {
  failures.push("release:check must include npm run release:artifact-manifest");
}

if (!/state:summary/.test(releaseCheck)) {
  failures.push("release:check must include npm run state:summary");
}

if (!/worktree:packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run worktree:packet");
}

if (!/release:review-bundle/.test(releaseCheck)) {
  failures.push("release:check must include npm run release:review-bundle");
}

if (!/release:evidence-report/.test(releaseCheck)) {
  failures.push("release:check must include npm run release:evidence-report");
}

if (!/owner:queue/.test(releaseCheck)) {
  failures.push("release:check must include npm run owner:queue");
}

if (!/owner:proof-handoff/.test(releaseCheck)) {
  failures.push("release:check must include npm run owner:proof-handoff");
}

if (!/owner:proof-input-template/.test(releaseCheck)) {
  failures.push("release:check must include npm run owner:proof-input-template");
}

if (!/owner:proof-input-check/.test(releaseCheck)) {
  failures.push("release:check must include npm run owner:proof-input-check");
}

if (!/owner:proof-input-split/.test(releaseCheck)) {
  failures.push("release:check must include npm run owner:proof-input-split");
}

if (!/owner:decision-intake/.test(releaseCheck)) {
  failures.push("release:check must include npm run owner:decision-intake");
}

if (!/owner:decision-answer-record/.test(releaseCheck)) {
  failures.push("release:check must include npm run owner:decision-answer-record");
}

if (!/owner:answer-review/.test(releaseCheck)) {
  failures.push("release:check must include npm run owner:answer-review");
}

if (!/owner:evidence-attachment-form/.test(releaseCheck)) {
  failures.push("release:check must include npm run owner:evidence-attachment-form");
}

if (!/owner:evidence-submission-record/.test(releaseCheck)) {
  failures.push("release:check must include npm run owner:evidence-submission-record");
}

if (!/owner:evidence-submission-check/.test(releaseCheck)) {
  failures.push("release:check must include npm run owner:evidence-submission-check");
}

if (!/owner:evidence-bundle/.test(releaseCheck)) {
  failures.push("release:check must include npm run owner:evidence-bundle");
}

if (!/owner:evidence-intake-record/.test(releaseCheck)) {
  failures.push("release:check must include npm run owner:evidence-intake-record");
}

if (!/owner:evidence-review/.test(releaseCheck)) {
  failures.push("release:check must include npm run owner:evidence-review");
}

if (!/audit:release-artifact-manifest/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:release-artifact-manifest");
}

if (!/audit:release-evidence-report/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:release-evidence-report");
}

if (!/audit:owner-queue/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:owner-queue");
}

if (!/audit:owner-proof-handoff/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:owner-proof-handoff");
}

if (!/audit:owner-proof-input/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:owner-proof-input");
}

if (!/audit:owner-proof-input-split/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:owner-proof-input-split");
}

if (!/audit:owner-decision-intake/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:owner-decision-intake");
}

if (!/audit:owner-decision-answer-record/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:owner-decision-answer-record");
}

if (!/audit:owner-answer-review/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:owner-answer-review");
}

if (!/audit:owner-evidence-attachment-form/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:owner-evidence-attachment-form");
}

if (!/audit:owner-evidence-submission-record/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:owner-evidence-submission-record");
}

if (!/audit:owner-evidence-bundle/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:owner-evidence-bundle");
}

if (!/audit:owner-evidence-intake-record/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:owner-evidence-intake-record");
}

if (!/audit:owner-evidence-review/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:owner-evidence-review");
}

if (!/audit:release-execution/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:release-execution");
}

if (!/audit:release-order/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:release-order");
}

if (!/audit:package/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:package");
}

if (!/audit:action/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:action");
}

if (!/release:packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run release:packet");
}

if (!/audit:sources/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:sources");
}

if (!/audit:secrets/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:secrets");
}

if (!/audit:status-roadmap/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:status-roadmap");
}

if (!/audit:spec-index/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:spec-index");
}

if (!/audit:state-summary/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:state-summary");
}

if (!/audit:worktree-packet/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:worktree-packet");
}

if (!/audit:release-review-bundle/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:release-review-bundle");
}

if (!/audit:completion/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:completion");
}

if (!/audit:completion-row-count/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:completion-row-count");
}

if (!/audit:publication/.test(releaseCheck)) {
  failures.push("release:check must include npm run audit:publication");
}

const localAction = read(".github/actions/release-check/action.yml");
if (!/using:\s*composite/i.test(localAction)) {
  failures.push("release-check action must be a composite action");
}

if (!/npm run release:check/.test(localAction)) {
  failures.push("release-check action must run npm run release:check");
}

const rootAction = read("action.yml");
if (!/workspace:check/.test(rootAction) || !/using:\s*composite/i.test(rootAction)) {
  failures.push("root action.yml must expose the workspace:check composite action candidate");
}

if (!/not an npm package release/i.test(read("docs/PACKAGE-RELEASE-CANDIDATE.md"))) {
  failures.push("package release-candidate doc must keep npm release boundary visible");
}

if (!/not a marketplace action/i.test(read("docs/ACTION-RELEASE-CANDIDATE.md"))) {
  failures.push("action release-candidate doc must keep marketplace boundary visible");
}

if (!/Case Status: started/.test(read("docs/CASE-START.md"))) {
  failures.push("case-start doc must keep started-case boundary visible");
}

if (!/completed case note/.test(read("docs/CASE-CHECK.md"))) {
  failures.push("case-check doc must describe completed case note boundary");
}

if (!/permissioned-case starter/i.test(read("docs/CASE-FROM-INTAKE.md"))) {
  failures.push("case-from-intake doc must describe permissioned-case starter boundary");
}

if (!/proof-intake-record starter/i.test(read("docs/CASE-FROM-RECORD.md"))) {
  failures.push("case-from-record doc must describe proof-intake-record starter boundary");
}

if (!/does not prove improvement/i.test(read("docs/CASE-FROM-RECORD.md"))) {
  failures.push("case-from-record doc must keep improvement-proof boundary visible");
}

if (!/does not publish/i.test(read("docs/CASE-PUBLICATION-PACKET.md"))) {
  failures.push("case publication packet doc must keep publication boundary visible");
}

if (!/does not create evidence/i.test(read("docs/EVIDENCE-PACKET.md"))) {
  failures.push("evidence packet doc must keep evidence-creation boundary visible");
}

if (!/does not mark the evidence as reviewed/i.test(read("docs/EVIDENCE-FROM-CASE.md"))) {
  failures.push("evidence-from-case doc must keep reviewed-evidence boundary visible");
}

if (!/does not prove external adoption/i.test(read("docs/EVIDENCE-FROM-CASE.md"))) {
  failures.push("evidence-from-case doc must keep external-adoption boundary visible");
}

if (!/does not create evidence/i.test(read("docs/EVIDENCE-REVIEW.md"))) {
  failures.push("evidence-review doc must keep evidence-creation boundary visible");
}

if (!/does not prove external adoption/i.test(read("docs/EVIDENCE-REVIEW.md"))) {
  failures.push("evidence-review doc must keep external-adoption boundary visible");
}

if (!/reviewed evidence packet/i.test(read("docs/CLAIM-FROM-EVIDENCE.md"))) {
  failures.push("claim-from-evidence doc must require reviewed evidence packet");
}

if (!/does not publish/i.test(read("docs/CLAIM-FROM-EVIDENCE.md"))) {
  failures.push("claim-from-evidence doc must keep publication boundary visible");
}

if (!/does not prove external adoption/i.test(read("docs/FIRST-LOOP-DEMO.md"))) {
  failures.push("first-loop demo doc must keep external-adoption boundary visible");
}

if (!/does not choose a license/i.test(read("docs/GATEBOARD.md"))) {
  failures.push("gate board doc must keep owner-decision boundary visible");
}

if (!/does not prove completion/i.test(read("docs/GAP-REGISTER.md"))) {
  failures.push("gap register doc must keep completion boundary visible");
}

if (!/does not create external proof/i.test(read("docs/GAP-REGISTER.md"))) {
  failures.push("gap register doc must keep proof-creation boundary visible");
}

if (!/does not close gates/i.test(read("docs/GAP-CLOSURE-PLAN.md"))) {
  failures.push("gap closure plan doc must keep non-closure boundary visible");
}

if (!/does not prove completion/i.test(read("docs/GAP-CLOSURE-PLAN.md"))) {
  failures.push("gap closure plan doc must keep completion boundary visible");
}

if (!/does not publish/i.test(read("docs/GAP-CLOSURE-PLAN.md"))) {
  failures.push("gap closure plan doc must keep publication boundary visible");
}

if (!/does not create external proof/i.test(read("docs/GAP-CLOSURE-PLAN.md"))) {
  failures.push("gap closure plan doc must keep proof-creation boundary visible");
}

if (!/does not create evidence/i.test(read("docs/GATE-EVIDENCE-PACKET.md"))) {
  failures.push("gate evidence packet doc must keep evidence-creation boundary visible");
}

if (!/does not close gates/i.test(read("docs/GATE-EVIDENCE-PACKET.md"))) {
  failures.push("gate evidence packet doc must keep non-closure boundary visible");
}

if (!/does not prove completion/i.test(read("docs/GATE-EVIDENCE-PACKET.md"))) {
  failures.push("gate evidence packet doc must keep completion boundary visible");
}

if (!/No permissioned external weak artifact has been submitted yet/i.test(read("docs/V0.2-PROOF-QUEUE.md"))) {
  failures.push("v0.2 proof queue must keep missing external proof visible");
}

if (!/does not create external proof/i.test(read("docs/FIRST-PROOF-PACKET.md"))) {
  failures.push("first proof packet doc must keep proof-creation boundary visible");
}

if (!/does not create external proof/i.test(read("docs/PROOF-INTAKE-KIT.md"))) {
  failures.push("proof intake kit doc must keep proof-creation boundary visible");
}

if (!/not a real submitter artifact/i.test(read("docs/PROOF-INTAKE-RECORD.md"))) {
  failures.push("proof intake record doc must keep fixture boundary visible");
}

if (!/does not create external proof/i.test(read("docs/PROOF-INTAKE-RECORD.md"))) {
  failures.push("proof intake record doc must keep proof-creation boundary visible");
}

if (!/proof intake check/i.test(read("docs/PROOF-INTAKE-CHECK.md"))) {
  failures.push("proof intake check doc must describe the proof intake check");
}

if (!/does not create external proof/i.test(read("docs/PROOF-INTAKE-CHECK.md"))) {
  failures.push("proof intake check doc must keep proof-creation boundary visible");
}

if (!/does not grant permission/i.test(read("docs/PROOF-INTAKE-CHECK.md"))) {
  failures.push("proof intake check doc must keep permission boundary visible");
}

if (!/does not create external proof/i.test(read("docs/FIRST-PROOF-CANDIDATE-PACKET.md"))) {
  failures.push("first proof candidate packet doc must keep proof-creation boundary visible");
}

if (!/does not select a candidate/i.test(read("docs/FIRST-PROOF-CANDIDATE-PACKET.md"))) {
  failures.push("first proof candidate packet doc must keep candidate-selection boundary visible");
}

if (!/does not redact files/i.test(read("docs/PROOF-REDACTION-PACKET.md"))) {
  failures.push("proof redaction packet doc must keep no-redaction boundary visible");
}

if (!/does not guarantee complete private-data removal/i.test(read("docs/PROOF-REDACTION-PACKET.md"))) {
  failures.push("proof redaction packet doc must keep private-data boundary visible");
}

if (!/does not submit an artifact/i.test(read("docs/PROOF-SUBMISSION-PACKET.md"))) {
  failures.push("proof submission packet doc must keep not-submitted boundary visible");
}

if (!/does not create external proof/i.test(read("docs/PROOF-SUBMISSION-PACKET.md"))) {
  failures.push("proof submission packet doc must keep proof-creation boundary visible");
}

if (!/does not accept an artifact/i.test(read("docs/PROOF-ACCEPTANCE-PACKET.md"))) {
  failures.push("proof acceptance packet doc must keep not-accepted boundary visible");
}

if (!/does not create external proof/i.test(read("docs/PROOF-ACCEPTANCE-PACKET.md"))) {
  failures.push("proof acceptance packet doc must keep proof-creation boundary visible");
}

if (!/does not grant permission/i.test(read("docs/PROOF-INTAKE-SCHEMA.md"))) {
  failures.push("proof intake schema doc must keep permission boundary visible");
}

if (!/does not prove external adoption/i.test(read("docs/PROOF-INTAKE-SCHEMA.md"))) {
  failures.push("proof intake schema doc must keep external-adoption boundary visible");
}

if (!/spec index/i.test(read("spec/README.md"))) {
  failures.push("spec README must name the spec index surface");
}

if (!/owner-decision-answer\.schema\.json/i.test(read("spec/README.md"))) {
  failures.push("spec README must index owner decision answer schema");
}

if (!/current-state-summary\.schema\.json/i.test(read("spec/README.md"))) {
  failures.push("spec README must index current state summary schema");
}

if (!/worktree-review-packet\.schema\.json/i.test(read("spec/README.md"))) {
  failures.push("spec README must index worktree review packet schema");
}

if (!/release-review-bundle\.schema\.json/i.test(read("spec/README.md"))) {
  failures.push("spec README must index release review bundle schema");
}

if (!/owner-evidence-submission\.schema\.json/i.test(read("spec/README.md"))) {
  failures.push("spec README must index owner evidence submission schema");
}

if (!/not submitted evidence/i.test(read("spec/README.md"))) {
  failures.push("spec README must keep not-submitted-evidence boundary visible");
}

if (!/does not create external proof/i.test(read("docs/PROOF-RUN-PACKET.md"))) {
  failures.push("proof run packet doc must keep proof-creation boundary visible");
}

if (!/does not publish/i.test(read("docs/PROOF-RUN-PACKET.md"))) {
  failures.push("proof run packet doc must keep publication boundary visible");
}

if (!/does not execute commands/i.test(read("docs/PROOF-EXECUTION-REPORT.md"))) {
  failures.push("proof execution report doc must keep no-execution boundary visible");
}

if (!/does not create external proof/i.test(read("docs/PROOF-EXECUTION-REPORT.md"))) {
  failures.push("proof execution report doc must keep proof-creation boundary visible");
}

if (!/does not create external proof/i.test(read("docs/PROOF-RUN-DRY-AUDIT.md"))) {
  failures.push("proof run dry audit doc must keep proof-creation boundary visible");
}

if (!/does not run release:check:public/i.test(read("docs/PROOF-RUN-DRY-AUDIT.md"))) {
  failures.push("proof run dry audit doc must keep no-recursive-release boundary visible");
}

if (!/does not choose a license/i.test(read("docs/LICENSE-PACKET.md"))) {
  failures.push("license packet doc must keep owner-decision boundary visible");
}

if (!/does not prove external adoption/i.test(read("docs/OPERATOR-RUNBOOK.md"))) {
  failures.push("operator runbook doc must keep external-adoption boundary visible");
}

if (!/does not copy neighboring repository content/i.test(read("docs/ECOSYSTEM-RESOURCE-PACKET.md"))) {
  failures.push("ecosystem resource packet doc must keep no-copy boundary visible");
}

if (!/does not prove external adoption/i.test(read("docs/ECOSYSTEM-RESOURCE-PACKET.md"))) {
  failures.push("ecosystem resource packet doc must keep external-adoption boundary visible");
}

if (!/does not prove benchmarked productivity/i.test(read("docs/BENCHMARK-PACKET.md"))) {
  failures.push("benchmark packet doc must keep benchmark boundary visible");
}

if (!/does not prove external adoption/i.test(read("docs/BENCHMARK-PACKET.md"))) {
  failures.push("benchmark packet doc must keep adoption boundary visible");
}

if (!/does not publish a marketplace action/i.test(read("docs/PLUGIN-RELEASE-PACKET.md"))) {
  failures.push("plugin release packet doc must keep release-candidate boundary visible");
}

if (!/line-delimited JSON-RPC/i.test(read("plugins/mcp-server.md"))) {
  failures.push("MCP server doc must describe the local stdio runtime candidate");
}

if (!/does not execute tool commands/i.test(read("plugins/mcp-server.md"))) {
  failures.push("MCP server doc must keep tool-command execution boundary visible");
}

if (!/does not prove external adoption/i.test(read("docs/PUBLIC-CLAIM-PACK.md"))) {
  failures.push("public claim pack doc must keep external-adoption boundary visible");
}

if (!/does not prove benchmarked productivity/i.test(read("docs/PUBLIC-CLAIM-PACK.md"))) {
  failures.push("public claim pack doc must keep benchmark boundary visible");
}

if (!/does not stage, commit, push/i.test(read("docs/PUBLISH-HANDOFF-PACKET.md"))) {
  failures.push("publish handoff packet doc must keep git publication boundary visible");
}

if (!/does not publish/i.test(read("docs/RELEASE-EXECUTION-PACKET.md"))) {
  failures.push("release execution packet doc must keep publication boundary visible");
}

if (!/does not create a tag/i.test(read("docs/RELEASE-EXECUTION-PACKET.md"))) {
  failures.push("release execution packet doc must keep tag boundary visible");
}

if (!/does not publish/i.test(read("docs/RELEASE-EVIDENCE-REPORT.md"))) {
  failures.push("release evidence report doc must keep publication boundary visible");
}

if (!/does not publish to npm/i.test(read("docs/RELEASE-EVIDENCE-REPORT.md"))) {
  failures.push("release evidence report doc must keep npm publication boundary visible");
}

if (!/owner action queue/i.test(read("docs/OWNER-ACTION-QUEUE.md"))) {
  failures.push("owner action queue doc must name the owner action queue surface");
}

if (!/does not choose a license/i.test(read("docs/OWNER-ACTION-QUEUE.md"))) {
  failures.push("owner action queue doc must keep license decision boundary visible");
}

if (!/does not create external proof/i.test(read("docs/OWNER-ACTION-QUEUE.md"))) {
  failures.push("owner action queue doc must keep proof boundary visible");
}

if (!/owner proof handoff/i.test(read("docs/OWNER-PROOF-HANDOFF.md"))) {
  failures.push("owner proof handoff doc must name the handoff surface");
}

if (!/does not choose a license/i.test(read("docs/OWNER-PROOF-HANDOFF.md"))) {
  failures.push("owner proof handoff doc must keep license decision boundary visible");
}

if (!/does not approve proof/i.test(read("docs/OWNER-PROOF-HANDOFF.md"))) {
  failures.push("owner proof handoff doc must keep proof approval boundary visible");
}

if (!/owner proof input/i.test(read("docs/OWNER-PROOF-INPUT.md"))) {
  failures.push("owner proof input doc must name the proof input surface");
}

if (!/does not choose a license/i.test(read("docs/OWNER-PROOF-INPUT.md"))) {
  failures.push("owner proof input doc must keep license decision boundary visible");
}

if (!/does not submit an artifact/i.test(read("docs/OWNER-PROOF-INPUT.md"))) {
  failures.push("owner proof input doc must keep artifact submission boundary visible");
}

if (!/does not approve proof/i.test(read("docs/OWNER-PROOF-INPUT.md"))) {
  failures.push("owner proof input doc must keep proof approval boundary visible");
}

if (!/owner proof input split/i.test(read("docs/OWNER-PROOF-INPUT-SPLIT.md"))) {
  failures.push("owner proof input split doc must name the split surface");
}

if (!/does not choose a license/i.test(read("docs/OWNER-PROOF-INPUT-SPLIT.md"))) {
  failures.push("owner proof input split doc must keep license decision boundary visible");
}

if (!/does not submit an artifact/i.test(read("docs/OWNER-PROOF-INPUT-SPLIT.md"))) {
  failures.push("owner proof input split doc must keep artifact submission boundary visible");
}

if (!/does not close gates/i.test(read("docs/OWNER-PROOF-INPUT-SPLIT.md"))) {
  failures.push("owner proof input split doc must keep gate closure boundary visible");
}

if (!/owner decision intake/i.test(read("docs/OWNER-DECISION-INTAKE.md"))) {
  failures.push("owner decision intake doc must name the owner decision intake surface");
}

if (!/does not grant permission/i.test(read("docs/OWNER-DECISION-INTAKE.md"))) {
  failures.push("owner decision intake doc must keep permission boundary visible");
}

if (!/does not close gates/i.test(read("docs/OWNER-DECISION-INTAKE.md"))) {
  failures.push("owner decision intake doc must keep gate boundary visible");
}

if (!/owner decision answer record/i.test(read("docs/OWNER-DECISION-ANSWER-RECORD.md"))) {
  failures.push("owner decision answer record doc must name the answer record surface");
}

if (!/pending owner answers/i.test(read("docs/OWNER-DECISION-ANSWER-RECORD.md"))) {
  failures.push("owner decision answer record doc must keep pending-answer status visible");
}

if (!/does not close gates/i.test(read("docs/OWNER-DECISION-ANSWER-RECORD.md"))) {
  failures.push("owner decision answer record doc must keep gate boundary visible");
}

if (!/owner answer review/i.test(read("docs/OWNER-ANSWER-REVIEW.md"))) {
  failures.push("owner answer review doc must name the answer review surface");
}

if (!/blocked_pending_owner_answers/i.test(read("docs/OWNER-ANSWER-REVIEW.md"))) {
  failures.push("owner answer review doc must keep blocked pending-answer status visible");
}

if (!/does not close gates/i.test(read("docs/OWNER-ANSWER-REVIEW.md"))) {
  failures.push("owner answer review doc must keep gate boundary visible");
}

if (!/owner evidence attachment form/i.test(read("docs/OWNER-EVIDENCE-ATTACHMENT-FORM.md"))) {
  failures.push("owner evidence attachment form doc must name the attachment form surface");
}

if (!/owner-provided evidence only/i.test(read("docs/OWNER-EVIDENCE-ATTACHMENT-FORM.md"))) {
  failures.push("owner evidence attachment form doc must keep owner-provided evidence boundary visible");
}

if (!/does not attach evidence/i.test(read("docs/OWNER-EVIDENCE-ATTACHMENT-FORM.md"))) {
  failures.push("owner evidence attachment form doc must keep no-evidence boundary visible");
}

if (!/owner evidence submission record/i.test(read("docs/OWNER-EVIDENCE-SUBMISSION-RECORD.md"))) {
  failures.push("owner evidence submission record doc must name the submission record surface");
}

if (!/not_submitted_owner_evidence/i.test(read("docs/OWNER-EVIDENCE-SUBMISSION-RECORD.md"))) {
  failures.push("owner evidence submission record doc must keep not-submitted status visible");
}

if (!/does not submit evidence/i.test(read("docs/OWNER-EVIDENCE-SUBMISSION-RECORD.md"))) {
  failures.push("owner evidence submission record doc must keep no-submitted-evidence boundary visible");
}

if (!/owner evidence submission check/i.test(read("docs/OWNER-EVIDENCE-SUBMISSION-CHECK.md"))) {
  failures.push("owner evidence submission check doc must name the submission check surface");
}

if (!/gates remain blocked/i.test(read("docs/OWNER-EVIDENCE-SUBMISSION-CHECK.md"))) {
  failures.push("owner evidence submission check doc must keep blocked-gate status visible");
}

if (!/does not close gates/i.test(read("docs/OWNER-EVIDENCE-SUBMISSION-CHECK.md"))) {
  failures.push("owner evidence submission check doc must keep no-closure boundary visible");
}

if (!/owner evidence bundle/i.test(read("docs/OWNER-EVIDENCE-BUNDLE.md"))) {
  failures.push("owner evidence bundle doc must name the evidence bundle surface");
}

if (!/not evidence/i.test(read("docs/OWNER-EVIDENCE-BUNDLE.md"))) {
  failures.push("owner evidence bundle doc must keep no-evidence status visible");
}

if (!/does not close gates/i.test(read("docs/OWNER-EVIDENCE-BUNDLE.md"))) {
  failures.push("owner evidence bundle doc must keep gate boundary visible");
}

if (!/owner evidence intake record/i.test(read("docs/OWNER-EVIDENCE-INTAKE-RECORD.md"))) {
  failures.push("owner evidence intake record doc must name the intake record surface");
}

if (!/pending owner evidence attachments/i.test(read("docs/OWNER-EVIDENCE-INTAKE-RECORD.md"))) {
  failures.push("owner evidence intake record doc must keep pending evidence status visible");
}

if (!/does not attach evidence/i.test(read("docs/OWNER-EVIDENCE-INTAKE-RECORD.md"))) {
  failures.push("owner evidence intake record doc must keep no-evidence boundary visible");
}

if (!/owner evidence review/i.test(read("docs/OWNER-EVIDENCE-REVIEW.md"))) {
  failures.push("owner evidence review doc must name the review surface");
}

if (!/blocked_pending_owner_evidence/i.test(read("docs/OWNER-EVIDENCE-REVIEW.md"))) {
  failures.push("owner evidence review doc must keep blocked pending-evidence status visible");
}

if (!/does not attach evidence/i.test(read("docs/OWNER-EVIDENCE-REVIEW.md"))) {
  failures.push("owner evidence review doc must keep no-evidence boundary visible");
}

if (!/sha256/i.test(read("docs/RELEASE-ARTIFACT-MANIFEST.md"))) {
  failures.push("release artifact manifest doc must keep hash-inventory surface visible");
}

if (!/does not publish/i.test(read("docs/RELEASE-ARTIFACT-MANIFEST.md"))) {
  failures.push("release artifact manifest doc must keep publication boundary visible");
}

if (!/does not create external proof/i.test(read("docs/RELEASE-ARTIFACT-MANIFEST.md"))) {
  failures.push("release artifact manifest doc must keep proof-creation boundary visible");
}

if (!/current state summary/i.test(read("docs/CURRENT-STATE-SUMMARY.md"))) {
  failures.push("current state summary doc must name the summary surface");
}

if (!/does not close gates/i.test(read("docs/CURRENT-STATE-SUMMARY.md"))) {
  failures.push("current state summary doc must keep non-closure boundary visible");
}

if (!/does not prove completion/i.test(read("docs/CURRENT-STATE-SUMMARY.md"))) {
  failures.push("current state summary doc must keep completion boundary visible");
}

if (!/does not create external proof/i.test(read("docs/CURRENT-STATE-SUMMARY.md"))) {
  failures.push("current state summary doc must keep proof-creation boundary visible");
}

if (!/worktree review packet/i.test(read("docs/WORKTREE-REVIEW-PACKET.md"))) {
  failures.push("worktree review packet doc must name the review packet surface");
}

if (!/does not stage/i.test(read("docs/WORKTREE-REVIEW-PACKET.md"))) {
  failures.push("worktree review packet doc must keep staging boundary visible");
}

if (!/does not commit/i.test(read("docs/WORKTREE-REVIEW-PACKET.md"))) {
  failures.push("worktree review packet doc must keep commit boundary visible");
}

if (!/does not push/i.test(read("docs/WORKTREE-REVIEW-PACKET.md"))) {
  failures.push("worktree review packet doc must keep push boundary visible");
}

if (!/does not close strict sync/i.test(read("docs/WORKTREE-REVIEW-PACKET.md"))) {
  failures.push("worktree review packet doc must keep strict sync boundary visible");
}

if (!/release review bundle/i.test(read("docs/RELEASE-REVIEW-BUNDLE.md"))) {
  failures.push("release review bundle doc must name the review bundle surface");
}

if (!/does not stage/i.test(read("docs/RELEASE-REVIEW-BUNDLE.md"))) {
  failures.push("release review bundle doc must keep staging boundary visible");
}

if (!/does not commit/i.test(read("docs/RELEASE-REVIEW-BUNDLE.md"))) {
  failures.push("release review bundle doc must keep commit boundary visible");
}

if (!/does not push/i.test(read("docs/RELEASE-REVIEW-BUNDLE.md"))) {
  failures.push("release review bundle doc must keep push boundary visible");
}

if (!/does not choose a license/i.test(read("docs/RELEASE-REVIEW-BUNDLE.md"))) {
  failures.push("release review bundle doc must keep license boundary visible");
}

if (!/does not close strict sync/i.test(read("docs/RELEASE-REVIEW-BUNDLE.md"))) {
  failures.push("release review bundle doc must keep strict sync boundary visible");
}

if (!/audit:secrets before validate/i.test(read("docs/RELEASE-CHECK-ORDER.md"))) {
  failures.push("release check order doc must keep secret-report-before-validate boundary visible");
}

if (!/framework:manifest.*audit:framework-manifest-schema.*audit:framework-manifest/i.test(read("docs/RELEASE-CHECK-ORDER.md"))) {
  failures.push("release check order doc must keep framework-manifest-schema-before-audit boundary visible");
}

if (!/reference:index.*audit:reference-index.*validate.*audit:sources/i.test(read("docs/RELEASE-CHECK-ORDER.md"))) {
  failures.push("release check order doc must keep reference-index-before-source-audit boundary visible");
}

if (!/does not publish/i.test(read("docs/RELEASE-CHECK-ORDER.md"))) {
  failures.push("release check order doc must keep publication boundary visible");
}

if (!/visibility audit/i.test(read("docs/REMOTE-ECOSYSTEM-AUDIT.md"))) {
  failures.push("remote ecosystem audit doc must keep visibility-only boundary visible");
}

if (!/does not prove production-grade security/i.test(read("docs/SECRET-SAFETY-GATE.md"))) {
  failures.push("secret safety gate doc must keep security boundary visible");
}

if (!/does not prove completion/i.test(read("docs/STATUS-ROADMAP-SYNC.md"))) {
  failures.push("status roadmap sync doc must keep completion boundary visible");
}

if (!/does not publish/i.test(read("docs/STATUS-ROADMAP-SYNC.md"))) {
  failures.push("status roadmap sync doc must keep publication boundary visible");
}

if (!/explicit publication boundary/i.test(read("docs/PUBLISH-SYNC-GATE.md"))) {
  failures.push("publish sync gate doc must keep publication boundary visible");
}

const workflow = read(".github/workflows/validate-mimesis.yml");
if (!/\.\/\.github\/actions\/release-check/.test(workflow)) {
  failures.push("validation workflow must call the local release-check action");
}

const publicationPacket = read(".mimesis/publication-packets/v0.1.md");
if (!/Publication Packet/i.test(publicationPacket)) {
  failures.push("generated publication packet must identify itself");
}

if (!/does not prove hosted deployment/i.test(publicationPacket)) {
  failures.push("generated publication packet must include proof boundary");
}

if (failures.length) {
  console.error("\nMimesis release readiness audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis release readiness audit passed: v0.1 is locally coherent and remaining gates are explicit.");

#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "release-artifacts", "v0.1-manifest.json");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function git(args) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    return (result.stderr || result.stdout || result.error?.message || "").trim();
  }
  return result.stdout.trim();
}

function statusLines() {
  const status = git(["status", "--short"]);
  return status ? status.split(/\r?\n/).filter(Boolean) : [];
}

function categoryFor(relativePath) {
  if (relativePath.startsWith(".mimesis/")) {
    return "generated-protocol";
  }
  if (relativePath.startsWith("docs/")) {
    return "documentation";
  }
  if (relativePath.startsWith("tools/")) {
    return "tooling";
  }
  if (relativePath.startsWith("spec/")) {
    return "specification";
  }
  if (relativePath.startsWith("templates/")) {
    return "template";
  }
  if (relativePath.startsWith("reference-packs/")) {
    return "reference-pack";
  }
  if (relativePath.startsWith("cases/")) {
    return "case";
  }
  if (relativePath.startsWith("examples/")) {
    return "example";
  }
  if (relativePath.startsWith("adapters/")) {
    return "adapter";
  }
  if (relativePath.startsWith("plugins/")) {
    return "plugin";
  }
  if (relativePath.startsWith("prompts/")) {
    return "prompt";
  }
  if (relativePath.startsWith(".github/")) {
    return "github";
  }
  return "root";
}

function sourceTypeFor(relativePath) {
  if (relativePath.startsWith(".mimesis/")) {
    return "generated-local-artifact";
  }
  if (relativePath.startsWith("tools/create-") || relativePath.startsWith("tools/audit-") || relativePath.startsWith("bin/")) {
    return "local-tooling";
  }
  if (relativePath.startsWith("templates/")) {
    return "copyable-template";
  }
  if (relativePath.startsWith("reference-packs/")) {
    return "source-first-standard";
  }
  if (relativePath.startsWith("cases/")) {
    return "case-surface";
  }
  return "framework-source";
}

const packageJson = readJson("package.json");
const status = statusLines();
const trackedChanged = status.filter((line) => !line.startsWith("??"));
const untracked = status.filter((line) => line.startsWith("??"));
const head = git(["rev-parse", "HEAD"]) || "unknown";
const upstreamResult = git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
const upstream = upstreamResult.includes("fatal") ? "none" : upstreamResult || "none";

const artifactPaths = [
  "README.md",
  "FRAMEWORK.md",
  "GLOSSARY.md",
  "MANIFESTO.md",
  "PROOF-BOUNDARY.md",
  "STATUS.md",
  "ROADMAP.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "LICENSE.md",
  "package.json",
  "bin/mimesis.mjs",
  "action.yml",
  ".github/actions/release-check/action.yml",
  ".github/workflows/validate-mimesis.yml",
  ".github/ISSUE_TEMPLATE/owner-proof-input.yml",
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
  "templates/README.md",
  "templates/artifact-brief.md",
  "templates/reference-set.md",
  "templates/structure-map.md",
  "templates/transformation-plan.md",
  "templates/improved-artifact.md",
  "templates/boundary-check.md",
  "templates/case-note.md",
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
  "cases/001-mimesis-on-mimesis.md",
  "cases/002-blog-homepage-mimesis.md",
  "cases/003-github-profile-mimesis.md",
  "cases/004-when-mimesis-becomes-shallow-copying.md",
  "cases/005-lovable-ai-app-builder-public-source-specimen.md",
  "examples/weak-readme.md",
  "examples/permissioned-case-intake.md",
  "prompts/README.md",
  "prompts/superpowers-mimesis.md",
  "adapters/README.md",
  "adapters/superpowers.md",
  "plugins/README.md",
  "plugins/mimesis-codex/.codex-plugin/plugin.json",
  "plugins/mimesis-codex/skills/mimesis-loop/SKILL.md",
  "plugins/mimesis-mcp/manifest.json",
  "plugins/mimesis-mcp/resources.json",
  "plugins/mimesis-mcp/tools.json",
  "docs/ACTIVATION-SURFACE.md",
  "docs/COMPLETION-AUDIT.md",
  "docs/GOAL-COMPLETION-AUDIT.md",
  "docs/LICENSE-DECISION-FROM-OWNER-ANSWER.md",
  "docs/GAP-REGISTER.md",
  "docs/GAP-CLOSURE-PLAN.md",
  "docs/GATE-EVIDENCE-PACKET.md",
  "docs/GATE-CLOSURE-READINESS.md",
  "docs/GATE-CLOSURE-REVIEW.md",
  "docs/FRAMEWORK-MANIFEST.md",
  "docs/FRAMEWORK-MANIFEST-SCHEMA.md",
  "docs/REFERENCE-PACK-INDEX.md",
  "docs/SOURCE-FIRST-PROTOCOL.md",
  "docs/V0.1-RELEASE-PACKET.md",
  "docs/V0.2-PROOF-QUEUE.md",
  "docs/FIRST-PROOF-CANDIDATE-PACKET.md",
  "docs/PROOF-REDACTION-PACKET.md",
  "docs/PROOF-SUBMISSION-PACKET.md",
  "docs/PROOF-ACCEPTANCE-PACKET.md",
  "docs/FIRST-LOOP-DEMO.md",
  "docs/PROOF-INTAKE-KIT.md",
  "docs/PROOF-INTAKE-CHECK.md",
  "docs/PROOF-INTAKE-FROM-OWNER-EVIDENCE.md",
  "docs/PROOF-INTAKE-RECORD.md",
  "docs/PROOF-INTAKE-SCHEMA.md",
  "docs/PROOF-READINESS-PACKET.md",
  "docs/PROOF-RUN-PACKET.md",
  "docs/PROOF-EXECUTION-REPORT.md",
  "docs/PROOF-RUN-DRY-AUDIT.md",
  "docs/RELEASE-ARTIFACT-MANIFEST.md",
  "docs/RELEASE-EVIDENCE-REPORT.md",
  "docs/PUBLICATION-EVIDENCE-PACKET.md",
  "docs/OWNER-ACTION-QUEUE.md",
  "docs/OWNER-PROOF-HANDOFF.md",
  "docs/OWNER-PROOF-INPUT.md",
  "docs/OWNER-PROOF-INPUT-ISSUE.md",
  "docs/OWNER-PROOF-INPUT-REQUEST.md",
  "docs/OWNER-PROOF-INPUT-REMOTE-ISSUE.md",
  "docs/OWNER-PROOF-INPUT-ISSUE-CONVERT.md",
  "docs/OWNER-PROOF-INPUT-REVIEW.md",
  "docs/OWNER-PROOF-INPUT-SPLIT.md",
  "docs/OWNER-DECISION-INTAKE.md",
  "docs/OWNER-DECISION-ANSWER-RECORD.md",
  "docs/OWNER-ANSWER-REVIEW.md",
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
  "docs/STATUS-ROADMAP-SYNC.md",
  "docs/SUPERPOWERS-ADAPTER.md",
  "docs/RELEASE-DECISION-RECORD.md",
  "docs/RELEASE-EXECUTION-PACKET.md",
  "docs/PUBLISH-HANDOFF-PACKET.md",
  "docs/PUBLISH-SYNC-GATE.md",
  "docs/PUBLIC-CLAIM-PACK.md",
  "docs/CLAIM-FROM-EVIDENCE.md",
  "docs/BENCHMARK-PACKET.md",
  "docs/ADOPTION-PACKET.md",
  "docs/PLUGIN-INSTALL-PACKET.md",
  "docs/PLUGIN-RELEASE-PACKET.md",
  "docs/PACKAGE-RELEASE-CANDIDATE.md",
  "docs/ACTION-RELEASE-CANDIDATE.md",
  "tools/validate-mimesis.mjs",
  "tools/audit-superpowers-adapter.mjs",
  "tools/create-framework-manifest.mjs",
  "tools/check-proof-intake-record.mjs",
  "tools/proof-intake-from-owner-evidence.mjs",
  "tools/audit-proof-intake-check.mjs",
  "tools/audit-proof-intake-from-owner-evidence.mjs",
  "tools/create-proof-candidate-packet.mjs",
  "tools/create-proof-redaction-packet.mjs",
  "tools/create-proof-submission-packet.mjs",
  "tools/create-proof-acceptance-packet.mjs",
  "tools/create-proof-execution-report.mjs",
  "tools/create-gap-register.mjs",
  "tools/create-gap-closure-plan.mjs",
  "tools/create-gate-evidence-packet.mjs",
  "tools/create-gate-closure-readiness.mjs",
  "tools/create-gate-closure-review.mjs",
  "tools/audit-framework-manifest.mjs",
  "tools/audit-proof-candidate-packet.mjs",
  "tools/audit-proof-redaction-packet.mjs",
  "tools/audit-proof-submission-packet.mjs",
  "tools/audit-proof-acceptance-packet.mjs",
  "tools/audit-proof-execution-report.mjs",
  "tools/audit-gap-register.mjs",
  // npm run audit:gap-register-sync-closure
  "tools/audit-gap-register-sync-closure.mjs",
  "tools/audit-gap-closure-plan.mjs",
  "tools/audit-gate-evidence-packet.mjs",
  "tools/audit-gate-closure-readiness.mjs",
  "tools/audit-gate-closure-review.mjs",
  "tools/create-publication-packet.mjs",
  "tools/audit-publication-packet.mjs",
  "tools/license-decision-from-owner-answer.mjs",
  "tools/audit-license-decision-from-owner-answer.mjs",
  "tools/create-release-decision-record.mjs",
  "tools/create-release-evidence-report.mjs",
  "tools/create-publication-evidence-packet.mjs",
  "tools/audit-publication-evidence-packet.mjs",
  "tools/create-goal-completion-audit.mjs",
  "tools/audit-goal-completion-audit.mjs",
  "tools/create-adoption-packet.mjs",
  "tools/audit-adoption-packet.mjs",
  "tools/create-owner-action-queue.mjs",
  "tools/create-owner-proof-handoff.mjs",
  "tools/create-owner-proof-input-issue-packet.mjs",
  "tools/create-owner-proof-input-request.mjs",
  "tools/create-owner-proof-input-remote-issue-anchor.mjs",
  "tools/convert-owner-proof-input-issue.mjs",
  "tools/review-owner-proof-input-record.mjs",
  "tools/create-owner-proof-input-template.mjs",
  "tools/check-owner-proof-input-record.mjs",
  "tools/split-owner-proof-input-record.mjs",
  "tools/create-owner-decision-intake.mjs",
  "tools/create-owner-decision-answer-record.mjs",
  "tools/review-owner-decision-answer-record.mjs",
  "tools/create-owner-evidence-attachment-form.mjs",
  "tools/create-owner-evidence-submission-record.mjs",
  "tools/check-owner-evidence-submission-record.mjs",
  "tools/create-owner-evidence-bundle.mjs",
  "tools/create-owner-evidence-intake-record.mjs",
  "tools/review-owner-evidence-intake-record.mjs",
  "tools/audit-release-decision-record.mjs",
  "tools/audit-release-evidence-report.mjs",
  "tools/audit-owner-action-queue.mjs",
  "tools/audit-owner-proof-handoff.mjs",
  "tools/audit-owner-proof-input.mjs",
  "tools/audit-owner-proof-input-issue.mjs",
  "tools/audit-owner-proof-input-request.mjs",
  "tools/audit-owner-proof-input-remote-issue.mjs",
  "tools/audit-owner-proof-input-issue-convert.mjs",
  "tools/audit-owner-proof-input-review.mjs",
  "tools/audit-owner-proof-input-split.mjs",
  "tools/audit-owner-decision-intake.mjs",
  "tools/audit-owner-decision-answer-record.mjs",
  "tools/audit-owner-answer-review.mjs",
  "tools/audit-owner-evidence-attachment-form.mjs",
  "tools/audit-owner-evidence-submission-record.mjs",
  "tools/audit-owner-evidence-submission-check.mjs",
  "tools/audit-owner-evidence-bundle.mjs",
  "tools/audit-owner-evidence-intake-record.mjs",
  "tools/audit-owner-evidence-review.mjs",
  "tools/create-release-artifact-manifest.mjs",
  "tools/audit-release-artifact-manifest.mjs",
  "tools/audit-spec-index.mjs",
  "tools/create-current-state-summary.mjs",
  "tools/audit-current-state-summary.mjs",
  "tools/audit-state-snapshot-boundary.mjs",
  "tools/create-worktree-review-packet.mjs",
  "tools/audit-worktree-review-packet.mjs",
  "tools/create-release-review-bundle.mjs",
  "tools/audit-release-review-bundle.mjs",
  "tools/audit-status-roadmap-sync.mjs",
  "tools/audit-sync-strict-nonwriting.mjs",
  "tools/audit-release-check-order.mjs",
  "tools/audit-release-readiness.mjs",
  "tools/audit-package-surface.mjs",
  ".mimesis/framework-manifest.json",
  ".mimesis/adapter-packets/superpowers.md",
  ".mimesis/reference-packs/index.json",
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
  ".mimesis/owner-actions/proof-run-handoff.md",
  ".mimesis/owner-actions/proof-input-template.json",
  ".mimesis/owner-actions/fixture-proof-input-check.md",
  ".mimesis/owner-actions/proof-input-issue-packet.md",
  ".mimesis/owner-actions/proof-input-request.md",
  ".mimesis/owner-actions/remote-proof-input-issue-anchor.md",
  ".mimesis/owner-actions/fixture-owner-proof-input-issue.md",
  ".mimesis/owner-actions/fixture-owner-proof-input-issue-record.json",
  ".mimesis/owner-actions/fixture-owner-proof-input-issue-conversion-report.md",
  ".mimesis/owner-actions/fixture-proof-input-review.md",
  ".mimesis/owner-actions/proof-input-split-report.md",
  ".mimesis/owner-actions/decision-intake.md",
  ".mimesis/owner-actions/fixture-answer-record.json",
  ".mimesis/owner-actions/answer-review.md",
  ".mimesis/owner-actions/evidence-attachment-form.md",
  ".mimesis/owner-actions/fixture-evidence-submission-record.json",
  ".mimesis/owner-actions/fixture-evidence-submission-check.md",
  ".mimesis/owner-actions/evidence-bundle.md",
  ".mimesis/owner-actions/fixture-evidence-record.json",
  ".mimesis/owner-actions/evidence-review.md",
  ".mimesis/state/current-state.json",
  ".mimesis/worktree/review-packet.json",
  ".mimesis/release-review/v0.1-bundle.json",
  ".mimesis/completion/goal-completion-audit.json",
  ".mimesis/ecosystem-resources/current-resource-packet.md",
  ".mimesis/benchmark-packets/v0.2-first-benchmark.md",
  ".mimesis/adoption-packets/v0.2-first-adoption.md",
  ".mimesis/release-decisions/from-owner-answer-bridge.md",
  ".mimesis/release-decisions/owner-decision-record.json",
  ".mimesis/release-evidence/v0.1-report.md",
  ".mimesis/release-evidence/publication-evidence-packet.md",
  ".mimesis/release-execution/v0.1-owner-handoff.md",
  ".mimesis/security/secret-safety-report.md",
  ".mimesis/mcp/resource-index.json",
  ".mimesis/sync-status.md",
  ".mimesis/run_ledger.md",
];

const artifacts = [];
const missingArtifacts = [];

for (const relativePath of artifactPaths) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    missingArtifacts.push(relativePath);
    continue;
  }

  const bytes = read(relativePath);
  artifacts.push({
    path: relativePath,
    category: categoryFor(relativePath),
    sourceType: sourceTypeFor(relativePath),
    bytes: bytes.byteLength,
    sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
  });
}

artifacts.sort((left, right) => left.path.localeCompare(right.path));

const manifest = {
  schema: "mimesis.release-artifact-manifest.v0.1",
  status: "local_manifest_not_publication",
  generatedAt: new Date().toISOString(),
  package: {
    name: packageJson.name,
    version: packageJson.version,
    private: packageJson.private === true,
    license: packageJson.license ?? "none",
  },
  git: {
    branch: git(["rev-parse", "--abbrev-ref", "HEAD"]) || "unknown",
    head,
    upstream,
    trackedChangedCount: trackedChanged.length,
    untrackedCount: untracked.length,
  },
  artifactCount: artifacts.length,
  artifacts,
  missingArtifacts,
  boundaries: [
    "does_not_publish",
    "does_not_stage_commit_push_tag_release",
    "does_not_choose_license",
    "does_not_create_external_proof",
    "does_not_prove_adoption",
  ],
  notes: [
    "This manifest inventories selected local v0.1 release-review artifacts with SHA-256 hashes.",
    "It intentionally does not hash itself, because generatedAt would make a self hash unstable.",
    "It is local integrity evidence only, not publication, external proof, adoption proof, legal advice, or license choice.",
  ],
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`[release-artifact-manifest] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

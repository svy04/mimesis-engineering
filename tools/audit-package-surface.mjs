#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmExecPath = process.env.npm_execpath;
const failures = [];

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

const packageJson = JSON.parse(read("package.json"));
const releaseCandidateDoc = read("docs/PACKAGE-RELEASE-CANDIDATE.md");

if (packageJson.private !== true) {
  failures.push("package.json must remain private until license and publication gates close");
}

if (packageJson.license !== "UNLICENSED") {
  failures.push("package.json must use UNLICENSED while reuse license is owner-gated");
}

if (packageJson.bin?.mimesis !== "bin/mimesis.mjs") {
  failures.push("package.json must expose bin.mimesis as bin/mimesis.mjs");
}

for (const scriptName of ["workspace:check", "package:dry-run", "audit:package", "audit:remote", "audit:sync", "audit:sync:strict", "release:check:public", "release:ready:publish"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const scriptName of ["case:start", "case:check", "case:review", "case:from-intake", "case:from-record", "case:publish-packet", "audit:case-start", "audit:case-check", "audit:permissioned-case", "audit:permissioned-fixture", "audit:case-from-intake", "audit:case-from-record", "audit:case-publication"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const scriptName of ["evidence:check", "evidence:from-case", "evidence:review", "audit:evidence", "audit:evidence-from-case", "audit:evidence-review"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const scriptName of ["first-loop:demo", "audit:first-loop"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const scriptName of ["gap:register", "gap:closure-plan", "audit:gap-register", "audit:gap-closure-plan"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const scriptName of ["framework:manifest", "audit:framework-manifest"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!packageJson.scripts?.["audit:framework-manifest-schema"]) {
  failures.push("package.json missing script: audit:framework-manifest-schema");
}

for (const scriptName of ["reference:index", "audit:reference-index"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!packageJson.scripts?.["audit:secrets"]) {
  failures.push("package.json missing script: audit:secrets");
}

if (!packageJson.scripts?.["audit:status-roadmap"]) {
  failures.push("package.json missing script: audit:status-roadmap");
}

if (!packageJson.scripts?.["audit:spec-index"]) {
  failures.push("package.json missing script: audit:spec-index");
}

for (const scriptName of ["state:summary", "audit:state-summary"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const scriptName of ["worktree:packet", "audit:worktree-packet"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const scriptName of ["release:review-bundle", "audit:release-review-bundle"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!packageJson.scripts?.["audit:remote-fallback"]) {
  failures.push("package.json missing script: audit:remote-fallback");
}

if (!packageJson.scripts?.["audit:activation"]) {
  failures.push("package.json missing script: audit:activation");
}

for (const scriptName of ["gate:board", "gate:evidence-packet", "audit:gateboard", "audit:gate-evidence-packet"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const scriptName of ["operator:runbook", "audit:operator-runbook"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const scriptName of ["ecosystem:resources", "audit:ecosystem-resources"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!packageJson.scripts?.["audit:proof-queue"]) {
  failures.push("package.json missing script: audit:proof-queue");
}

for (const scriptName of ["proof:intake", "proof:intake-record", "proof:redaction-packet", "proof:submission-packet", "proof:acceptance-packet", "audit:proof-intake", "audit:proof-intake-record", "audit:proof-intake-schema", "audit:proof-redaction-packet", "audit:proof-submission-packet", "audit:proof-acceptance-packet"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const scriptName of ["proof:run-packet", "proof:execution-report", "proof:candidate-packet", "audit:proof-run", "audit:proof-execution-report", "audit:proof-candidate-packet"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!packageJson.scripts?.["audit:proof-run-dry"]) {
  failures.push("package.json missing script: audit:proof-run-dry");
}

for (const scriptName of ["proof:packet", "audit:proof-packet"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const scriptName of ["license:packet", "audit:license-packet"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const scriptName of ["plugin:install-packet", "plugin:packet", "audit:plugin-install-packet", "audit:plugin-packet", "audit:codex-plugin", "mcp:resources", "mcp:serve", "audit:mcp-server", "audit:mcp-stdio"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const scriptName of ["publish:packet", "audit:publish-packet"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const scriptName of ["claim:pack", "audit:claim-pack"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const scriptName of ["claim:from-evidence", "audit:claim-from-evidence"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const scriptName of ["benchmark:packet", "audit:benchmark-packet"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!packageJson.scripts?.["audit:completion-row-count"]) {
  failures.push("package.json missing script: audit:completion-row-count");
}

for (const scriptName of ["release:execution-packet", "audit:release-execution"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const scriptName of ["release:decision-record", "audit:release-decision-record"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const scriptName of ["release:artifact-manifest", "audit:release-artifact-manifest"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const scriptName of ["release:evidence-report", "audit:release-evidence-report"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const scriptName of ["owner:queue", "audit:owner-queue"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const scriptName of ["owner:decision-intake", "audit:owner-decision-intake"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const scriptName of ["owner:decision-answer-record", "audit:owner-decision-answer-record"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

for (const scriptName of ["owner:answer-review", "audit:owner-answer-review", "owner:evidence-attachment-form", "audit:owner-evidence-attachment-form", "owner:evidence-submission-record", "audit:owner-evidence-submission-record", "owner:evidence-bundle", "audit:owner-evidence-bundle", "owner:evidence-intake-record", "audit:owner-evidence-intake-record", "owner:evidence-review", "audit:owner-evidence-review"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!packageJson.scripts?.["audit:release-order"]) {
  failures.push("package.json missing script: audit:release-order");
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:package")) {
  failures.push("release:check must include npm run audit:package");
}

const requiredFilesEntries = [
  "action.yml",
  "bin/",
  "tools/",
  "spec/",
  "templates/",
  "reference-packs/",
  "cases/",
  "docs/",
  "README.md",
  "PROOF-BOUNDARY.md",
];

for (const entry of requiredFilesEntries) {
  if (!packageJson.files?.includes(entry)) {
    failures.push(`package.json files must include ${entry}`);
  }
}

for (const text of [
  "not an npm package release",
  "npm pack --dry-run",
  "owner license decision",
]) {
  if (!releaseCandidateDoc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/PACKAGE-RELEASE-CANDIDATE.md missing boundary text: ${text}`);
  }
}

if (!failures.length) {
  const command = npmExecPath || (process.platform === "win32" ? "cmd.exe" : "npm");
  const args = npmExecPath
    ? [npmExecPath, "pack", "--dry-run", "--json"]
    : process.platform === "win32"
      ? ["/d", "/s", "/c", "npm", "pack", "--dry-run", "--json"]
      : ["pack", "--dry-run", "--json"];
  const result = spawnSync(npmExecPath ? process.execPath : command, args, {
    cwd: root,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    failures.push(`npm pack --dry-run --json failed: ${result.error?.message || result.stderr || result.stdout}`);
  } else {
    let parsed;
    try {
      parsed = JSON.parse(result.stdout);
    } catch (error) {
      failures.push(`could not parse npm pack dry-run JSON: ${error.message}`);
    }

    const packedFiles = new Set((parsed?.[0]?.files ?? []).map((item) => item.path));
    for (const packedPath of [
      "package.json",
      "README.md",
      "bin/mimesis.mjs",
      "tools/check-case.mjs",
      "tools/check-evidence-packet.mjs",
      "tools/create-evidence-from-case.mjs",
      "tools/review-evidence-packet.mjs",
      "tools/check-permissioned-case.mjs",
      "tools/check-workspace.mjs",
      "tools/audit-activation-surface.mjs",
      "tools/audit-first-loop-demo.mjs",
      "tools/audit-gap-register.mjs",
      "tools/audit-gap-closure-plan.mjs",
      "tools/audit-gate-evidence-packet.mjs",
      "tools/audit-framework-manifest.mjs",
      "tools/audit-framework-manifest-schema.mjs",
      "tools/case-from-intake.mjs",
      "tools/case-from-record.mjs",
      "tools/create-case-publication-packet.mjs",
      "tools/create-benchmark-packet.mjs",
      "tools/audit-case-from-intake.mjs",
      "tools/audit-case-from-record.mjs",
      "tools/audit-case-publication-packet.mjs",
      "tools/audit-benchmark-packet.mjs",
      "tools/audit-completion-row-count.mjs",
      "tools/audit-codex-plugin-scaffold.mjs",
      "tools/audit-mcp-server-scaffold.mjs",
      "tools/audit-mcp-stdio-runtime.mjs",
      "tools/audit-evidence-packet.mjs",
      "tools/audit-evidence-from-case.mjs",
      "tools/audit-evidence-review.mjs",
      "tools/audit-gateboard.mjs",
      "tools/audit-license-packet.mjs",
      "tools/audit-ecosystem-resource-packet.mjs",
      "tools/audit-operator-runbook.mjs",
      "tools/audit-plugin-install-packet.mjs",
      "tools/audit-plugin-release-packet.mjs",
      "tools/audit-proof-intake-kit.mjs",
      "tools/audit-proof-intake-record.mjs",
      "tools/audit-proof-intake-schema.mjs",
      "tools/audit-proof-redaction-packet.mjs",
      "tools/audit-proof-submission-packet.mjs",
      "tools/audit-proof-acceptance-packet.mjs",
      "tools/audit-proof-run-packet.mjs",
      "tools/audit-proof-execution-report.mjs",
      "tools/audit-proof-run-dry.mjs",
      "tools/audit-publish-handoff-packet.mjs",
      "tools/audit-public-claim-pack.mjs",
      "tools/audit-claim-from-evidence.mjs",
      "tools/audit-reference-pack-index.mjs",
      "tools/audit-release-execution-packet.mjs",
      "tools/audit-release-decision-record.mjs",
      "tools/audit-release-evidence-report.mjs",
      "tools/audit-owner-action-queue.mjs",
      "tools/audit-owner-decision-intake.mjs",
      "tools/audit-owner-decision-answer-record.mjs",
      "tools/audit-owner-answer-review.mjs",
      "tools/audit-owner-evidence-attachment-form.mjs",
      "tools/audit-owner-evidence-submission-record.mjs",
      "tools/audit-owner-evidence-review.mjs",
      "tools/audit-release-artifact-manifest.mjs",
      "tools/audit-release-check-order.mjs",
      "tools/audit-proof-packet.mjs",
      "tools/audit-proof-candidate-packet.mjs",
      "tools/audit-proof-queue.mjs",
      "tools/audit-permissioned-case-check.mjs",
      "tools/audit-permissioned-fixture.mjs",
      "tools/audit-remote-ecosystem.mjs",
      "tools/audit-remote-fallback.mjs",
      "tools/audit-secret-safety.mjs",
      "tools/audit-spec-index.mjs",
      "tools/audit-current-state-summary.mjs",
      "tools/create-worktree-review-packet.mjs",
      "tools/audit-worktree-review-packet.mjs",
      "tools/create-release-review-bundle.mjs",
      "tools/audit-release-review-bundle.mjs",
      "tools/audit-status-roadmap-sync.mjs",
      "tools/audit-sync-status.mjs",
      "tools/start-case.mjs",
      "tools/create-gateboard.mjs",
      "tools/create-gate-evidence-packet.mjs",
      "tools/create-gap-register.mjs",
      "tools/create-gap-closure-plan.mjs",
      "tools/create-first-loop-demo.mjs",
      "tools/create-framework-manifest.mjs",
      "tools/create-license-packet.mjs",
      "tools/create-mcp-resource-index.mjs",
      "tools/mcp-stdio-server.mjs",
      "tools/create-ecosystem-resource-packet.mjs",
      "tools/create-operator-runbook.mjs",
      "tools/create-plugin-install-packet.mjs",
      "tools/create-plugin-release-packet.mjs",
      "tools/create-public-claim-pack.mjs",
      "tools/create-claim-from-evidence.mjs",
      "tools/create-reference-pack-index.mjs",
      "tools/create-proof-intake-kit.mjs",
      "tools/create-proof-redaction-packet.mjs",
      "tools/create-proof-submission-packet.mjs",
      "tools/create-proof-acceptance-packet.mjs",
      "tools/create-proof-candidate-packet.mjs",
      "tools/create-proof-intake-record.mjs",
      "tools/create-proof-run-packet.mjs",
      "tools/create-proof-execution-report.mjs",
      "tools/create-publish-handoff-packet.mjs",
      "tools/create-release-execution-packet.mjs",
      "tools/create-release-decision-record.mjs",
      "tools/create-release-evidence-report.mjs",
      "tools/create-owner-action-queue.mjs",
      "tools/create-owner-decision-intake.mjs",
      "tools/create-owner-decision-answer-record.mjs",
      "tools/review-owner-decision-answer-record.mjs",
      "tools/create-owner-evidence-attachment-form.mjs",
      "tools/create-owner-evidence-submission-record.mjs",
      "tools/review-owner-evidence-intake-record.mjs",
      "tools/create-current-state-summary.mjs",
      "tools/create-release-artifact-manifest.mjs",
      "tools/create-proof-packet.mjs",
      "tools/validate-mimesis.mjs",
      "templates/artifact-brief.md",
      "examples/weak-readme.md",
      "examples/permissioned-case-intake.md",
      "spec/framework-manifest.schema.json",
      "spec/current-state-summary.schema.json",
      "spec/worktree-review-packet.schema.json",
      "spec/release-review-bundle.schema.json",
      "spec/proof-intake.schema.json",
      "spec/owner-decision-answer.schema.json",
      "spec/mimesis-v0.1.md",
      "docs/FIRST-LOOP-DEMO.md",
      "docs/FIRST-PROOF-CANDIDATE-PACKET.md",
      "docs/PROOF-REDACTION-PACKET.md",
      "docs/PROOF-SUBMISSION-PACKET.md",
      "docs/PROOF-ACCEPTANCE-PACKET.md",
      "docs/GAP-REGISTER.md",
      "docs/GAP-CLOSURE-PLAN.md",
      "docs/GATE-EVIDENCE-PACKET.md",
      "docs/FRAMEWORK-MANIFEST.md",
      "docs/FRAMEWORK-MANIFEST-SCHEMA.md",
      "docs/PACKAGE-RELEASE-CANDIDATE.md",
      "docs/ACTIVATION-SURFACE.md",
      "docs/BENCHMARK-PACKET.md",
      "docs/CASE-CHECK.md",
      "docs/CASE-FROM-INTAKE.md",
      "docs/CASE-FROM-RECORD.md",
      "docs/CASE-PUBLICATION-PACKET.md",
      "docs/EVIDENCE-PACKET.md",
      "docs/EVIDENCE-FROM-CASE.md",
      "docs/EVIDENCE-REVIEW.md",
      "docs/GATEBOARD.md",
      "docs/LICENSE-PACKET.md",
      "docs/ECOSYSTEM-RESOURCE-PACKET.md",
      "docs/OPERATOR-RUNBOOK.md",
      "docs/PLUGIN-INSTALL-PACKET.md",
      "docs/PLUGIN-RELEASE-PACKET.md",
      "docs/FIRST-PROOF-PACKET.md",
      "docs/PROOF-INTAKE-KIT.md",
      "docs/PROOF-INTAKE-RECORD.md",
      "docs/PROOF-INTAKE-SCHEMA.md",
      "docs/PROOF-RUN-PACKET.md",
      "docs/PROOF-EXECUTION-REPORT.md",
      "docs/PROOF-RUN-DRY-AUDIT.md",
      "docs/REFERENCE-PACK-INDEX.md",
      "docs/V0.2-PROOF-QUEUE.md",
      "docs/SECRET-SAFETY-GATE.md",
      "docs/STATUS-ROADMAP-SYNC.md",
      "docs/PUBLIC-CLAIM-PACK.md",
      "docs/CLAIM-FROM-EVIDENCE.md",
      "docs/PUBLISH-HANDOFF-PACKET.md",
      "docs/RELEASE-DECISION-RECORD.md",
      "docs/RELEASE-EVIDENCE-REPORT.md",
      "docs/OWNER-ACTION-QUEUE.md",
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
      "docs/RELEASE-ARTIFACT-MANIFEST.md",
      "docs/RELEASE-EXECUTION-PACKET.md",
      "docs/RELEASE-CHECK-ORDER.md",
      "docs/CASE-START.md",
      "docs/PERMISSIONED-CASE-CHECK.md",
      "docs/PERMISSIONED-CASE-FIXTURE.md",
      "docs/REMOTE-ECOSYSTEM-AUDIT.md",
      "docs/PUBLISH-SYNC-GATE.md",
      "plugins/mimesis-codex/.codex-plugin/plugin.json",
      "plugins/mimesis-codex/README.md",
      "plugins/mimesis-codex/skills/mimesis-loop/SKILL.md",
      "plugins/mimesis-mcp/manifest.json",
      "plugins/mimesis-mcp/resources.json",
      "plugins/mimesis-mcp/tools.json",
      "plugins/mimesis-mcp/README.md",
      "action.yml",
    ]) {
      if (!packedFiles.has(packedPath)) {
        failures.push(`npm pack dry-run missing ${packedPath}`);
      }
    }
  }
}

if (failures.length) {
  console.error("\nMimesis package surface audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis package surface audit passed: npm pack dry-run surface checked without publishing.");

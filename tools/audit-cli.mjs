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

const cli = read("bin/mimesis.mjs");
const packageJson = read("package.json");

for (const command of [
  "init",
  "adapter:superpowers",
  "adoption:packet",
  "benchmark:packet",
  "case:start",
  "case:check",
  "case:review",
  "case:from-intake",
  "case:from-record",
  "case:publish-packet",
  "claim:from-evidence",
  "claim:pack",
  "ecosystem:resources",
  "evidence:check",
  "evidence:from-case",
  "evidence:review",
  "first-loop:demo",
  "gap:register",
  "gap:closure-plan",
  "goal:completion-audit",
  "gate:evidence-packet",
  "gate:closure-readiness",
  "gate:closure-review",
  "framework:manifest",
  "gate:board",
  "workspace:check",
  "validate",
  "release:packet",
  "proof:packet",
  "proof:intake",
  "proof:intake-check",
  "proof:intake-from-owner-evidence",
  "proof:intake-record",
  "proof:redaction-packet",
  "proof:submission-packet",
  "proof:acceptance-packet",
  "proof:execution-report",
  "proof:candidate-packet",
  "proof:readiness",
  "proof:run-packet",
  "license:decision-from-owner-answer",
  "license:packet",
  "reference:index",
  "mcp:resources",
  "mcp:serve",
  "operator:runbook",
  "owner:answer-review",
  "owner:decision-answer-record",
  "owner:decision-intake",
  "owner:evidence-attachment-form",
  "owner:evidence-submission-record",
  "owner:evidence-submission-check",
  "owner:evidence-bundle",
  "owner:evidence-intake-record",
  "owner:evidence-review",
  "owner:proof-handoff",
  "owner:proof-input-issue",
  "owner:proof-input-issue-convert",
  "owner:proof-input-template",
  "owner:proof-input-check",
  "owner:proof-input-split",
  "owner:queue",
  "plugin:install-packet",
  "plugin:packet",
  "publication:evidence-packet",
  "publish:packet",
  "release:decision-record",
  "release:artifact-manifest",
  "release:evidence-report",
  "release:execution-packet",
  "release:review-bundle",
  "state:summary",
  "worktree:packet",
  "release:check",
  "release:check:workspace",
  "release:check:public",
  "release:ready:publish",
  "audit:sources",
  "audit:activation",
  "audit:adoption-packet",
  "audit:benchmark-packet",
  "audit:case-from-record",
  "audit:case-publication",
  "audit:claim-from-evidence",
  "audit:claim-pack",
  "audit:completion",
  "audit:completion-row-count",
  "audit:codex-plugin",
  "audit:ecosystem-resources",
  "audit:evidence",
  "audit:evidence-from-case",
  "audit:evidence-review",
  "audit:first-loop",
  "audit:gap-register",
  "audit:gap-register-sync-closure",
  "audit:gap-closure-plan",
  "audit:goal-completion-audit",
  "audit:gate-evidence-packet",
  "audit:gate-closure-readiness",
  "audit:gate-closure-review",
  "audit:framework-manifest",
  "audit:framework-manifest-schema",
  "audit:gateboard",
  "audit:license-decision-from-owner-answer",
  "audit:license-packet",
  "audit:mcp-stdio",
  "audit:mcp-server",
  "audit:operator-runbook",
  "audit:owner-answer-review",
  "audit:owner-decision-answer-record",
  "audit:owner-decision-intake",
  "audit:owner-evidence-attachment-form",
  "audit:owner-evidence-submission-record",
  "audit:owner-evidence-submission-check",
  "audit:owner-evidence-bundle",
  "audit:owner-evidence-intake-record",
  "audit:owner-evidence-review",
  "audit:owner-proof-handoff",
  "audit:owner-proof-input",
  "audit:owner-proof-input-issue",
  "audit:owner-proof-input-issue-convert",
  "audit:owner-proof-input-split",
  "audit:owner-queue",
  "audit:plugin-packet",
  "audit:proof-intake",
  "audit:proof-intake-check",
  "audit:proof-intake-from-owner-evidence",
  "audit:proof-intake-record",
  "audit:proof-intake-schema",
  "audit:proof-redaction-packet",
  "audit:proof-submission-packet",
  "audit:proof-acceptance-packet",
  "audit:proof-execution-report",
  "audit:proof-candidate-packet",
  "audit:proof-packet",
  "audit:proof-queue",
  "audit:proof-readiness",
  "audit:proof-run",
  "audit:proof-run-dry",
  "audit:publication-evidence-packet",
  "audit:publish-packet",
  "audit:publication",
  "audit:reference-index",
  "audit:release-decision-record",
  "audit:release-artifact-manifest",
  "audit:release-evidence-report",
  "audit:release-execution",
  "audit:release-review-bundle",
  "audit:release-order",
  "audit:package",
  "audit:action",
  "audit:superpowers-adapter",
  "audit:permissioned-fixture",
  "audit:plugin-install-packet",
  "audit:remote",
  "audit:remote-fallback",
  "audit:secrets",
  "audit:spec-index",
  "audit:state-summary",
  "audit:status-roadmap",
  "audit:sync",
  "audit:sync:strict",
  "audit:sync:strict-nonwriting",
  "audit:worktree-packet",
]) {
  if (!cli.includes(`"${command}"`)) {
    failures.push(`bin/mimesis.mjs missing command: ${command}`);
  }
}

if (!/"bin"\s*:/.test(packageJson) || !/"mimesis"\s*:\s*"bin\/mimesis\.mjs"/.test(packageJson)) {
  failures.push("package.json must expose bin.mimesis as bin/mimesis.mjs");
}

if (!/"cli"\s*:\s*"node bin\/mimesis\.mjs"/.test(packageJson)) {
  failures.push("package.json must expose npm run cli");
}

if (!/"audit:cli"\s*:\s*"node tools\/audit-cli\.mjs"/.test(packageJson)) {
  failures.push("package.json must expose npm run audit:cli");
}

if (!/"workspace:check"\s*:\s*"node tools\/check-workspace\.mjs \."/ .test(packageJson)) {
  failures.push("package.json must expose npm run workspace:check");
}

if (!/local CLI wrapper/i.test(cli)) {
  failures.push("CLI help must state local wrapper boundary");
}

if (!/does not prove npm package release/i.test(cli)) {
  failures.push("CLI help must include package-release boundary");
}

if (!/workspace:check can inspect a target \.mimesis trail/i.test(cli)) {
  failures.push("CLI help must include workspace-check boundary");
}

if (failures.length) {
  console.error("\nMimesis CLI audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis CLI audit passed.");

#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const invocationCwd = process.cwd();
const args = process.argv.slice(2);
const command = args[0] ?? "help";
const rest = args.slice(1);

const npmExecPath = process.env.npm_execpath;

const commands = new Map([
  ["help", { description: "Show this help.", type: "help" }],
  ["init", { description: "Initialize a .mimesis workspace from templates.", type: "node", script: "tools/init-mimesis.mjs" }],
  ["adapter:superpowers", { description: "Generate the local Superpowers process/artifact adapter packet.", type: "node", script: "tools/create-cli-packet.mjs", args: ["superpowers", ".mimesis/adapter-packets/superpowers.md"] }],
  ["adoption:packet", { description: "Generate the external adoption evidence intake packet without claiming adoption.", type: "node", script: "tools/create-adoption-packet.mjs" }],
  ["benchmark:packet", { description: "Generate the benchmark/adoption measurement protocol packet.", type: "node", script: "tools/create-benchmark-packet.mjs" }],
  ["case:start", { description: "Start a Mimesis case workspace from one weak artifact.", type: "node", script: "tools/start-case.mjs" }],
  ["case:check", { description: "Check whether a case workspace has completed local evidence.", type: "node", script: "tools/check-case.mjs" }],
  ["case:review", { description: "Review a permissioned external case intake.", type: "node", script: "tools/check-permissioned-case.mjs" }],
  ["case:from-intake", { description: "Create a started case workspace from reviewed permissioned intake.", type: "node", script: "tools/case-from-intake.mjs" }],
  ["case:from-record", { description: "Create a started case workspace from a proof intake record.", type: "node", script: "tools/case-from-record.mjs" }],
  ["case:publish-packet", { description: "Generate a bounded casebook candidate packet from a completed case.", type: "node", script: "tools/create-case-publication-packet.mjs" }],
  ["claim:from-evidence", { description: "Create a bounded claim candidate from reviewed evidence.", type: "node", script: "tools/create-claim-from-evidence.mjs" }],
  ["claim:pack", { description: "Generate the bounded public claim/copy packet.", type: "node", script: "tools/create-public-claim-pack.mjs" }],
  ["ecosystem:resources", { description: "Generate the local ecosystem resource packet.", type: "node", script: "tools/create-ecosystem-resource-packet.mjs" }],
  ["evidence:check", { description: "Check a strong claim evidence packet.", type: "node", script: "tools/check-evidence-packet.mjs" }],
  ["evidence:from-case", { description: "Create a draft evidence packet from a completed case workspace.", type: "node", script: "tools/create-evidence-from-case.mjs" }],
  ["evidence:review", { description: "Record a reviewer decision on an evidence packet.", type: "node", script: "tools/review-evidence-packet.mjs" }],
  ["first-loop:demo", { description: "Generate the completed local first-loop demo case.", type: "node", script: "tools/create-first-loop-demo.mjs" }],
  ["gap:register", { description: "Generate the current open-gate gap register.", type: "node", script: "tools/create-gap-register.mjs" }],
  ["gap:closure-plan", { description: "Generate bounded closure instructions for the current open gates.", type: "node", script: "tools/create-gap-closure-plan.mjs" }],
  ["goal:completion-audit", { description: "Generate the active-goal completion audit without marking completion.", type: "node", script: "tools/create-goal-completion-audit.mjs" }],
  ["gate:evidence-packet", { description: "Generate the evidence intake packet for closing open gates.", type: "node", script: "tools/create-gate-evidence-packet.mjs" }],
  ["gate:closure-readiness", { description: "Generate the machine-readable open-gate closure readiness report without closing gates.", type: "node", script: "tools/create-gate-closure-readiness.mjs" }],
  ["gate:closure-review", { description: "Generate the machine-readable gate closure review record without approving or closing gates.", type: "node", script: "tools/create-gate-closure-review.mjs" }],
  ["framework:manifest", { description: "Generate the machine-readable AI-native framework manifest.", type: "node", script: "tools/create-framework-manifest.mjs" }],
  ["gate:board", { description: "Generate the current owner/proof/publication gate board.", type: "node", script: "tools/create-gateboard.mjs" }],
  ["workspace:check", { description: "Check a target repository's .mimesis artifact trail.", type: "node", script: "tools/check-workspace.mjs" }],
  ["validate", { description: "Validate the local Mimesis protocol surface.", type: "node", script: "tools/validate-mimesis.mjs" }],
  ["release:packet", { description: "Generate the local v0.1 publication packet.", type: "node", script: "tools/create-publication-packet.mjs" }],
  ["proof:packet", { description: "Generate the local v0.2 first-proof handoff packet.", type: "node", script: "tools/create-proof-packet.mjs" }],
  ["proof:intake", { description: "Generate the first external proof intake kit.", type: "node", script: "tools/create-proof-intake-kit.mjs" }],
  ["proof:intake-check", { description: "Check a proof intake record before started-case creation.", type: "node", script: "tools/check-proof-intake-record.mjs" }],
  ["proof:intake-from-owner-evidence", { description: "Bridge a reviewed owner evidence field into a proof intake record.", type: "node", script: "tools/proof-intake-from-owner-evidence.mjs" }],
  ["proof:intake-record", { description: "Generate the schema-shaped proof intake fixture record.", type: "node", script: "tools/create-proof-intake-record.mjs" }],
  ["proof:redaction-packet", { description: "Generate the proof redaction checklist packet.", type: "node", script: "tools/create-proof-redaction-packet.mjs" }],
  ["proof:submission-packet", { description: "Generate the proof submission handoff packet.", type: "node", script: "tools/create-proof-submission-packet.mjs" }],
  ["proof:acceptance-packet", { description: "Generate the proof acceptance case creation gate packet.", type: "node", script: "tools/create-proof-acceptance-packet.mjs" }],
  ["proof:execution-report", { description: "Generate the proof execution command evidence report packet.", type: "node", script: "tools/create-proof-execution-report.mjs" }],
  ["proof:candidate-packet", { description: "Generate the first proof candidate selection packet.", type: "node", script: "tools/create-proof-candidate-packet.mjs" }],
  ["proof:readiness", { description: "Generate the first weak artifact readiness packet.", type: "node", script: "tools/create-proof-readiness-packet.mjs" }],
  ["proof:run-packet", { description: "Generate the operator packet for the first v0.2 proof run.", type: "node", script: "tools/create-proof-run-packet.mjs" }],
  ["license:decision-from-owner-answer", { description: "Bridge a reviewed owner license/no-reuse answer into a bounded release decision record candidate.", type: "node", script: "tools/license-decision-from-owner-answer.mjs" }],
  ["license:packet", { description: "Generate the owner license decision packet.", type: "node", script: "tools/create-license-packet.mjs" }],
  ["reference:index", { description: "Generate the source-first reference pack index.", type: "node", script: "tools/create-reference-pack-index.mjs" }],
  ["mcp:resources", { description: "Generate the local MCP resource index scaffold.", type: "node", script: "tools/create-mcp-resource-index.mjs" }],
  ["mcp:serve", { description: "Run the local line-delimited JSON-RPC stdio candidate for Mimesis resources.", type: "node", script: "tools/mcp-stdio-server.mjs" }],
  ["operator:runbook", { description: "Generate the current ecosystem operator runbook.", type: "node", script: "tools/create-operator-runbook.mjs" }],
  ["owner:answer-review", { description: "Review owner decision answers and keep blocked gates explicit.", type: "node", script: "tools/review-owner-decision-answer-record.mjs" }],
  ["owner:decision-answer-record", { description: "Generate the schema-shaped owner decision answer fixture without making decisions.", type: "node", script: "tools/create-owner-decision-answer-record.mjs" }],
  ["owner:decision-intake", { description: "Generate the owner decision intake form without making decisions.", type: "node", script: "tools/create-owner-decision-intake.mjs" }],
  ["owner:evidence-attachment-form", { description: "Generate the owner evidence attachment form without attaching evidence.", type: "node", script: "tools/create-owner-evidence-attachment-form.mjs" }],
  ["owner:evidence-submission-record", { description: "Generate the owner evidence submission record without submitting evidence.", type: "node", script: "tools/create-owner-evidence-submission-record.mjs" }],
  ["owner:evidence-submission-check", { description: "Check an owner evidence submission record before gate movement.", type: "node", script: "tools/check-owner-evidence-submission-record.mjs" }],
  ["owner:evidence-bundle", { description: "Generate the owner evidence attachment bundle without creating evidence.", type: "node", script: "tools/create-owner-evidence-bundle.mjs" }],
  ["owner:evidence-intake-record", { description: "Generate the schema-shaped pending owner evidence fixture without attaching evidence.", type: "node", script: "tools/create-owner-evidence-intake-record.mjs" }],
  ["owner:evidence-review", { description: "Review pending owner evidence attachments and keep blocked gates explicit.", type: "node", script: "tools/review-owner-evidence-intake-record.mjs" }],
  ["owner:proof-handoff", { description: "Generate the minimum owner handoff for license/no-reuse and one weak artifact proof input.", type: "node", script: "tools/create-owner-proof-handoff.mjs" }],
  ["owner:proof-input-issue", { description: "Generate the owner proof input issue handoff packet.", type: "node", script: "tools/create-owner-proof-input-issue-packet.mjs" }],
  ["owner:proof-input-request", { description: "Generate the owner-facing request for license/no-reuse and one weak artifact input.", type: "node", script: "tools/create-owner-proof-input-request.mjs" }],
  ["owner:proof-input-issue-convert", { description: "Convert an owner proof input issue body into a bounded draft owner proof input record.", type: "node", script: "tools/convert-owner-proof-input-issue.mjs" }],
  ["owner:proof-input-review", { description: "Review an owner proof input record before reviewed-record promotion.", type: "node", script: "tools/review-owner-proof-input-record.mjs" }],
  ["owner:proof-input-template", { description: "Generate the single owner proof input template without submitting owner input.", type: "node", script: "tools/create-owner-proof-input-template.mjs" }],
  ["owner:proof-input-check", { description: "Check an owner proof input record before downstream conversion.", type: "node", script: "tools/check-owner-proof-input-record.mjs" }],
  ["owner:proof-input-split", { description: "Split a reviewed owner proof input into downstream owner record candidates.", type: "node", script: "tools/split-owner-proof-input-record.mjs" }],
  ["owner:queue", { description: "Generate the current owner action queue handoff.", type: "node", script: "tools/create-owner-action-queue.mjs" }],
  ["plugin:install-packet", { description: "Generate the local Codex plugin install-readiness packet.", type: "node", script: "tools/create-plugin-install-packet.mjs" }],
  ["plugin:packet", { description: "Generate the plugin/action release-candidate packet.", type: "node", script: "tools/create-plugin-release-packet.mjs" }],
  ["publication:evidence-packet", { description: "Generate the publication evidence intake packet without publishing.", type: "node", script: "tools/create-publication-evidence-packet.mjs" }],
  ["publish:packet", { description: "Generate the local publish/sync handoff packet.", type: "node", script: "tools/create-publish-handoff-packet.mjs" }],
  ["release:decision-record", { description: "Generate the owner release decision record.", type: "node", script: "tools/create-release-decision-record.mjs" }],
  ["release:artifact-manifest", { description: "Generate the local release artifact hash manifest.", type: "node", script: "tools/create-release-artifact-manifest.mjs" }],
  ["release:evidence-report", { description: "Generate the release/publication evidence checklist report.", type: "node", script: "tools/create-release-evidence-report.mjs" }],
  ["release:execution-packet", { description: "Generate the owner release execution handoff packet.", type: "node", script: "tools/create-release-execution-packet.mjs" }],
  ["release:review-bundle", { description: "Generate the local release review bundle without staging, committing, pushing, or publishing.", type: "node", script: "tools/create-release-review-bundle.mjs" }],
  ["state:summary", { description: "Generate the machine-readable current state summary.", type: "node", script: "tools/create-current-state-summary.mjs" }],
  ["worktree:packet", { description: "Generate the local dirty worktree review packet without staging, committing, pushing, or publishing.", type: "node", script: "tools/create-worktree-review-packet.mjs" }],
  ["release:check", { description: "Run the full local release preflight.", type: "npm", script: "release:check" }],
  ["release:check:workspace", { description: "Run release preflight plus local ecosystem audit.", type: "npm", script: "release:check:workspace" }],
  ["release:check:public", { description: "Run release, workspace, and remote public-surface checks.", type: "npm", script: "release:check:public" }],
  ["release:ready:publish", { description: "Run public checks plus strict clean/synced worktree gate.", type: "npm", script: "release:ready:publish" }],
  ["audit:sources", { description: "Audit source-first reference discipline.", type: "node", script: "tools/audit-source-first.mjs" }],
  ["audit:activation", { description: "Audit README and quickstart first-action surface.", type: "node", script: "tools/audit-activation-surface.mjs" }],
  ["audit:adoption-packet", { description: "Audit the generated adoption evidence intake packet and no-adoption-proof boundary.", type: "node", script: "tools/audit-adoption-packet.mjs" }],
  ["audit:benchmark-packet", { description: "Audit the generated benchmark/adoption measurement packet.", type: "node", script: "tools/audit-benchmark-packet.mjs" }],
  ["audit:case-from-record", { description: "Audit the proof-intake-record to started-case path.", type: "node", script: "tools/audit-case-from-record.mjs" }],
  ["audit:case-publication", { description: "Audit the generated casebook candidate packet.", type: "node", script: "tools/audit-case-publication-packet.mjs" }],
  ["audit:claim-from-evidence", { description: "Audit reviewed-evidence to bounded-claim candidate creation.", type: "node", script: "tools/audit-claim-from-evidence.mjs" }],
  ["audit:claim-pack", { description: "Audit the generated public claim/copy packet.", type: "node", script: "tools/audit-public-claim-pack.mjs" }],
  ["audit:completion", { description: "Audit the completion matrix.", type: "node", script: "tools/audit-completion-matrix.mjs" }],
  ["audit:completion-row-count", { description: "Audit completion matrix visible row count reporting.", type: "node", script: "tools/audit-completion-row-count.mjs" }],
  ["audit:codex-plugin", { description: "Audit the local Codex plugin scaffold.", type: "node", script: "tools/audit-codex-plugin-scaffold.mjs" }],
  ["audit:ecosystem-resources", { description: "Audit the generated ecosystem resource packet.", type: "node", script: "tools/audit-ecosystem-resource-packet.mjs" }],
  ["audit:evidence", { description: "Audit the evidence packet gate.", type: "node", script: "tools/audit-evidence-packet.mjs" }],
  ["audit:evidence-from-case", { description: "Audit completed-case to draft-evidence packet creation.", type: "node", script: "tools/audit-evidence-from-case.mjs" }],
  ["audit:evidence-review", { description: "Audit evidence packet review decisions.", type: "node", script: "tools/audit-evidence-review.mjs" }],
  ["audit:first-loop", { description: "Audit the completed local first-loop demo case.", type: "node", script: "tools/audit-first-loop-demo.mjs" }],
  ["audit:gap-register", { description: "Audit the current open-gate gap register.", type: "node", script: "tools/audit-gap-register.mjs" }],
  ["audit:gap-register-sync-closure", { description: "Audit that strict sync leaves the gap register only when sync-ready evidence exists.", type: "node", script: "tools/audit-gap-register-sync-closure.mjs" }],
  ["audit:gap-closure-plan", { description: "Audit bounded closure instructions for open gates.", type: "node", script: "tools/audit-gap-closure-plan.mjs" }],
  ["audit:goal-completion-audit", { description: "Audit active-goal completion evidence and no-completion boundary.", type: "node", script: "tools/audit-goal-completion-audit.mjs" }],
  ["audit:gate-evidence-packet", { description: "Audit the evidence intake packet for open gates.", type: "node", script: "tools/audit-gate-evidence-packet.mjs" }],
  ["audit:gate-closure-readiness", { description: "Audit the gate closure readiness report and no-closure boundary.", type: "node", script: "tools/audit-gate-closure-readiness.mjs" }],
  ["audit:gate-closure-review", { description: "Audit the gate closure review record and no-approval/no-closure boundary.", type: "node", script: "tools/audit-gate-closure-review.mjs" }],
  ["audit:framework-manifest", { description: "Audit the generated AI-native framework manifest.", type: "node", script: "tools/audit-framework-manifest.mjs" }],
  ["audit:framework-manifest-schema", { description: "Audit the schema contract for the generated framework manifest.", type: "node", script: "tools/audit-framework-manifest-schema.mjs" }],
  ["audit:gateboard", { description: "Audit the generated current gate board.", type: "node", script: "tools/audit-gateboard.mjs" }],
  ["audit:license-decision-from-owner-answer", { description: "Audit owner license answer to release decision record bridging.", type: "node", script: "tools/audit-license-decision-from-owner-answer.mjs" }],
  ["audit:license-packet", { description: "Audit the generated license decision packet.", type: "node", script: "tools/audit-license-packet.mjs" }],
  ["audit:mcp-stdio", { description: "Audit the local MCP stdio runtime candidate.", type: "node", script: "tools/audit-mcp-stdio-runtime.mjs" }],
  ["audit:mcp-server", { description: "Audit the local MCP server scaffold.", type: "node", script: "tools/audit-mcp-server-scaffold.mjs" }],
  ["audit:operator-runbook", { description: "Audit the generated ecosystem operator runbook.", type: "node", script: "tools/audit-operator-runbook.mjs" }],
  ["audit:owner-answer-review", { description: "Audit the owner answer review packet and blocked-gate boundary.", type: "node", script: "tools/audit-owner-answer-review.mjs" }],
  ["audit:owner-decision-answer-record", { description: "Audit the owner decision answer fixture and schema boundary.", type: "node", script: "tools/audit-owner-decision-answer-record.mjs" }],
  ["audit:owner-decision-intake", { description: "Audit the owner decision intake form and no-decision boundary.", type: "node", script: "tools/audit-owner-decision-intake.mjs" }],
  ["audit:owner-evidence-attachment-form", { description: "Audit the owner evidence attachment form and no-evidence boundary.", type: "node", script: "tools/audit-owner-evidence-attachment-form.mjs" }],
  ["audit:owner-evidence-submission-record", { description: "Audit the owner evidence submission record and no-submitted-evidence boundary.", type: "node", script: "tools/audit-owner-evidence-submission-record.mjs" }],
  ["audit:owner-evidence-submission-check", { description: "Audit the owner evidence submission check and no-gate-movement boundary.", type: "node", script: "tools/audit-owner-evidence-submission-check.mjs" }],
  ["audit:owner-evidence-bundle", { description: "Audit the owner evidence bundle and no-evidence/no-proof boundary.", type: "node", script: "tools/audit-owner-evidence-bundle.mjs" }],
  ["audit:owner-evidence-intake-record", { description: "Audit the owner evidence intake fixture and no-evidence boundary.", type: "node", script: "tools/audit-owner-evidence-intake-record.mjs" }],
  ["audit:owner-evidence-review", { description: "Audit the owner evidence review packet and blocked-gate boundary.", type: "node", script: "tools/audit-owner-evidence-review.mjs" }],
  ["audit:owner-proof-handoff", { description: "Audit the owner proof handoff and no-decision/no-proof boundary.", type: "node", script: "tools/audit-owner-proof-handoff.mjs" }],
  ["audit:owner-proof-input", { description: "Audit the owner proof input template/checker and no-decision/no-proof boundary.", type: "node", script: "tools/audit-owner-proof-input.mjs" }],
  ["audit:owner-proof-input-issue", { description: "Audit the public owner proof input issue form and handoff packet.", type: "node", script: "tools/audit-owner-proof-input-issue.mjs" }],
  ["audit:owner-proof-input-request", { description: "Audit the owner proof input request packet and no-proof boundaries.", type: "node", script: "tools/audit-owner-proof-input-request.mjs" }],
  ["audit:owner-proof-input-issue-convert", { description: "Audit owner proof input issue conversion and no-proof boundaries.", type: "node", script: "tools/audit-owner-proof-input-issue-convert.mjs" }],
  ["audit:owner-proof-input-review", { description: "Audit owner proof input review and no-proof boundaries.", type: "node", script: "tools/audit-owner-proof-input-review.mjs" }],
  ["audit:owner-proof-input-split", { description: "Audit owner proof input split routing and no-proof boundaries.", type: "node", script: "tools/audit-owner-proof-input-split.mjs" }],
  ["audit:owner-queue", { description: "Audit the generated owner action queue handoff.", type: "node", script: "tools/audit-owner-action-queue.mjs" }],
  ["audit:plugin-packet", { description: "Audit the generated plugin/action release-candidate packet.", type: "node", script: "tools/audit-plugin-release-packet.mjs" }],
  ["audit:proof-intake", { description: "Audit the generated first external proof intake kit.", type: "node", script: "tools/audit-proof-intake-kit.mjs" }],
  ["audit:proof-intake-check", { description: "Audit the proof intake record checker and report.", type: "node", script: "tools/audit-proof-intake-check.mjs" }],
  ["audit:proof-intake-from-owner-evidence", { description: "Audit owner evidence to proof intake record bridging.", type: "node", script: "tools/audit-proof-intake-from-owner-evidence.mjs" }],
  ["audit:proof-intake-record", { description: "Audit the generated schema-shaped proof intake fixture record.", type: "node", script: "tools/audit-proof-intake-record.mjs" }],
  ["audit:proof-intake-schema", { description: "Audit the local schema contract for proof intake records.", type: "node", script: "tools/audit-proof-intake-schema.mjs" }],
  ["audit:proof-redaction-packet", { description: "Audit the proof redaction checklist packet.", type: "node", script: "tools/audit-proof-redaction-packet.mjs" }],
  ["audit:proof-submission-packet", { description: "Audit the proof submission handoff packet.", type: "node", script: "tools/audit-proof-submission-packet.mjs" }],
  ["audit:proof-acceptance-packet", { description: "Audit the proof acceptance case creation gate packet.", type: "node", script: "tools/audit-proof-acceptance-packet.mjs" }],
  ["audit:proof-execution-report", { description: "Audit the proof execution command evidence report packet.", type: "node", script: "tools/audit-proof-execution-report.mjs" }],
  ["audit:proof-candidate-packet", { description: "Audit the first proof candidate selection packet.", type: "node", script: "tools/audit-proof-candidate-packet.mjs" }],
  ["audit:proof-packet", { description: "Audit the generated first-proof packet.", type: "node", script: "tools/audit-proof-packet.mjs" }],
  ["audit:proof-queue", { description: "Audit the v0.2 proof queue.", type: "node", script: "tools/audit-proof-queue.mjs" }],
  ["audit:proof-readiness", { description: "Audit the generated first weak artifact readiness packet.", type: "node", script: "tools/audit-proof-readiness-packet.mjs" }],
  ["audit:proof-run", { description: "Audit the generated first proof run packet.", type: "node", script: "tools/audit-proof-run-packet.mjs" }],
  ["audit:proof-run-dry", { description: "Run the proof path against a temporary local fixture.", type: "node", script: "tools/audit-proof-run-dry.mjs" }],
  ["audit:publication-evidence-packet", { description: "Audit the publication evidence packet and no-publication boundary.", type: "node", script: "tools/audit-publication-evidence-packet.mjs" }],
  ["audit:publish-packet", { description: "Audit the generated publish/sync handoff packet.", type: "node", script: "tools/audit-publish-handoff-packet.mjs" }],
  ["audit:publication", { description: "Audit the generated publication packet.", type: "node", script: "tools/audit-publication-packet.mjs" }],
  ["audit:reference-index", { description: "Audit the generated source-first reference pack index.", type: "node", script: "tools/audit-reference-pack-index.mjs" }],
  ["audit:release-decision-record", { description: "Audit the owner release decision record.", type: "node", script: "tools/audit-release-decision-record.mjs" }],
  ["audit:release-artifact-manifest", { description: "Audit the local release artifact hash manifest.", type: "node", script: "tools/audit-release-artifact-manifest.mjs" }],
  ["audit:release-evidence-report", { description: "Audit the release/publication evidence checklist report.", type: "node", script: "tools/audit-release-evidence-report.mjs" }],
  ["audit:release-execution", { description: "Audit the generated owner release execution handoff.", type: "node", script: "tools/audit-release-execution-packet.mjs" }],
  ["audit:release-review-bundle", { description: "Audit the local release review bundle and no-commit/no-publication boundary.", type: "node", script: "tools/audit-release-review-bundle.mjs" }],
  ["audit:release-order", { description: "Audit release preflight command ordering.", type: "node", script: "tools/audit-release-check-order.mjs" }],
  ["audit:package", { description: "Audit the npm package release-candidate surface.", type: "node", script: "tools/audit-package-surface.mjs" }],
  ["audit:action", { description: "Audit the GitHub Action release-candidate surface.", type: "node", script: "tools/audit-action-release-candidate.mjs" }],
  ["audit:superpowers-adapter", { description: "Audit the local Superpowers adapter packet, docs, CLI, and proof boundaries.", type: "node", script: "tools/audit-superpowers-adapter.mjs" }],
  ["audit:permissioned-fixture", { description: "Audit the reviewable permissioned-case fixture.", type: "node", script: "tools/audit-permissioned-fixture.mjs" }],
  ["audit:plugin-install-packet", { description: "Audit the local Codex plugin install-readiness packet.", type: "node", script: "tools/audit-plugin-install-packet.mjs" }],
  ["audit:remote", { description: "Audit expected GitHub public repository visibility.", type: "node", script: "tools/audit-remote-ecosystem.mjs" }],
  ["audit:remote-fallback", { description: "Audit public repository visibility fallback when gh auth fails.", type: "node", script: "tools/audit-remote-fallback.mjs" }],
  ["audit:secrets", { description: "Audit local files for common credential patterns.", type: "node", script: "tools/audit-secret-safety.mjs" }],
  ["audit:spec-index", { description: "Audit the spec README index and schema boundary surface.", type: "node", script: "tools/audit-spec-index.mjs" }],
  ["audit:state-summary", { description: "Audit the current state summary and open-gate boundaries.", type: "node", script: "tools/audit-current-state-summary.mjs" }],
  ["audit:status-roadmap", { description: "Audit that public status and roadmap docs match the local v0.1 surface.", type: "node", script: "tools/audit-status-roadmap-sync.mjs" }],
  ["audit:sync", { description: "Write local git sync status without requiring publication readiness.", type: "node", script: "tools/audit-sync-status.mjs" }],
  ["audit:sync:strict", { description: "Require a clean worktree synced with upstream.", type: "npm", script: "audit:sync:strict" }],
  ["audit:sync:strict-nonwriting", { description: "Audit that strict sync runs in non-writing mode for publication readiness.", type: "node", script: "tools/audit-sync-strict-nonwriting.mjs" }],
  ["audit:worktree-packet", { description: "Audit the local dirty worktree review packet and strict sync boundary.", type: "node", script: "tools/audit-worktree-review-packet.mjs" }],
]);

function usage() {
  console.log(`Mimesis Engineering local CLI

Usage:
  mimesis <command> [args]
  node bin/mimesis.mjs <command> [args]

Commands:`);

  for (const [name, spec] of commands) {
    console.log(`  ${name.padEnd(24)} ${spec.description}`);
  }

  console.log(`
Boundary:
  This is a local CLI wrapper. workspace:check can inspect a target .mimesis trail.
  It does not prove npm package release, marketplace integration, external adoption, or shipped plugins.
`);
}

function runNode(script, scriptArgs = []) {
  const result = spawnSync(process.execPath, [path.join(root, script), ...scriptArgs], {
    cwd: invocationCwd,
    stdio: "inherit",
  });
  process.exit(result.status ?? 1);
}

function runNpm(script, scriptArgs = []) {
  const command = npmExecPath || (process.platform === "win32" ? "cmd.exe" : "npm");
  const args = npmExecPath
    ? [npmExecPath, "run", script, ...scriptArgs]
    : process.platform === "win32"
      ? ["/d", "/s", "/c", "npm", "run", script, ...scriptArgs]
      : ["run", script, ...scriptArgs];
  const result = spawnSync(npmExecPath ? process.execPath : command, args, {
    cwd: root,
    stdio: "inherit",
  });
  process.exit(result.status ?? 1);
}

if (command === "--help" || command === "-h") {
  usage();
  process.exit(0);
}

const spec = commands.get(command);

if (!spec) {
  console.error(`Unknown command: ${command}\n`);
  usage();
  process.exit(1);
}

if (spec.type === "help") {
  usage();
  process.exit(0);
}

if (spec.type === "node") {
  runNode(spec.script, [...(spec.args ?? []), ...rest]);
}

if (spec.type === "npm") {
  runNpm(spec.script, rest);
}

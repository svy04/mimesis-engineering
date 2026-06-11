#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "framework-manifest.json");
const checkOnly = process.argv.includes("--check");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function stableStringify(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

const packageJson = readJson("package.json");

const manifest = {
  name: "mimesis-engineering",
  version: packageJson.version,
  status: "public-working-framework-v0.1",
  purpose: "AI-native work framework for improving one weak artifact through standards, references, and proof boundaries.",
  corePhrases: [
    "Give AI standards, not roles.",
    "Bring one weak artifact.",
    "No proof, no claim."
  ],
  loop: ["Import", "Distill", "Capsule", "Shard", "Verify", "Remember"],
  aiNativeShape: {
    primaryUse: "Give agents explicit artifact standards, source boundaries, case files, and validation commands.",
    humanInput: "one weak artifact plus constraints",
    agentOutput: "a stronger artifact, seven protocol files, and a visible proof boundary",
    memoryRule: "Remember only through explicit run ledger and case notes, not hidden claims."
  },
  entrypoints: [
    {
      name: "30-second orientation",
      path: "README.md",
      command: null
    },
    {
      name: "5-minute first loop",
      path: "docs/QUICKSTART.md",
      command: "npm run first-loop:demo"
    },
    {
      name: "framework spec",
      path: "spec/mimesis-v0.1.md",
      command: null
    },
    {
      name: "spec index",
      path: "spec/README.md",
      command: "npm run audit:spec-index"
    },
    {
      name: ".mimesis file protocol",
      path: "spec/file-protocol.md",
      command: "npm run validate"
    },
    {
      name: "proof boundary",
      path: "PROOF-BOUNDARY.md",
      command: null
    },
    {
      name: "machine-readable manifest",
      path: ".mimesis/framework-manifest.json",
      command: "npm run framework:manifest"
    },
    {
      name: "source-first reference pack index",
      path: ".mimesis/reference-packs/index.json",
      command: "npm run reference:index"
    },
    {
      name: "proof intake schema",
      path: "spec/proof-intake.schema.json",
      command: "npm run audit:proof-intake-schema"
    },
    {
      name: "proof intake fixture record",
      path: ".mimesis/proof-intake/fixture-record.json",
      command: "npm run proof:intake-record"
    },
    {
      name: "proof intake check report",
      path: ".mimesis/proof-intake/fixture-check.md",
      command: "npm run proof:intake-check"
    },
    {
      name: "proof intake from owner evidence bridge",
      path: ".mimesis/proof-intake/from-owner-evidence-bridge.md",
      command: "npm run proof:intake-from-owner-evidence"
    },
    {
      name: "proof redaction packet",
      path: ".mimesis/proof-intake/redaction-packet.md",
      command: "npm run proof:redaction-packet"
    },
    {
      name: "proof submission packet",
      path: ".mimesis/proof-intake/submission-packet.md",
      command: "npm run proof:submission-packet"
    },
    {
      name: "proof acceptance packet",
      path: ".mimesis/proof-intake/acceptance-packet.md",
      command: "npm run proof:acceptance-packet"
    },
    {
      name: "proof execution report",
      path: ".mimesis/proof-runs/execution-report.md",
      command: "npm run proof:execution-report"
    },
    {
      name: "first weak artifact readiness",
      path: ".mimesis/proof-runs/readiness.md",
      command: "npm run proof:readiness"
    },
    {
      name: "first proof candidate packet",
      path: ".mimesis/proof-candidates/first-candidate.md",
      command: "npm run proof:candidate-packet"
    },
    {
      name: "current gap register",
      path: ".mimesis/gaps/current-gap-register.json",
      command: "npm run gap:register"
    },
    {
      name: "gap closure plan",
      path: ".mimesis/gaps/closure-plan.json",
      command: "npm run gap:closure-plan"
    },
    {
      name: "gate evidence packet",
      path: ".mimesis/gates/evidence-packet.md",
      command: "npm run gate:evidence-packet"
    },
    {
      name: "gate closure readiness report",
      path: ".mimesis/gates/closure-readiness.json",
      command: "npm run gate:closure-readiness"
    },
    {
      name: "gate closure review record",
      path: ".mimesis/gates/closure-review.json",
      command: "npm run gate:closure-review"
    },
    {
      name: "case from proof intake record",
      path: "docs/CASE-FROM-RECORD.md",
      command: "npm run cli -- case:from-record .mimesis/proof-intake/fixture-record.json"
    },
    {
      name: "evidence from completed case",
      path: "docs/EVIDENCE-FROM-CASE.md",
      command: "npm run cli -- evidence:from-case . --out .mimesis/evidence-packets/local-case-draft.md --force"
    },
    {
      name: "evidence review",
      path: "docs/EVIDENCE-REVIEW.md",
      command: "npm run cli -- evidence:review path/to/evidence-packet.md --decision reviewed --reviewer \"Reviewer Name\" --note \"Reviewed against the proof boundary.\" --out path/to/reviewed-evidence.md"
    },
    {
      name: "claim from reviewed evidence",
      path: "docs/CLAIM-FROM-EVIDENCE.md",
      command: "npm run cli -- claim:from-evidence path/to/reviewed-evidence.md --out path/to/claim-candidate.md"
    },
    {
      name: "local Codex plugin install readiness",
      path: ".mimesis/plugin-install-packets/codex-local.md",
      command: "npm run plugin:install-packet"
    },
    {
      name: "owner release decision record",
      path: ".mimesis/release-decisions/owner-decision-record.json",
      command: "npm run release:decision-record"
    },
    {
      name: "release evidence report",
      path: ".mimesis/release-evidence/v0.1-report.md",
      command: "npm run release:evidence-report"
    },
    {
      name: "publication evidence intake",
      path: ".mimesis/release-evidence/publication-evidence-packet.md",
      command: "npm run publication:evidence-packet"
    },
    {
      name: "external adoption evidence intake",
      path: ".mimesis/adoption-packets/v0.2-first-adoption.md",
      command: "npm run adoption:packet"
    },
    {
      name: "owner action queue",
      path: ".mimesis/owner-actions/current-action-queue.md",
      command: "npm run owner:queue"
    },
    {
      name: "owner decision intake",
      path: ".mimesis/owner-actions/decision-intake.md",
      command: "npm run owner:decision-intake"
    },
    {
      name: "owner decision answer record",
      path: ".mimesis/owner-actions/fixture-answer-record.json",
      command: "npm run owner:decision-answer-record"
    },
    {
      name: "owner answer review",
      path: ".mimesis/owner-actions/answer-review.md",
      command: "npm run owner:answer-review"
    },
    {
      name: "owner evidence bundle",
      path: ".mimesis/owner-actions/evidence-bundle.md",
      command: "npm run owner:evidence-bundle"
    },
    {
      name: "owner evidence intake record",
      path: ".mimesis/owner-actions/fixture-evidence-record.json",
      command: "npm run owner:evidence-intake-record"
    },
    {
      name: "owner evidence review",
      path: ".mimesis/owner-actions/evidence-review.md",
      command: "npm run owner:evidence-review"
    },
    {
      name: "owner evidence attachment form",
      path: ".mimesis/owner-actions/evidence-attachment-form.md",
      command: "npm run owner:evidence-attachment-form"
    },
    {
      name: "owner evidence submission record",
      path: ".mimesis/owner-actions/fixture-evidence-submission-record.json",
      command: "npm run owner:evidence-submission-record"
    },
    {
      name: "owner evidence submission check",
      path: ".mimesis/owner-actions/fixture-evidence-submission-check.md",
      command: "npm run owner:evidence-submission-check"
    },
    {
      name: "current state summary",
      path: ".mimesis/state/current-state.json",
      command: "npm run state:summary"
    },
    {
      name: "worktree review packet",
      path: ".mimesis/worktree/review-packet.json",
      command: "npm run worktree:packet"
    },
    {
      name: "release review bundle",
      path: ".mimesis/release-review/v0.1-bundle.json",
      command: "npm run release:review-bundle"
    },
    {
      name: "goal completion audit",
      path: ".mimesis/completion/goal-completion-audit.json",
      command: "npm run goal:completion-audit"
    },
    {
      name: "release artifact manifest",
      path: ".mimesis/release-artifacts/v0.1-manifest.json",
      command: "npm run release:artifact-manifest"
    }
  ],
  commands: [
    {
      name: "validate",
      purpose: "Check the local framework file protocol and public surface."
    },
    {
      name: "first-loop:demo",
      purpose: "Generate a completed local demo case from one weak README fixture."
    },
    {
      name: "audit:first-loop",
      purpose: "Check the generated local demo case with workspace and case audits."
    },
    {
      name: "gap:register",
      purpose: "Generate the current machine-readable open-gate register."
    },
    {
      name: "audit:gap-register",
      purpose: "Check that remaining owner, proof, publication, benchmark, and adoption gates stay visible and bounded."
    },
    {
      name: "audit:gap-register-sync-closure",
      purpose: "Check that the strict sync gap remains open until sync-ready evidence exists, then leaves the open-gate register."
    },
    {
      name: "gap:closure-plan",
      purpose: "Generate bounded evidence steps for closing the current open gates without claiming closure."
    },
    {
      name: "audit:gap-closure-plan",
      purpose: "Check that open gates have closure instructions, stop conditions, and proof boundaries."
    },
    {
      name: "gate:evidence-packet",
      purpose: "Generate the evidence intake packet for routing open gates to evidence requirements."
    },
    {
      name: "audit:gate-evidence-packet",
      purpose: "Check that open gates have an evidence intake packet without claiming evidence."
    },
    {
      name: "gate:closure-readiness",
      purpose: "Generate the machine-readable readiness report for open gates without closing gates."
    },
    {
      name: "audit:gate-closure-readiness",
      purpose: "Check that open gates remain not-ready until direct evidence exists."
    },
    {
      name: "gate:closure-review",
      purpose: "Generate the machine-readable gate closure review record without approving or closing gates."
    },
    {
      name: "audit:gate-closure-review",
      purpose: "Check that gate closure attempts remain keep_open until direct evidence exists."
    },
    {
      name: "framework:manifest",
      purpose: "Generate this AI-native framework manifest."
    },
    {
      name: "audit:framework-manifest",
      purpose: "Check the manifest, docs, CLI exposure, and proof boundaries."
    },
    {
      name: "reference:index",
      purpose: "Generate a machine-readable source-first standards index from reference packs."
    },
    {
      name: "audit:reference-index",
      purpose: "Check generated reference pack index freshness, source-first fields, and copy boundaries."
    },
    {
      name: "audit:spec-index",
      purpose: "Check the spec README indexes all local framework contracts and schema boundaries."
    },
    {
      name: "audit:proof-intake-schema",
      purpose: "Check the local schema contract for permissioned proof intake records."
    },
    {
      name: "proof:intake-record",
      purpose: "Generate a schema-shaped local fixture record from the permissioned-case intake markdown."
    },
    {
      name: "proof:intake-check",
      purpose: "Check a schema-shaped proof intake record before started-case creation."
    },
    {
      name: "proof:intake-from-owner-evidence",
      purpose: "Bridge a reviewed owner weak_artifact_permission field into a proof intake record without claiming permission or proof."
    },
    {
      name: "audit:proof-intake-record",
      purpose: "Check proof intake record freshness, schema conformance, safety confirmations, and proof boundaries."
    },
    {
      name: "audit:proof-intake-check",
      purpose: "Check proof intake record validation, report output, failure behavior, and no-proof boundary."
    },
    {
      name: "audit:proof-intake-from-owner-evidence",
      purpose: "Check owner evidence to proof intake conversion, blocked fixture behavior, safety confirmations, and started-case boundary."
    },
    {
      name: "proof:redaction-packet",
      purpose: "Generate a redaction checklist packet before a permissioned weak artifact enters the proof path."
    },
    {
      name: "audit:proof-redaction-packet",
      purpose: "Check the proof redaction packet and no-proof/private-data boundary."
    },
    {
      name: "proof:submission-packet",
      purpose: "Generate the proof submission handoff packet without submitting an artifact."
    },
    {
      name: "audit:proof-submission-packet",
      purpose: "Check the proof submission packet and not-submitted/no-proof boundary."
    },
    {
      name: "proof:acceptance-packet",
      purpose: "Generate the proof acceptance case creation gate without accepting an artifact."
    },
    {
      name: "audit:proof-acceptance-packet",
      purpose: "Check the proof acceptance packet and no-accepted-artifact/no-proof boundary."
    },
    {
      name: "proof:execution-report",
      purpose: "Generate the proof execution command evidence ledger without executing commands."
    },
    {
      name: "audit:proof-execution-report",
      purpose: "Check the proof execution report and no-executed-proof boundary."
    },
    {
      name: "proof:readiness",
      purpose: "Generate the first weak artifact readiness packet before the real proof artifact arrives."
    },
    {
      name: "audit:proof-readiness",
      purpose: "Check the readiness packet, command path, blocked gates, and proof boundaries."
    },
    {
      name: "proof:candidate-packet",
      purpose: "Generate the first proof candidate selection packet without selecting a candidate."
    },
    {
      name: "audit:proof-candidate-packet",
      purpose: "Check the first proof candidate packet and no-proof boundary."
    },
    {
      name: "case:from-record",
      purpose: "Create a started case workspace from a schema-shaped proof intake record."
    },
    {
      name: "audit:case-from-record",
      purpose: "Smoke-test proof-intake-record to started-case workspace creation."
    },
    {
      name: "evidence:from-case",
      purpose: "Create a draft evidence packet from a completed local case workspace."
    },
    {
      name: "audit:evidence-from-case",
      purpose: "Smoke-test completed-case to draft-evidence packet creation while preserving the review gate."
    },
    {
      name: "evidence:review",
      purpose: "Record a named reviewer decision on an evidence packet."
    },
    {
      name: "audit:evidence-review",
      purpose: "Smoke-test reviewed, rejected, and missing-reviewer evidence decision paths."
    },
    {
      name: "claim:from-evidence",
      purpose: "Create a bounded claim candidate from a reviewed evidence packet."
    },
    {
      name: "audit:claim-from-evidence",
      purpose: "Smoke-test reviewed-evidence to bounded-claim candidate creation."
    },
    {
      name: "mcp:resources",
      purpose: "Generate the local MCP resource index scaffold."
    },
    {
      name: "audit:mcp-stdio",
      purpose: "Smoke-test the local stdio runtime candidate without executing tool commands."
    },
    {
      name: "plugin:install-packet",
      purpose: "Generate the local Codex plugin install-readiness packet without installing or shipping the plugin."
    },
    {
      name: "audit:plugin-install-packet",
      purpose: "Check the local Codex plugin install-readiness packet and not-installed boundary."
    },
    {
      name: "release:decision-record",
      purpose: "Generate the machine-readable owner release decision record without choosing or publishing."
    },
    {
      name: "audit:release-decision-record",
      purpose: "Check owner release decisions remain pending or blocked and bounded."
    },
    {
      name: "release:evidence-report",
      purpose: "Generate the publication evidence checklist without publishing."
    },
    {
      name: "audit:release-evidence-report",
      purpose: "Check release evidence requirements and publication boundaries."
    },
    {
      name: "publication:evidence-packet",
      purpose: "Generate the publication evidence intake packet for package, action, and plugin claims without publishing."
    },
    {
      name: "audit:publication-evidence-packet",
      purpose: "Check the publication evidence packet, release preflight order, public docs, and no-publication boundary."
    },
    {
      name: "adoption:packet",
      purpose: "Generate the external adoption evidence intake packet without creating evidence or claiming adoption."
    },
    {
      name: "audit:adoption-packet",
      purpose: "Check the adoption evidence intake packet, CLI wiring, release preflight order, and no-adoption-proof boundary."
    },
    {
      name: "owner:queue",
      purpose: "Generate the owner action queue without making owner decisions or creating proof."
    },
    {
      name: "audit:owner-queue",
      purpose: "Check the owner action queue, source coverage, and no-decision/no-proof boundaries."
    },
    {
      name: "owner:decision-intake",
      purpose: "Generate the owner decision intake form without choosing a license, collecting an artifact, or closing gates."
    },
    {
      name: "audit:owner-decision-intake",
      purpose: "Check the owner decision intake form, source coverage, and no-decision/no-proof boundaries."
    },
    {
      name: "owner:decision-answer-record",
      purpose: "Generate the schema-shaped pending owner answer record without making owner decisions or closing gates."
    },
    {
      name: "audit:owner-decision-answer-record",
      purpose: "Check the owner decision answer record schema, freshness, and no-decision/no-proof boundaries."
    },
    {
      name: "owner:answer-review",
      purpose: "Generate a review packet showing pending owner answers keep gates blocked."
    },
    {
      name: "audit:owner-answer-review",
      purpose: "Check the owner answer review packet, blocked gates, and no-decision/no-proof boundaries."
    },
    {
      name: "owner:evidence-bundle",
      purpose: "Generate the owner evidence attachment bundle without creating evidence or closing gates."
    },
    {
      name: "audit:owner-evidence-bundle",
      purpose: "Check the owner evidence bundle, required attachments, command hints, and no-evidence/no-proof boundaries."
    },
    {
      name: "owner:evidence-intake-record",
      purpose: "Generate the schema-shaped pending owner evidence record without attaching evidence or closing gates."
    },
    {
      name: "audit:owner-evidence-intake-record",
      purpose: "Check the owner evidence intake record schema, freshness, and no-evidence/no-proof boundaries."
    },
    {
      name: "owner:evidence-review",
      purpose: "Generate a review packet showing pending owner evidence keeps gates blocked."
    },
    {
      name: "audit:owner-evidence-review",
      purpose: "Check the owner evidence review packet, blocked gates, and no-evidence/no-proof boundaries."
    },
    {
      name: "owner:evidence-attachment-form",
      purpose: "Generate the owner-facing attachment form for direct evidence without creating evidence."
    },
    {
      name: "audit:owner-evidence-attachment-form",
      purpose: "Check the owner evidence attachment form, required fields, blocked gates, and no-evidence boundary."
    },
    {
      name: "owner:evidence-submission-record",
      purpose: "Generate the schema-shaped owner evidence submission record without submitting evidence."
    },
    {
      name: "audit:owner-evidence-submission-record",
      purpose: "Check the owner evidence submission record, missing evidence status, blocked gates, and no-submitted-evidence boundary."
    },
    {
      name: "owner:evidence-submission-check",
      purpose: "Check an owner evidence submission record before it can influence gate movement."
    },
    {
      name: "audit:owner-evidence-submission-check",
      purpose: "Check owner evidence submission validation, report output, unsafe-record failure behavior, and no-closure boundary."
    },
    {
      name: "state:summary",
      purpose: "Generate a machine-readable current state summary from open gates and owner evidence packets without closing gates."
    },
    {
      name: "audit:state-summary",
      purpose: "Check the current state summary, source coverage, and no-proof/no-closure boundaries."
    },
    {
      name: "worktree:packet",
      purpose: "Generate a local dirty worktree review packet without staging, committing, pushing, closing strict sync, or publishing."
    },
    {
      name: "audit:worktree-packet",
      purpose: "Check the dirty worktree review packet, git status counts, public docs, CLI exposure, and strict sync boundary."
    },
    {
      name: "release:review-bundle",
      purpose: "Generate a local release review bundle that classifies dirty worktree scope without committing or publishing."
    },
    {
      name: "audit:release-review-bundle",
      purpose: "Check the release review bundle, review groups, public docs, CLI exposure, and no-commit/no-publication boundaries."
    },
    {
      name: "goal:completion-audit",
      purpose: "Generate a local active-goal completion audit from current gates, state, and release review evidence."
    },
    {
      name: "audit:goal-completion-audit",
      purpose: "Check that active-goal completion remains blocked while open gates remain."
    },
    {
      name: "release:artifact-manifest",
      purpose: "Generate a local SHA-256 inventory of selected v0.1 release-review artifacts without publishing."
    },
    {
      name: "audit:release-artifact-manifest",
      purpose: "Check the release artifact manifest, hashes, CLI exposure, release preflight wiring, and proof boundaries."
    },
    {
      name: "audit:status-roadmap",
      purpose: "Check that STATUS.md and ROADMAP.md name the current local v0.1 implementation surface."
    },
    {
      name: "audit:sync:strict-nonwriting",
      purpose: "Check that strict sync publication readiness runs without writing to the worktree."
    },
    {
      name: "release:check:public",
      purpose: "Run local, workspace, and read-only public visibility checks."
    }
  ],
  artifacts: [
    {
      name: "spec/",
      purpose: "Framework contract, file protocol, quality bar, and adapter contract."
    },
    {
      name: ".mimesis file protocol",
      purpose: "Visible artifact trail for each loop."
    },
    {
      name: "templates/",
      purpose: "Copyable starting files for the seven-artifact loop."
    },
    {
      name: "reference-packs/",
      purpose: "Source-first pattern packs that help agents extract structure without copying surface."
    },
    {
      name: "cases/",
      purpose: "Before/after examples and claim boundaries."
    },
    {
      name: "prompts/",
      purpose: "Reusable prompt surfaces for artifact analysis and risk inspection."
    },
    {
      name: "adapters/",
      purpose: "Tool-specific integration contracts and packets."
    },
    {
      name: "plugins/",
      purpose: "Local plugin/action/MCP scaffolds with status labels."
    }
  ],
  gates: [
    {
      name: "license decision",
      status: "owner-gated",
      evidence: "docs/LICENSE-PACKET.md and LICENSE.md"
    },
    {
      name: "external proof",
      status: "needs permissioned or clearly redacted weak artifact",
      evidence: "docs/PROOF-INTAKE-KIT.md and docs/V0.2-PROOF-QUEUE.md"
    },
    {
      name: "strict sync",
      status: "blocked until clean and synced worktree",
      evidence: ".mimesis/sync-status.md"
    },
    {
      name: "package publication",
      status: "not published",
      evidence: "docs/PACKAGE-RELEASE-CANDIDATE.md"
    },
    {
      name: "plugin/action release",
      status: "release-candidate only",
      evidence: "docs/PLUGIN-RELEASE-PACKET.md and docs/ACTION-RELEASE-CANDIDATE.md"
    },
    {
      name: "benchmark/adoption",
      status: "measurement protocol only",
      evidence: "docs/BENCHMARK-PACKET.md"
    }
  ],
  boundaries: [
    {
      name: "not external adoption proof",
      detail: "Local demos and read-only remote visibility checks do not prove usage by outside operators."
    },
    {
      name: "not benchmark proof",
      detail: "The benchmark packet is a protocol, not a completed study."
    },
    {
      name: "not package publication proof",
      detail: "npm pack dry-run and release-candidate checks do not publish a package."
    },
    {
      name: "not a legal originality guarantee",
      detail: "Originality checks are workflow boundaries, not legal advice or legal guarantees."
    },
    {
      name: "not shipped plugin proof",
      detail: "Local plugin and MCP scaffolds are not Marketplace releases or connector installations."
    }
  ],
  generatedFrom: [
    "package.json",
    "README.md",
    "spec/README.md",
    "spec/mimesis-v0.1.md",
    "spec/file-protocol.md",
    "spec/current-state-summary.schema.json",
    "spec/gate-closure-readiness.schema.json",
    "spec/gate-closure-review.schema.json",
    "spec/worktree-review-packet.schema.json",
    "spec/release-review-bundle.schema.json",
    "spec/proof-intake.schema.json",
    "spec/owner-decision-answer.schema.json",
    "spec/owner-evidence-intake.schema.json",
    "spec/owner-evidence-submission.schema.json",
    "docs/COMPLETION-AUDIT.md",
    "docs/GAP-REGISTER.md",
    "tools/audit-gap-register-sync-closure.mjs",
    "docs/GAP-CLOSURE-PLAN.md",
    "docs/GATE-EVIDENCE-PACKET.md",
    "docs/GATE-CLOSURE-READINESS.md",
    "docs/GATE-CLOSURE-REVIEW.md",
    "docs/FIRST-PROOF-CANDIDATE-PACKET.md",
    "docs/PROOF-REDACTION-PACKET.md",
    "docs/PROOF-SUBMISSION-PACKET.md",
    "docs/PROOF-ACCEPTANCE-PACKET.md",
    "docs/PROOF-EXECUTION-REPORT.md",
    "docs/PROOF-INTAKE-RECORD.md",
    "docs/PROOF-INTAKE-CHECK.md",
    "docs/PROOF-INTAKE-FROM-OWNER-EVIDENCE.md",
    "docs/PROOF-READINESS-PACKET.md",
    "docs/CASE-FROM-RECORD.md",
    "docs/EVIDENCE-FROM-CASE.md",
    "docs/EVIDENCE-REVIEW.md",
    "docs/CLAIM-FROM-EVIDENCE.md",
    "docs/PLUGIN-INSTALL-PACKET.md",
    "docs/STATUS-ROADMAP-SYNC.md",
    "docs/RELEASE-DECISION-RECORD.md",
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
    "docs/CURRENT-STATE-SUMMARY.md",
    "docs/WORKTREE-REVIEW-PACKET.md",
    "docs/RELEASE-REVIEW-BUNDLE.md",
    "docs/RELEASE-ARTIFACT-MANIFEST.md",
    "docs/PROOF-INTAKE-SCHEMA.md",
    "tools/proof-intake-from-owner-evidence.mjs",
    "tools/audit-proof-intake-from-owner-evidence.mjs",
    "docs/REFERENCE-PACK-INDEX.md",
    "reference-packs/README.md",
    "PROOF-BOUNDARY.md",
    "STATUS.md",
    "ROADMAP.md"
  ]
};

const serialized = stableStringify(manifest);

if (checkOnly) {
  if (!fs.existsSync(outputPath)) {
    throw new Error(".mimesis/framework-manifest.json is missing; run npm run framework:manifest");
  }

  const current = fs.readFileSync(outputPath, "utf8");
  if (current !== serialized) {
    throw new Error(".mimesis/framework-manifest.json is stale; run npm run framework:manifest");
  }

  console.log("Mimesis framework manifest check passed.");
  process.exit(0);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, serialized);

console.log(`[framework-manifest] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

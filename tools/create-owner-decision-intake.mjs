#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "owner-actions", "decision-intake.md");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function requiredEvidence(decision) {
  if (!Array.isArray(decision?.requiredEvidence) || decision.requiredEvidence.length === 0) {
    return "owner-attached evidence required";
  }
  return decision.requiredEvidence.join("<br>");
}

const packageJson = readJson("package.json");
const gapRegister = readJson(".mimesis/gaps/current-gap-register.json");
const decisionRecord = readJson(".mimesis/release-decisions/owner-decision-record.json");
const queue = read(".mimesis/owner-actions/current-action-queue.md");
const proofIntake = read(".mimesis/proof-intake/first-external-proof-kit.md");
const licensePacket = read(".mimesis/license-packets/owner-decision.md");
const releaseEvidence = read(".mimesis/release-evidence/v0.1-report.md");

const gapById = new Map((gapRegister.gaps ?? []).map((gap) => [gap.id, gap]));
const queueReady = queue.includes("## Owner Action Queue") ? "yes" : "missing";
const proofIntakeReady = proofIntake.includes("permissioned") ? "yes" : "missing";
const licensePacketReady = licensePacket.includes("## Owner Decision Questions") ? "yes" : "missing";
const releaseEvidenceReady = releaseEvidence.includes("## Publication Evidence Table") ? "yes" : "missing";

function gapSignal(id) {
  const gap = gapById.get(id);
  if (!gap) {
    return "missing gap";
  }
  return `${gap.status}: ${gap.nextAction}`;
}

const formRows = [
  {
    field: "license_or_no_reuse",
    ownerAnswer: "Choose an exact reuse license, split code/content licenses, or keep no-reuse for now.",
    currentSignal: `${decisionRecord.license?.decision ?? "missing"} / ${decisionRecord.license?.currentSignal ?? "missing"} / ${gapSignal("owner_license_decision")}`,
    evidence: requiredEvidence(decisionRecord.license),
    boundary: "does not choose a license",
  },
  {
    field: "weak_artifact_permission",
    ownerAnswer: "Attach one weak artifact and confirm permission, redaction, submitter scope, and publication scope.",
    currentSignal: `${decisionRecord.externalProof?.decision ?? "missing"} / ${decisionRecord.externalProof?.currentSignal ?? "missing"} / ${gapSignal("permissioned_external_artifact")}`,
    evidence: "docs/PROOF-INTAKE-KIT.md<br>.mimesis/proof-intake/first-external-proof-kit.md<br>permissioned or clearly redacted weak artifact",
    boundary: "does not collect an artifact or grant permission",
  },
  {
    field: "publication_scope",
    ownerAnswer: "Choose unpublished local packet, PR, public release, or later release after gates close.",
    currentSignal: `${decisionRecord.publicRelease?.decision ?? "missing"} / ${decisionRecord.publicRelease?.currentSignal ?? "missing"} / ${gapSignal("strict_publish_sync")}`,
    evidence: requiredEvidence(decisionRecord.publicRelease),
    boundary: "does not publish",
  },
  {
    field: "package_action_plugin_scope",
    ownerAnswer: "Choose whether npm, tagged action, Marketplace, plugin, or connector release is in scope after proof gates.",
    currentSignal: [
      decisionRecord.npmPublication?.currentSignal,
      decisionRecord.actionPublication?.currentSignal,
      decisionRecord.pluginPublication?.currentSignal,
    ].filter(Boolean).join(" / ") || "missing",
    evidence: [
      requiredEvidence(decisionRecord.npmPublication),
      requiredEvidence(decisionRecord.actionPublication),
      requiredEvidence(decisionRecord.pluginPublication),
    ].join("<br>"),
    boundary: "does not publish, ship a plugin, or prove official host compliance",
  },
  {
    field: "benchmark_adoption_scope",
    ownerAnswer: "Choose whether to run a benchmark/adoption study and name the evidence reviewer.",
    currentSignal: `${decisionRecord.benchmarkOrAdoption?.decision ?? "missing"} / ${decisionRecord.benchmarkOrAdoption?.currentSignal ?? "missing"} / ${gapSignal("benchmark_study")}`,
    evidence: requiredEvidence(decisionRecord.benchmarkOrAdoption),
    boundary: "does not prove adoption, productivity, customer outcomes, or benchmark results",
  },
  {
    field: "strict_sync_intent",
    ownerAnswer: "Confirm whether to clean, stage, commit, push, tag, or keep this as local evidence only.",
    currentSignal: decisionRecord.syncProof?.currentSignal ?? "runtime_sync_audit_required",
    evidence: "npm run audit:sync:strict",
    boundary: "does not stage, commit, push, tag, release, close gates, or prove sync",
  },
];

const formTable = formRows
  .map((row) => `| \`${row.field}\` | ${row.ownerAnswer} | ${row.currentSignal} | ${row.evidence} | ${row.boundary} |`)
  .join("\n");

const requiredAnswers = formRows
  .map((row) => `- \`${row.field}\`: owner answer required; current packet does not fill this field.`)
  .join("\n");

const generated = `# Mimesis Owner Decision Intake

Status: owner decision intake packet, not owner decision.

Generated for Mimesis Engineering v${packageJson.version} from the owner action queue, release decision record, proof intake kit, license packet, release evidence report, and gap register.

This packet answers one narrow question:

\`\`\`text
What exact owner answers and attachments are needed before any stronger release, proof, package, action, plugin, benchmark, or adoption claim?
\`\`\`

## Source Queue

- .mimesis/owner-actions/current-action-queue.md
- .mimesis/release-decisions/owner-decision-record.json
- .mimesis/proof-intake/first-external-proof-kit.md
- .mimesis/license-packets/owner-decision.md
- .mimesis/release-evidence/v0.1-report.md
- .mimesis/gaps/current-gap-register.json

Source readiness:

- owner action queue: ${queueReady}
- proof intake kit: ${proofIntakeReady}
- license packet: ${licensePacketReady}
- release evidence table: ${releaseEvidenceReady}

## Decision Intake Form

| Field | Owner Answer Needed | Current Signal | Evidence To Attach | Boundary |
| --- | --- | --- | --- | --- |
${formTable}

## Required Owner Answers

${requiredAnswers}

Owner-facing gate IDs to keep visible:

- \`owner_license_decision\`
- \`permissioned_external_artifact\`
- \`completed_external_case\`
- \`strict_publish_sync\`
- \`package_publication\`
- \`action_publication\`
- \`shipped_plugin\`
- \`benchmark_study\`
- \`external_adoption\`

## Evidence To Attach

- Exact license text or explicit no-reuse decision.
- One weak artifact with permission or clear redaction.
- Submitter and publication scope for the weak artifact.
- Before/after case path after \`case:review\`, \`case:from-intake\`, and \`case:check\`.
- Release, package, action, plugin, benchmark, or adoption evidence only when those scopes are chosen and reviewed.
- Sync evidence only when the owner intends to publish, tag, release, or package.

## Stop Conditions

- Stop if \`license_or_no_reuse\` is blank.
- Stop if \`weak_artifact_permission\` lacks permission, redaction, submitter scope, or publication scope.
- Stop if \`publication_scope\` asks for release while strict sync is blocked.
- Stop if \`package_action_plugin_scope\` asks for npm, Marketplace, plugin, or connector claims without direct publication or installation evidence.
- Stop if \`benchmark_adoption_scope\` asks for productivity, adoption, or customer-outcome claims without reviewed evidence.
- Stop if \`strict_sync_intent\` asks for release without a fresh passing runtime-only sync proof.

## Allowed Claim

Mimesis has a local owner decision intake packet that names the owner answers and attachments required before stronger claims.

## Disallowed Claim

The owner decision intake is not an owner decision.
It does not mean the owner has chosen a license.
It does not mean an external weak artifact has been submitted.
It does not mean permission has been granted.
It does not mean a before/after external case is complete.
It does not mean publication, npm release, Marketplace release, plugin shipment, benchmark proof, or adoption proof exists.
It does not mean gates are closed.

## Boundary

This packet does not choose a license.
It does not collect an artifact.
It does not grant permission.
It does not redact files.
It does not accept an artifact.
It does not run a transformation.
It does not publish.
It does not stage, commit, push, tag, or release.
It does not publish to npm.
It does not publish a GitHub Marketplace action.
It does not ship a plugin.
It does not create external proof.
It does not prove adoption.
It does not close gates.
It does not prove sync.
It does not prove benchmarked productivity, customer outcomes, commercial outcomes, legal originality, or endorsement.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[owner-decision-intake] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

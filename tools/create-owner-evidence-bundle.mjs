#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const outputIndex = args.indexOf("--output");

const outputRelative = outputIndex >= 0 && args[outputIndex + 1]
  ? args[outputIndex + 1]
  : ".mimesis/owner-actions/evidence-bundle.md";

const outputPath = path.resolve(root, outputRelative);

const sources = {
  answerReview: ".mimesis/owner-actions/answer-review.md",
  answerRecord: ".mimesis/owner-actions/fixture-answer-record.json",
  gateEvidencePacket: ".mimesis/gates/evidence-packet.md",
  closurePlan: ".mimesis/gaps/closure-plan.json",
  releaseEvidenceReport: ".mimesis/release-evidence/v0.1-report.md",
};

const fieldGateMap = {
  license_or_no_reuse: ["owner_license_decision"],
  weak_artifact_permission: ["permissioned_external_artifact", "completed_external_case"],
  publication_scope: ["strict_publish_sync"],
  package_action_plugin_scope: ["package_publication", "action_publication", "shipped_plugin"],
  benchmark_adoption_scope: ["benchmark_study", "external_adoption"],
  strict_sync_intent: ["strict_publish_sync"],
};

const fieldCommands = {
  license_or_no_reuse: [
    "npm run audit:license",
    "npm run license:packet",
    "npm run release:decision-record",
    "npm run audit:release-decision-record",
  ],
  weak_artifact_permission: [
    "npm run proof:intake",
    "npm run proof:redaction-packet",
    "npm run cli -- case:review",
    "npm run cli -- case:from-intake",
    "npm run cli -- case:check",
    "npm run evidence:from-case",
    "npm run evidence:review",
  ],
  publication_scope: [
    "npm run release:check:public",
    "npm run audit:sync:strict",
  ],
  package_action_plugin_scope: [
    "npm run audit:package",
    "npm run package:dry-run",
    "npm run audit:action",
    "npm run plugin:packet",
    "npm run audit:plugin-packet",
  ],
  benchmark_adoption_scope: [
    "npm run benchmark:packet",
    "npm run audit:benchmark-packet",
    "npm run evidence:review",
  ],
  strict_sync_intent: [
    "npm run audit:sync",
    "npm run audit:sync:strict",
    "git status --short --branch",
  ],
};

const fieldStopConditions = {
  license_or_no_reuse: "Stop if no owner license or no-reuse decision exists.",
  weak_artifact_permission: "Stop if permission, redaction, submitter scope, before/after evidence, or reviewed evidence is unclear.",
  publication_scope: "Stop if release:check:public or audit:sync:strict has not passed fresh after the owner intends to publish.",
  package_action_plugin_scope: "Stop if only dry-run, local action metadata, local scaffolds, or install-readiness packets exist.",
  benchmark_adoption_scope: "Stop if no measured study, external usage signal, or reviewed evidence packet exists.",
  strict_sync_intent: "Stop if the worktree is dirty and no owner has requested staging, committing, pushing, tagging, releasing, or publishing.",
};

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function sourceLine(label, relativePath, status) {
  return `- ${label}: ${relativePath} (${status})`;
}

function formatList(items) {
  return items.map((item) => `\`${item}\``).join("<br>");
}

function fieldRows(record) {
  return Object.entries(record.fields ?? {})
    .map(([field, entry]) => {
      const gates = fieldGateMap[field] ?? [];
      const commands = fieldCommands[field] ?? [];
      return `| \`${field}\` | ${entry.answerStatus} / ${entry.ownerAnswer} | ${gates.map((gate) => `\`${gate}\``).join("<br>")} | ${formatList(entry.evidenceToAttach ?? [])} | ${formatList(commands)} | ${fieldStopConditions[field] ?? "Stop until direct owner evidence exists."} | ${entry.boundary} |`;
    })
    .join("\n");
}

function gateRows(record, closurePlan) {
  const stepById = new Map((closurePlan.steps ?? []).map((step) => [step.id, step]));
  return (record.requiredGateIds ?? [])
    .map((gateId) => {
      const step = stepById.get(gateId);
      const title = step?.title ?? gateId;
      const stop = step?.stopConditions?.[0] ?? "Stop until direct evidence exists.";
      return `| \`${gateId}\` | ${title} | blocked_pending_owner_answers | ${stop} |`;
    })
    .join("\n");
}

function buildBundle() {
  const answerReview = read(sources.answerReview);
  const record = readJson(sources.answerRecord);
  const gateEvidencePacket = read(sources.gateEvidencePacket);
  const closurePlan = readJson(sources.closurePlan);
  const releaseEvidenceReport = read(sources.releaseEvidenceReport);

  const reviewStatus = /Review status:\s*`([^`]+)`/.exec(answerReview)?.[1] ?? "unknown";
  const readyToProceed = /ready to proceed:\s*(.+)/i.exec(answerReview)?.[1]?.trim() ?? "unknown";
  const gatePacketStatus = /Status:\s*(.+)/i.exec(gateEvidencePacket)?.[1]?.trim() ?? "unknown";
  const releaseReportStatus = /Status:\s*(.+)/i.exec(releaseEvidenceReport)?.[1]?.trim() ?? "unknown";

  return `# Mimesis Owner Evidence Bundle

Status: owner evidence bundle, not evidence.

Generated from the current owner answer review and open-gate evidence sources.

Review status: \`${reviewStatus}\`

ready to proceed: ${readyToProceed}

This packet answers one narrow question:

\`\`\`text
What exact owner evidence attachments, commands, and stop conditions are required before any blocked owner, proof, publication, benchmark, or adoption gate can move?
\`\`\`

It maps required evidence only.
It is not evidence.

## Source Review

${sourceLine("owner answer review", sources.answerReview, `review status ${reviewStatus}`)}
${sourceLine("owner answer record", sources.answerRecord, `record status ${record.status ?? "unknown"}`)}
${sourceLine("gate evidence packet", sources.gateEvidencePacket, gatePacketStatus)}
${sourceLine("gap closure plan", sources.closurePlan, `status ${closurePlan.status ?? "unknown"}`)}
${sourceLine("release evidence report", sources.releaseEvidenceReport, releaseReportStatus)}

## Evidence Attachment Matrix

| Owner Field | Answer Status | Blocked Gate IDs | Evidence To Attach | Required Commands | Stop Condition | Boundary |
| --- | --- | --- | --- | --- | --- | --- |
${fieldRows(record)}

## Gate Stop Matrix

| Gate ID | Gate | Current Status | First Stop Condition |
| --- | --- | --- | --- |
${gateRows(record, closurePlan)}

## Required Commands

\`\`\`bash
npm run audit:license
npm run cli -- case:review
npm run cli -- case:from-intake
npm run cli -- case:check
npm run evidence:from-case
npm run evidence:review
npm run audit:sync:strict
npm run audit:package
npm run audit:action
npm run benchmark:packet
\`\`\`

## Stop Conditions

- Stop if any owner field still says \`pending owner answer\`.
- Stop if \`${reviewStatus}\` is still the owner answer review status.
- Stop if ready to proceed remains \`${readyToProceed}\`.
- Stop if permission, redaction, or submitter scope is unclear.
- Stop if the case lacks before/after artifacts or reviewed evidence.
- Stop if the owner has not explicitly chosen a license or no-reuse boundary.
- Stop if strict sync, package publication, action publication, plugin release, benchmark, or adoption evidence is only local readiness evidence.

## Allowed Claim

Mimesis has a local owner evidence bundle that maps pending owner answer fields to required evidence attachments, commands, and stop conditions.

## Disallowed Claim

The owner evidence bundle is not evidence.
It does not mean an owner answered the fields.
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
It does not prove benchmarked productivity, customer outcomes, commercial outcomes, legal originality, or endorsement.
`;
}

const bundle = buildBundle();

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, bundle);

console.log(`[owner-evidence-bundle] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

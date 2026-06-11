#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "owner-actions", "current-action-queue.md");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function firstCommand(step) {
  if (!Array.isArray(step.commands) || step.commands.length === 0) {
    return "Attach direct evidence, then rerun the relevant audit.";
  }
  return step.commands[0];
}

const packageJson = readJson("package.json");
const gapRegister = readJson(".mimesis/gaps/current-gap-register.json");
const closurePlan = readJson(".mimesis/gaps/closure-plan.json");
const decisionRecord = readJson(".mimesis/release-decisions/owner-decision-record.json");
const syncStatus = read(".mimesis/sync-status.md");
const releaseEvidence = read(".mimesis/release-evidence/v0.1-report.md");
const gateEvidence = read(".mimesis/gates/evidence-packet.md");
const proofExecution = read(".mimesis/proof-runs/execution-report.md");

const closureById = new Map((closurePlan.steps ?? []).map((step) => [step.id, step]));

const priorityById = new Map([
  ["owner_license_decision", 1],
  ["permissioned_external_artifact", 2],
  ["completed_external_case", 3],
  ["strict_publish_sync", 4],
  ["package_publication", 5],
  ["action_publication", 6],
  ["shipped_plugin", 7],
  ["benchmark_study", 8],
  ["external_adoption", 9],
]);

const rows = [...(gapRegister.gaps ?? [])]
  .sort((a, b) => (priorityById.get(a.id) ?? 99) - (priorityById.get(b.id) ?? 99))
  .map((gap) => {
    const closure = closureById.get(gap.id) ?? {};
    const command = firstCommand(closure);
    return `| ${priorityById.get(gap.id) ?? ""} | \`${gap.id}\` | ${gap.title} | ${gap.status} | ${gap.nextAction} | \`${command}\` | ${gap.boundary} |`;
  });

const decisionKeys = [
  "license",
  "publicRelease",
  "npmPublication",
  "actionPublication",
  "pluginPublication",
  "externalProof",
  "benchmarkOrAdoption",
];

const decisionRows = decisionKeys
  .map((key) => {
    const decision = decisionRecord[key] ?? {};
    const requiredEvidence = Array.isArray(decision.requiredEvidence)
      ? decision.requiredEvidence.join("<br>")
      : "not recorded";

    return `| \`${key}\` | ${decision.decision ?? "missing"} | ${decision.currentSignal ?? "missing"} | ${decision.ownerQuestion ?? "missing"} | ${requiredEvidence} |`;
  })
  .join("\n");

const releaseEvidenceReady = releaseEvidence.includes("## Publication Evidence Table") ? "yes" : "missing";
const gateEvidenceReady = gateEvidence.includes("## Evidence Intake Matrix") ? "yes" : "missing";
const proofExecutionReady = proofExecution.includes("## Command Evidence Ledger") ? "yes" : "missing";
const syncReady = syncStatus.includes("failed") ? "blocked" : "local audit recorded";

const generated = `# Mimesis Owner Action Queue

Status: owner action queue packet, not owner decision.

Generated for Mimesis Engineering v${packageJson.version} from the current gap register, gap closure plan, gate evidence packet, release evidence report, release decision record, sync status, and proof execution report.

This packet answers one narrow question:

\`\`\`text
What should the owner decide or provide next before stronger v0.1/v0.2 claims?
\`\`\`

## Source Packets

- .mimesis/gaps/current-gap-register.json
- .mimesis/gaps/closure-plan.json
- .mimesis/gates/evidence-packet.md
- .mimesis/release-evidence/v0.1-report.md
- .mimesis/release-decisions/owner-decision-record.json
- .mimesis/sync-status.md
- .mimesis/proof-runs/execution-report.md

Source readiness:

- release evidence table: ${releaseEvidenceReady}
- gate evidence matrix: ${gateEvidenceReady}
- proof execution ledger: ${proofExecutionReady}
- strict sync state: ${syncReady}

## Owner Decision Snapshot

| Decision ID | Decision | Current Signal | Owner Question | Required Evidence |
| --- | --- | --- | --- | --- |
${decisionRows}

## Owner Action Queue

| Priority | Gap ID | Owner-Facing Gate | Current State | Next Owner Action | First Local Command | Boundary |
| --- | --- | --- | --- | --- | --- | --- |
${rows.join("\n")}

## Fastest Safe Path

1. Record the license or no-reuse decision before public reuse or npm claims.
2. Bring one weak artifact with permission or clear redaction.
3. Run intake review with \`npm run cli -- case:review path/to/intake.md\`.
4. Create the started case with \`npm run cli -- case:from-intake path/to/intake.md --reference-pack reference-packs/github-readme.md\`.
5. Complete before/after evidence, then run \`npm run cli -- case:check path/to/case\`.
6. Generate and review evidence before any stronger public claim.
7. Rerun \`npm run release:evidence-report\` before release, package, action, plugin, proof, benchmark, or adoption claims.
8. Rerun \`npm run audit:sync:strict\` only after the owner intends a clean synced publication state.

## Stop Conditions

- Stop if the owner license decision is missing.
- Stop if permission, redaction, or submitter scope is unclear.
- Stop if no weak artifact has been provided.
- Stop if a before/after case lacks explicit boundary evidence.
- Stop if publication is requested while strict sync is blocked.
- Stop if npm, Marketplace, plugin, benchmark, adoption, or customer-outcome claims lack direct reviewed evidence.

## Allowed Claim

Mimesis has a local owner action queue that lists the next owner decisions and evidence inputs needed before stronger claims.

## Disallowed Claim

The owner action queue is not an owner decision.
It does not mean the owner has chosen a license.
It does not mean an external weak artifact has been submitted.
It does not mean a before/after external case is complete.
It does not mean publication, npm release, Marketplace release, plugin shipment, benchmark proof, or adoption proof exists.

## Boundary

This packet does not choose a license.
It does not collect an artifact.
It does not grant permission.
It does not redact files.
It does not run a transformation.
It does not publish.
It does not stage, commit, push, tag, or release.
It does not publish to npm.
It does not publish a GitHub Marketplace action.
It does not ship a plugin.
It does not create external proof.
It does not prove adoption.
It does not prove benchmarked productivity, customer outcomes, commercial outcomes, legal originality, or endorsement.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[owner-action-queue] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

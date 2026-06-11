#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "proof-runs", "execution-report.md");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function has(content, text) {
  return content.toLowerCase().includes(text.toLowerCase()) ? "yes" : "missing";
}

const packageJson = readJson("package.json");
const acceptancePacket = read(".mimesis/proof-intake/acceptance-packet.md");
const proofRunPacket = read(".mimesis/proof-runs/v0.2-first-run.md");
const caseFromIntake = read("docs/CASE-FROM-INTAKE.md");
const caseCheck = read("docs/CASE-CHECK.md");
const evidenceFromCase = read("docs/EVIDENCE-FROM-CASE.md");
const evidenceReview = read("docs/EVIDENCE-REVIEW.md");
const claimFromEvidence = read("docs/CLAIM-FROM-EVIDENCE.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");

const commands = [
  {
    command: "npm run cli -- case:review path/to/permissioned-case.md --require-public --write-report",
    expectedEvidence: "permissioned intake review report",
    status: "not_started",
  },
  {
    command: "npm run cli -- case:from-intake path/to/permissioned-case.md --reference-pack reference-packs/github-readme.md --title \"Permissioned README Case\"",
    expectedEvidence: "started case workspace path",
    status: "not_started",
  },
  {
    command: "npm run cli -- case:check path/to/started-case",
    expectedEvidence: "expected failure until improved artifact, boundary check, case note, and run ledger exist",
    status: "not_started",
  },
  {
    command: "npm run cli -- case:check path/to/completed-case --write-report",
    expectedEvidence: ".mimesis/case-proof.md in completed case workspace",
    status: "not_started",
  },
  {
    command: "npm run cli -- evidence:from-case path/to/completed-case --out path/to/evidence-packet.md --force",
    expectedEvidence: "draft evidence packet",
    status: "not_started",
  },
  {
    command: "npm run cli -- evidence:review path/to/evidence-packet.md --decision reviewed --reviewer \"Reviewer Name\" --note \"Reviewed against the proof boundary.\" --out path/to/reviewed-evidence.md",
    expectedEvidence: "reviewed evidence packet",
    status: "not_started",
  },
  {
    command: "npm run cli -- evidence:check path/to/reviewed-evidence.md --require-reviewed --write-report",
    expectedEvidence: "reviewed evidence check report",
    status: "not_started",
  },
  {
    command: "npm run cli -- claim:from-evidence path/to/reviewed-evidence.md --out path/to/claim-candidate.md",
    expectedEvidence: "bounded claim candidate",
    status: "not_started",
  },
  {
    command: "npm run release:check:public",
    expectedEvidence: "public preflight output, not publication",
    status: "not_started",
  },
];

const commandRows = commands
  .map((entry) => `| \`${entry.command}\` | ${entry.expectedEvidence} | ${entry.status} | paste exit code and report path after a real run |`)
  .join("\n");

const generated = `# Mimesis Proof Execution Report

Status: execution report packet, not executed proof.

Generated for Mimesis Engineering v${packageJson.version} from the proof acceptance packet, proof run packet, case bridge, case check, evidence flow, claim candidate, and release preflight docs.

## Report Inputs

Use this report only after the proof acceptance gate says accept.

Required local inputs:

- .mimesis/proof-intake/acceptance-packet.md
- .mimesis/proof-runs/v0.2-first-run.md
- docs/CASE-FROM-INTAKE.md
- docs/CASE-CHECK.md
- docs/EVIDENCE-FROM-CASE.md
- docs/EVIDENCE-REVIEW.md
- docs/CLAIM-FROM-EVIDENCE.md
- docs/V0.1-RELEASE-PACKET.md
- one real permissioned or clearly redacted weak artifact intake file

Source checks:

- acceptance packet has accept / revise / reject states: ${has(acceptancePacket, "accept / revise / reject")}
- proof run packet has operator command path: ${has(proofRunPacket, "Operator Command Path")}
- case-from-intake keeps started-case boundary: ${has(caseFromIntake, "Case Status: started")}
- case-check requires completed case note: ${has(caseCheck, "completed case note")}
- evidence-from-case keeps draft evidence boundary: ${has(evidenceFromCase, "does not mark the evidence as reviewed")}
- evidence-review keeps no-new-evidence boundary: ${has(evidenceReview, "does not create evidence")}
- claim-from-evidence requires reviewed evidence: ${has(claimFromEvidence, "reviewed evidence packet")}
- release packet keeps release preflight path: ${has(releasePacket, "npm run release:check")}

## Execution States

Use exactly one report state:

- not_started: the report is generated as a blank evidence ledger before a real artifact run.
- running: a real accepted intake is being processed and some command evidence is still missing.
- stopped: the run stopped at a failed command, unclear permission, unsafe redaction, failed review, failed case check, failed evidence check, or unsupported claim.
- complete_local_run: the real run has local before/after case evidence, reviewed evidence, bounded claim candidate, and public preflight output.

complete_local_run is not the same as external adoption, benchmark proof, legal originality proof, package publication, or shipped plugin proof.

## Command Evidence Ledger

| Command | Required Evidence | State | Operator Notes |
| --- | --- | --- | --- |
${commandRows}

When a command fails, keep the exit code, report path, and exact stop reason. Do not skip forward.

## Required Attachments

Attach or link these local files after a real run:

- accepted permissioned intake file
- redaction notes
- started case workspace path
- completed improved artifact
- completed boundary check
- completed case note
- completed run ledger entry
- .mimesis/case-proof.md from the completed case
- reviewed evidence packet
- evidence check report
- bounded claim candidate
- release:check:public output

## Stop Conditions

Stop the run if:

- the acceptance state is not accept
- the artifact owner, permission status, publication preference, or redaction requirements are unclear
- case:review --require-public fails
- case:from-intake cannot create a started case workspace
- case:check fails after the operator claims the case is complete
- evidence remains draft while a public claim needs reviewed evidence
- evidence:check --require-reviewed fails
- claim:from-evidence would produce a claim stronger than the reviewed evidence
- release:check:public fails
- any claim implies external adoption, benchmarked productivity, customer outcomes, endorsement, legal originality, package publication, Marketplace release, or shipped plugin status without direct evidence

## Allowed Claim

Mimesis has a local proof execution report packet for recording command evidence during the first real permissioned proof run.

## Disallowed Claim

This report does not execute commands.
It does not mean a proof run has started.
It does not mean a proof run has completed.
It does not create external proof.
It does not grant permission.
It does not redact files.
It does not run a transformation.
It does not publish.
It does not prove adoption, benchmarked productivity, customer outcomes, commercial outcomes, legal originality, endorsement, package release, Marketplace release, or shipped plugin status.

## Boundary

This proof execution report does not execute commands.
It does not create external proof.
It does not grant permission.
It does not publish.
It does not stage, commit, push, tag, or release.
It does not choose a license.
It does not run a transformation.
It does not create evidence by itself.
It does not replace \`case:review\`, \`case:from-intake\`, \`case:check\`, \`evidence:review\`, \`evidence:check\`, \`claim:from-evidence\`, release preflight, redaction review, or human owner review.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[proof-execution-report] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "owner-actions", "proof-run-handoff.md");

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
const actionQueue = read(".mimesis/owner-actions/current-action-queue.md");
const decisionIntake = read(".mimesis/owner-actions/decision-intake.md");
const evidenceAttachment = read(".mimesis/owner-actions/evidence-attachment-form.md");
const proofRunPacket = read(".mimesis/proof-runs/v0.2-first-run.md");
const proofExecutionReport = read(".mimesis/proof-runs/execution-report.md");
const licensePacket = read(".mimesis/license-packets/owner-decision.md");
const proofIntakeKit = read(".mimesis/proof-intake/first-external-proof-kit.md");

const generated = `# Mimesis Owner Proof Handoff

Status: owner proof handoff packet, not owner decision or proof.

Generated for Mimesis Engineering v${packageJson.version} from the owner action queue, owner decision intake, owner evidence attachment form, proof run packet, proof execution report, license packet, and proof intake kit.

This packet answers one narrow question:

\`\`\`text
What is the minimum owner input needed to move from local framework readiness toward one real proof run?
\`\`\`

## Source Packets

- .mimesis/owner-actions/current-action-queue.md
- .mimesis/owner-actions/decision-intake.md
- .mimesis/owner-actions/evidence-attachment-form.md
- .mimesis/proof-runs/v0.2-first-run.md
- .mimesis/proof-runs/execution-report.md
- .mimesis/license-packets/owner-decision.md
- .mimesis/proof-intake/first-external-proof-kit.md

Source readiness:

- owner action queue has license gate: ${has(actionQueue, "owner_license_decision")}
- owner action queue has weak artifact gate: ${has(actionQueue, "permissioned_external_artifact")}
- decision intake names license_or_no_reuse: ${has(decisionIntake, "license_or_no_reuse")}
- evidence attachment form names weak_artifact_permission: ${has(evidenceAttachment, "weak_artifact_permission")}
- proof run packet has owner evidence bridge lane: ${has(proofRunPacket, "owner:evidence-submission-check")}
- proof execution report has proof execution record candidate mode: ${has(proofExecutionReport, "proof execution record")}
- license packet keeps owner decision required: ${has(licensePacket, "owner decision required")}
- proof intake kit says Bring one weak artifact: ${has(proofIntakeKit, "weak artifact")}

## Minimum Owner Inputs

| Input | Owner Must Provide | Local Field | Moves Toward | Boundary |
| --- | --- | --- | --- | --- |
| license or no-reuse decision | exact reuse license, split code/content license choice, or explicit no-reuse for now | \`license_or_no_reuse\` | owner license decision and publication scope | does not choose a license or provide legal advice |
| one permissioned weak artifact | weak artifact text/file/path plus artifact owner, permission status, publication preference, redaction requirements, and safety confirmation | \`weak_artifact_permission\` | permissioned external artifact and completed external case | does not grant permission or create external proof |

Bring one weak artifact means one user-submitted, permissioned, or clearly redacted weak artifact.
It does not mean fake engagement, hidden scraping, copied protected work, private customer data, or unreviewed publication permission.

## Owner Fill Targets

Use these local record targets after the owner supplies direct input:

| Target | Purpose | Next Check | Boundary |
| --- | --- | --- | --- |
| owner decision answer record | records the owner answer for \`license_or_no_reuse\` | \`npm run cli -- license:decision-from-owner-answer path/to/owner-decision-answer-record.json --output path/to/release-decision-record.json\` | not legal advice or framework-chosen license |
| owner evidence submission record | records the owner evidence for \`weak_artifact_permission\` | \`npm run cli -- owner:evidence-submission-check path/to/owner-evidence-submission-record.json --require-field weak_artifact_permission\` | not submitted evidence by itself and not gate closure |
| proof intake record | carries reviewed weak artifact evidence into case creation | \`npm run cli -- proof:intake-from-owner-evidence path/to/owner-evidence-submission-record.json --output path/to/proof-intake-record.json\` | not permission grant or proof |
| proof execution record | records command results after the local proof run | \`npm run cli -- proof:execution-report --execution-record path/to/proof-execution-record.json --output path/to/proof-execution-candidate.md\` | candidate review only; \`proofApproved: false\` and \`completionAllowed: false\` |

## Fastest Safe Command Path

Run only after the owner supplies the relevant input:

\`\`\`text
owner:decision-intake
-> owner:decision-answer-record
-> license:decision-from-owner-answer
-> owner:evidence-attachment-form
-> owner:evidence-submission-record
-> owner:evidence-submission-check --require-field weak_artifact_permission
-> proof:intake-from-owner-evidence
-> proof:intake-check
-> case:from-record
-> case:check
-> evidence:from-case
-> evidence:review
-> evidence:check
-> claim:from-evidence
-> proof:execution-report --execution-record
-> gate:closure-readiness --owner-evidence-submission
-> gate:closure-review --readiness
\`\`\`

Concrete command hints:

\`\`\`bash
npm run owner:decision-intake
npm run owner:evidence-attachment-form
npm run cli -- owner:evidence-submission-check path/to/owner-evidence-submission-record.json --require-field weak_artifact_permission
npm run cli -- proof:intake-from-owner-evidence path/to/owner-evidence-submission-record.json --output path/to/proof-intake-record.json
npm run cli -- proof:intake-check path/to/proof-intake-record.json --require-case-ready --write-report path/to/proof-intake-check.md
npm run cli -- case:from-record path/to/proof-intake-record.json --reference-pack reference-packs/github-readme.md --out path/to/case
npm run cli -- proof:execution-report --execution-record path/to/proof-execution-record.json --output path/to/proof-execution-candidate.md
\`\`\`

## Candidate Review Outputs

Candidate outputs can show review readiness, not approval:

| Candidate | Ready Signal | Still False |
| --- | --- | --- |
| release decision candidate | owner license or no-reuse answer recorded | not legal advice, not publication |
| owner evidence field check | \`weak_artifact_permission\` ready for field-level review | not permission grant, not gate closure |
| proof intake record | reviewed weak artifact can start a case | not proof |
| proof execution candidate | \`candidateEvidenceReviewReady: true\` when command evidence is complete | \`proofApproved: false\`, \`publicClaimApproved: false\`, \`completionAllowed: false\` |
| gate closure readiness/review candidates | \`ownerEvidenceReviewReady: true\` when owner evidence is ready for gate review | \`canCloseNow: false\`, \`closureApproved: false\`, \`completionAllowed: false\` |

## Stop Conditions

- Stop if \`license_or_no_reuse\` is blank, ambiguous, or presented as legal advice from the framework.
- Stop if \`weak_artifact_permission\` lacks artifact owner, permission status, publication preference, redaction requirements, or safety confirmation.
- Stop if the artifact includes secrets, OAuth tokens, API keys, passwords, private customer data, or copied protected material.
- Stop if the owner evidence submission record is not reviewed.
- Stop if a case workspace lacks before/after evidence, boundary check, case note, or run ledger.
- Stop if candidate review output is described as proof approval, publication, adoption evidence, benchmark evidence, or gate closure.

## Allowed Claim

Mimesis has a local owner proof handoff that names the minimum owner inputs and command path for the first real permissioned proof run.

## Disallowed Claim

The owner proof handoff is not an owner decision.
It does not mean the owner chose a license.
It does not mean a weak artifact was submitted.
It does not grant permission.
It does not create external proof.
It does not approve proof.
It does not approve public claims.
It does not publish.
It does not close gates.
It does not prove adoption, benchmarked productivity, customer outcomes, commercial outcomes, legal originality, endorsement, package release, Marketplace release, or shipped plugin status.

## Boundary

This handoff does not choose a license.
It does not provide legal advice.
It does not collect an artifact.
It does not grant permission.
It does not redact files.
It does not run a transformation.
It does not execute proof commands.
It does not create external proof.
It does not approve proof.
It does not publish.
It does not stage, commit, push, tag, or release.
It does not close gates or mark the active objective complete.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[owner-proof-handoff] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

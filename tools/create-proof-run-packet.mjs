#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "proof-runs", "v0.2-first-run.md");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function extractSection(content, heading) {
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start < 0) {
    return "";
  }

  const collected = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("## ")) {
      break;
    }
    collected.push(line);
  }
  return collected.join("\n").trim();
}

const packageJson = JSON.parse(read("package.json"));
const proofQueue = read("docs/V0.2-PROOF-QUEUE.md");
const intakeKit = read("docs/PROOF-INTAKE-KIT.md");
const ownerEvidenceBridge = read("docs/PROOF-INTAKE-FROM-OWNER-EVIDENCE.md");
const permissionedCheck = read("docs/PERMISSIONED-CASE-CHECK.md");
const caseFromIntake = read("docs/CASE-FROM-INTAKE.md");
const caseFromRecord = read("docs/CASE-FROM-RECORD.md");
const caseCheck = read("docs/CASE-CHECK.md");
const evidencePacket = read("docs/EVIDENCE-PACKET.md");
const benchmarkPacket = read("docs/BENCHMARK-PACKET.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");

const currentState = extractSection(proofQueue, "Current Queue State");
const requirements = extractSection(proofQueue, "First Proof Candidate Requirements");
const commandPath = extractSection(proofQueue, "Required Command Path");
const queueStops = extractSection(proofQueue, "Stop Conditions");
const exitClaim = extractSection(proofQueue, "v0.2 Exit Claim");

const generated = `# Mimesis v0.2 First Proof Run Packet

Generated from the current local repository state for Mimesis Engineering v${packageJson.version}.

Status: operator proof run packet, not completed external proof.

## Purpose

Use this packet when an operator has one real permissioned or clearly redacted weak artifact and needs to run the first v0.2 proof attempt without losing the artifact trail.

It connects the intake kit, owner evidence bridge, permissioned review gate, started-case bridges, case evidence checker, benchmark protocol, evidence packet gate, and public release preflight.

## Current Queue State

${currentState}

## Inputs To Collect

${requirements}

Operator must also keep:

- original weak artifact path
- reviewed permissioned intake path
- reviewed owner evidence submission record path when using the owner evidence bridge lane
- generated proof intake record path when using the owner evidence bridge lane
- chosen reference pack path
- started case workspace path
- completed evidence packet path for any stronger public claim
- redaction notes for public or private case handling

## Operator Command Path

Run in this order:

${commandPath}

Minimum command chain:

\`\`\`text
case:review -> case:from-intake -> case:check -> evidence:check
\`\`\`

Owner evidence bridge command chain:

\`\`\`text
owner:evidence-submission-check -> proof:intake-from-owner-evidence -> proof:intake-check -> case:from-record -> case:check -> evidence:check
\`\`\`

## Evidence Board

| Evidence | Source | Required Before Claim |
| --- | --- | --- |
| Proof queue state | docs/V0.2-PROOF-QUEUE.md | before selecting a candidate |
| Submitter intake kit | docs/PROOF-INTAKE-KIT.md | before asking for a weak artifact |
| Owner evidence bridge | docs/PROOF-INTAKE-FROM-OWNER-EVIDENCE.md | before turning reviewed owner evidence into a proof intake record |
| Permissioned review gate | docs/PERMISSIONED-CASE-CHECK.md | before publication treatment |
| Started case bridge | docs/CASE-FROM-INTAKE.md | before transforming the artifact |
| Record started case bridge | docs/CASE-FROM-RECORD.md | before transforming a proof intake record |
| Completed case check | docs/CASE-CHECK.md | before a before/after case claim |
| Evidence packet gate | docs/EVIDENCE-PACKET.md | before stronger public claims |
| Benchmark protocol | docs/BENCHMARK-PACKET.md | before productivity or adoption claims |
| Release preflight | docs/V0.1-RELEASE-PACKET.md | before public release copy |

## Source Snapshot

- Intake kit boundary includes: ${intakeKit.includes("does not create external proof") ? "does not create external proof" : "missing proof boundary"}
- Owner evidence bridge boundary includes: ${ownerEvidenceBridge.includes("does not grant permission") ? "does not grant permission" : "missing owner evidence bridge boundary"}
- Permissioned review boundary includes: ${permissionedCheck.includes("permissioned external case") ? "permissioned external case review" : "missing permissioned review"}
- Case bridge boundary includes: ${caseFromIntake.includes("permissioned-case starter") ? "permissioned-case starter" : "missing started-case boundary"}
- Record case bridge boundary includes: ${caseFromRecord.includes("does not create completed before/after proof") ? "does not create completed before/after proof" : "missing record-case boundary"}
- Case check boundary includes: ${caseCheck.includes("completed case note") ? "completed case note" : "missing case-check boundary"}
- Evidence gate boundary includes: ${evidencePacket.includes("does not create evidence") ? "does not create evidence" : "missing evidence boundary"}
- Benchmark boundary includes: ${benchmarkPacket.includes("does not prove benchmarked productivity") ? "does not prove benchmarked productivity" : "missing benchmark boundary"}
- Release packet boundary includes: ${releasePacket.includes("npm run release:check") ? "release preflight" : "missing release preflight"}

## Stop Conditions

${queueStops}

Also stop if:

- the intake file cannot be shared publicly or redacted safely
- the owner evidence submission record is not reviewed or \`weak_artifact_permission\` is not submitted
- the evidence packet is draft, unsafe, or not reviewed
- \`npm run release:check:public\` fails
- the public copy needs a claim stronger than the evidence board supports

## Allowed Claim

${exitClaim}

## Disallowed Claim

Do not claim that Mimesis is externally adopted, benchmarked, commercially proven, legally original, universally effective, production-ready, endorsed by a submitter, or shipped as a package/plugin because this packet exists.

## Boundary

This proof run packet does not create external proof, does not prove external adoption, does not prove customer outcomes, does not prove benchmarked productivity, does not prove legal originality, does not grant permission, does not choose a license, and does not publish.

It only prepares the operator path for a future real proof run.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[proof-run-packet] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

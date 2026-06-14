#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "proof-runs", "readiness.md");

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
const proofIntake = read("docs/PROOF-INTAKE-KIT.md");
const proofRunPacket = read("docs/PROOF-RUN-PACKET.md");
const proofRunDry = read("docs/PROOF-RUN-DRY-AUDIT.md");
const completionAudit = read("docs/COMPLETION-AUDIT.md");
const gateBoard = fs.existsSync(path.join(root, ".mimesis", "gates", "current-gateboard.md"))
  ? read(".mimesis/gates/current-gateboard.md")
  : "";

const currentQueueState = extractSection(proofQueue, "Current Queue State");
const candidateRequirements = extractSection(proofQueue, "First Proof Candidate Requirements");
const commandPath = extractSection(proofQueue, "Required Command Path");
const stopConditions = extractSection(proofQueue, "Stop Conditions");

const generated = `# Mimesis v0.2 Proof Readiness Packet

Generated from the current local repository state for Mimesis Engineering v${packageJson.version}.

Status: first weak artifact readiness, not external proof.

## Readiness State

The framework is ready to receive one weak artifact for the first permissioned proof attempt.

Current queue state:

${currentQueueState}

This means the next action is not to invent stronger claims. The next action is to Bring one weak artifact with permission, redaction, and publication boundaries.

## What Is Ready

- submitter-facing intake kit: docs/PROOF-INTAKE-KIT.md
- proof intake schema and fixture record: spec/proof-intake.schema.json and .mimesis/proof-intake/fixture-record.json
- permissioned case review gate: docs/PERMISSIONED-CASE-CHECK.md
- started-case bridge: docs/CASE-FROM-INTAKE.md and docs/CASE-FROM-RECORD.md
- case evidence checker: docs/CASE-CHECK.md
- evidence packet gate and reviewer decision path: docs/EVIDENCE-PACKET.md and docs/EVIDENCE-REVIEW.md
- bounded claim candidate generator: docs/CLAIM-FROM-EVIDENCE.md
- dry-run rehearsal through bounded claim candidate: docs/PROOF-RUN-DRY-AUDIT.md
- public release preflight: npm run release:check:public

Local readiness signals:

- proof intake kit boundary present: ${proofIntake.includes("does not create external proof") ? "yes" : "missing"}
- proof run packet boundary present: ${proofRunPacket.includes("does not create external proof") ? "yes" : "missing"}
- dry audit reaches bounded claim candidate: ${proofRunDry.includes("bounded claim candidate") ? "yes" : "missing"}
- completion audit keeps external proof incomplete: ${completionAudit.includes("No permissioned external weak artifact has been submitted yet") || completionAudit.includes("needs one user-submitted") ? "yes" : "missing"}
- gate board blocks first external proof without an artifact: ${gateBoard.includes("first permissioned external proof") ? "yes" : "run npm run gate:board"}

## What Is Still Blocked

- No permissioned external weak artifact has been submitted yet.
- The owner has not chosen a reuse license.
- No case has completed a real external before/after proof loop.
- No benchmark or adoption evidence has been collected.
- No package, action, or plugin has been published.

These are gates, not hidden successes.

## One Weak Artifact Intake Card

Before running the proof loop, collect:

${candidateRequirements}

Use the smallest artifact that can show a real before/after transformation:

- a weak README section
- a rough product page
- a shallow prompt or workflow note
- a public-source specimen with explicit redaction and no endorsement claim

Reject or pause the artifact if permission, ownership, redaction, publication preference, or safety status is unclear.

## Operator Command Path

Run this only after the artifact is permissioned or safely redacted:

${commandPath}

Minimum proof path:

\`\`\`text
case:review -> case:from-intake -> case:check -> evidence:from-case -> evidence:review -> evidence:check -> claim:from-evidence -> release:check:public
\`\`\`

## Claim Boundary

Allowed before the real artifact arrives:

\`\`\`text
Mimesis Engineering has a local first-proof readiness packet for collecting one permissioned or clearly redacted weak artifact.
\`\`\`

Allowed only after a real candidate passes the full path:

\`\`\`text
Mimesis Engineering v0.2 includes one permissioned or clearly redacted external before/after proof loop with explicit evidence and claim boundaries.
\`\`\`

Not allowed from this readiness packet:

\`\`\`text
Mimesis is externally adopted, benchmarked, commercially proven, legally original, universally effective, endorsed, production-ready, published, or shipped as a package/plugin.
\`\`\`

## Next Non-Bypassing Action

Bring one weak artifact.

Then run:

\`\`\`bash
npm run cli -- case:review path/to/permissioned-case.md --require-public --write-report
npm run cli -- case:from-intake path/to/permissioned-case.md --reference-pack reference-packs/github-readme.md --title "Permissioned README Case"
\`\`\`

Do not skip the started-case completion work. \`case:check\` should fail until improved artifact, boundary check, case note, and run ledger are complete.

## Stop Conditions

${stopConditions}

Also stop if the operator wants a public claim that is stronger than the reviewed evidence packet supports.

## Boundary

This readiness packet does not create external proof, does not choose a license, does not publish, does not stage files, does not commit, does not push, does not tag, does not release, does not bypass owner gates, does not prove external adoption, does not prove benchmarked productivity, does not prove customer outcomes, and does not prove legal originality.

It only makes the next honest proof action explicit: Bring one weak artifact.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[proof-readiness] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

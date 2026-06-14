#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "proof-candidates", "first-candidate.md");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
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

const packageJson = readJson("package.json");
const proofQueue = read("docs/V0.2-PROOF-QUEUE.md");
const proofIntake = read("docs/PROOF-INTAKE-KIT.md");
const proofReadiness = read(".mimesis/proof-runs/readiness.md");
const gateEvidence = read(".mimesis/gates/evidence-packet.md");
const gapRegister = readJson(".mimesis/gaps/current-gap-register.json");

const currentQueueState = extractSection(proofQueue, "Current Queue State");
const candidateRequirements = extractSection(proofQueue, "First Proof Candidate Requirements");
const commandPath = extractSection(proofQueue, "Required Command Path");

const externalArtifactGap = (gapRegister.gaps ?? []).find((gap) => gap.id === "permissioned_external_artifact");
const externalCaseGap = (gapRegister.gaps ?? []).find((gap) => gap.id === "completed_external_case");

const generated = `# Mimesis First Proof Candidate Packet

Status: candidate selection packet, not external proof.

Generated from the current proof queue, proof intake kit, proof readiness packet, gate evidence packet, and gap register for Mimesis Engineering v${packageJson.version}.

## Current Candidate State

${currentQueueState}

Current open proof gates:

- \`${externalArtifactGap?.id ?? "permissioned_external_artifact"}\`: ${externalArtifactGap?.status ?? "waiting_for_artifact"} - ${externalArtifactGap?.nextAction ?? "Collect one permissioned or clearly redacted weak artifact."}
- \`${externalCaseGap?.id ?? "completed_external_case"}\`: ${externalCaseGap?.status ?? "waiting_for_artifact"} - ${externalCaseGap?.nextAction ?? "Run the artifact through the full case path."}

The next honest action is still:

\`\`\`text
Bring one weak artifact.
\`\`\`

## Candidate Selection Rubric

Pick the smallest candidate that can complete a real before/after loop without private-data risk.

| Criterion | Strong Candidate | Stop Or Reject |
| --- | --- | --- |
| Permission | owner-submitted, explicitly permissioned, or clearly redacted public source | owner, permission, or publication status is unclear |
| Scope | one weak artifact small enough to transform in one case | broad product, private workspace, or multi-document system |
| Redaction | secrets, customer data, identities, and private business context removed | redaction requirements are vague or impossible |
| Reference fit | one source-first reference pack clearly applies | no reference pack fits the artifact |
| Before/after potential | starting artifact is weak enough to improve visibly | artifact is already polished or cannot be shown |
| Claim boundary | submitter accepts explicit allowed/disallowed claims | submitter wants adoption, benchmark, endorsement, or commercial proof claims |

Recommended first reference packs:

- reference-packs/github-readme.md
- reference-packs/landing-page.md
- reference-packs/product-page.md
- reference-packs/ai-workflow.md

## Candidate Intake Card

Use this card before running \`case:review\`.

\`\`\`text
Submitter:
Artifact owner:
Starting artifact path or pasted text:
Permission status:
Publication preference:
Redaction requirements:
Safety confirmation:
Chosen reference pack:
Desired transformation:
Allowed claim:
Disallowed claim:
What remains unproven:
\`\`\`

Candidate requirements from the proof queue:

${candidateRequirements}

Submitter-facing intake source:

\`\`\`text
docs/PROOF-INTAKE-KIT.md
.mimesis/proof-intake/first-external-proof-kit.md
\`\`\`

Readiness source:

\`\`\`text
.mimesis/proof-runs/readiness.md
\`\`\`

Gate evidence source:

\`\`\`text
.mimesis/gates/evidence-packet.md
\`\`\`

## Non-Bypassing Command Path

Do not skip the proof path.

${commandPath}

Minimum operator chain:

\`\`\`bash
npm run cli -- case:review path/to/permissioned-case.md --require-public --write-report
npm run cli -- case:from-intake path/to/permissioned-case.md --reference-pack reference-packs/github-readme.md --title "Permissioned README Case"
npm run cli -- case:check path/to/started-case
npm run cli -- evidence:from-case path/to/started-case --out path/to/evidence-packet.md --force
npm run cli -- evidence:review path/to/evidence-packet.md --decision reviewed --reviewer "Reviewer Name" --note "Reviewed against the proof boundary." --out path/to/reviewed-evidence.md
npm run cli -- evidence:check path/to/reviewed-evidence.md --require-reviewed --write-report
npm run cli -- claim:from-evidence path/to/reviewed-evidence.md --out path/to/claim-candidate.md
npm run release:check:public
\`\`\`

## Allowed Claim

Mimesis has a local first proof candidate packet for selecting one permissioned or clearly redacted weak artifact.

## Disallowed Claim

This packet does not select a candidate.
It does not mean a permissioned external weak artifact has been submitted.
It does not mean a before/after external proof loop has completed.
It does not mean Mimesis is externally adopted, benchmarked, endorsed, commercially proven, legally original, universally effective, published, or shipped.

## Boundary

This packet does not create external proof.
It does not select a candidate.
It does not grant permission.
It does not run a transformation.
It does not create evidence.
It does not prove completion.
It does not publish.
It does not stage, commit, push, tag, or release.
It does not choose a license.
It does not prove external adoption.
It does not prove benchmarked productivity, customer outcomes, commercial outcomes, package publication, Marketplace publication, shipped plugin status, legal originality, or endorsement.

Source boundary checks:

- proof intake keeps no-proof boundary: ${proofIntake.includes("does not create external proof") ? "yes" : "missing"}
- proof readiness says Bring one weak artifact: ${proofReadiness.includes("Bring one weak artifact") ? "yes" : "missing"}
- gate evidence packet is not evidence: ${gateEvidence.includes("not evidence") ? "yes" : "missing"}
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[proof-candidate-packet] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

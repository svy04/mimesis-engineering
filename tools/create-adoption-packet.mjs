#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "adoption-packets", "v0.2-first-adoption.md");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

const packageJson = readJson("package.json");
const completionAudit = read("docs/COMPLETION-AUDIT.md");
const gapRegister = readJson(".mimesis/gaps/current-gap-register.json");
const closureReview = readJson(".mimesis/gates/closure-review.json");

const adoptionGap = /no external adoption evidence/i.test(completionAudit)
  ? "No external adoption evidence is currently recorded."
  : "External adoption evidence must still be verified from current files.";

const externalAdoptionGate = (gapRegister.gaps ?? []).find((gap) => gap.id === "external_adoption");
const closureStatus = (closureReview.reviews ?? []).find((review) => review.gateId === "external_adoption");
const gateStatus = externalAdoptionGate?.status ?? closureStatus?.decision ?? "open";

const generated = `# Mimesis Adoption Packet

Generated from the current local repository state for Mimesis Engineering v${packageJson.version}.

Status: external adoption evidence intake packet, not adoption proof.

## Current Gap

- ${adoptionGap}
- Gate: \`external_adoption\`
- Current gate status: \`${gateStatus}\`
- This packet prepares evidence intake for external adoption, not a claim by itself.

## Adoption Event Types

Reviewable adoption events include:

- a third-party issue, discussion, or case submission from someone outside the local authoring run
- a public fork, PR, package install, action run, plugin install, or MCP host use with context
- a permissioned external weak artifact that enters a Mimesis case and leaves a reviewed trail
- a user report that includes a reproducible artifact path, timestamp, and permission boundary
- a documented external before/after case with a reviewed evidence packet

Do not count private intention, vanity metrics, fake engagement, unverifiable screenshots, or internal-only demo runs as adoption evidence.

## Required Evidence

For each event, collect a reviewed evidence packet with:

- event type and source URL or local archival path
- actor/source description and whether the source is public, permissioned, or redacted
- timestamp or commit reference
- artifact before/after path when the event involves a Mimesis case
- observation method and limits
- reviewer name, decision, and review notes
- allowed claim and disallowed claim
- redaction notes for private data

Use \`templates/evidence-packet.md\` as the packet starting point.

## Review Path

1. Copy \`templates/evidence-packet.md\`.
2. Fill it with the external adoption event, source, boundary, and evidence path.
3. Run:

\`\`\`bash
npm run cli -- evidence:check path/to/evidence-packet.md --require-reviewed --write-report path/to/evidence-check.md
\`\`\`

Short command form:

\`\`\`text
evidence:check --require-reviewed
\`\`\`

4. If the evidence is reviewed, run \`npm run cli -- claim:from-evidence path/to/reviewed-evidence.md --out path/to/claim-candidate.md\`.
5. Keep the claim candidate bounded to the named event. This packet does not close gates.

## Allowed Claim

Allowed now:

\`\`\`text
Mimesis Engineering includes a local adoption evidence intake packet for future external events; it is not external adoption proof.
\`\`\`

Allowed only after a reviewed evidence packet exists:

\`\`\`text
One named external adoption event was reviewed under the stated evidence packet and boundary.
\`\`\`

## Disallowed Claim

Not allowed from this packet:

\`\`\`text
Mimesis is externally adopted, commercially proven, viral, benchmarked, or broadly used.
\`\`\`

## Boundary

This packet does not prove external adoption, does not create evidence, does not publish, does not close gates, does not create engagement, does not prove benchmarked productivity, does not prove customer outcomes, and does not certify commercial impact.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[adoption-packet] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

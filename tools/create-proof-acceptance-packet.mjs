#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "proof-intake", "acceptance-packet.md");

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
const submissionPacket = read(".mimesis/proof-intake/submission-packet.md");
const redactionPacket = read(".mimesis/proof-intake/redaction-packet.md");
const candidatePacket = read(".mimesis/proof-candidates/first-candidate.md");
const proofQueue = read("docs/V0.2-PROOF-QUEUE.md");

const submissionStops = extractSection(submissionPacket, "Stop Conditions");
const redactionChecklist = extractSection(redactionPacket, "Redaction Checklist");
const candidateRubric = extractSection(candidatePacket, "Candidate Selection Rubric");
const queueRequirements = extractSection(proofQueue, "First Proof Candidate Requirements");

const generated = `# Mimesis Proof Acceptance Packet

Status: acceptance gate packet, not accepted artifact.

Generated for Mimesis Engineering v${packageJson.version} from the proof submission packet, redaction packet, first proof candidate packet, and v0.2 proof queue.

## Gate Inputs

Use this packet after a submitter prepares one permissioned or clearly redacted weak artifact, but before starting a case workspace.

Required local inputs:

- .mimesis/proof-intake/submission-packet.md
- .mimesis/proof-intake/redaction-packet.md
- .mimesis/proof-candidates/first-candidate.md
- docs/V0.2-PROOF-QUEUE.md
- one permissioned or clearly redacted intake file supplied by the owner or operator

The intake is not accepted by this packet. The packet only gives the operator a case creation gate.

## Acceptance States

Use exactly one state:

- accept: the intake has known owner or public-source status, explicit permission status, publication preference, redaction requirements, safety confirmation, chosen reference pack, and a bounded desired transformation.
- revise: the intake is plausible, but one or more required fields, redaction notes, or claim boundaries need submitter clarification before case creation.
- reject: the intake is too broad, unsafe, private, unpermissioned, legally unclear, already polished, unrelated to an available reference pack, or asks for unsupported adoption, benchmark, endorsement, commercial, legal originality, or universal effectiveness claims.

Accepted means "ready to create a started case workspace", not "proof complete".

## Acceptance Checklist

Before moving to \`case:from-intake\`, confirm:

- there is one weak artifact, not a broad project dump
- the owner or public-source status is clear
- permission status is explicit
- publication preference is public, anonymized, redacted, or private only
- redaction requirements are specific enough for the chosen publication preference
- safety confirmation excludes secrets, tokens, passwords, private customer data, and copied protected material that is not allowed
- one reference pack is chosen
- the desired transformation is narrow enough for one before/after case
- the allowed claim and disallowed claim are written
- the submitter accepts that a started case is not proof until \`case:check\` and evidence review gates pass

Queue requirements:

${queueRequirements}

Redaction source:

${redactionChecklist}

Candidate rubric source:

${candidateRubric}

## Operator Command Path

When the state is accept, run:

\`\`\`bash
npm run audit:secrets
npm run cli -- case:review path/to/permissioned-case.md --require-public --write-report
npm run cli -- case:from-intake path/to/permissioned-case.md --reference-pack reference-packs/github-readme.md --title "Permissioned README Case"
npm run cli -- case:check path/to/started-case
\`\`\`

When the state is revise, return the missing fields or redaction questions to the submitter and do not create a case.

When the state is reject, record the reason in the run ledger and do not create a case.

\`case:check\` should fail until the started case contains a completed improved artifact, boundary check, case note, and run ledger evidence.

## Stop Conditions

${submissionStops}

Also stop before case creation if:

- the acceptance state is not accept
- the operator cannot write an allowed claim and disallowed claim
- the chosen reference pack does not fit the artifact
- public handling would expose private data
- the intake needs a legal, license, employment, customer-data, or platform-policy decision outside the framework

## Allowed Claim

Mimesis has a local proof acceptance packet that gives an operator an accept / revise / reject case creation gate before starting the first permissioned external proof case.

## Disallowed Claim

This packet does not accept an artifact.
It does not mean a permissioned external weak artifact has been accepted.
It does not create external proof.
It does not grant permission.
It does not redact files.
It does not prove complete private-data removal.
It does not run a transformation.
It does not publish.
It does not prove adoption, benchmarked productivity, customer outcomes, commercial outcomes, legal originality, endorsement, package release, Marketplace release, or shipped plugin status.

## Boundary

This packet does not accept an artifact.
It does not create external proof.
It does not grant permission.
It does not publish.
It does not stage, commit, push, tag, or release.
It does not choose a license.
It does not run a transformation.
It does not create evidence.
It does not prove adoption.
It does not replace \`case:review\`, \`case:from-intake\`, \`case:check\`, redaction review, or human owner review.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[proof-acceptance-packet] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

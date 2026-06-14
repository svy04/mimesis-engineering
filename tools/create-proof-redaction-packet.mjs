#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "proof-intake", "redaction-packet.md");

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

function rewriteDocLinksForOutput(content) {
  return content.replace(/\]\(([^)]+\.md)\)/g, "](../../docs/$1)");
}

const packageJson = readJson("package.json");
const proofQueue = read("docs/V0.2-PROOF-QUEUE.md");
const proofIntakeDoc = read("docs/PROOF-INTAKE-KIT.md");
const intakeKit = read(".mimesis/proof-intake/first-external-proof-kit.md");
const intakeTemplate = read("templates/permissioned-case-intake.md");
const fixtureRecord = readJson(".mimesis/proof-intake/fixture-record.json");
const secretSafety = read("docs/SECRET-SAFETY-GATE.md");
const candidatePacket = read(".mimesis/proof-candidates/first-candidate.md");

const currentQueueState = extractSection(proofQueue, "Current Queue State");
const intakePurpose = rewriteDocLinksForOutput(extractSection(proofIntakeDoc, "Purpose"));
const candidateRubric = extractSection(candidatePacket, "Candidate Selection Rubric");

const generated = `# Mimesis Proof Redaction Packet

Status: redaction checklist packet, not proof.

Generated for Mimesis Engineering v${packageJson.version} from the proof intake kit, proof intake record, permissioned intake template, first proof candidate packet, and secret safety gate.

## Intake Source

${currentQueueState}

This packet prepares a permissioned external weak artifact for safe review.
It does not mean a permissioned external weak artifact has been submitted yet.

Input surfaces:

- docs/PROOF-INTAKE-KIT.md
- .mimesis/proof-intake/first-external-proof-kit.md
- templates/permissioned-case-intake.md
- .mimesis/proof-intake/fixture-record.json
- docs/SECRET-SAFETY-GATE.md

Proof intake purpose:

${intakePurpose}

Current fixture publication preference:

\`\`\`text
${fixtureRecord.publicationPreference ?? "missing"}
\`\`\`

Current fixture redaction requirements:

\`\`\`text
${fixtureRecord.redactionRequirements ?? "missing"}
\`\`\`

## Redaction Checklist

Before running \`case:review\`, remove or replace:

- secrets
- tokens
- passwords
- API keys
- OAuth tokens
- private customer data
- private company data
- private submitter identities unless publication is explicitly named
- copied protected material that is not allowed for publication
- screenshots, logs, or transcripts that reveal private data
- analytics, revenue, or account data that the owner has not approved for publication

Keep only the minimum weak artifact needed for one before/after transformation.

Record:

- artifact owner
- permission status
- publication preference
- redaction requirements
- safety confirmation
- allowed claim
- disallowed claim
- what remains unproven

Candidate rubric source:

${candidateRubric}

## Operator Review

Run local checks only after the submitter says the artifact is permissioned, redacted, and safe:

\`\`\`bash
npm run audit:secrets
npm run cli -- case:review path/to/permissioned-case.md --require-public --write-report
npm run cli -- case:from-intake path/to/permissioned-case.md --reference-pack reference-packs/github-readme.md --title "Permissioned README Case"
\`\`\`

Then stop until the started case contains improved artifact evidence, boundary check, case note, and run ledger evidence.

The secret safety gate says:

\`\`\`text
${secretSafety.includes("local heuristic guardrail") ? "local heuristic guardrail" : "secret safety gate missing expected boundary"}
\`\`\`

## Stop Conditions

Stop before case creation if:

- artifact ownership is unclear
- permission status is unclear
- publication preference is missing
- redaction requirements are vague
- safety confirmation does not name no secrets, no tokens, no passwords, and no private customer data
- the artifact includes copied protected material without permission
- the submitter wants endorsement, adoption, benchmark, commercial outcome, legal originality, or universal effectiveness claims
- \`npm run audit:secrets\` reports a credential finding
- \`case:review --require-public\` fails

## Allowed Claim

Mimesis has a local proof redaction packet for checking redaction requirements before a permissioned external weak artifact enters the proof path.

## Disallowed Claim

This packet does not redact files.
It does not mean an artifact is safe.
It does not mean permission has been granted.
It does not mean a permissioned external weak artifact has been submitted.
It does not mean external proof exists.
It does not prove complete private-data removal, legal compliance, external adoption, benchmarked productivity, customer outcomes, commercial outcomes, legal originality, publication, package release, Marketplace release, or shipped plugin status.

## Boundary

This packet does not redact files.
It does not create external proof.
It does not grant permission.
It does not publish.
It does not stage, commit, push, tag, or release.
It does not choose a license.
It does not run a transformation.
It does not create evidence.
It does not prove adoption.
It does not guarantee complete private-data removal.
It does not replace human review, legal review, owner permission, or the required \`case:review\` gate.

Template signal:

- intake template mentions redaction: ${intakeTemplate.toLowerCase().includes("redaction") ? "yes" : "missing"}
- generated intake kit mentions Safety confirmation: ${intakeKit.includes("Safety confirmation") ? "yes" : "missing"}
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[proof-redaction-packet] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

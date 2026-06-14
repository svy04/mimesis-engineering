#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "proof-intake", "submission-packet.md");

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
const issueForm = read(".github/ISSUE_TEMPLATE/permissioned-external-case.yml");
const intakeKit = read("docs/PROOF-INTAKE-KIT.md");
const intakeTemplate = read("templates/permissioned-case-intake.md");
const redactionPacket = read(".mimesis/proof-intake/redaction-packet.md");
const candidatePacket = read(".mimesis/proof-candidates/first-candidate.md");

const queueState = extractSection(proofQueue, "Current Queue State");
const requirements = extractSection(proofQueue, "First Proof Candidate Requirements");
const redactionChecklist = extractSection(redactionPacket, "Redaction Checklist");
const candidateCard = extractSection(candidatePacket, "Candidate Intake Card");

const issueFields = [
  "Starting artifact",
  "Artifact owner",
  "Permission status",
  "Publication preference",
  "Redaction requirements",
  "References studied",
  "Desired transformation",
  "Proof boundary",
  "Safety confirmation",
];

const generated = `# Mimesis Proof Submission Packet

Status: submission handoff packet, not submitted artifact.

Generated for Mimesis Engineering v${packageJson.version} from the permissioned external case GitHub issue form, proof intake kit, proof redaction packet, first proof candidate packet, and v0.2 proof queue.

## Submission Surfaces

${queueState}

Use one of these local surfaces to prepare the first permissioned external weak artifact:

- .github/ISSUE_TEMPLATE/permissioned-external-case.yml
- templates/permissioned-case-intake.md
- docs/PROOF-INTAKE-KIT.md
- .mimesis/proof-intake/first-external-proof-kit.md
- .mimesis/proof-intake/redaction-packet.md
- .mimesis/proof-candidates/first-candidate.md

GitHub issue form signal:

- permissioned external case form present: ${issueForm.includes("Permissioned External Case") ? "yes" : "missing"}
- safety warning present: ${issueForm.includes("Do not paste private data") ? "yes" : "missing"}
- issue form requires publication preference: ${issueForm.includes("Publication preference") ? "yes" : "missing"}

Intake template signal:

- permissioned-case intake template present: ${intakeTemplate.includes("Permission Status") ? "yes" : "missing"}

## Submitter Checklist

Before submitting, the submitter must confirm:

- the artifact is one weak artifact, not a broad project dump
- the artifact owner is known
- permission status is explicit
- publication preference is public, anonymized, redacted, or private only
- redaction requirements are explicit
- references studied are named
- desired transformation is specific
- proof boundary names what the case must not claim
- safety confirmation says no secrets, no tokens, no passwords, and no private customer data
- copied protected material is absent or permissioned
- no adoption, benchmark, endorsement, commercial outcome, legal originality, or universal effectiveness claim is requested

The v0.2 proof queue requires:

${requirements}

Redaction packet checklist:

${redactionChecklist}

## Issue Form Fields

The GitHub issue form and Markdown intake should preserve these fields:

${issueFields.map((field) => `- ${field}`).join("\n")}

Candidate intake card:

${candidateCard}

## Operator Command Path

After a submitter provides a permissioned or clearly redacted intake file, run:

\`\`\`bash
npm run audit:secrets
npm run cli -- case:review path/to/permissioned-case.md --require-public --write-report
npm run cli -- case:from-intake path/to/permissioned-case.md --reference-pack reference-packs/github-readme.md --title "Permissioned README Case"
npm run cli -- case:check path/to/started-case
\`\`\`

\`case:check\` should fail until the started case contains the improved artifact, boundary check, case note, and run ledger evidence.

Do not continue to evidence review until the before/after case actually exists.

## Stop Conditions

Stop before accepting the submission if:

- the artifact owner is unclear
- permission status is unclear
- publication preference is missing
- redaction requirements are vague
- safety confirmation is incomplete
- the submitted artifact includes secrets, tokens, passwords, private customer data, or copied protected material
- the submitter asks for unsupported adoption, benchmark, endorsement, commercial outcome, legal originality, or universal effectiveness claims
- the issue form or intake file is private only while the operator is trying to run a public proof path
- \`case:review --require-public\` fails

## Allowed Claim

Mimesis has a local proof submission packet that tells a submitter how to prepare one permissioned external weak artifact for review.

## Disallowed Claim

This packet does not submit an artifact.
It does not mean a permissioned external weak artifact has been submitted.
It does not create external proof.
It does not grant permission.
It does not redact files.
It does not prove complete private-data removal.
It does not run a transformation.
It does not prove adoption, benchmarked productivity, customer outcomes, commercial outcomes, legal originality, endorsement, publication, package release, Marketplace release, or shipped plugin status.

## Boundary

This packet does not submit an artifact.
It does not create external proof.
It does not grant permission.
It does not publish.
It does not stage, commit, push, tag, or release.
It does not choose a license.
It does not run a transformation.
It does not create evidence.
It does not prove adoption.
It does not replace the GitHub issue form, permissioned intake template, proof redaction packet, \`case:review\`, or human owner review.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[proof-submission-packet] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

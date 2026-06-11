#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "owner-actions", "proof-input-request.md");

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
const gapRegister = readJson(".mimesis/gaps/current-gap-register.json");
const actionQueue = read(".mimesis/owner-actions/current-action-queue.md");
const proofHandoff = read(".mimesis/owner-actions/proof-run-handoff.md");
const issuePacket = read(".mimesis/owner-actions/proof-input-issue-packet.md");
const issueConvertDoc = read("docs/OWNER-PROOF-INPUT-ISSUE-CONVERT.md");
const issueForm = read(".github/ISSUE_TEMPLATE/owner-proof-input.yml");

const openGateIds = (gapRegister.gaps ?? []).map((gap) => gap.id);

const packet = `# Mimesis Owner Proof Input Request

Status: owner request packet, not owner decision or proof.

Generated for Mimesis Engineering v${packageJson.version} from the current owner action queue, owner proof handoff, owner proof input issue packet, issue form, and issue conversion path.

This packet is the single owner-facing request needed before the first real proof loop can move beyond local fixtures.

## Source Readiness

- owner action queue exists: ${has(actionQueue, "Owner Action Queue")}
- owner proof handoff names minimum inputs: ${has(proofHandoff, "Minimum Owner Inputs")}
- issue packet routes public intake: ${has(issuePacket, "owner proof input issue")}
- issue form asks for license_or_no_reuse: ${has(issueForm, "license_or_no_reuse")}
- issue form asks for weak_artifact_permission: ${has(issueForm, "weak_artifact_permission")}
- issue convert command is documented: ${has(issueConvertDoc, "owner:proof-input-issue-convert")}
- open gates currently visible: ${openGateIds.length ? openGateIds.join(", ") : "none"}

## Owner Request

Please provide exactly two minimum inputs:

| Field | Owner Should Provide | Why It Is Needed | Boundary |
| --- | --- | --- | --- |
| \`license_or_no_reuse\` | Exact reuse license, split code/content license instruction, or explicit no-reuse for now. | Moves the owner license decision gate from ambiguous to reviewable. | does not choose a license or provide legal advice |
| \`weak_artifact_permission\` | One weak artifact text, file path, issue body, URL, or redacted excerpt, plus artifact owner, permission status, publication preference, redaction requirements, and safety confirmation. | Moves the permissioned external artifact gate toward proof intake. | does not grant permission, submit proof, or close gates |

Bring one weak artifact means one owner-submitted, permissioned, or clearly redacted artifact that is weak enough to improve and safe enough to review.

## How To Respond

Option A: Open the owner proof input issue form in GitHub and fill every required field.

\`\`\`text
https://github.com/svy04/mimesis-engineering/issues/new?template=owner-proof-input.yml
\`\`\`

Option B: Save the issue body as a local markdown file and convert it after review:

\`\`\`bash
npm run cli -- owner:proof-input-issue-convert path/to/owner-proof-input-issue.md --output path/to/owner-proof-input-record.json --report path/to/owner-proof-input-conversion-report.md --status reviewed --require-complete
npm run cli -- owner:proof-input-check path/to/owner-proof-input-record.json --require-ready --write-report path/to/owner-proof-input-check.md
npm run cli -- owner:proof-input-split path/to/owner-proof-input-record.json --output-dir path/to/split-output --require-ready
\`\`\`

## Do Not Include

- secrets, passwords, API keys, OAuth tokens, session tokens, private customer data, or copied protected material
- fake engagement, fake user feedback, fake adoption, or fabricated proof
- automatic DM, automatic comment, bulk account creation, scraping, or hidden-identity claims
- legal advice requests that ask the framework to choose license terms

## Stop Conditions

- Stop if \`license_or_no_reuse\` is blank, ambiguous, or asks the framework to choose legal terms.
- Stop if \`weak_artifact_permission\` lacks owner, permission status, publication preference, redaction requirements, or safety confirmation.
- Stop if the artifact is not owner-submitted, permissioned, or clearly redacted.
- Stop if the submitted issue body is treated as permission grant, proof approval, publication approval, adoption evidence, benchmark evidence, or gate closure.

## Allowed Claim

Mimesis has a single owner proof input request packet that tells the owner exactly what to submit before the first real proof loop.

## Disallowed Claim

The owner proof input request is not an owner decision.
It does not mean the owner chose a license.
It does not mean a weak artifact was submitted.
It does not grant permission.
It does not create external proof.
It does not approve proof.
It does not publish.
It does not close gates.
It does not prove adoption, benchmarked productivity, customer outcomes, commercial outcomes, package publication, Marketplace publication, shipped plugin status, or legal originality.

## Boundary

This packet does not choose a license.
It does not provide legal advice.
It does not collect an artifact.
It does not grant permission.
It does not redact files.
It does not run a transformation.
It does not create external proof.
It does not approve proof.
It does not publish.
It does not stage, commit, push, tag, or release.
It does not close gates or mark the active objective complete.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, packet);

console.log(`[owner-proof-input-request] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

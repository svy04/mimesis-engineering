#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "owner-actions", "remote-proof-input-issue-anchor.md");

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
const issueUrl = "https://github.com/svy04/mimesis-engineering/issues/7";
const issueLabel = "owner-proof-input";
const requestPacket = read(".mimesis/owner-actions/proof-input-request.md");
const issuePacket = read(".mimesis/owner-actions/proof-input-issue-packet.md");
const reviewDoc = read("docs/OWNER-PROOF-INPUT-REVIEW.md");
const issueForm = read(".github/ISSUE_TEMPLATE/owner-proof-input.yml");

const packet = `# Mimesis Remote Owner Proof Input Issue Anchor

Status: remote owner input anchor, not owner decision or proof.

Generated for Mimesis Engineering v${packageJson.version} from the local owner proof input request, issue packet, issue form, and review path.

This packet records the current public GitHub issue where the owner can provide the two minimum inputs before the first real proof loop can move beyond local fixtures.

## Remote Anchor

- issue: ${issueUrl}
- expected label: ${issueLabel}
- expected state: open until owner fills the request or replaces it with an equivalent reviewed owner record
- remote verification command: \`gh issue view 7 --json number,title,state,url,labels,body,createdAt\`
- local status: anchor recorded only; owner input still pending

## Source Readiness

- owner proof input request names license_or_no_reuse: ${has(requestPacket, "license_or_no_reuse")}
- owner proof input request names weak_artifact_permission: ${has(requestPacket, "weak_artifact_permission")}
- owner proof input issue packet routes public intake: ${has(issuePacket, "owner proof input issue")}
- issue form carries owner-proof-input label: ${has(issueForm, "owner-proof-input")}
- issue form asks for license_or_no_reuse: ${has(issueForm, "license_or_no_reuse")}
- issue form asks for weak_artifact_permission: ${has(issueForm, "weak_artifact_permission")}
- review path documented: ${has(reviewDoc, "owner:proof-input-review")}

## Owner Inputs Still Required

| Field | Required Owner Input | Local Processing | Boundary |
| --- | --- | --- | --- |
| \`license_or_no_reuse\` | Exact reuse license, split code/content license instruction, legal-review note, or explicit no-reuse for now. | \`owner:proof-input-issue-convert\`, \`owner:proof-input-review\`, \`owner:proof-input-check --require-ready\`, then license decision bridge. | does not choose a license or provide legal advice |
| \`weak_artifact_permission\` | One weak artifact excerpt/path/link plus owner, permission status, publication preference, redaction requirements, proof boundary, and safety confirmation. | \`owner:proof-input-issue-convert\`, \`owner:proof-input-review\`, \`owner:proof-input-split --require-ready\`, then owner evidence/proof intake checks. | does not grant permission, submit proof, or close gates |

## Processing Path After Owner Review

\`\`\`bash
npm run cli -- owner:proof-input-issue-convert path/to/owner-proof-input-issue.md --output path/to/owner-proof-input-record.json --report path/to/owner-proof-input-conversion-report.md --status reviewed --require-complete
npm run cli -- owner:proof-input-review path/to/owner-proof-input-record.json --write-report path/to/review.md --output-record path/to/reviewed-owner-proof-input-record.json --approve --require-approvable
npm run cli -- owner:proof-input-check path/to/reviewed-owner-proof-input-record.json --require-ready --write-report path/to/owner-proof-input-check.md
npm run cli -- owner:proof-input-split path/to/reviewed-owner-proof-input-record.json --output-dir path/to/split-output --require-ready
\`\`\`

## Stop Conditions

- Stop if the remote issue is missing, closed without replacement, unlabeled, or lacks the two required inputs.
- Stop if \`license_or_no_reuse\` asks the framework to choose legal terms.
- Stop if \`weak_artifact_permission\` lacks owner, permission, publication preference, redaction requirements, proof boundary, or safety confirmation.
- Stop if the issue includes secrets, passwords, tokens, private customer data, copied protected material, fake engagement, fake adoption, or fabricated proof.
- Stop if the remote issue is treated as permission grant, proof approval, publication approval, benchmark evidence, adoption evidence, or gate closure.

## Allowed Claim

Mimesis has a remote owner proof input issue anchor where the owner can provide the minimum license/no-reuse and weak artifact permission inputs.

## Disallowed Claim

The remote owner proof input issue anchor is not an owner decision.
It does not mean the owner chose a license.
It does not grant permission.
It does not submit an artifact.
It does not create external proof.
It does not approve proof.
It does not publish.
It does not close gates.
It does not prove adoption, benchmarked productivity, customer outcomes, commercial outcomes, package publication, Marketplace publication, shipped plugin status, or legal originality.

## Boundary

This packet does not verify live GitHub state by itself.
It does not choose a license.
It does not provide legal advice.
It does not grant permission.
It does not collect or redact an artifact.
It does not create external proof.
It does not publish.
It does not stage, commit, push, tag, or release.
It does not close gates or mark the active objective complete.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, packet);

console.log(`[owner-proof-input-remote-issue] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

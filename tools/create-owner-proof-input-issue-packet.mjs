#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "owner-actions", "proof-input-issue-packet.md");

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
const issueForm = read(".github/ISSUE_TEMPLATE/owner-proof-input.yml");
const proofHandoff = read(".mimesis/owner-actions/proof-run-handoff.md");
const proofInputTemplate = read(".mimesis/owner-actions/proof-input-template.json");
const proofInputCheck = read(".mimesis/owner-actions/fixture-proof-input-check.md");
const proofInputSplit = read(".mimesis/owner-actions/proof-input-split-report.md");

const packet = `# Mimesis Owner Proof Input Issue Packet

Status: owner proof input issue handoff, not owner decision or proof.

Generated for Mimesis Engineering v${packageJson.version} from the public owner proof input issue form, owner proof handoff, owner proof input template, owner proof input check, and owner proof input split report.

## Source Files

- .github/ISSUE_TEMPLATE/owner-proof-input.yml
- .mimesis/owner-actions/proof-run-handoff.md
- .mimesis/owner-actions/proof-input-template.json
- .mimesis/owner-actions/fixture-proof-input-check.md
- .mimesis/owner-actions/proof-input-split-report.md

Source readiness:

- issue form asks for license_or_no_reuse: ${has(issueForm, "license_or_no_reuse")}
- issue form asks for weak_artifact_permission: ${has(issueForm, "weak_artifact_permission")}
- issue form asks for artifact_owner: ${has(issueForm, "artifact_owner")}
- issue form asks for publication_preference: ${has(issueForm, "publication_preference")}
- issue form asks for redaction_requirements: ${has(issueForm, "redaction_requirements")}
- issue form has safety_confirmation: ${has(issueForm, "safety_confirmation")}
- proof handoff names minimum owner inputs: ${has(proofHandoff, "Minimum Owner Inputs")}
- proof input template has schema field license_or_no_reuse: ${has(proofInputTemplate, "license_or_no_reuse")}
- proof input template has schema field weak_artifact_permission: ${has(proofInputTemplate, "weak_artifact_permission")}
- proof input check keeps default template not ready: ${has(proofInputCheck, "not ready")}
- proof input split keeps default template blocked: ${has(proofInputSplit, "not ready")}

## Intake Purpose

The issue form captures one owner-controlled answer for:

| Field | Why It Exists | Next Local Check | Boundary |
| --- | --- | --- | --- |
| \`license_or_no_reuse\` | Owner states the current reuse direction or no-reuse boundary. | \`owner:proof-input-check --require-ready\` and \`license:decision-from-owner-answer\` | does not choose a license or provide legal advice |
| \`weak_artifact_permission\` | Owner provides one permissioned or redacted weak artifact for review. | \`owner:proof-input-check --require-ready\`, \`owner:proof-input-split\`, and \`owner:evidence-submission-check --require-field weak_artifact_permission\` | does not grant permission, submit proof, or close gates |

## Review Path

\`\`\`text
owner proof input issue
-> reviewed owner proof input record
-> owner:proof-input-check --require-ready
-> owner:proof-input-split
-> license:decision-from-owner-answer
-> owner:evidence-submission-check --require-field weak_artifact_permission
-> proof:intake-from-owner-evidence
-> proof:intake-check
-> case:from-record
\`\`\`

## Stop Conditions

- Stop if \`license_or_no_reuse\` is blank, ambiguous, or asks the framework to choose legal terms.
- Stop if \`weak_artifact_permission\` lacks owner, permission, publication preference, redaction requirements, or safety confirmation.
- Stop if the issue includes secrets, passwords, tokens, private customer data, copied protected material, or fake engagement.
- Stop if the issue is treated as permission grant, proof approval, publication approval, or gate closure.

## Allowed Claim

Mimesis has a public owner proof input issue form and local packet that route the two minimum owner proof inputs toward reviewed records.

## Disallowed Claim

The owner proof input issue is not an owner decision.
It does not choose a license.
It does not provide legal advice.
It does not grant permission.
It does not submit an artifact by itself.
It does not create external proof.
It does not approve proof.
It does not publish.
It does not close gates.
It does not prove adoption, benchmarked productivity, customer outcomes, commercial outcomes, package publication, Marketplace publication, shipped plugin status, or legal originality.

## Boundary

This packet is local handoff evidence only.
It does not collect a real owner issue.
It does not stage, commit, push, tag, release, publish, approve proof, or mark the active objective complete.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, packet);

console.log(`[owner-proof-input-issue] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const inputIndex = args.indexOf("--input");
const outputIndex = args.indexOf("--output");

const inputRelative = inputIndex >= 0 && args[inputIndex + 1]
  ? args[inputIndex + 1]
  : ".mimesis/owner-actions/fixture-answer-record.json";
const outputRelative = outputIndex >= 0 && args[outputIndex + 1]
  ? args[outputIndex + 1]
  : ".mimesis/owner-actions/answer-review.md";

const inputPath = path.resolve(root, inputRelative);
const outputPath = path.resolve(root, outputRelative);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function fieldRows(fields) {
  return Object.entries(fields)
    .map(([field, entry]) => {
      const evidence = Array.isArray(entry.evidenceToAttach) ? entry.evidenceToAttach.join("<br>") : "owner evidence required";
      return `| \`${field}\` | ${entry.answerStatus} / ${entry.ownerAnswer} | ${entry.currentSignal} | ${evidence} | ${entry.boundary} |`;
    })
    .join("\n");
}

function blockedGateRows(record) {
  return (record.requiredGateIds ?? [])
    .map((gateId) => `| \`${gateId}\` | blocked_pending_owner_answers | owner answer review keeps this gate open until direct evidence is attached. |`)
    .join("\n");
}

function buildReview(record) {
  const fields = record.fields ?? {};
  const pendingFields = Object.entries(fields)
    .filter(([, entry]) => entry.answerStatus !== "answered")
    .map(([field]) => field);
  const status = pendingFields.length > 0 ? "blocked_pending_owner_answers" : "owner_answers_review_needed";
  const readyToProceed = pendingFields.length === 0 ? "needs evidence review" : "no";

  return `# Mimesis Owner Answer Review

Status: owner answer review packet, gates remain blocked.

Generated from \`${inputRelative.replaceAll(path.sep, "/")}\`.

Review status: \`${status}\`

ready to proceed: ${readyToProceed}

This packet answers one narrow question:

\`\`\`text
Do the owner answer fields contain enough reviewed owner evidence to move release, proof, publication, benchmark, or adoption gates forward?
\`\`\`

## Source Record

- ${inputRelative.replaceAll(path.sep, "/")}
- source intake: ${record.sourceIntake ?? "missing"}
- schema version: ${record.schemaVersion ?? "missing"}
- source status: ${record.status ?? "missing"}
- pending fields: ${pendingFields.length ? pendingFields.map((field) => `\`${field}\``).join(", ") : "none recorded"}

## Answer Status Table

| Field | Answer Status | Current Signal | Evidence To Attach | Boundary |
| --- | --- | --- | --- | --- |
${fieldRows(fields)}

## Blocked Gates

| Gate ID | Review Status | Reason |
| --- | --- | --- |
${blockedGateRows(record)}

## Required Next Evidence

- Replace each \`pending owner answer\` with an explicit owner answer only when the owner provides it.
- Attach direct evidence for license, weak artifact permission, publication scope, package/action/plugin scope, benchmark/adoption scope, and strict sync intent.
- Rerun \`npm run owner:answer-review\` after owner answers are recorded.
- Run the relevant evidence audits before making any stronger claim.

## Allowed Claim

Mimesis has a local owner answer review packet that shows pending owner answers keep gates blocked.

## Disallowed Claim

The owner answer review is not an owner decision.
It does not mean the owner has chosen a license.
It does not mean an external weak artifact has been submitted.
It does not mean permission has been granted.
It does not mean a before/after external case is complete.
It does not mean publication, npm release, Marketplace release, plugin shipment, benchmark proof, or adoption proof exists.
It does not mean gates are closed.

## Boundary

This packet does not choose a license.
It does not collect an artifact.
It does not grant permission.
It does not redact files.
It does not accept an artifact.
It does not run a transformation.
It does not publish.
It does not stage, commit, push, tag, or release.
It does not publish to npm.
It does not publish a GitHub Marketplace action.
It does not ship a plugin.
It does not create external proof.
It does not prove adoption.
It does not close gates.
It does not prove benchmarked productivity, customer outcomes, commercial outcomes, legal originality, or endorsement.
`;
}

if (!fs.existsSync(inputPath)) {
  throw new Error(`Owner decision answer record does not exist: ${inputPath}`);
}

const record = readJson(inputPath);
const review = buildReview(record);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, review);

console.log(`[owner-answer-review] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

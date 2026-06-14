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
  : ".mimesis/owner-actions/fixture-evidence-record.json";
const outputRelative = outputIndex >= 0 && args[outputIndex + 1]
  ? args[outputIndex + 1]
  : ".mimesis/owner-actions/evidence-review.md";

const inputPath = path.resolve(root, inputRelative);
const outputPath = path.resolve(root, outputRelative);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function cellList(values, fallback) {
  if (!Array.isArray(values) || values.length === 0) {
    return fallback;
  }
  return values.map((value) => String(value).trim()).filter(Boolean).join("<br>") || fallback;
}

function fieldRows(fields) {
  return Object.entries(fields)
    .map(([field, entry]) => {
      const requiredAttachments = cellList(entry.requiredAttachments, "owner-provided evidence required");
      const blockedGates = cellList(entry.blockedGateIds, "owner evidence required");
      return `| \`${field}\` | ${entry.attachmentStatus} | ${entry.ownerEvidence} | ${requiredAttachments} | ${blockedGates} | ${entry.boundary} |`;
    })
    .join("\n");
}

function blockedGateRows(record) {
  return (record.requiredGateIds ?? [])
    .map((gateId) => `| \`${gateId}\` | blocked_pending_owner_evidence | pending owner evidence attachments do not move this gate. |`)
    .join("\n");
}

function buildReview(record) {
  const fields = record.fields ?? {};
  const pendingFields = Object.entries(fields)
    .filter(([, entry]) => entry.attachmentStatus !== "attached")
    .map(([field]) => field);
  const status = pendingFields.length > 0 ? "blocked_pending_owner_evidence" : "owner_evidence_review_needed";
  const readyToProceed = pendingFields.length === 0 ? "needs owner evidence review" : "no";

  return `# Mimesis Owner Evidence Review

Status: owner evidence review packet, gates remain blocked.

Generated from \`${inputRelative.replaceAll(path.sep, "/")}\`.

Review status: \`${status}\`

ready to proceed: ${readyToProceed}

This packet answers one narrow question:

\`\`\`text
Do pending owner evidence attachments contain direct evidence that can move release, proof, publication, benchmark, or adoption gates forward?
\`\`\`

## Source Record

- ${inputRelative.replaceAll(path.sep, "/")}
- source bundle: ${record.sourceBundle ?? "missing"}
- schema version: ${record.schemaVersion ?? "missing"}
- source status: ${record.status ?? "missing"}
- pending evidence fields: ${pendingFields.length ? pendingFields.map((field) => `\`${field}\``).join(", ") : "none recorded"}

## Evidence Attachment Status Table

| Field | Attachment Status | Owner Evidence | Required Attachments | Blocked Gates | Boundary |
| --- | --- | --- | --- | --- | --- |
${fieldRows(fields)}

## Blocked Gates

| Gate ID | Review Status | Reason |
| --- | --- | --- |
${blockedGateRows(record)}

## Required Next Evidence

- Attach direct owner evidence for license, weak artifact permission, publication scope, package/action/plugin scope, benchmark/adoption scope, and strict sync intent.
- Replace each \`pending owner evidence\` marker only when the owner provides the evidence artifact or explicit no-reuse/no-publication decision.
- Rerun \`npm run owner:evidence-intake-record\` and \`npm run owner:evidence-review\` after evidence is recorded.
- Run the relevant gate, proof, publication, package, plugin, benchmark, and adoption audits before making any stronger claim.

## Allowed Claim

Mimesis has a local owner evidence review packet that shows pending owner evidence attachments keep gates blocked.

## Disallowed Claim

The owner evidence review is not attached evidence.
It does not mean the owner has chosen a license.
It does not mean an external weak artifact has been submitted.
It does not mean permission has been granted.
It does not mean a before/after external case is complete.
It does not mean publication, npm release, Marketplace release, plugin shipment, benchmark proof, or adoption proof exists.
It does not mean gates are closed.

## Boundary

This packet does not attach evidence.
It does not choose a license.
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
  throw new Error(`Owner evidence intake record does not exist: ${inputPath}`);
}

const record = readJson(inputPath);
const review = buildReview(record);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, review);

console.log(`[owner-evidence-review] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

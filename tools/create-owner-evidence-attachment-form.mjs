#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const inputIndex = args.indexOf("--input");
const reviewIndex = args.indexOf("--review");
const outputIndex = args.indexOf("--output");

const inputRelative = inputIndex >= 0 && args[inputIndex + 1]
  ? args[inputIndex + 1]
  : ".mimesis/owner-actions/fixture-evidence-record.json";
const reviewRelative = reviewIndex >= 0 && args[reviewIndex + 1]
  ? args[reviewIndex + 1]
  : ".mimesis/owner-actions/evidence-review.md";
const outputRelative = outputIndex >= 0 && args[outputIndex + 1]
  ? args[outputIndex + 1]
  : ".mimesis/owner-actions/evidence-attachment-form.md";

const inputPath = path.resolve(root, inputRelative);
const reviewPath = path.resolve(root, reviewRelative);
const outputPath = path.resolve(root, outputRelative);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function list(values, fallback) {
  if (!Array.isArray(values) || values.length === 0) {
    return fallback;
  }
  return values.map((value) => String(value).trim()).filter(Boolean).join("<br>") || fallback;
}

function fieldRows(fields) {
  return Object.entries(fields)
    .map(([field, entry]) => {
      const evidence = list(entry.requiredAttachments, "owner-provided evidence required");
      const gates = list(entry.blockedGateIds, "owner evidence required");
      const slot = "owner-provided evidence required";
      const safety = field === "weak_artifact_permission"
        ? "owner-provided permission required"
        : "owner must confirm source, permission, and publication scope";
      return `| \`${field}\` | ${evidence} | ${gates} | ${slot} | ${safety} |`;
    })
    .join("\n");
}

function attachmentSections(fields) {
  return Object.entries(fields)
    .map(([field, entry]) => {
      const gates = list(entry.blockedGateIds, "owner evidence required");
      const evidence = list(entry.requiredAttachments, "owner-provided evidence required");
      return `### ${field}

- blocked gates: ${gates}
- required evidence: ${evidence}
- owner attachment: owner-provided evidence required
- permission/publication scope: owner-provided permission required
- safety check: confirm this attachment contains no secrets, passwords, OAuth tokens, private customer data, or copied protected material.
- review note: leave as pending until direct owner evidence exists.
`;
    })
    .join("\n");
}

function buildForm(record) {
  const fields = record.fields ?? {};

  return `# Mimesis Owner Evidence Attachment Form

Status: owner evidence attachment form, not evidence.

Generated from \`${inputRelative.replaceAll(path.sep, "/")}\` and \`${reviewRelative.replaceAll(path.sep, "/")}\`.

Review status inherited from source review: \`blocked_pending_owner_evidence\`

This form answers one narrow question:

\`\`\`text
What direct owner-provided evidence must be attached before pending owner evidence can move a gate?
\`\`\`

## Source Review

- evidence review: ${reviewRelative.replaceAll(path.sep, "/")}
- evidence record: ${inputRelative.replaceAll(path.sep, "/")}
- source bundle: ${record.sourceBundle ?? "missing"}
- schema version: ${record.schemaVersion ?? "missing"}
- source status: ${record.status ?? "missing"}

## Owner Evidence Fields

| Field | Owner Evidence To Attach | Blocked Gates | Owner Attachment Slot | Safety Check |
| --- | --- | --- | --- | --- |
${fieldRows(fields)}

## Attachment Form

${attachmentSections(fields)}

## Safety Confirmation

Before this form can be treated as submitted evidence, the owner must confirm:

- owner-provided evidence only
- owner-provided permission required for any external artifact
- no secrets, passwords, OAuth tokens, API keys, private customer data, or copied protected material are included
- publication scope is explicit: public, anonymized, redacted, private only, or no reuse
- redaction requirements are explicit before any public claim
- any benchmark, adoption, package, action, plugin, or release claim has direct evidence and review

## Review Commands

\`\`\`bash
npm run owner:evidence-intake-record
npm run owner:evidence-review
npm run owner:evidence-attachment-form
npm run audit:owner-evidence-attachment-form
\`\`\`

If a permissioned external case is attached later, continue with:

\`\`\`bash
npm run cli -- case:review path/to/intake.md
npm run cli -- case:from-intake path/to/intake.md
npm run cli -- case:check path/to/case
npm run cli -- evidence:from-case path/to/case --out path/to/evidence-packet.md --force
npm run cli -- evidence:review path/to/evidence-packet.md --decision reviewed --reviewer "Reviewer Name" --note "Reviewed against the proof boundary." --out path/to/reviewed-evidence.md
\`\`\`

## Allowed Claim

Mimesis has a local owner evidence attachment form that asks for owner-provided evidence without pretending that evidence exists.

## Disallowed Claim

The owner evidence attachment form is not evidence.
It does not mean the owner has chosen a license.
It does not mean an external weak artifact has been submitted.
It does not mean permission has been granted.
It does not mean publication, npm release, Marketplace release, plugin shipment, benchmark proof, or adoption proof exists.
It does not mean gates are closed.

## Boundary

This form does not attach evidence.
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

if (!fs.existsSync(reviewPath)) {
  throw new Error(`Owner evidence review does not exist: ${reviewPath}`);
}

const record = readJson(inputPath);
const form = buildForm(record);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, form);

console.log(`[owner-evidence-attachment-form] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

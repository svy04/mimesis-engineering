#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "release-evidence", "publication-evidence-packet.md");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

const packageJson = readJson("package.json");
const gapRegister = readJson(".mimesis/gaps/current-gap-register.json");
const releaseEvidenceReport = read(".mimesis/release-evidence/v0.1-report.md");

const publicationGates = (gapRegister.gaps ?? []).filter((gap) =>
  ["package_publication", "action_publication", "shipped_plugin"].includes(gap.id),
);
const reportStatus = /Status: release evidence report packet, not publication/i.test(releaseEvidenceReport)
  ? "release evidence report is available and bounded"
  : "release evidence report must be regenerated before publication evidence review";

const gateRows = publicationGates
  .map(
    (gate) =>
      `| \`${gate.id}\` | ${gate.title} | ${gate.status} | ${gate.requiredEvidence.join("<br>")} | ${gate.boundary} |`,
  )
  .join("\n");

const generated = `# Mimesis Publication Evidence Packet

Generated from the current local repository state for Mimesis Engineering v${packageJson.version}.

Status: publication evidence packet, not publication proof.

## Current Publication Gates

Release evidence report status: ${reportStatus}.

| Gate | Title | Current Status | Required Evidence | Boundary |
| --- | --- | --- | --- | --- |
${gateRows}

## Required Direct Evidence

Direct publication evidence means evidence produced outside this local checklist:

- owner-controlled npm publish evidence for \`package_publication\`
- tag or Marketplace release evidence for \`action_publication\`
- installation or release evidence packet for \`shipped_plugin\`
- commit, push, and tag references when a publication claim depends on repository sync
- release URL, registry URL, Marketplace URL, host listing, or install proof as applicable
- reviewer decision and claim boundary before public copy changes

Dry-run package checks, repository-local action metadata, local plugin scaffolds, and install-readiness packets are not direct publication evidence.

## Submission Paths

Use this packet when an owner has real release evidence to attach:

1. Start from \`templates/evidence-packet.md\`.
2. Set the evidence type to \`package release\`, \`action release\`, \`shipped plugin\`, or \`publication event\`; this is not proof by itself.
3. Attach URLs or local archival paths for the publication event.
4. Record who controls the account, repository, tag, package, listing, or host.
5. Include redactions for private account, token, billing, or maintainer details.
6. Keep the claim tied to the named event.

## Review Path

Run:

\`\`\`bash
npm run cli -- evidence:check path/to/publication-evidence.md --require-reviewed --write-report path/to/publication-evidence-check.md
\`\`\`

Short command form:

\`\`\`text
evidence:check --require-reviewed
\`\`\`

Only after a reviewed evidence packet exists, run \`npm run cli -- claim:from-evidence path/to/reviewed-evidence.md --out path/to/claim-candidate.md\`.

## Allowed Claim

Allowed now:

\`\`\`text
Mimesis Engineering includes a local publication evidence packet for collecting direct package, action, and plugin release evidence.
\`\`\`

Allowed only after reviewed direct evidence exists:

\`\`\`text
One named package, action, plugin, or publication event was reviewed under the stated evidence packet and boundary.
\`\`\`

## Disallowed Claim

Not allowed from this packet:

\`\`\`text
Mimesis is published to npm, released as a Marketplace action, or shipped as a plugin.
\`\`\`

## Boundary

This packet does not publish, does not stage, does not commit, does not push, does not create tag, does not publish to npm, does not publish a GitHub Marketplace action, does not ship a plugin, does not close gates, does not choose a license, does not create external proof, and does not prove adoption.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[publication-evidence-packet] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

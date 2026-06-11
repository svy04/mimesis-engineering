#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "owner-actions", "v0.2-issue-queue.md");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function markdownList(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "- Attach direct evidence before changing any claim.";
  }
  return items.map((item) => `- ${item}`).join("\n");
}

function labelForGap(gap) {
  const common = ["mimesis-v0.2", "mimesis-gap"];

  if (gap.kind === "owner_decision" || gap.kind === "git_sync") {
    return ["mimesis-owner-gate", ...common];
  }

  if (gap.kind === "external_artifact" || gap.kind === "proof_case") {
    return ["mimesis-proof-gate", ...common];
  }

  if (gap.kind === "publication" || gap.kind === "integration") {
    return ["mimesis-publication-gate", ...common];
  }

  if (gap.kind === "measurement" || gap.kind === "adoption") {
    return ["mimesis-measurement-gate", ...common];
  }

  return ["mimesis-owner-gate", ...common];
}

function issueTitle(gap) {
  return `[Mimesis v0.2 gate] ${gap.title}`;
}

const packageJson = readJson("package.json");
const gapRegister = readJson(".mimesis/gaps/current-gap-register.json");
const closurePlan = readJson(".mimesis/gaps/closure-plan.json");
const ownerQueue = read(".mimesis/owner-actions/current-action-queue.md");

const closureById = new Map((closurePlan.steps ?? []).map((step) => [step.id, step]));
const gaps = Array.isArray(gapRegister.gaps) ? gapRegister.gaps : [];

const rows = gaps
  .map((gap) => {
    const labels = labelForGap(gap).map((label) => `label: ${label}`).join("<br>");
    return `| \`${gap.id}\` | ${gap.title} | ${gap.status} | ${labels} | ${gap.nextAction} |`;
  })
  .join("\n");

const drafts = gaps
  .map((gap) => {
    const closure = closureById.get(gap.id) ?? {};
    const labels = labelForGap(gap);

    return `### Issue Draft: \`${gap.id}\`

Title: ${issueTitle(gap)}

Labels:
${labels.map((label) => `- label: ${label}`).join("\n")}

Copyable issue body only:

\`\`\`markdown
## Why This Issue Exists

This issue tracks the \`${gap.id}\` gate for Mimesis Engineering v${packageJson.version}.

Current status: ${gap.status}

Owner-facing action: ${gap.nextAction}

## Direct Evidence Needed

${markdownList(gap.requiredEvidence)}

## Suggested Local Commands

${markdownList(closure.commands)}

## Stop Conditions

${markdownList(closure.stopConditions)}

## Allowed Claim After Direct Evidence

${closure.allowedClaimAfterClosure ?? "Only the directly evidenced closure can be claimed."}

## Boundary

${gap.boundary}

This issue body does not create GitHub issues.
It does not close gates.
It does not choose a license.
It does not collect an artifact.
It does not grant permission.
It does not create external proof.
It does not prove adoption.
\`\`\``;
  })
  .join("\n\n");

const generated = `# Mimesis Owner Issue Queue

Status: issue-ready owner queue, not remote issue creation.

Generated for Mimesis Engineering v${packageJson.version} from the current gap register, gap closure plan, and owner action queue.

This packet turns the remaining owner, proof, publication, benchmark, and adoption gates into copyable GitHub issue body drafts. It does not call the GitHub API, does not run a remote mutation, and does not create GitHub issues.

## Source Packets

- .mimesis/gaps/current-gap-register.json
- .mimesis/gaps/closure-plan.json
- .mimesis/owner-actions/current-action-queue.md

Source readiness:

- gap register status: ${gapRegister.status}
- gap count: ${gapRegister.gapCount}
- closure plan status: ${closurePlan.status}
- owner action queue present: ${ownerQueue.includes("# Mimesis Owner Action Queue") ? "yes" : "missing"}

## Issue Queue

| Gap ID | Issue Title | Current State | Labels | Next Owner Action |
| --- | --- | --- | --- | --- |
${rows}

## Label Legend

- label: mimesis-owner-gate
- label: mimesis-proof-gate
- label: mimesis-publication-gate
- label: mimesis-measurement-gate
- label: mimesis-v0.2
- label: mimesis-gap

## Issue Body Drafts

${drafts}

## Stop Conditions

- Stop if the owner license decision is missing and the issue asks for public reuse or package publication.
- Stop if permission, redaction, or submitter scope is unclear.
- Stop if the weak artifact contains secrets, private customer data, or copied protected material.
- Stop if a before/after case lacks explicit boundary evidence.
- Stop if publication, package, action, plugin, benchmark, adoption, or customer-outcome claims lack direct reviewed evidence.
- Stop if a remote issue would expose private owner input, secrets, or raw artifact text that should remain private.

## Allowed Claim

Mimesis has a local owner issue queue with copyable issue body drafts for the remaining open gates.

## Disallowed Claim

The owner issue queue is not remote issue creation.
It does not mean any GitHub issue has been created.
It does not mean a gate is closed.
It does not mean the owner has chosen a license.
It does not mean an external weak artifact has been submitted.
It does not mean a before/after external case is complete.
It does not mean publication, package release, action release, plugin shipment, benchmark evidence, or adoption evidence is available.

## Boundary

This packet does not create GitHub issues.
It does not close gates.
It does not choose a license.
It does not collect an artifact.
It does not grant permission.
It does not redact files.
It does not run a transformation.
It does not publish.
It does not stage, commit, push, tag, or release.
It does not create external proof.
It does not prove adoption.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[owner-issue-queue] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

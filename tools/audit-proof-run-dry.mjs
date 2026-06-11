#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportPath = path.join(root, ".mimesis", "proof-runs", "dry-run-report.md");
const failures = [];

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

const packageJson = JSON.parse(read("package.json") || "{}");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/PROOF-RUN-DRY-AUDIT.md");

function runNode(script, args, cwd) {
  return spawnSync(process.execPath, [path.join(root, "tools", script), ...args], {
    cwd,
    encoding: "utf8",
  });
}

function writeCaseCompletion(caseRoot) {
  const replacements = new Map([
    [".mimesis/artifact-brief.md", `# Artifact Brief

## Artifact

permissioned weak README fixture

## Audience

New repository visitors.

## Goal

Make the README clearer, more actionable, and proof-bounded.

## Current Weakness

The weak artifact is vague and does not show a first action or proof boundary.

## Constraint

Respect permission, redaction, and proof boundary.

## Success Looks Like

A before/after case note shows a concrete transformation and what remains unproven.

## Proof Needed

Completed improved artifact, boundary check, case note, run ledger, and evidence packet review.
`],
    [".mimesis/reference-set.md", `# Reference Set

## Use Case

Improve a permissioned weak README fixture.

## References

| Source Type | Source / Reference | Why It Is Strong | What To Inspect | What Not To Copy | Claim Boundary |
| --- | --- | --- | --- | --- | --- |
| reference pack | reference-packs/github-readme.md | Gives README structure standards | promise, first action, trust boundary | wording, protected surface, implied endorsement | local structure only |

## Source-First Check

- The reference pack is visible.
- The fixture is local and permissioned for dry audit use.
- The output must transform structure, not copy surface.
`],
    [".mimesis/structure-map.md", `# Structure Map

## Knowledge Structure

Problem, first action, proof boundary, and next evidence.

## User Flow

Reader sees the promise, runs the first action, and understands claim limits.

## Trust Devices

Permissioned intake, before/after case evidence, boundary check, evidence packet review.

## Claim Boundary

No external adoption, benchmarked productivity, customer outcome, commercial proof, or legal originality claim.
`],
    [".mimesis/transformation-plan.md", `# Transformation Plan

## Transfer

Use README structure: promise, first action, evidence, limits.

## Change

Rewrite vague positioning into a bounded first-action README.

## Reject

Reject copied wording, fake engagement, hidden references, and unsupported proof.

## Proof Needed

Case check report plus reviewed evidence packet.
`],
    [".mimesis/improved-artifact.md", `# Improved Artifact

## Improved Version

# Permissioned README Fixture

This project helps a reader understand the artifact, run one first action, and see the proof boundary before any larger claim is made.

First action:

\`\`\`bash
npm run audit:proof-run-dry
\`\`\`

## Why It Is Stronger

It is stronger because it names the reader, gives a concrete first action, and keeps unproven claims out of the public copy.

## What Remains Unproven

External adoption, benchmarked productivity, customer outcomes, commercial value, and legal originality remain unproven.
`],
    [".mimesis/boundary-check.md", `# Boundary Check

## Surface Similarity Risk

Low. The fixture uses generic README structure and does not copy reference wording.

## Wording Risk

Low. The wording is original to the fixture.

## Layout Risk

Low. Headings are conventional and not protected.

## Authority Borrowing Risk

Medium. Reference packs must not imply endorsement or external validation.

## Proof Risk

High if the dry audit is described as external proof.

## What Remains Unproven

This remains a temporary local fixture. It does not prove external adoption, benchmarked productivity, customer outcomes, commercial impact, or legal originality.
`],
    [".mimesis/case-note.md", `# Case Note

## Starting Artifact

The weak fixture said the README should be better but did not show a first action or claim boundary.

## Problem

The starting artifact was vague and under-bounded.

## Reference Artifacts

- reference-packs/github-readme.md

## Extracted Structure

Promise, first action, evidence, and explicit proof boundary.

## Transformation

The README fixture was rewritten around a concrete first action and visible limits.

## Before / After

Before:
The README said the project should be clearer.

After:
The README names the first action and proof boundary.

## What Improved

The artifact became more actionable and safer to cite.

## What Remains Unproven

External adoption, benchmarked productivity, customer outcomes, commercial impact, and legal originality remain unproven.

## Next Proof Artifact

A real permissioned external artifact should run through the same command path.
`],
    [".mimesis/run_ledger.md", `# Run Ledger

## Run

Date: 2026-06-11

Operator: proof-run dry audit

Artifact: temporary permissioned README fixture

## Import

- Created temporary permissioned intake.
- Selected reference-packs/github-readme.md.

## Distill

- Locked permission, redaction, and proof boundary.

## Capsule

- Split the proof run into intake review, case workspace, case check, and evidence packet review.

## Shard

- Completed improved artifact, boundary check, case note, and run ledger.

## Verify

- Permissioned intake passed.
- Started case failed case:check before completion.
- Completed case passed case:check with report.
- Evidence packet passed evidence:check with report.

## Remember

- This is a temporary local fixture and does not create external proof.
`],
  ]);

  for (const [relativePath, content] of replacements) {
    fs.writeFileSync(path.join(caseRoot, relativePath), content);
  }
}

function writeEvidencePacket(filePath, title, sourceLinks, allowedClaim) {
  fs.writeFileSync(filePath, `# Evidence Packet

## Claim Under Review

${title}

## Evidence Type

permissioned external case

## Source / Artifact Links

${sourceLinks.map((item) => `- ${item}`).join("\n")}

## Permission / Publication Boundary

The generated fixture is permissioned for public dry-run audit use, but it is not a real submitter artifact.

## Measurement / Observation Method

Observed by running the local proof-run dry audit in a temporary local directory.

## Before / After Or Event Evidence

Before:
Started case failed case:check before completion.

After:
Completed fixture passed case:check and produced case-proof.md.

## Allowed Claim

${allowedClaim}

## Disallowed Claim

The dry audit does not create external proof, prove adoption, prove benchmarked productivity, prove customer outcomes, or prove legal originality.

## What Remains Unproven

A real permissioned external weak artifact still needs to run through the path.

## Review Decision

reviewed
`);
}

function runDryAudit() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-proof-run-dry-"));
  const summary = [];

  try {
    const intakePath = path.join(tempRoot, "permissioned-intake.md");
    fs.writeFileSync(intakePath, `# Permissioned External Case Intake

## Starting artifact

Shareable weak README fixture for dry-run validation.

## Artifact owner

The fixture is generated locally for audit use.

## Permission status

The operator has permission to use and publish the generated fixture.

## Publication preference

Public.

## Redaction requirements

No redaction required because this is a generated fixture.

## References studied

reference-packs/github-readme.md

## Desired transformation

Make the README clearer, more actionable, and proof-bounded.

## Proof boundary

This dry run must not claim external adoption, benchmarked productivity, customer outcomes, commercial proof, legal originality, or endorsement.

## Safety confirmation

I did not include secrets, tokens, passwords, private customer data, or real submitter data.
`);

    const review = runNode("check-permissioned-case.mjs", [intakePath, "--require-public", "--write-report"], tempRoot);
    if (review.status !== 0) {
      failures.push(`permissioned intake dry run failed: ${review.stderr || review.stdout}`);
    } else {
      summary.push("permissioned intake: passed");
    }

    const fromIntake = runNode("case-from-intake.mjs", [
      intakePath,
      "--reference-pack",
      "reference-packs/github-readme.md",
      "--title",
      "Proof Run Dry Fixture",
      "--out",
      "proof-run-case",
    ], tempRoot);

    const caseRoot = path.join(tempRoot, "proof-run-case");
    if (fromIntake.status !== 0) {
      failures.push(`started case creation dry run failed: ${fromIntake.stderr || fromIntake.stdout}`);
    } else {
      summary.push("started case creation: passed");
    }

    const startedCheck = runNode("check-case.mjs", [caseRoot], tempRoot);
    if (startedCheck.status === 0) {
      failures.push("started case must fail case:check before completion");
    } else {
      summary.push("started case rejection: passed");
    }

    writeCaseCompletion(caseRoot);

    const completedCheck = runNode("check-case.mjs", [caseRoot, "--write-report"], tempRoot);
    if (completedCheck.status !== 0) {
      failures.push(`completed case check dry run failed: ${completedCheck.stderr || completedCheck.stdout}`);
    } else {
      summary.push("completed case check: passed");
    }

    const evidencePath = path.join(tempRoot, "evidence-packet.md");
    writeEvidencePacket(
      evidencePath,
      "The temporary local proof-run fixture completed the local Mimesis proof path through reviewed evidence packet and bounded claim candidate.",
      [
        "proof-run-case/.mimesis/case-proof.md",
        "permissioned-case-review.md",
        "proof-run-case/.mimesis/case-note.md",
      ],
      "The local dry audit can exercise the permissioned-intake proof-run command path on a temporary fixture.",
    );

    const evidenceCheck = runNode("check-evidence-packet.mjs", [
      evidencePath,
      "--require-reviewed",
      "--write-report",
    ], tempRoot);
    if (evidenceCheck.status !== 0) {
      failures.push(`evidence packet review dry run failed: ${evidenceCheck.stderr || evidenceCheck.stdout}`);
    } else {
      summary.push("evidence packet review: passed");
    }

    const claimPath = path.join(tempRoot, "claim-candidate.md");
    const claimCandidate = runNode("create-claim-from-evidence.mjs", [
      evidencePath,
      "--out",
      claimPath,
    ], tempRoot);
    if (claimCandidate.status !== 0) {
      failures.push(`claim candidate dry run failed: ${claimCandidate.stderr || claimCandidate.stdout}`);
    } else {
      summary.push("bounded claim candidate: passed");
    }

    const ownerRecord = JSON.parse(read(".mimesis/owner-actions/fixture-evidence-submission-record.json"));
    ownerRecord.status = "reviewed";
    ownerRecord.fields.weak_artifact_permission = {
      ...ownerRecord.fields.weak_artifact_permission,
      submissionStatus: "submitted",
      ownerSubmittedEvidence: [
        "# Owner Evidence Bridge Weak Artifact",
        "",
        "This temporary weak README fixture is generated for the owner evidence bridge dry audit.",
        "It has no secrets, no private customer data, and no copied protected material.",
        "It is permitted for redacted local framework review only.",
      ].join("\n"),
      ownerAttachmentSlot: "temporary owner evidence bridge weak artifact text",
      safetyCheck: "owner reviewed this temporary weak artifact and permits redacted local framework review only",
      boundary: "does not grant permission, create external proof, publish, or close gates",
    };

    const ownerRecordPath = path.join(tempRoot, "owner-evidence-submission-record.json");
    fs.writeFileSync(ownerRecordPath, `${JSON.stringify(ownerRecord, null, 2)}\n`);

    const ownerFieldCheck = runNode("check-owner-evidence-submission-record.mjs", [
      ownerRecordPath,
      "--require-field",
      "weak_artifact_permission",
      "--write-report",
      path.join(tempRoot, "owner-evidence-submission-check.md"),
    ], tempRoot);
    if (ownerFieldCheck.status !== 0) {
      failures.push(`owner evidence field dry run failed: ${ownerFieldCheck.stderr || ownerFieldCheck.stdout}`);
    } else {
      summary.push("owner evidence field check: passed");
    }

    const proofIntakeRecordPath = path.join(tempRoot, "owner-proof-intake-record.json");
    const ownerBridge = runNode("proof-intake-from-owner-evidence.mjs", [
      ownerRecordPath,
      "--output",
      proofIntakeRecordPath,
      "--submitter",
      "temporary owner evidence bridge dry audit",
      "--artifact-owner",
      "generated local fixture owner",
      "--permission-status",
      "owner permits redacted local framework review only; this is not publication permission",
      "--publication-preference",
      "redacted",
      "--redaction-requirements",
      "redact identifying and private details before any public use",
      "--reference",
      "reference-packs/github-readme.md",
      "--desired-transformation",
      "Transform the temporary weak artifact into a clearer proof-run dry-audit artifact while preserving proof boundaries.",
      "--confirm-no-secrets",
      "--confirm-no-private-customer-data",
      "--confirm-no-copied-protected-material",
    ], tempRoot);
    if (ownerBridge.status !== 0) {
      failures.push(`owner evidence bridge dry run failed: ${ownerBridge.stderr || ownerBridge.stdout}`);
    } else {
      summary.push("owner evidence bridge conversion: passed");
    }

    const ownerProofIntakeCheck = runNode("check-proof-intake-record.mjs", [
      proofIntakeRecordPath,
      "--require-case-ready",
      "--write-report",
      path.join(tempRoot, "owner-proof-intake-check.md"),
    ], tempRoot);
    if (ownerProofIntakeCheck.status !== 0) {
      failures.push(`owner proof intake check dry run failed: ${ownerProofIntakeCheck.stderr || ownerProofIntakeCheck.stdout}`);
    } else {
      summary.push("owner proof intake check: passed");
    }

    const ownerFromRecord = runNode("case-from-record.mjs", [
      proofIntakeRecordPath,
      "--title",
      "Owner Evidence Bridge Dry Fixture",
      "--out",
      "owner-bridge-case",
    ], tempRoot);

    const ownerCaseRoot = path.join(tempRoot, "owner-bridge-case");
    if (ownerFromRecord.status !== 0) {
      failures.push(`owner started case creation dry run failed: ${ownerFromRecord.stderr || ownerFromRecord.stdout}`);
    } else {
      summary.push("owner started case creation: passed");
    }

    const ownerStartedCheck = runNode("check-case.mjs", [ownerCaseRoot], tempRoot);
    if (ownerStartedCheck.status === 0) {
      failures.push("owner bridge started case must fail case:check before completion");
    } else {
      summary.push("owner started case rejection: passed");
    }

    writeCaseCompletion(ownerCaseRoot);

    const ownerCompletedCheck = runNode("check-case.mjs", [ownerCaseRoot, "--write-report"], tempRoot);
    if (ownerCompletedCheck.status !== 0) {
      failures.push(`owner completed case check dry run failed: ${ownerCompletedCheck.stderr || ownerCompletedCheck.stdout}`);
    } else {
      summary.push("owner completed case check: passed");
    }

    const ownerEvidencePath = path.join(tempRoot, "owner-evidence-packet.md");
    writeEvidencePacket(
      ownerEvidencePath,
      "The temporary owner evidence bridge fixture completed the local Mimesis proof path through reviewed evidence packet and bounded claim candidate.",
      [
        "owner-bridge-case/.mimesis/case-proof.md",
        "owner-proof-intake-record.json",
        "owner-bridge-case/.mimesis/case-note.md",
      ],
      "The local dry audit can exercise the owner-evidence bridge proof-run command path on a temporary fixture.",
    );

    const ownerEvidenceCheck = runNode("check-evidence-packet.mjs", [
      ownerEvidencePath,
      "--require-reviewed",
      "--write-report",
    ], tempRoot);
    if (ownerEvidenceCheck.status !== 0) {
      failures.push(`owner evidence packet review dry run failed: ${ownerEvidenceCheck.stderr || ownerEvidenceCheck.stdout}`);
    } else {
      summary.push("owner evidence packet review: passed");
    }

    const ownerClaimPath = path.join(tempRoot, "owner-claim-candidate.md");
    const ownerClaimCandidate = runNode("create-claim-from-evidence.mjs", [
      ownerEvidencePath,
      "--out",
      ownerClaimPath,
    ], tempRoot);
    if (ownerClaimCandidate.status !== 0) {
      failures.push(`owner claim candidate dry run failed: ${ownerClaimCandidate.stderr || ownerClaimCandidate.stdout}`);
    } else {
      summary.push("owner bounded claim candidate: passed");
    }

    if (!failures.length) {
      const report = `# Proof Run Dry Audit Report

Status: local fixture path checked.

## Checks

${summary.map((item) => `- ${item}`).join("\n")}

## Command Path

\`\`\`text
permissioned intake -> started case -> completed case -> reviewed evidence packet -> bounded claim candidate
\`\`\`

\`\`\`text
owner evidence bridge -> proof intake record -> started case -> completed case -> reviewed evidence packet -> bounded claim candidate
\`\`\`

## Boundary

This dry audit uses a temporary local fixture.
It does not create external proof, does not run release:check:public, does not prove external adoption, does not prove benchmarked productivity, does not prove customer outcomes, and does not prove legal originality.
`;

      fs.mkdirSync(path.dirname(reportPath), { recursive: true });
      fs.writeFileSync(reportPath, report);
    }
  } finally {
    if (tempRoot.startsWith(os.tmpdir())) {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  }
}

if (!packageJson.scripts?.["audit:proof-run-dry"]) {
  failures.push("package.json missing script: audit:proof-run-dry");
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:proof-run-dry")) {
  failures.push("release:check must include npm run audit:proof-run-dry");
}

if (!cli.includes('"audit:proof-run-dry"')) {
  failures.push("CLI missing audit:proof-run-dry command");
}

for (const text of [
  "permissioned intake -> started case -> completed case -> reviewed evidence packet -> bounded claim candidate",
  "owner evidence bridge -> proof intake record -> started case -> completed case -> reviewed evidence packet -> bounded claim candidate",
  "does not create external proof",
  "does not run release:check:public",
  "temporary local fixture",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/PROOF-RUN-DRY-AUDIT.md missing text: ${text}`);
  }
}

if (!failures.length) {
  runDryAudit();
}

if (!fs.existsSync(reportPath)) {
  failures.push("missing .mimesis/proof-runs/dry-run-report.md; run npm run audit:proof-run-dry");
} else {
  const report = fs.readFileSync(reportPath, "utf8");
  for (const text of [
    "# Proof Run Dry Audit Report",
    "permissioned intake: passed",
    "started case creation: passed",
    "started case rejection: passed",
    "completed case check: passed",
    "evidence packet review: passed",
    "bounded claim candidate: passed",
    "owner evidence bridge conversion: passed",
    "owner proof intake check: passed",
    "owner started case creation: passed",
    "owner started case rejection: passed",
    "owner completed case check: passed",
    "owner evidence packet review: passed",
    "owner bounded claim candidate: passed",
    "owner evidence bridge -> proof intake record -> started case -> completed case -> reviewed evidence packet -> bounded claim candidate",
    "does not create external proof",
  ]) {
    if (!report.toLowerCase().includes(text.toLowerCase())) {
      failures.push(`dry-run report missing text: ${text}`);
    }
  }
}

if (failures.length) {
  console.error("\nMimesis proof-run dry audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis proof-run dry audit passed: local fixture path reaches reviewed evidence packet and bounded claim candidate.");

#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const issueDir = path.join(root, ".github", "ISSUE_TEMPLATE");

const expectedForms = {
  "weak-artifact.yml": ["artifact-type", "current-artifact", "target-audience", "what-feels-weak", "desired-transformation", "public-case-permission"],
  "reference-pack.yml": ["domain", "use-case", "candidate-references", "source-quality", "what-makes-strong", "what-not-to-copy"],
  "case-submission.yml": ["starting-artifact", "references-studied", "extracted-structure", "transformation", "before-after", "proof-boundary", "permission-to-publish"],
  "permissioned-external-case.yml": [
    "starting-artifact",
    "artifact-owner",
    "permission-status",
    "publication-preference",
    "redaction-requirements",
    "references-studied",
    "desired-transformation",
    "proof-boundary",
    "safety-confirmation",
  ],
  "owner-proof-input.yml": [
    "license_or_no_reuse",
    "license_notes",
    "weak_artifact_permission",
    "artifact_owner",
    "publication_preference",
    "redaction_requirements",
    "proof_boundary",
    "safety_confirmation",
  ],
  "gate-evidence.yml": [
    "gate_id",
    "evidence_type",
    "evidence_links",
    "evidence_summary",
    "permission_boundary",
    "review_state",
    "allowed_claim",
    "disallowed_claim",
    "safety_confirmation",
  ],
  "boundary-risk.yml": ["file-or-case", "risk-type", "why-it-matters", "suggested-repair"],
};

const failures = [];

if (!fs.existsSync(issueDir)) {
  failures.push("missing .github/ISSUE_TEMPLATE directory");
} else {
  for (const [file, requiredIds] of Object.entries(expectedForms)) {
    const fullPath = path.join(issueDir, file);
    if (!fs.existsSync(fullPath)) {
      failures.push(`missing issue form: ${file}`);
      continue;
    }

    const content = fs.readFileSync(fullPath, "utf8");
    console.log(`[issue-form] ${file}`);

    for (const key of ["name:", "description:", "title:", "labels:", "body:"]) {
      if (!content.includes(key)) {
        failures.push(`${file}: missing ${key}`);
      }
    }

    for (const id of requiredIds) {
      if (!content.includes(`id: ${id}`)) {
        failures.push(`${file}: missing id ${id}`);
      }
    }

    if (!/validations:\s*\n\s*required:\s*true/m.test(content)) {
      failures.push(`${file}: no required validations found`);
    }

    if (/fake stars|fake comments|fake testimonials|fake users|fake endorsements/i.test(content)) {
      failures.push(`${file}: issue form should not invite fake engagement`);
    }
  }
}

if (failures.length) {
  console.error("\nMimesis issue form audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log(`\nMimesis issue form audit passed: ${Object.keys(expectedForms).length} forms checked.`);

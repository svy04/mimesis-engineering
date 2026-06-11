#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "gates", "closure-review.json");

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

const packageJson = readJson("package.json");
const readiness = readJson(".mimesis/gates/closure-readiness.json");
const gapRegister = readJson(".mimesis/gaps/current-gap-register.json");
const currentState = readJson(".mimesis/state/current-state.json");
const ownerSubmission = readJson(".mimesis/owner-actions/fixture-evidence-submission-record.json");
readText(".mimesis/owner-actions/fixture-evidence-submission-check.md");

const gapsById = new Map((gapRegister.gaps ?? []).map((gap) => [gap.id, gap]));
const requiredGateIds = ownerSubmission.requiredGateIds ?? [];

const reviews = (readiness.gates ?? []).map((gate) => {
  const gap = gapsById.get(gate.id) ?? {};
  const missingEvidence = unique(gate.missingEvidence ?? gap.requiredEvidence ?? []);
  const ownerEvidence = Array.isArray(gate.ownerEvidence) ? gate.ownerEvidence : [];
  const missingOwnerFields = ownerEvidence
    .filter((field) => field.submissionStatus !== "submitted")
    .map((field) => field.fieldName);
  const reviewReason = missingOwnerFields.length
    ? `Owner evidence fields are not submitted: ${missingOwnerFields.join(", ")}.`
    : `Direct closure evidence is still missing: ${missingEvidence.slice(0, 3).join("; ")}.`;

  return {
    id: gate.id,
    title: gate.title,
    status: gate.status,
    readiness: gate.readiness,
    decision: "keep_open",
    closureApproved: false,
    canCloseNow: false,
    reviewReason,
    requiredBeforeClosure: missingEvidence,
    ownerEvidenceFields: ownerEvidence.map((field) => ({
      fieldName: field.fieldName,
      submissionStatus: field.submissionStatus,
      ownerSubmittedEvidence: field.ownerSubmittedEvidence,
      boundary: field.boundary,
    })),
    sourceEvidence: [
      ".mimesis/gates/closure-readiness.json",
      ".mimesis/owner-actions/fixture-evidence-submission-check.md",
      ".mimesis/owner-actions/fixture-evidence-submission-record.json",
    ],
    forbiddenClaim: "This review does not approve gate closure.",
    nextAction: gate.nextAction,
    boundary: gate.boundary,
  };
});

const reviewCounts = {};
for (const review of reviews) {
  reviewCounts[review.decision] = (reviewCounts[review.decision] ?? 0) + 1;
}

const report = {
  schema: "mimesis.gate-closure-review.v0.1",
  status: "blocked_no_gate_closure",
  generatedAt: new Date().toISOString(),
  package: {
    name: packageJson.name,
    version: packageJson.version,
    private: packageJson.private === true,
    license: packageJson.license ?? "none",
  },
  git: currentState.git ?? {},
  completionAllowed: false,
  closureApproved: false,
  reviewCount: reviews.length,
  readinessStatus: readiness.status,
  readinessGateCount: readiness.gateCount,
  requiredGateIds,
  reviewCounts,
  reviews,
  sourceFiles: [
    ".mimesis/gates/closure-readiness.json",
    ".mimesis/owner-actions/fixture-evidence-submission-check.md",
    ".mimesis/owner-actions/fixture-evidence-submission-record.json",
    ".mimesis/gaps/current-gap-register.json",
    ".mimesis/state/current-state.json",
  ],
  boundaries: [
    "does_not_close_gates",
    "does_not_approve_gate_closure",
    "does_not_create_evidence",
    "does_not_attach_evidence",
    "does_not_submit_evidence",
    "does_not_prove_completion",
    "does_not_publish",
    "does_not_stage_commit_push_tag_release",
    "does_not_choose_license",
    "does_not_create_external_proof",
    "does_not_prove_adoption",
  ],
  allowedClaim:
    "Mimesis has a local gate closure review record that keeps every current gate open until direct closure evidence is reviewed.",
  disallowedClaim:
    "The gate closure review record does not approve gate closure, close gates, submit evidence, attach evidence, publish, choose a license, create external proof, prove adoption, prove benchmarked productivity, or ship a plugin.",
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(`[gate-closure-review] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

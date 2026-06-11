#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "gates", "closure-readiness.json");

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readinessFor(status) {
  const readinessByStatus = {
    blocked: "blocked",
    pending_owner: "pending_owner",
    waiting_for_artifact: "waiting_for_artifact",
    waiting_for_evidence: "waiting_for_evidence",
  };
  return readinessByStatus[status] ?? "not_ready";
}

function ownerSubmissionFieldsByGate(submissionRecord) {
  const byGate = new Map();
  for (const [fieldName, field] of Object.entries(submissionRecord.fields ?? {})) {
    for (const gateId of field.blockedGateIds ?? []) {
      const entries = byGate.get(gateId) ?? [];
      entries.push({
        fieldName,
        submissionStatus: field.submissionStatus,
        ownerSubmittedEvidence: field.ownerSubmittedEvidence,
        requiredAttachments: field.requiredAttachments ?? [],
        ownerAttachmentSlot: field.ownerAttachmentSlot,
        safetyCheck: field.safetyCheck,
        boundary: field.boundary,
      });
      byGate.set(gateId, entries);
    }
  }
  return byGate;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

const packageJson = readJson("package.json");
const gapRegister = readJson(".mimesis/gaps/current-gap-register.json");
const closurePlan = readJson(".mimesis/gaps/closure-plan.json");
const ownerEvidenceSubmission = readJson(".mimesis/owner-actions/fixture-evidence-submission-record.json");
const currentState = readJson(".mimesis/state/current-state.json");
const closureById = new Map((closurePlan.steps ?? []).map((step) => [step.id, step]));
const ownerFieldsByGate = ownerSubmissionFieldsByGate(ownerEvidenceSubmission);

const gates = (gapRegister.gaps ?? []).map((gap) => {
  const closure = closureById.get(gap.id) ?? {};
  const ownerFields = ownerFieldsByGate.get(gap.id) ?? [];
  const ownerMissingEvidence = ownerFields
    .filter((field) => field.submissionStatus !== "submitted")
    .flatMap((field) => [
      `${field.fieldName}: ${field.ownerSubmittedEvidence}`,
      ...field.requiredAttachments,
      field.ownerAttachmentSlot,
    ]);
  const missingEvidence = unique([
    ...(gap.requiredEvidence ?? []),
    ...(closure.requiredEvidence ?? []),
    ...ownerMissingEvidence,
    ownerFields.length === 0 ? "direct reviewed evidence packet" : null,
  ]);

  return {
    id: gap.id,
    title: gap.title,
    kind: gap.kind,
    status: gap.status,
    closureType: closure.closureType ?? "unknown",
    readiness: readinessFor(gap.status),
    canCloseNow: false,
    requiredEvidence: gap.requiredEvidence ?? [],
    missingEvidence,
    ownerEvidence: ownerFields,
    firstCommand: closure.commands?.[0] ?? "see gap closure plan",
    commands: closure.commands ?? [],
    stopConditions: closure.stopConditions ?? ["Stop if direct evidence is missing."],
    nextAction: gap.nextAction,
    boundary: gap.boundary,
  };
});

const readinessCounts = {};
for (const gate of gates) {
  readinessCounts[gate.readiness] = (readinessCounts[gate.readiness] ?? 0) + 1;
}

const report = {
  schema: "mimesis.gate-closure-readiness.v0.1",
  status: "open_gates_not_ready",
  generatedAt: new Date().toISOString(),
  package: {
    name: packageJson.name,
    version: packageJson.version,
    private: packageJson.private === true,
    license: packageJson.license ?? "none",
  },
  git: currentState.git ?? {},
  completionAllowed: false,
  gateCount: gates.length,
  readinessCounts,
  counts: currentState.counts ?? {},
  gates,
  nextReviewOrder: gates.map((gate) => ({
    id: gate.id,
    readiness: gate.readiness,
    firstCommand: gate.firstCommand,
    nextAction: gate.nextAction,
  })),
  sourceFiles: [
    ".mimesis/gaps/current-gap-register.json",
    ".mimesis/gaps/closure-plan.json",
    ".mimesis/owner-actions/evidence-bundle.md",
    ".mimesis/owner-actions/fixture-evidence-submission-record.json",
    ".mimesis/owner-actions/evidence-review.md",
    ".mimesis/state/current-state.json",
  ],
  boundaries: [
    "does_not_close_gates",
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
    "Mimesis has a local gate closure readiness report that shows which open gates are still not ready to close and what evidence remains missing.",
  disallowedClaim:
    "The gate closure readiness report does not close gates, submit evidence, attach evidence, prove completion, publish, choose a license, create external proof, prove adoption, prove benchmarked productivity, or ship a plugin.",
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(`[gate-closure-readiness] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

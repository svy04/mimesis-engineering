#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flags = new Map();
const defaultReadinessReport = ".mimesis/gates/closure-readiness.json";
const defaultOwnerEvidenceSubmissionCheck = ".mimesis/owner-actions/fixture-evidence-submission-check.md";
const defaultOwnerEvidenceSubmissionRecord = ".mimesis/owner-actions/fixture-evidence-submission-record.json";
const defaultOutputPath = ".mimesis/gates/closure-review.json";

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (!arg.startsWith("--")) {
    continue;
  }

  const key = arg.slice(2);
  const next = args[index + 1];
  if (next && !next.startsWith("--")) {
    flags.set(key, next);
    index += 1;
  } else {
    flags.set(key, true);
  }
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function resolveInput(inputPath) {
  const raw = String(inputPath);
  const cwdPath = path.resolve(process.cwd(), raw);
  if (fs.existsSync(cwdPath)) {
    return cwdPath;
  }

  const repoPath = path.resolve(root, raw);
  if (fs.existsSync(repoPath)) {
    return repoPath;
  }

  return cwdPath;
}

function resolveOutput(outputPath) {
  const raw = String(outputPath);
  return path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);
}

function displayPath(filePath) {
  const repoRelative = path.relative(root, filePath);
  if (!repoRelative.startsWith("..") && !path.isAbsolute(repoRelative)) {
    return repoRelative.replaceAll(path.sep, "/");
  }
  return path.resolve(filePath).replaceAll(path.sep, "/");
}

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function usage() {
  console.log(`Usage: mimesis gate:closure-review [--readiness path/to/readiness.json] [--owner-evidence-submission-check path/to/check.md] [--owner-evidence-submission path/to/record.json] [--output path/to/closure-review.json]

Generates a gate closure review record from readiness and owner evidence submission inputs.
Default mode uses the fixture readiness/check/record files.
Candidate mode can read a real readiness candidate and owner evidence check, then write a separate review output.
It does not approve closure, close gates, create evidence, publish, or prove adoption.
`);
}

if (flags.has("help") || flags.has("h")) {
  usage();
  process.exit(0);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

const packageJson = readJson("package.json");
const readinessPath = resolveInput(flags.get("readiness") ?? defaultReadinessReport);
const ownerEvidenceSubmissionCheckPath = resolveInput(
  flags.get("owner-evidence-submission-check") ?? defaultOwnerEvidenceSubmissionCheck,
);
const ownerEvidenceSubmissionPath = resolveInput(
  flags.get("owner-evidence-submission") ?? defaultOwnerEvidenceSubmissionRecord,
);
const outputPath = resolveOutput(flags.get("output") ?? defaultOutputPath);
const readiness = readJsonFile(readinessPath);
const gapRegister = readJson(".mimesis/gaps/current-gap-register.json");
const currentState = readJson(".mimesis/state/current-state.json");
const ownerSubmission = readJsonFile(ownerEvidenceSubmissionPath);
fs.readFileSync(ownerEvidenceSubmissionCheckPath, "utf8");
const readinessReport = displayPath(readinessPath);
const ownerEvidenceSubmissionCheck = displayPath(ownerEvidenceSubmissionCheckPath);
const ownerEvidenceSubmissionRecord = displayPath(ownerEvidenceSubmissionPath);
const outputRecord = displayPath(outputPath);
const candidateMode =
  readinessReport !== defaultReadinessReport ||
  ownerEvidenceSubmissionCheck !== defaultOwnerEvidenceSubmissionCheck ||
  ownerEvidenceSubmissionRecord !== defaultOwnerEvidenceSubmissionRecord ||
  outputRecord !== defaultOutputPath;

const gapsById = new Map((gapRegister.gaps ?? []).map((gap) => [gap.id, gap]));
const requiredGateIds = ownerSubmission.requiredGateIds ?? [];

const reviews = (readiness.gates ?? []).map((gate) => {
  const gap = gapsById.get(gate.id) ?? {};
  const missingEvidence = unique(gate.missingEvidence ?? gap.requiredEvidence ?? []);
  const ownerEvidence = Array.isArray(gate.ownerEvidence) ? gate.ownerEvidence : [];
  const missingOwnerFields = ownerEvidence
    .filter((field) => field.submissionStatus !== "submitted")
    .map((field) => field.fieldName);
  const ownerEvidenceReviewReady = gate.ownerEvidenceReviewReady === true;
  const reviewReason = missingOwnerFields.length
    ? `Owner evidence fields are not submitted: ${missingOwnerFields.join(", ")}.`
    : ownerEvidenceReviewReady
      ? `Owner evidence is ready for gate-specific review; direct closure evidence is still missing: ${missingEvidence.slice(0, 3).join("; ")}.`
      : `Direct closure evidence is still missing: ${missingEvidence.slice(0, 3).join("; ")}.`;

  return {
    id: gate.id,
    title: gate.title,
    status: gate.status,
    readiness: gate.readiness,
    decision: "keep_open",
    closureApproved: false,
    canCloseNow: false,
    ownerEvidenceReviewReady,
    reviewReason,
    requiredBeforeClosure: missingEvidence,
    ownerEvidenceFields: ownerEvidence.map((field) => ({
      fieldName: field.fieldName,
      submissionStatus: field.submissionStatus,
      ownerSubmittedEvidence: field.ownerSubmittedEvidence,
      boundary: field.boundary,
    })),
    sourceEvidence: [
      readinessReport,
      ownerEvidenceSubmissionCheck,
      ownerEvidenceSubmissionRecord,
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
  inputMode: {
    readinessReport,
    ownerEvidenceSubmissionCheck,
    ownerEvidenceSubmissionRecord,
    outputPath: outputRecord,
    candidateMode,
    boundary:
      "A supplied readiness/check/record set can make owner evidence review-ready, but this review still keeps every gate open until direct closure evidence is reviewed.",
  },
  completionAllowed: false,
  closureApproved: false,
  reviewCount: reviews.length,
  readinessStatus: readiness.status,
  readinessGateCount: readiness.gateCount,
  requiredGateIds,
  reviewCounts,
  reviews,
  sourceFiles: [
    readinessReport,
    ownerEvidenceSubmissionCheck,
    ownerEvidenceSubmissionRecord,
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

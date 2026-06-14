#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultOutputPath = path.join(root, ".mimesis", "proof-runs", "execution-report.md");
const args = process.argv.slice(2);
const flags = new Map();

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg.startsWith("--")) {
    const key = arg.slice(2);
    const next = args[index + 1];
    if (next && !next.startsWith("--")) {
      flags.set(key, next);
      index += 1;
    } else {
      flags.set(key, true);
    }
  }
}

const secretPattern = /\b(api[_-]?key|secret|password|token|oauth[_-]?token)\b\s*[:=]\s*["']?[A-Za-z0-9._\-]{8,}/i;
const requiredCommandFragments = [
  "case:review",
  "case:from-intake",
  "case:check",
  "evidence:from-case",
  "evidence:review",
  "evidence:check",
  "claim:from-evidence",
  "release:check:public",
];

function usage() {
  console.log(`Usage: mimesis proof:execution-report [--execution-record path/to/proof-execution-record.json --output path/to/proof-execution-candidate.md]

Default packet mode writes a blank command evidence ledger to:
  .mimesis/proof-runs/execution-report.md

Candidate execution review mode reads a supplied proof execution record and writes a separate review report.

Boundary:
  This tool does not execute commands, approve proof, publish, or close gates.
`);
}

function flagValue(name, fallback = "") {
  const value = flags.get(name);
  return value === undefined || value === true ? fallback : String(value);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`Proof execution record is not valid JSON: ${error.message}`);
    process.exit(1);
  }
}

function resolveInput(inputPath) {
  const cwdPath = path.resolve(process.cwd(), inputPath);
  if (fs.existsSync(cwdPath)) {
    return cwdPath;
  }
  const repoPath = path.resolve(root, inputPath);
  if (fs.existsSync(repoPath)) {
    return repoPath;
  }
  return cwdPath;
}

function resolveOutput(outputPath) {
  return path.resolve(process.cwd(), outputPath);
}

function displayPath(filePath) {
  const repoRelative = path.relative(root, filePath);
  if (!repoRelative.startsWith("..") && !path.isAbsolute(repoRelative)) {
    return repoRelative.replaceAll(path.sep, "/");
  }
  return path.relative(process.cwd(), filePath).replaceAll(path.sep, "/") || filePath;
}

function has(content, text) {
  return content.toLowerCase().includes(text.toLowerCase()) ? "yes" : "missing";
}

function writeText(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function commandRows(commands) {
  return commands
    .map((entry) => `| \`${entry.command}\` | ${entry.expectedEvidence} | ${entry.status} | paste exit code and report path after a real run |`)
    .join("\n");
}

function suppliedCommandRows(record) {
  return (record.commandEvidence ?? [])
    .map((entry) => `| \`${entry.command}\` | ${entry.state} | ${entry.exitCode} | ${entry.evidencePath ?? "missing"} | ${entry.notes ?? ""} |`)
    .join("\n");
}

function list(items) {
  return items?.length ? items.map((item) => `- ${item}`).join("\n") : "- none";
}

function validateExecutionRecord(record) {
  const failures = [];

  if (record.schemaVersion !== "0.1.0") {
    failures.push("schemaVersion must be 0.1.0");
  }

  if (!["not_started", "running", "stopped", "complete_local_run"].includes(record.status)) {
    failures.push("status must be not_started, running, stopped, or complete_local_run");
  }

  if (!Array.isArray(record.commandEvidence) || !record.commandEvidence.length) {
    failures.push("commandEvidence must contain at least one command record");
  }

  for (const [index, entry] of (record.commandEvidence ?? []).entries()) {
    if (!entry.command || typeof entry.command !== "string") {
      failures.push(`commandEvidence[${index}].command must be a non-empty string`);
    }
    if (!["passed", "failed", "not_run", "blocked"].includes(entry.state)) {
      failures.push(`commandEvidence[${index}].state must be passed, failed, not_run, or blocked`);
    }
    if (typeof entry.exitCode !== "number") {
      failures.push(`commandEvidence[${index}].exitCode must be a number`);
    }
  }

  const safety = record.safetyConfirmation ?? {};
  for (const key of [
    "noSecrets",
    "noPrivateCustomerData",
    "noCopiedProtectedMaterial",
    "noUnreviewedPublicationClaim",
  ]) {
    if (safety[key] !== true) {
      failures.push(`safetyConfirmation.${key} must be true`);
    }
  }

  if (!Array.isArray(record.boundary) || !record.boundary.length) {
    failures.push("boundary must contain at least one does-not boundary");
  }
  if (!Array.isArray(record.prohibitedClaims) || !record.prohibitedClaims.length) {
    failures.push("prohibitedClaims must contain at least one forbidden claim");
  }
  if (secretPattern.test(JSON.stringify(record))) {
    failures.push("proof execution record appears to include a secret, token, password, OAuth token, or API key");
  }

  if (failures.length) {
    console.error("\nProof execution record cannot be reviewed:");
    for (const failure of failures) {
      console.error(`[fail] ${failure}`);
    }
    process.exit(1);
  }
}

function candidateEvidenceReviewReady(record) {
  if (record.status !== "complete_local_run") {
    return false;
  }

  const passedCommands = new Set(
    record.commandEvidence
      .filter((entry) => entry.state === "passed" && entry.exitCode === 0)
      .map((entry) => entry.command),
  );

  return requiredCommandFragments.every((fragment) =>
    [...passedCommands].some((command) => command.includes(fragment)),
  );
}

function generateDefaultReport() {
  const packageJson = readJson("package.json");
  const acceptancePacket = read(".mimesis/proof-intake/acceptance-packet.md");
  const proofRunPacket = read(".mimesis/proof-runs/v0.2-first-run.md");
  const caseFromIntake = read("docs/CASE-FROM-INTAKE.md");
  const caseCheck = read("docs/CASE-CHECK.md");
  const evidenceFromCase = read("docs/EVIDENCE-FROM-CASE.md");
  const evidenceReview = read("docs/EVIDENCE-REVIEW.md");
  const claimFromEvidence = read("docs/CLAIM-FROM-EVIDENCE.md");
  const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");

  const commands = [
    {
      command: "npm run cli -- case:review path/to/permissioned-case.md --require-public --write-report",
      expectedEvidence: "permissioned intake review report",
      status: "not_started",
    },
    {
      command: "npm run cli -- case:from-intake path/to/permissioned-case.md --reference-pack reference-packs/github-readme.md --title \"Permissioned README Case\"",
      expectedEvidence: "started case workspace path",
      status: "not_started",
    },
    {
      command: "npm run cli -- case:check path/to/started-case",
      expectedEvidence: "expected failure until improved artifact, boundary check, case note, and run ledger exist",
      status: "not_started",
    },
    {
      command: "npm run cli -- case:check path/to/completed-case --write-report",
      expectedEvidence: ".mimesis/case-proof.md in completed case workspace",
      status: "not_started",
    },
    {
      command: "npm run cli -- evidence:from-case path/to/completed-case --out path/to/evidence-packet.md --force",
      expectedEvidence: "draft evidence packet",
      status: "not_started",
    },
    {
      command: "npm run cli -- evidence:review path/to/evidence-packet.md --decision reviewed --reviewer \"Reviewer Name\" --note \"Reviewed against the proof boundary.\" --out path/to/reviewed-evidence.md",
      expectedEvidence: "reviewed evidence packet",
      status: "not_started",
    },
    {
      command: "npm run cli -- evidence:check path/to/reviewed-evidence.md --require-reviewed --write-report",
      expectedEvidence: "reviewed evidence check report",
      status: "not_started",
    },
    {
      command: "npm run cli -- claim:from-evidence path/to/reviewed-evidence.md --out path/to/claim-candidate.md",
      expectedEvidence: "bounded claim candidate",
      status: "not_started",
    },
    {
      command: "npm run release:check:public",
      expectedEvidence: "public preflight output, not publication",
      status: "not_started",
    },
  ];

  return `# Mimesis Proof Execution Report

Status: execution report packet, not executed proof.

Generated for Mimesis Engineering v${packageJson.version} from the proof acceptance packet, proof run packet, case bridge, case check, evidence flow, claim candidate, and release preflight docs.

## Input Mode

- mode: default packet mode
- execution record: none
- candidate execution review mode: \`npm run cli -- proof:execution-report --execution-record path/to/proof-execution-record.json --output path/to/proof-execution-candidate.md\`
- candidateEvidenceReviewReady: false
- proofApproved: false
- publicClaimApproved: false
- completionAllowed: false

## Report Inputs

Use this report only after the proof acceptance gate says accept.

Required local inputs:

- .mimesis/proof-intake/acceptance-packet.md
- .mimesis/proof-runs/v0.2-first-run.md
- docs/CASE-FROM-INTAKE.md
- docs/CASE-CHECK.md
- docs/EVIDENCE-FROM-CASE.md
- docs/EVIDENCE-REVIEW.md
- docs/CLAIM-FROM-EVIDENCE.md
- docs/V0.1-RELEASE-PACKET.md
- one real permissioned or clearly redacted weak artifact intake file
- optional proof execution record for candidate execution review mode

Source checks:

- acceptance packet has accept / revise / reject states: ${has(acceptancePacket, "accept / revise / reject")}
- proof run packet has operator command path: ${has(proofRunPacket, "Operator Command Path")}
- case-from-intake keeps started-case boundary: ${has(caseFromIntake, "Case Status: started")}
- case-check requires completed case note: ${has(caseCheck, "completed case note")}
- evidence-from-case keeps draft evidence boundary: ${has(evidenceFromCase, "does not mark the evidence as reviewed")}
- evidence-review keeps no-new-evidence boundary: ${has(evidenceReview, "does not create evidence")}
- claim-from-evidence requires reviewed evidence: ${has(claimFromEvidence, "reviewed evidence packet")}
- release packet keeps release preflight path: ${has(releasePacket, "npm run release:check")}

## Execution States

Use exactly one report state:

- not_started: the report is generated as a blank evidence ledger before a real artifact run.
- running: a real accepted intake is being processed and some command evidence is still missing.
- stopped: the run stopped at a failed command, unclear permission, unsafe redaction, failed review, failed case check, failed evidence check, or unsupported claim.
- complete_local_run: the real run has local before/after case evidence, reviewed evidence, bounded claim candidate, and public preflight output.

complete_local_run is not the same as external adoption, benchmark proof, legal originality proof, package publication, or shipped plugin proof.

## Command Evidence Ledger

| Command | Required Evidence | State | Operator Notes |
| --- | --- | --- | --- |
${commandRows(commands)}

When a command fails, keep the exit code, report path, and exact stop reason. Do not skip forward.

## Required Attachments

Attach or link these local files after a real run:

- accepted permissioned intake file
- redaction notes
- started case workspace path
- completed improved artifact
- completed boundary check
- completed case note
- completed run ledger entry
- .mimesis/case-proof.md from the completed case
- reviewed evidence packet
- evidence check report
- bounded claim candidate
- release:check:public output

## Stop Conditions

Stop the run if:

- the acceptance state is not accept
- the artifact owner, permission status, publication preference, or redaction requirements are unclear
- case:review --require-public fails
- case:from-intake cannot create a started case workspace
- case:check fails after the operator claims the case is complete
- evidence remains draft while a public claim needs reviewed evidence
- evidence:check --require-reviewed fails
- claim:from-evidence would produce a claim stronger than the reviewed evidence
- release:check:public fails
- any claim implies external adoption, benchmarked productivity, customer outcomes, endorsement, legal originality, package publication, Marketplace release, or shipped plugin status without direct evidence

## Allowed Claim

Mimesis has a local proof execution report packet for recording command evidence during the first real permissioned proof run.

## Disallowed Claim

This report does not execute commands.
It does not mean a proof run has started.
It does not mean a proof run has completed.
It does not create external proof.
It does not grant permission.
It does not redact files.
It does not run a transformation.
It does not publish.
It does not prove adoption, benchmarked productivity, customer outcomes, commercial outcomes, legal originality, endorsement, package release, Marketplace release, or shipped plugin status.

## Boundary

This proof execution report does not execute commands.
It does not create external proof.
It does not grant permission.
It does not publish.
It does not stage, commit, push, tag, or release.
It does not choose a license.
It does not run a transformation.
It does not create evidence by itself.
It does not replace \`case:review\`, \`case:from-intake\`, \`case:check\`, \`evidence:review\`, \`evidence:check\`, \`claim:from-evidence\`, release preflight, redaction review, or human owner review.
`;
}

function generateCandidateReport(record, recordPath, outputPath) {
  const ready = candidateEvidenceReviewReady(record);
  const failedOrBlocked = record.commandEvidence.filter((entry) => entry.state !== "passed" || entry.exitCode !== 0);

  return `# Mimesis Proof Execution Report

Status: candidate execution review, not proof approval.

## Input Mode

- mode: candidate execution review mode
- proof execution record: \`${displayPath(recordPath)}\`
- output: \`${displayPath(outputPath)}\`
- candidateEvidenceReviewReady: ${ready}
- proofApproved: false
- publicClaimApproved: false
- completionAllowed: false
- boundary: a supplied proof execution record can make a local proof run review-ready, but this report does not approve proof, create external proof, publish, close gates, prove adoption, or prove benchmarked productivity.

## Record State

- schemaVersion: ${record.schemaVersion}
- status: ${record.status}
- artifact intake path: ${record.artifactIntakePath ?? "not provided"}
- case workspace path: ${record.caseWorkspacePath ?? "not provided"}
- evidence packet path: ${record.evidencePacketPath ?? "not provided"}
- claim candidate path: ${record.claimCandidatePath ?? "not provided"}
- public preflight path: ${record.publicPreflightPath ?? "not provided"}

## Command Evidence Ledger

| Command | State | Exit Code | Evidence Path | Notes |
| --- | --- | --- | --- | --- |
${suppliedCommandRows(record)}

## Failed Or Blocked Commands

${failedOrBlocked.length ? failedOrBlocked.map((entry) => `- \`${entry.command}\` state=${entry.state} exitCode=${entry.exitCode}`).join("\n") : "- none"}

## Required Command Coverage

${requiredCommandFragments.map((fragment) => {
  const covered = record.commandEvidence.some((entry) =>
    entry.command.includes(fragment) && entry.state === "passed" && entry.exitCode === 0,
  );
  return `- ${fragment}: ${covered ? "passed evidence present" : "missing passed evidence"}`;
}).join("\n")}

## Safety Confirmation

- noSecrets: ${record.safetyConfirmation.noSecrets}
- noPrivateCustomerData: ${record.safetyConfirmation.noPrivateCustomerData}
- noCopiedProtectedMaterial: ${record.safetyConfirmation.noCopiedProtectedMaterial}
- noUnreviewedPublicationClaim: ${record.safetyConfirmation.noUnreviewedPublicationClaim}

## Boundary From Record

${list(record.boundary)}

## Prohibited Claims

${list(record.prohibitedClaims)}

## Allowed Claim

Mimesis has a candidate execution review report for a supplied proof execution record.

If candidateEvidenceReviewReady is true, the supplied command record is ready for direct evidence review.
That still does not approve proof, close gates, publish, prove adoption, prove benchmarked productivity, or prove customer outcomes.

## Disallowed Claim

This candidate execution review does not execute commands.
It does not approve proof.
It does not create external proof.
It does not publish.
It does not close gates.
It does not prove adoption, benchmarked productivity, customer outcomes, commercial outcomes, legal originality, endorsement, package release, Marketplace release, or shipped plugin status.

## Boundary

Candidate execution review is a review surface over a supplied proof execution record.
It is not proof approval, publication approval, gate closure, owner license choice, external adoption evidence, or benchmark evidence.
`;
}

if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

const executionRecordArg = flagValue("execution-record");

if (executionRecordArg) {
  const outputArg = flagValue("output");
  if (!outputArg) {
    console.error("Missing --output for candidate execution review mode.");
    usage();
    process.exit(1);
  }

  const recordPath = resolveInput(executionRecordArg);
  if (!fs.existsSync(recordPath) || !fs.statSync(recordPath).isFile()) {
    console.error(`Proof execution record file does not exist: ${recordPath}`);
    process.exit(1);
  }

  const outputPath = resolveOutput(outputArg);
  const record = readJsonFile(recordPath);
  validateExecutionRecord(record);
  writeText(outputPath, generateCandidateReport(record, recordPath, outputPath));
  console.log(`[proof-execution-report] ${displayPath(outputPath)}`);
  process.exit(0);
}

writeText(defaultOutputPath, generateDefaultReport());
console.log(`[proof-execution-report] ${path.relative(root, defaultOutputPath).replaceAll(path.sep, "/")}`);

#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const positional = [];
const flags = new Map();

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg.startsWith("--")) {
    const key = arg.slice(2);
    const next = args[index + 1];
    const value = next && !next.startsWith("--") ? next : true;
    if (flags.has(key)) {
      const current = flags.get(key);
      flags.set(key, Array.isArray(current) ? [...current, value] : [current, value]);
    } else {
      flags.set(key, value);
    }
    if (value !== true) {
      index += 1;
    }
  } else {
    positional.push(arg);
  }
}

const defaultOwnerAnswerRecord = ".mimesis/owner-actions/fixture-answer-record.json";
const defaultReport = ".mimesis/release-decisions/from-owner-answer-bridge.md";
const secretPattern = /\b(api[_-]?key|secret|password|token|oauth[_-]?token)\b\s*[:=]\s*["']?[A-Za-z0-9._\-]{8,}/i;
const placeholderPattern = /\bTBD\b|<fill|TODO|pending owner answer|not provided|none yet/i;
const allowedDecisions = new Set(["no_reuse_boundary", "reuse_license_selected"]);

function usage() {
  console.log(`Usage: mimesis license:decision-from-owner-answer path/to/owner-answer-record.json --output path/to/release-decision-record.json [options]

Records a reviewed owner license/no-reuse answer as a bounded release decision record candidate.
It only reads the license_or_no_reuse field.

Required options for record output:
  --decision no_reuse_boundary|reuse_license_selected
  --owner-confirmation "Owner confirmation text"
  --decision-evidence path/or/note
  --confirm-owner-reviewed
  --confirm-not-legal-advice
  --confirm-no-publication

Required when --decision reuse_license_selected:
  --license-name "Owner-selected license identifier"

Default no-arg mode writes a blocked bridge report to ${defaultReport}.

Boundary:
  This records owner-provided license intent only.
  It does not choose a license, provide legal advice, publish, create external proof, or close gates.
`);
}

function flagValue(name, fallback = "") {
  const value = flags.get(name);
  if (Array.isArray(value)) {
    return String(value[value.length - 1]);
  }
  return value === true || value === undefined ? fallback : String(value);
}

function flagValues(name) {
  const value = flags.get(name);
  if (value === undefined || value === true) {
    return [];
  }
  return (Array.isArray(value) ? value : [value]).map(String);
}

function resolvePath(inputPath) {
  const cwdPath = path.resolve(process.cwd(), inputPath);
  if (fs.existsSync(cwdPath)) {
    return cwdPath;
  }
  const repoPath = path.resolve(repoRoot, inputPath);
  if (fs.existsSync(repoPath)) {
    return repoPath;
  }
  return cwdPath;
}

function displayPath(filePath) {
  const repoRelative = path.relative(repoRoot, filePath);
  if (!repoRelative.startsWith("..") && !path.isAbsolute(repoRelative)) {
    return repoRelative.replaceAll(path.sep, "/");
  }
  return path.relative(process.cwd(), filePath).replaceAll(path.sep, "/") || filePath;
}

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`Owner decision answer record is not valid JSON: ${error.message}`);
    process.exit(1);
  }
}

function writeText(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function writeJson(filePath, value, force) {
  if (fs.existsSync(filePath) && !force) {
    console.error(`Output already exists: ${filePath}`);
    console.error("Re-run with --force to overwrite generated files.");
    process.exit(1);
  }
  writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function bridgeReport(record, source) {
  const field = record.fields?.license_or_no_reuse ?? {};
  const reviewed = record.status === "reviewed";
  const answered = field.answerStatus === "answered";
  const status = reviewed && answered
    ? "reviewed license_or_no_reuse owner answer can be checked for release decision conversion."
    : "blocked: license_or_no_reuse is not answered and reviewed.";

  return `# License Decision From Owner Answer

Status: ${status}

This report describes the bridge from an owner decision answer record into a bounded release decision record candidate.
It is not a license choice by itself.

## Source

- owner decision answer record: \`${source}\`
- record status: ${record.status ?? "missing"}
- license_or_no_reuse status: ${field.answerStatus ?? "missing"}

## Bridge Rule

The bridge can create a release decision record candidate only when:

- the owner decision answer record has \`status: reviewed\`
- \`fields.license_or_no_reuse.answerStatus\` is \`answered\`
- the answer text is explicit owner-provided license or no-reuse intent
- the operator supplies the owner confirmation and decision evidence
- the operator confirms owner review, no legal advice, and no publication

## Command Shape

\`\`\`bash
npm run cli -- license:decision-from-owner-answer path/to/owner-answer-record.json --output path/to/release-decision-record.json --decision no_reuse_boundary --owner-confirmation "Owner explicitly chose the no-reuse boundary for v0.1." --decision-evidence path/to/reviewed-owner-answer.json --confirm-owner-reviewed --confirm-not-legal-advice --confirm-no-publication
\`\`\`

## Boundary

License decision from owner answer records owner-provided intent only.
It does not choose a license by code.
It does not provide legal advice.
It does not publish.
It does not create external proof.
It does not close gates.
It does not prove adoption, benchmarked productivity, customer outcomes, legal originality, or commercial outcomes.
`;
}

function failValidation(failures) {
  console.error("\nOwner answer cannot become a release decision record:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

function validateForConversion(record) {
  const failures = [];
  const field = record.fields?.license_or_no_reuse;
  const decision = flagValue("decision");
  const licenseName = flagValue("license-name");

  if (record.schemaVersion !== "0.1.0") {
    failures.push("schemaVersion must be 0.1.0");
  }
  if (record.status !== "reviewed") {
    failures.push("record status must be reviewed");
  }
  if (!field) {
    failures.push("record missing fields.license_or_no_reuse");
  }
  if (field?.answerStatus !== "answered") {
    failures.push("fields.license_or_no_reuse.answerStatus must be answered");
  }
  if (!field?.ownerAnswer || placeholderPattern.test(field.ownerAnswer)) {
    failures.push("fields.license_or_no_reuse.ownerAnswer must contain an explicit owner answer");
  }
  if (!field?.boundary || !/does not/i.test(field.boundary)) {
    failures.push("fields.license_or_no_reuse.boundary must preserve a does-not boundary");
  }
  if (record.safetyConfirmation?.noRealOwnerDecision !== false) {
    failures.push("safetyConfirmation.noRealOwnerDecision must be false for a reviewed owner decision answer");
  }
  if (!allowedDecisions.has(decision)) {
    failures.push("--decision must be no_reuse_boundary or reuse_license_selected");
  }
  if (decision === "reuse_license_selected" && !licenseName.trim()) {
    failures.push("--license-name is required when --decision reuse_license_selected");
  }

  for (const flag of ["owner-confirmation", "decision-evidence"]) {
    if (!flagValue(flag).trim()) {
      failures.push(`missing --${flag}`);
    }
  }

  for (const flag of [
    "confirm-owner-reviewed",
    "confirm-not-legal-advice",
    "confirm-no-publication",
  ]) {
    if (!flags.has(flag)) {
      failures.push(`missing --${flag}`);
    }
  }

  if (secretPattern.test(JSON.stringify(record)) || secretPattern.test(JSON.stringify(Object.fromEntries(flags)))) {
    failures.push("owner decision answer or flags appear to include a secret, token, password, OAuth token, or API key");
  }

  return failures;
}

function buildReleaseDecisionRecord(record, inputPath) {
  const packageJson = JSON.parse(read("package.json"));
  const gateBoard = fs.existsSync(path.join(repoRoot, ".mimesis", "gates", "current-gateboard.md"))
    ? read(".mimesis/gates/current-gateboard.md")
    : "";
  const field = record.fields.license_or_no_reuse;
  const decision = flagValue("decision");
  const selectedLicense = decision === "reuse_license_selected"
    ? flagValue("license-name")
    : "UNLICENSED / no-reuse boundary";
  const decisionEvidence = flagValues("decision-evidence");

  return {
    schema: "mimesis.release-decision-record.v0.1",
    generatedAt: new Date().toISOString(),
    status: "owner_license_decision_recorded_not_publication",
    package: {
      name: packageJson.name,
      version: packageJson.version,
      private: packageJson.private === true,
      license: packageJson.license ?? "none",
    },
    syncProof: {
      currentSignal: "runtime_sync_audit_required",
      requiredCommand: "npm run audit:sync:strict",
      committedRecordIsNotSyncProof: true,
    },
    license: {
      decision,
      selectedLicense,
      currentSignal: field.currentSignal ?? "owner_answered_license_or_no_reuse",
      ownerAnswer: field.ownerAnswer,
      ownerConfirmation: flagValue("owner-confirmation"),
      decisionEvidence,
      requiredEvidence: [
        displayPath(inputPath),
        "docs/LICENSE-DECISION.md",
        ".mimesis/license-packets/owner-decision.md",
      ],
      boundary: "Records owner-provided license/no-reuse intent; does not provide legal advice, publish, or close gates.",
    },
    publicRelease: {
      decision: "pending",
      currentSignal: "runtime_sync_audit_required",
      ownerQuestion: "Decide whether this local work belongs in a public release, PR, or unpublished local packet.",
      requiredEvidence: ["npm run release:check:public", "npm run audit:sync:strict"],
    },
    npmPublication: {
      decision: "blocked",
      currentSignal: packageJson.private === true ? "package_private_true" : "package_private_false",
      ownerQuestion: "Decide whether npm publication is in scope after license and sync gates close.",
      requiredEvidence: ["docs/PACKAGE-RELEASE-CANDIDATE.md", "npm run audit:package"],
    },
    actionPublication: {
      decision: "blocked",
      currentSignal: "root_action_candidate_only",
      ownerQuestion: "Decide whether a tagged GitHub Action release or Marketplace listing is in scope.",
      requiredEvidence: ["docs/ACTION-RELEASE-CANDIDATE.md", "npm run audit:action"],
    },
    pluginPublication: {
      decision: "blocked",
      currentSignal: "plugin_scaffold_and_install_readiness_only",
      ownerQuestion: "Decide whether any plugin should be shipped after real installation or release proof exists.",
      requiredEvidence: ["docs/PLUGIN-INSTALL-PACKET.md", "docs/PLUGIN-RELEASE-PACKET.md"],
    },
    externalProof: {
      decision: "waiting_for_artifact",
      currentSignal: gateBoard.includes("first permissioned external proof") ? "gate_board_blocks_external_proof" : "proof_gate_not_refreshed",
      ownerQuestion: "Bring one permissioned or clearly redacted weak artifact before v0.2 proof claims.",
      requiredEvidence: ["docs/V0.2-PROOF-QUEUE.md", ".mimesis/proof-runs/readiness.md"],
    },
    benchmarkOrAdoption: {
      decision: "waiting_for_evidence",
      currentSignal: "protocol_only",
      ownerQuestion: "Collect reviewed benchmark or adoption evidence before productivity/adoption claims.",
      requiredEvidence: ["docs/BENCHMARK-PACKET.md", "templates/evidence-packet.md"],
    },
    requiredFreshCommands: [
      "npm run release:check:public",
      "npm run audit:sync:strict",
      "npm run audit:license",
      "npm run audit:package",
      "npm run audit:action",
    ],
    sourceFiles: [
      displayPath(inputPath),
      "docs/LICENSE-DECISION-FROM-OWNER-ANSWER.md",
      "docs/LICENSE-DECISION.md",
      "docs/RELEASE-EXECUTION-PACKET.md",
      "docs/PUBLISH-HANDOFF-PACKET.md",
      ".mimesis/gates/current-gateboard.md",
    ],
    boundaries: [
      "records_owner_provided_license_or_no_reuse_intent",
      "does_not_choose_license_by_code",
      "does_not_provide_legal_advice",
      "does_not_publish",
      "does_not_stage_commit_push_tag_release",
      "does_not_create_external_proof",
      "does_not_prove_adoption",
      "does_not_prove_sync",
      "does_not_close_gates",
    ],
  };
}

if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

const recordArg = positional[0] || flagValue("record");

if (!recordArg) {
  const reportPath = path.resolve(repoRoot, flagValue("default-report", defaultReport));
  const sourcePath = resolvePath(defaultOwnerAnswerRecord);
  const record = fs.existsSync(sourcePath) ? readJson(sourcePath) : {};
  writeText(reportPath, bridgeReport(record, displayPath(sourcePath)));
  console.log(`[license-decision-from-owner-answer] ${displayPath(reportPath)}`);
  process.exit(0);
}

const recordPath = resolvePath(recordArg);
if (!fs.existsSync(recordPath) || !fs.statSync(recordPath).isFile()) {
  console.error(`Owner decision answer record file does not exist: ${recordPath}`);
  process.exit(1);
}

const outputArg = flagValue("output");
if (!outputArg) {
  console.error("Missing --output path for release decision record.");
  usage();
  process.exit(1);
}

const record = readJson(recordPath);
const failures = validateForConversion(record);
if (failures.length) {
  failValidation(failures);
}

const decisionRecord = buildReleaseDecisionRecord(record, recordPath);
if (secretPattern.test(JSON.stringify(decisionRecord))) {
  failValidation(["release decision output appears to include a secret, token, password, OAuth token, or API key"]);
}

const outputPath = path.resolve(process.cwd(), outputArg);
writeJson(outputPath, decisionRecord, flags.has("force"));
console.log(`[license-decision-from-owner-answer] ${displayPath(outputPath)}`);

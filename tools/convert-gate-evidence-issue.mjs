#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flags = new Map();
const positional = [];

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
  } else {
    positional.push(arg);
  }
}

const defaultInput = ".mimesis/gates/fixture-gate-evidence-issue.md";
const defaultOutput = ".mimesis/gates/fixture-gate-evidence-packet.md";
const defaultReport = ".mimesis/gates/fixture-gate-evidence-issue-conversion-report.md";
const requiredIssueFields = [
  "gate_id",
  "evidence_type",
  "evidence_links",
  "evidence_summary",
  "permission_boundary",
  "review_state",
  "allowed_claim",
  "disallowed_claim",
  "safety_confirmation",
];
const placeholderPattern = /\bTBD\b|<fill|TODO|pending input|not provided|none yet|_No response_/i;
const secretPattern = /\b(api[_-]?key|secret|password|token|oauth[_-]?token)\b\s*[:=]\s*["']?[A-Za-z0-9._\-]{8,}/i;

function usage() {
  console.log(`Usage: mimesis gate:evidence-issue-convert [path/to/gate-evidence-issue.md] [--output path/to/evidence-packet.md] [--report path/to/report.md] [--source label] [--require-complete]

Converts a GitHub Gate Evidence issue body into a draft evidence packet candidate.
Default output is a fixture draft packet, not proof, evidence review, publication, adoption evidence, benchmark evidence, or gate closure.
`);
}

function normalizeHeading(value) {
  return value
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeValue(value) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

function parseIssueBody(markdown) {
  const sections = new Map();
  const headingPattern = /^###\s+(.+?)\s*$/gm;
  const matches = [...markdown.matchAll(headingPattern)];

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const title = normalizeHeading(match[1]);
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? markdown.length;
    sections.set(title, normalizeValue(markdown.slice(start, end)));
  }

  return sections;
}

function getSection(sections, aliases) {
  for (const alias of aliases) {
    const value = sections.get(normalizeHeading(alias));
    if (value && !placeholderPattern.test(value)) {
      return value;
    }
  }
  return "";
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

function writeText(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function list(items) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- none";
}

function normalizeGateId(value) {
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^- \[[ x]\]\s*/i, "").trim())
    .find(Boolean)
    ?.replace(/`/g, "")
    .trim() ?? "";
}

function evidenceClassFor(gateId, evidenceType) {
  const normalizedGate = normalizeGateId(gateId).toLowerCase();
  if (normalizedGate.includes("strict_publish_sync")) {
    return "sync verification, not publication evidence or gate closure";
  }
  if (normalizedGate.includes("owner_license_decision")) {
    return "owner decision, not legal advice or publication evidence";
  }
  if (normalizedGate.includes("permissioned_external_artifact") || normalizedGate.includes("completed_external_case")) {
    return "permissioned external case, not a claim by itself";
  }
  if (normalizedGate.includes("package_publication")) {
    return "package release, not a claim by itself";
  }
  if (normalizedGate.includes("action_publication")) {
    return "action release, not a claim by itself";
  }
  if (normalizedGate.includes("shipped_plugin")) {
    return "shipped plugin, not a claim by itself";
  }
  if (normalizedGate.includes("benchmark_study")) {
    return "benchmark study, not a claim by itself";
  }
  if (normalizedGate.includes("external_adoption")) {
    return "external adoption, not a claim by itself";
  }
  return `${evidenceType || "gate evidence"}, not proof by itself`;
}

function buildEvidencePacket({ fields, inputPath, source }) {
  const gateId = normalizeGateId(fields.gate_id);
  const evidenceClass = evidenceClassFor(gateId, fields.evidence_type);
  const claim = `Candidate gate movement claim for \`${gateId || "unknown_gate"}\`: ${fields.allowed_claim || "draft allowed claim not supplied"}`;
  const sourceLines = [
    `- source issue body: \`${displayPath(inputPath)}\``,
    source ? `- source label: ${source}` : "",
    fields.evidence_links,
  ].filter(Boolean).join("\n");

  return `# Evidence Packet

Status: draft.

Generated from a Gate Evidence issue body.
This is a draft evidence packet candidate only.
It does not close gates, does not create proof, does not prove adoption, does not prove benchmarked productivity, and does not publish.

## Claim Under Review

${claim}

## Evidence Type

${evidenceClass}

Raw issue evidence type:

${fields.evidence_type || "not supplied"}

## Source / Artifact Links

${sourceLines}

## Permission / Publication Boundary

${fields.permission_boundary || "Permission and publication boundary not supplied; do not publish or rely on this packet."}

## Measurement / Observation Method

Observed from a GitHub Gate Evidence issue body.
Review state from issue: ${fields.review_state || "not supplied"}.
The linked evidence must still be checked with \`evidence:check\`, reviewed with \`evidence:review\`, and routed through gate closure readiness/review.

## Before / After Or Event Evidence

Issue evidence summary and linked artifact/event/log:

${fields.evidence_summary || "No evidence summary supplied."}

Linked evidence:

${fields.evidence_links || "No evidence links supplied."}

## Allowed Claim

${fields.allowed_claim || "No allowed claim supplied."}

## Disallowed Claim

${fields.disallowed_claim || "No disallowed claim supplied."}

## What Remains Unproven

This draft remains unreviewed.
It does not close gates.
It does not create proof.
It does not prove adoption.
It does not prove benchmarked productivity.
It still needs named evidence review and gate closure readiness/review before any gate movement claim.

## Review Decision

draft.

Safety confirmation from issue:

${fields.safety_confirmation || "No safety confirmation supplied."}
`;
}

function buildReport({ inputPath, outputPath, reportPath, fields, failures, warnings, isFixture }) {
  const ready =
    failures.length === 0 &&
    /^reviewed evidence packet attached/i.test(fields.review_state.trim());
  const statusLine = isFixture
    ? "fixture gate evidence issue converted to draft evidence packet, not proof."
    : "gate evidence issue converted to draft evidence packet, not proof.";

  return `# Gate Evidence Issue Conversion Report

Status: ${statusLine}

This report converts one GitHub Gate Evidence issue body into a local draft evidence packet candidate.
It is not reviewed evidence, proof, publication, adoption evidence, benchmark evidence, or gate closure.

## Source

- issue body: \`${displayPath(inputPath)}\`
- output evidence packet: \`${displayPath(outputPath)}\`
- report: \`${displayPath(reportPath)}\`
- gate id: ${normalizeGateId(fields.gate_id) || "missing"}
- issue review state: ${fields.review_state || "missing"}
- ready for evidence review: ${ready ? "yes" : "no"}

## Parsed Fields

- gate_id: ${fields.gate_id ? "present" : "missing"}
- evidence_type: ${fields.evidence_type ? "present" : "missing"}
- evidence_links: ${fields.evidence_links ? "present" : "missing"}
- evidence_summary: ${fields.evidence_summary ? "present" : "missing"}
- permission_boundary: ${fields.permission_boundary ? "present" : "missing"}
- allowed_claim: ${fields.allowed_claim ? "present" : "missing"}
- disallowed_claim: ${fields.disallowed_claim ? "present" : "missing"}
- safety_confirmation: ${fields.safety_confirmation ? "present" : "missing"}

## Warnings

${list(warnings)}

## Failures

${list(failures)}

## Allowed Claim

Mimesis can convert a Gate Evidence issue body into a draft evidence packet candidate.

## Disallowed Claim

The gate evidence issue convert step does not create proof.
It does not review evidence.
It does not publish.
It does not prove adoption.
It does not prove benchmarked productivity.
It does not close gates.

## Boundary

The draft packet must still pass \`evidence:check\`, \`evidence:review\`, gate closure readiness, and gate closure review before stronger gate movement claims.

## Machine Boundaries

- does_not_create_proof
- does_not_review_evidence
- does_not_publish
- does_not_prove_adoption
- does_not_prove_benchmark
- does_not_close_gates
`;
}

if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

const inputPath = resolveInput(positional[0] || defaultInput);
const outputPath = resolveOutput(flags.get("output") === true || !flags.has("output") ? defaultOutput : String(flags.get("output")));
const reportPath = resolveOutput(flags.get("report") === true || !flags.has("report") ? defaultReport : String(flags.get("report")));
const source = flags.get("source") === true || !flags.has("source") ? displayPath(inputPath) : String(flags.get("source"));
const requireComplete = flags.has("require-complete");

if (!fs.existsSync(inputPath) || !fs.statSync(inputPath).isFile()) {
  console.error(`Gate evidence issue body file does not exist: ${inputPath}`);
  process.exit(1);
}

const markdown = fs.readFileSync(inputPath, "utf8");
const sections = parseIssueBody(markdown);
const fields = {
  gate_id: getSection(sections, ["Gate ID", "gate_id"]),
  evidence_type: getSection(sections, ["Evidence type", "evidence_type"]),
  evidence_links: getSection(sections, ["Evidence links", "evidence_links"]),
  evidence_summary: getSection(sections, ["Evidence summary", "evidence_summary"]),
  permission_boundary: getSection(sections, ["Permission and publication boundary", "permission_boundary", "Permission boundary"]),
  review_state: getSection(sections, ["Review state", "review_state"]),
  allowed_claim: getSection(sections, ["Allowed claim", "allowed_claim"]),
  disallowed_claim: getSection(sections, ["Disallowed claim", "disallowed_claim"]),
  safety_confirmation: getSection(sections, ["Safety confirmation", "safety_confirmation"]),
};

const failures = [];
const warnings = [];

for (const fieldName of requiredIssueFields) {
  if (!fields[fieldName]) {
    failures.push(`issue body missing ${fieldName}`);
  }
}
if (!/^reviewed evidence packet attached/i.test(fields.review_state.trim())) {
  warnings.push("issue is not marked as reviewed; generated evidence packet must remain draft");
}
if (secretPattern.test(markdown)) {
  failures.push("issue body appears to include a secret, token, password, OAuth token, or API key");
}
if (/fake stars|fake comments|fake testimonials|fake users|fake endorsements|fake engagement/i.test(markdown)) {
  failures.push("issue body appears to include manufactured engagement language");
}

const packet = buildEvidencePacket({ fields, inputPath, source });
const isFixture = displayPath(inputPath).includes("fixture-gate-evidence-issue.md");
const report = buildReport({
  inputPath,
  outputPath,
  reportPath,
  fields,
  failures,
  warnings,
  isFixture,
});

writeText(outputPath, packet);
writeText(reportPath, report);

console.log(`[gate-evidence-issue-convert] ${displayPath(outputPath)}`);
console.log(`[gate-evidence-issue-convert] ${displayPath(reportPath)}`);

if (failures.length && requireComplete) {
  console.error("\nGate evidence issue conversion is incomplete:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis gate evidence issue converted: draft evidence packet written; downstream gates remain blocked.");

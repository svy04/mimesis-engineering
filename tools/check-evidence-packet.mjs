#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith("--")));
const positional = args.filter((arg) => !arg.startsWith("--"));
const targetArg = positional[0];
const requireReviewed = flags.has("--require-reviewed");
const writeReport = flags.has("--write-report");

function usage() {
  console.log(`Usage: mimesis evidence:check path/to/evidence-packet.md [--require-reviewed] [--write-report]

Checks whether a strong public claim has evidence, permission, measurement, allowed-claim, disallowed-claim, and remaining-gap boundaries.
It does not create proof, publish anything, or validate claims beyond the named artifacts.
`);
}

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function extractHeadingSection(content, aliases) {
  const lines = content.split(/\r?\n/);
  let start = -1;
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^#{1,6}\s+(.+)$/);
    if (!match) {
      continue;
    }
    const heading = normalize(match[1]);
    if (aliases.some((alias) => heading === normalize(alias))) {
      start = index + 1;
      break;
    }
  }

  if (start < 0) {
    return "";
  }

  const collected = [];
  for (const line of lines.slice(start)) {
    if (/^#{1,6}\s+/.test(line)) {
      break;
    }
    collected.push(line);
  }
  return collected.join("\n").trim();
}

function hasPlaceholder(value) {
  return /\bTBD\b|<fill|TODO/i.test(value);
}

if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

if (!targetArg) {
  console.error("Missing evidence packet file.");
  usage();
  process.exit(1);
}

const targetPath = path.resolve(process.cwd(), targetArg);
if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
  console.error(`Evidence packet file does not exist: ${targetPath}`);
  process.exit(1);
}

const content = fs.readFileSync(targetPath, "utf8");
const failures = [];

const sections = [
  ["Claim Under Review", ["claim under review", "claim"]],
  ["Evidence Type", ["evidence type"]],
  ["Source / Artifact Links", ["source artifact links", "source links", "artifact links", "sources"]],
  ["Permission / Publication Boundary", ["permission publication boundary", "permission boundary", "publication boundary"]],
  ["Measurement / Observation Method", ["measurement observation method", "measurement method", "observation method"]],
  ["Before / After Or Event Evidence", ["before after or event evidence", "before after evidence", "event evidence", "evidence"]],
  ["Allowed Claim", ["allowed claim"]],
  ["Disallowed Claim", ["disallowed claim"]],
  ["What Remains Unproven", ["what remains unproven", "remaining proof gaps"]],
  ["Review Decision", ["review decision", "decision"]],
];

const values = new Map();

for (const [label, aliases] of sections) {
  const value = extractHeadingSection(content, aliases);
  values.set(label, value);
  if (!value) {
    failures.push(`missing or empty section: ${label}`);
  } else if (hasPlaceholder(value)) {
    failures.push(`section contains unfinished placeholder: ${label}`);
  }
}

const claim = values.get("Claim Under Review") ?? "";
const evidenceType = values.get("Evidence Type") ?? "";
const sourceLinks = values.get("Source / Artifact Links") ?? "";
const permissionBoundary = values.get("Permission / Publication Boundary") ?? "";
const measurement = values.get("Measurement / Observation Method") ?? "";
const eventEvidence = values.get("Before / After Or Event Evidence") ?? "";
const allowedClaim = values.get("Allowed Claim") ?? "";
const disallowedClaim = values.get("Disallowed Claim") ?? "";
const remaining = values.get("What Remains Unproven") ?? "";
const decision = values.get("Review Decision") ?? "";

if (/(guarantee|guaranteed|universal|always|proves everything|automatic success)/i.test(claim)) {
  failures.push("claim under review uses absolute proof language");
}

if (!/(permissioned external case|benchmark|external adoption|package release|action release|shipped plugin|customer outcome|publication event|local case|owner decision|sync verification|gate evidence)/i.test(evidenceType)) {
  failures.push("evidence type must name a concrete evidence class");
}

if (!/(\[[^\]]+\]\([^)]+\)|https?:\/\/|\.\.?\/|[A-Za-z0-9_-]+\.(md|yml|json)|#\d+|v?\d+\.\d+)/i.test(sourceLinks)) {
  failures.push("source / artifact links must include a link, path, issue number, tag, or artifact reference");
}

if (!/(permission|publish|publication|public|redact|redaction|license|owner|consent)/i.test(permissionBoundary)) {
  failures.push("permission / publication boundary must mention permission, publication, redaction, license, owner, or consent");
}

if (!/(measured|observed|checked|reviewed|logged|run|command|case|release|tag|package|issue|pull request|benchmark|before|after)/i.test(measurement)) {
  failures.push("measurement / observation method must describe how the evidence was observed");
}

if (!/(before|after|event|release|tag|package|case|benchmark|review|log|artifact|diff)/i.test(eventEvidence)) {
  failures.push("before / after or event evidence must point to a concrete artifact, event, log, or diff");
}

if (!allowedClaim || !disallowedClaim) {
  failures.push("allowed and disallowed claims must both be explicit");
}

if (!/(not|no |unproven|remain|boundary|does not|cannot|needs)/i.test(remaining)) {
  failures.push("what remains unproven must keep a visible proof boundary");
}

const decisionLine = decision.split(/\r?\n/).map((line) => line.trim()).find(Boolean) ?? "";
if (requireReviewed && !/^(reviewed|accepted|publish|publish redacted)\.?$/i.test(decisionLine)) {
  failures.push("require-reviewed gate failed: review decision is not reviewed, accepted, publish, or publish redacted");
}

const status = failures.length ? "not evidence-ready" : "reviewed";
const report = `# Evidence Packet Review

Status: ${status}

Target: \`${path.relative(process.cwd(), targetPath).replaceAll(path.sep, "/")}\`

## Decision

${decision || "No decision recorded."}

## Boundary

This review checks packet structure and claim boundaries.
It does not create evidence, verify external adoption, prove customer outcomes, publish a package, release an action, or guarantee legal originality.

## Failures

${failures.length ? failures.map((failure) => `- ${failure}`).join("\n") : "- none"}
`;

if (writeReport) {
  const reportPath = path.join(path.dirname(targetPath), "evidence-packet-review.md");
  fs.writeFileSync(reportPath, report);
  console.log(`[evidence-packet-review] ${path.relative(process.cwd(), reportPath).replaceAll(path.sep, "/")}`);
}

if (failures.length) {
  console.error("\nMimesis evidence packet check failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis evidence packet check passed: claim has an evidence packet boundary.");

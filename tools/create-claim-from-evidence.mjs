#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const positional = [];
const options = new Map();
let force = false;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--force") {
    force = true;
    continue;
  }
  if (arg.startsWith("--")) {
    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${arg}`);
    }
    options.set(arg, value);
    index += 1;
    continue;
  }
  positional.push(arg);
}

function usage() {
  console.log(`Usage: mimesis claim:from-evidence path/to/reviewed-evidence.md [--out path/to/claim-candidate.md] [--force]

Creates a bounded public claim candidate from a reviewed evidence packet.
It does not create evidence, publish anything, or prove external adoption.
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

if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

const targetArg = positional[0];
if (!targetArg) {
  console.error("Missing reviewed evidence packet file.");
  usage();
  process.exit(1);
}

const targetPath = path.resolve(process.cwd(), targetArg);
if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
  console.error(`Reviewed evidence packet file does not exist: ${targetPath}`);
  process.exit(1);
}

const outPath = path.resolve(
  process.cwd(),
  options.get("--out") ?? path.join(path.dirname(targetPath), "claim-from-evidence.md"),
);

if (fs.existsSync(outPath) && !force) {
  console.error(`Output already exists: ${outPath}. Pass --force to overwrite.`);
  process.exit(1);
}

const check = spawnSync(process.execPath, [
  path.join(root, "tools", "check-evidence-packet.mjs"),
  targetPath,
  "--require-reviewed",
], {
  cwd: process.cwd(),
  encoding: "utf8",
});

if (check.status !== 0) {
  console.error(check.stderr || check.stdout);
  console.error("Cannot create a claim candidate until evidence:check --require-reviewed passes.");
  process.exit(check.status ?? 1);
}

const content = fs.readFileSync(targetPath, "utf8");
const claimUnderReview = extractHeadingSection(content, ["Claim Under Review", "Claim"]);
const evidenceType = extractHeadingSection(content, ["Evidence Type"]);
const sources = extractHeadingSection(content, ["Source / Artifact Links", "Source Links", "Artifact Links", "Sources"]);
const allowedClaim = extractHeadingSection(content, ["Allowed Claim"]);
const disallowedClaim = extractHeadingSection(content, ["Disallowed Claim"]);
const remaining = extractHeadingSection(content, ["What Remains Unproven", "Remaining Proof Gaps"]);
const reviewDecision = extractHeadingSection(content, ["Review Decision", "Decision"]);

const publicCandidate = allowedClaim || claimUnderReview;
const output = `# Claim From Evidence

Status: bounded claim candidate.

Generated from a reviewed evidence packet.

## Evidence Source

- Packet: ${path.relative(root, targetPath).replaceAll(path.sep, "/") || targetPath}
- Evidence Type: ${evidenceType || "reviewed evidence packet"}

## Review Decision

${reviewDecision}

## Public Claim Candidate

${publicCandidate}

## Allowed Claim

${allowedClaim || publicCandidate}

## Disallowed Claim

${disallowedClaim || "Do not make stronger public claims than the reviewed evidence packet supports."}

## Evidence To Cite

${sources}

## What Remains Unproven

${remaining || "External adoption, benchmarked productivity, customer outcomes, publication, license choice, and legal originality remain unproven unless named evidence says otherwise."}

## Publication Boundary

This is a bounded claim candidate generated from reviewed evidence.
It does not create evidence, does not publish, does not post, does not stage, does not commit, does not push, does not create engagement, does not prove external adoption, does not prove benchmarked productivity, does not prove customer outcomes, does not publish a package, does not release an action, does not ship a plugin, does not choose a license, and does not certify legal originality.
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, output);

console.log(`[claim-from-evidence] ${path.relative(process.cwd(), outPath).replaceAll(path.sep, "/")}`);

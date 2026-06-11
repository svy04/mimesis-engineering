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
  console.log(`Usage: mimesis evidence:from-case [case-dir] [--out path/to/evidence-packet.md] [--claim "claim"] [--force]

Creates a draft evidence packet from a completed Mimesis case workspace.
It runs case:check first and does not mark the evidence as reviewed.
`);
}

function normalizeRelative(fromRoot, targetPath) {
  return path.relative(fromRoot, targetPath).replaceAll(path.sep, "/") || ".";
}

function extractSection(content, heading) {
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim().toLowerCase() === `## ${heading}`.toLowerCase());
  if (start < 0) {
    return "";
  }

  const collected = [];
  for (const line of lines.slice(start + 1)) {
    if (/^##\s+/.test(line)) {
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

const targetRoot = path.resolve(process.cwd(), positional[0] ?? ".");
const mimesisDir = path.join(targetRoot, ".mimesis");
const outPath = path.resolve(
  process.cwd(),
  options.get("--out") ?? path.join(targetRoot, ".mimesis", "evidence-packets", "local-case-draft.md"),
);
const claim = options.get("--claim")
  ?? "This local Mimesis case workspace contains completed case evidence under the stated proof boundary.";

if (!fs.existsSync(targetRoot) || !fs.statSync(targetRoot).isDirectory()) {
  console.error(`Case directory does not exist: ${targetRoot}`);
  process.exit(1);
}

if (!fs.existsSync(mimesisDir)) {
  console.error(`Case directory does not contain .mimesis: ${targetRoot}`);
  process.exit(1);
}

if (fs.existsSync(outPath) && !force) {
  console.error(`Output already exists: ${outPath}. Pass --force to overwrite.`);
  process.exit(1);
}

const caseCheck = spawnSync(process.execPath, [
  path.join(root, "tools", "check-case.mjs"),
  targetRoot,
  "--write-report",
], {
  cwd: root,
  encoding: "utf8",
});

if (caseCheck.status !== 0) {
  console.error(caseCheck.stderr || caseCheck.stdout);
  console.error("Cannot create an evidence packet until case:check passes.");
  process.exit(caseCheck.status ?? 1);
}

function readMimesisFile(name) {
  return fs.readFileSync(path.join(mimesisDir, name), "utf8");
}

const caseNote = readMimesisFile("case-note.md");
const improvedArtifact = readMimesisFile("improved-artifact.md");
const boundaryCheck = readMimesisFile("boundary-check.md");

const beforeAfter = extractSection(caseNote, "Before / After") || "Before / after evidence is recorded in `.mimesis/case-note.md`.";
const whatImproved = extractSection(caseNote, "What Improved") || extractSection(improvedArtifact, "Why It Is Stronger");
const remainsUnproven = extractSection(caseNote, "What Remains Unproven")
  || extractSection(improvedArtifact, "What Remains Unproven")
  || extractSection(boundaryCheck, "What Remains Unproven");

const sourceLinks = [
  ".mimesis/case-proof.md",
  ".mimesis/case-note.md",
  ".mimesis/improved-artifact.md",
  ".mimesis/boundary-check.md",
  ".mimesis/run_ledger.md",
].map((file) => `- ${file}`).join("\n");

const packet = `# Evidence Packet

Status: draft.

Generated from a completed Mimesis case workspace.
This draft evidence packet does not mark the evidence as reviewed.

## Claim Under Review

${claim}

## Evidence Type

local case

## Source / Artifact Links

${sourceLinks}

Case workspace: ${normalizeRelative(root, targetRoot)}

## Permission / Publication Boundary

The repository owner can review this local case evidence for publication.
Permission, redaction, license, and public-use boundaries still need an explicit review before this packet supports stronger public copy.

## Measurement / Observation Method

Checked by running npm run case:check through tools/check-case.mjs --write-report against the case workspace.
The generated .mimesis/case-proof.md is local structural evidence, not external adoption evidence.

## Before / After Or Event Evidence

${beforeAfter}

Supporting change note:

${whatImproved || "The improved artifact and case note describe the local transformation."}

## Allowed Claim

This local case workspace contains completed Mimesis case evidence and can be used as a draft evidence packet source.

## Disallowed Claim

This does not prove external adoption, benchmarked productivity, customer outcomes, package publication, shipped plugin use, legal originality, endorsement, or commercial impact.

## What Remains Unproven

${remainsUnproven || "External adoption, benchmarked productivity, customer outcomes, legal originality, and publication approval remain unproven."}

## Review Decision

draft.
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, packet);

console.log(`[evidence-from-case] ${normalizeRelative(process.cwd(), outPath)}`);

#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "proof-packets", "v0.2-first-proof.md");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function extractSection(content, heading) {
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start < 0) {
    return "";
  }

  const collected = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("## ")) {
      break;
    }
    collected.push(line);
  }
  return collected.join("\n").trim();
}

function bulletListFromSection(content, heading) {
  return extractSection(content, heading)
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("- "))
    .join("\n")
    .trim();
}

const packageJson = JSON.parse(read("package.json"));
const proofQueue = read("docs/V0.2-PROOF-QUEUE.md");
const intakeTemplate = read("templates/permissioned-case-intake.md");
const evidenceTemplate = read("templates/evidence-packet.md");

const currentState = extractSection(proofQueue, "Current Queue State");
const requirements = bulletListFromSection(proofQueue, "First Proof Candidate Requirements");
const commandPath = extractSection(proofQueue, "Required Command Path");
const stopConditions = extractSection(proofQueue, "Stop Conditions");
const exitClaim = extractSection(proofQueue, "v0.2 Exit Claim");
const intakeSections = intakeTemplate
  .split(/\r?\n/)
  .filter((line) => /^##\s+/.test(line))
  .map((line) => `- ${line.replace(/^##\s+/, "")}`)
  .join("\n");
const evidenceSections = evidenceTemplate
  .split(/\r?\n/)
  .filter((line) => /^##\s+/.test(line))
  .map((line) => `- ${line.replace(/^##\s+/, "")}`)
  .join("\n");

const generated = `# Mimesis Engineering v0.2 First Proof Packet

Generated from the current local repository state for Mimesis Engineering v${packageJson.version}.

Status: handoff packet, not completed proof.

## Purpose

Use this packet to collect the first permissioned or clearly redacted external weak artifact and run it through the Mimesis proof path.

It does not prove external adoption, customer outcomes, benchmarked productivity, commercial success, legal originality, endorsement, npm release, marketplace release, or shipped plugins.

## Current Queue State

${currentState}

## Submitter Intake Checklist

The submitter or operator must fill these intake sections:

${intakeSections}

## First Proof Candidate Requirements

${requirements}

## Required Command Path

${commandPath}

## Evidence Packet Checklist

Any stronger public claim needs an evidence packet with these sections:

${evidenceSections}

## Source Files

- [v0.2 Proof Queue](../../docs/V0.2-PROOF-QUEUE.md)
- [Permissioned Case Intake Template](../../templates/permissioned-case-intake.md)
- [Evidence Packet Template](../../templates/evidence-packet.md)
- [Case From Intake](../../docs/CASE-FROM-INTAKE.md)
- [Case Check](../../docs/CASE-CHECK.md)
- [Evidence Packet](../../docs/EVIDENCE-PACKET.md)

## Stop Conditions

${stopConditions}

## Exit Claim

${exitClaim}

## Boundary

This first-proof packet is an operator handoff.
It does not create external proof and must not be described as a completed v0.2 proof loop until a real permissioned or clearly redacted artifact passes \`case:review\`, \`case:from-intake\`, \`case:check\`, \`evidence:check\`, and \`release:check:public\`.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[proof-packet] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

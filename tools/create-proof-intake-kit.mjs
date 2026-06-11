#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "proof-intake", "first-external-proof-kit.md");

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

const packageJson = JSON.parse(read("package.json"));
const intakeTemplate = read("templates/permissioned-case-intake.md");
const evidenceTemplate = read("templates/evidence-packet.md");
const proofQueue = read("docs/V0.2-PROOF-QUEUE.md");
const permissionedPacket = read("docs/PERMISSIONED-CASE-PACKET.md");

const candidateRequirements = extractSection(proofQueue, "First Proof Candidate Requirements");
const commandPath = extractSection(proofQueue, "Required Command Path");
const stopConditions = extractSection(proofQueue, "Stop Conditions");
const exitClaim = extractSection(proofQueue, "v0.2 Exit Claim");
const minimumInputs = extractSection(permissionedPacket, "Minimum Inputs");
const permissionBoundary = extractSection(permissionedPacket, "Permission Boundary");

const generated = `# Mimesis First External Proof Intake Kit

Generated from the current local repository state for Mimesis Engineering v${packageJson.version}.

Status: intake kit, not external proof.

Use this kit when asking someone to bring one permissioned external weak artifact into the first v0.2 proof loop.

## Submitter Checklist

A submitter must provide:

${minimumInputs}

The first proof candidate also needs:

${candidateRequirements}

## Intake Template

Copy this into a permissioned intake file before running \`case:review\`.

${intakeTemplate}

## Required Command Path

${commandPath}

## Evidence Packet Requirements

After the case transformation is complete, create a reviewed evidence packet for any public claim stronger than local transformation evidence.

Evidence packet template:

${evidenceTemplate}

## Redaction And Permission Boundary

${permissionBoundary}

Required submitter fields include:

- Artifact owner
- Permission status
- Publication preference
- Redaction requirements
- Safety confirmation

## Stop Conditions

${stopConditions}

## Allowed Claim

${exitClaim}

## Disallowed Claim

This kit does not prove that Mimesis is externally adopted, benchmarked, commercially validated, legally original, universally effective, or production-ready.

## Boundary

This kit does not create external proof, does not prove adoption, does not choose a license, does not grant permission, does not run a transformation, does not publish a case, does not publish to npm, and does not publish a GitHub Marketplace action.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[proof-intake-kit] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

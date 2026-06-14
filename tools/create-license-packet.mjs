#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "license-packets", "owner-decision.md");

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
const decisionDoc = read("docs/LICENSE-DECISION.md");
const licenseStatus = read("LICENSE.md");
const packageCandidate = read("docs/PACKAGE-RELEASE-CANDIDATE.md");

const currentBoundary = extractSection(decisionDoc, "Current Boundary");
const decisionNeeded = extractSection(decisionDoc, "Decision Needed");
const safeClaim = extractSection(decisionDoc, "Safe Claim Before Decision");
const unsafeClaim = extractSection(decisionDoc, "Unsafe Claim Before Decision");
const ownerGates = extractSection(packageCandidate, "Owner Gates Before Publish");

const generated = `# Mimesis Engineering License Decision Packet

Generated from the current local repository state.

Status: owner decision required.

## Current Package Boundary

- package name: \`${packageJson.name}\`
- package version: \`${packageJson.version}\`
- package private flag: \`${packageJson.private}\`
- package license field: \`${packageJson.license}\`

${licenseStatus.trim()}

## Current License Boundary

${currentBoundary}

## Owner Decision Questions

1. Should repository code and validators be reusable by others?
2. Should docs, templates, prompts, and cases use the same license as code?
3. Should cases or proof artifacts have a stricter publication or reuse boundary?
4. Should the package remain private even after a license is chosen?
5. Who owns npm, GitHub release, and publication authority?

## Decision Directions

${decisionNeeded}

## Package Publish Gates

${ownerGates}

## Safe Claim Before Decision

${safeClaim}

## Unsafe Claim Before Decision

${unsafeClaim}

## Stop Conditions

Do not claim open-source reuse readiness if:

- \`LICENSE.md\` remains a status note instead of selected license text
- \`package.json\` remains \`"license": "UNLICENSED"\`
- \`package.json\` remains \`"private": true\`
- docs imply free reuse before the owner chooses
- package publication is described as completed before npm publication evidence exists

## Boundary

This packet is a license decision aid.
It does not choose a license, grant reuse rights, create legal advice, publish to npm, or prove open-source readiness.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[license-packet] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

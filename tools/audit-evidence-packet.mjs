#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function runChecker(filePath, extraArgs = []) {
  return spawnSync(process.execPath, [
    path.join(root, "tools", "check-evidence-packet.mjs"),
    filePath,
    ...extraArgs,
  ], {
    cwd: root,
    encoding: "utf8",
  });
}

const packageJson = JSON.parse(read("package.json"));
const cli = read("bin/mimesis.mjs");
const doc = read("docs/EVIDENCE-PACKET.md");
const template = read("templates/evidence-packet.md");

for (const scriptName of ["evidence:check", "audit:evidence"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:evidence")) {
  failures.push("release:check must include npm run audit:evidence");
}

if (!cli.includes('"evidence:check"')) {
  failures.push("CLI missing evidence:check command");
}

for (const text of ["No proof, no claim", "does not create evidence", "What Remains Unproven"]) {
  if (!doc.includes(text) && !template.includes(text)) {
    failures.push(`evidence packet docs/template missing text: ${text}`);
  }
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-evidence-packet-"));
try {
  const goodPacket = path.join(tempRoot, "good.md");
  fs.writeFileSync(goodPacket, `# Evidence Packet

Status: reviewed.

## Claim Under Review

Mimesis has a repository-local GitHub Action release-candidate surface.

## Evidence Type

action release

## Source / Artifact Links

- action.yml
- docs/ACTION-RELEASE-CANDIDATE.md

## Permission / Publication Boundary

The repository owner can publish this public repository metadata. It is not a Marketplace release.

## Measurement / Observation Method

Checked by running npm run audit:action and inspecting action.yml.

## Before / After Or Event Evidence

Event evidence: action.yml exists as a local composite action candidate.

## Allowed Claim

The repository includes a local action release-candidate surface.

## Disallowed Claim

This is not a GitHub Marketplace action release and does not prove external adoption.

## What Remains Unproven

Marketplace publication, tagged release, and external adoption remain unproven.

## Review Decision

reviewed.
`);

  const goodResult = runChecker(goodPacket, ["--require-reviewed", "--write-report"]);
  if (goodResult.status !== 0) {
    failures.push(`reviewed evidence packet should pass: ${goodResult.stderr || goodResult.stdout}`);
  }
  if (!fs.existsSync(path.join(tempRoot, "evidence-packet-review.md"))) {
    failures.push("evidence packet review report should be written for --write-report");
  }

  const draftPacket = path.join(tempRoot, "draft.md");
  fs.writeFileSync(draftPacket, fs.readFileSync(goodPacket, "utf8").replace(/## Review Decision\s+reviewed\./, "## Review Decision\n\ndraft."));
  const draftResult = runChecker(draftPacket, ["--require-reviewed"]);
  if (draftResult.status === 0) {
    failures.push("draft evidence packet should fail --require-reviewed");
  }

  const unsafePacket = path.join(tempRoot, "unsafe.md");
  fs.writeFileSync(unsafePacket, `# Evidence Packet

## Claim Under Review

Mimesis guarantees universal adoption.

## Evidence Type

vibes

## Source / Artifact Links

none

## Permission / Publication Boundary

none

## Measurement / Observation Method

felt true

## Before / After Or Event Evidence

none

## Allowed Claim

Mimesis guarantees universal adoption.

## Disallowed Claim

none

## What Remains Unproven

everything is proven

## Review Decision

reviewed.
`);
  const unsafeResult = runChecker(unsafePacket);
  if (unsafeResult.status === 0) {
    failures.push("unsafe evidence packet should fail");
  }
} finally {
  if (tempRoot.startsWith(os.tmpdir())) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

if (failures.length) {
  console.error("\nMimesis evidence packet audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis evidence packet audit passed: strong claims require structured evidence boundaries.");

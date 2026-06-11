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

const packageJson = JSON.parse(read("package.json"));
const cli = read("bin/mimesis.mjs");
const doc = read("docs/CLAIM-FROM-EVIDENCE.md");
const completionAudit = read("docs/COMPLETION-AUDIT.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");

for (const relativePath of [
  "tools/create-claim-from-evidence.mjs",
  "tools/audit-claim-from-evidence.mjs",
  "docs/CLAIM-FROM-EVIDENCE.md",
]) {
  read(relativePath);
}

for (const scriptName of ["claim:from-evidence", "audit:claim-from-evidence"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:claim-from-evidence")) {
  failures.push("release:check must include npm run audit:claim-from-evidence");
}

for (const command of ["claim:from-evidence", "audit:claim-from-evidence"]) {
  if (!cli.includes(`"${command}"`)) {
    failures.push(`CLI missing ${command} command`);
  }
}

for (const text of [
  "reviewed evidence packet",
  "bounded claim candidate",
  "Allowed Claim",
  "Disallowed Claim",
  "does not create evidence",
  "does not publish",
]) {
  if (!`${doc}\n${completionAudit}\n${releasePacket}`.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`claim-from-evidence docs missing text: ${text}`);
  }
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-claim-from-evidence-"));

try {
  const draftSource = path.join(root, ".mimesis", "evidence-packets", "local-case-draft.md");
  const draftPath = path.join(tempRoot, "draft.md");
  const reviewedPath = path.join(tempRoot, "reviewed.md");
  const claimPath = path.join(tempRoot, "claim-candidate.md");
  fs.copyFileSync(draftSource, draftPath);

  const review = spawnSync(process.execPath, [
    path.join(root, "tools", "review-evidence-packet.mjs"),
    draftPath,
    "--decision",
    "reviewed",
    "--reviewer",
    "Local Reviewer",
    "--note",
    "Reviewed local case evidence against the proof boundary.",
    "--out",
    reviewedPath,
  ], {
    cwd: tempRoot,
    encoding: "utf8",
  });

  if (review.status !== 0) {
    failures.push(`fixture evidence review failed: ${review.stderr || review.stdout}`);
  }

  const result = spawnSync(process.execPath, [
    path.join(root, "tools", "create-claim-from-evidence.mjs"),
    reviewedPath,
    "--out",
    claimPath,
  ], {
    cwd: tempRoot,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    failures.push(`claim:from-evidence smoke failed: ${result.stderr || result.stdout}`);
  }

  if (!fs.existsSync(claimPath)) {
    failures.push("claim:from-evidence must write claim candidate");
  }

  const claim = fs.existsSync(claimPath) ? fs.readFileSync(claimPath, "utf8") : "";
  for (const text of [
    "# Claim From Evidence",
    "Status: bounded claim candidate.",
    "## Evidence Source",
    "## Public Claim Candidate",
    "## Allowed Claim",
    "## Disallowed Claim",
    "## What Remains Unproven",
    "## Publication Boundary",
    "does not create evidence",
    "does not publish",
    "does not prove external adoption",
  ]) {
    if (!claim.includes(text)) {
      failures.push(`claim candidate missing text: ${text}`);
    }
  }

  const draftResult = spawnSync(process.execPath, [
    path.join(root, "tools", "create-claim-from-evidence.mjs"),
    draftPath,
    "--out",
    path.join(tempRoot, "draft-claim.md"),
  ], {
    cwd: tempRoot,
    encoding: "utf8",
  });

  if (draftResult.status === 0) {
    failures.push("claim:from-evidence must reject draft evidence packets");
  }
} finally {
  if (tempRoot.startsWith(os.tmpdir())) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

if (failures.length) {
  console.error("\nMimesis claim-from-evidence audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis claim-from-evidence audit passed: reviewed evidence can produce a bounded claim candidate.");

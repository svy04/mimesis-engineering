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
const doc = read("docs/CASE-FROM-INTAKE.md");

for (const scriptName of ["case:from-intake", "audit:case-from-intake"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:case-from-intake")) {
  failures.push("release:check must include npm run audit:case-from-intake");
}

if (!cli.includes('"case:from-intake"')) {
  failures.push("CLI missing case:from-intake command");
}

for (const text of ["permissioned external case", "Case Status: started", "does not prove improvement"]) {
  if (!doc.includes(text)) {
    failures.push(`docs/CASE-FROM-INTAKE.md missing text: ${text}`);
  }
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-from-intake-"));
const intake = path.join(tempRoot, "intake.md");

fs.writeFileSync(intake, `# Permissioned External Case Intake

## Starting artifact

Shareable weak README excerpt.

## Artifact owner

Submitter owns the artifact.

## Permission status

I own it.

## Publication preference

Public.

## Redaction requirements

No redaction required.

## References studied

reference-packs/github-readme.md

## Desired transformation

Make the README clearer and safer.

## Proof boundary

This case must not claim universal effectiveness, benchmarked productivity, commercial outcomes, or legal originality.

## Safety confirmation

I did not include secrets, tokens, private customer data, or passwords.
`);

try {
  const result = spawnSync(process.execPath, [
    path.join(root, "tools", "case-from-intake.mjs"),
    intake,
    "--reference-pack",
    "reference-packs/github-readme.md",
    "--title",
    "Permissioned Smoke",
    "--out",
    "permissioned-smoke",
  ], {
    cwd: tempRoot,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    failures.push(`case:from-intake smoke failed: ${result.stderr || result.stdout}`);
  }

  const outRoot = path.join(tempRoot, "permissioned-smoke");
  for (const file of [
    "README.md",
    "permissioned-intake.md",
    "weak-artifact.md",
    ".mimesis/spec_lock.md",
    ".mimesis/reference-set.md",
    ".mimesis/boundary-check.md",
    ".mimesis/case-note.md",
    ".mimesis/run_ledger.md",
  ]) {
    if (!fs.existsSync(path.join(outRoot, file))) {
      failures.push(`case:from-intake smoke missing ${file}`);
    }
  }

  const specLock = fs.existsSync(path.join(outRoot, ".mimesis", "spec_lock.md"))
    ? fs.readFileSync(path.join(outRoot, ".mimesis", "spec_lock.md"), "utf8")
    : "";
  if (!specLock.includes("Permission Boundary")) {
    failures.push("case:from-intake output must include permission boundary");
  }

  const caseCheck = spawnSync(process.execPath, [
    path.join(root, "tools", "check-case.mjs"),
    outRoot,
  ], {
    cwd: tempRoot,
    encoding: "utf8",
  });

  if (caseCheck.status === 0) {
    failures.push("case:from-intake output must not pass case:check before transformation");
  }
} finally {
  if (tempRoot.startsWith(os.tmpdir())) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

if (failures.length) {
  console.error("\nMimesis case-from-intake audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis case-from-intake audit passed: reviewed intake becomes started external case workspace.");

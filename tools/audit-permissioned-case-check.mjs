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

function runReview(targetPath, extraArgs = []) {
  return spawnSync(process.execPath, [
    path.join(root, "tools", "check-permissioned-case.mjs"),
    targetPath,
    ...extraArgs,
  ], {
    cwd: root,
    encoding: "utf8",
  });
}

const packageJson = JSON.parse(read("package.json"));
const cli = read("bin/mimesis.mjs");
const doc = read("docs/PERMISSIONED-CASE-CHECK.md");

for (const scriptName of ["case:review", "audit:permissioned-case"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:permissioned-case")) {
  failures.push("release:check must include npm run audit:permissioned-case");
}

if (!cli.includes('"case:review"')) {
  failures.push("CLI missing case:review command");
}

for (const text of ["permissioned external case", "--require-public", "does not prove external adoption"]) {
  if (!doc.includes(text)) {
    failures.push(`docs/PERMISSIONED-CASE-CHECK.md missing text: ${text}`);
  }
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-permissioned-case-"));

try {
  const publicCase = path.join(tempRoot, "public-case.md");
  fs.writeFileSync(publicCase, `# Permissioned External Case Intake

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

  const publicResult = runReview(publicCase, ["--require-public", "--write-report"]);
  if (publicResult.status !== 0) {
    failures.push(`public permissioned case should pass: ${publicResult.stderr || publicResult.stdout}`);
  }

  if (!fs.existsSync(path.join(tempRoot, "permissioned-case-review.md"))) {
    failures.push("permissioned review report should be written for --write-report");
  }

  const privateCase = path.join(tempRoot, "private-case.md");
  fs.writeFileSync(privateCase, fs.readFileSync(publicCase, "utf8")
    .replace("I own it.", "Private only.")
    .replace("Public.", "Private only."));
  const privateResult = runReview(privateCase);
  if (privateResult.status !== 0) {
    failures.push(`private-only case should pass intake but stay private: ${privateResult.stderr || privateResult.stdout}`);
  }
  const privateStrictResult = runReview(privateCase, ["--require-public"]);
  if (privateStrictResult.status === 0) {
    failures.push("private-only case must fail --require-public");
  }

  const unsafeCase = path.join(tempRoot, "unsafe-case.md");
  fs.writeFileSync(unsafeCase, `${fs.readFileSync(publicCase, "utf8")}\npassword = abcdefghijklmnop\n`);
  const unsafeResult = runReview(unsafeCase);
  if (unsafeResult.status === 0) {
    failures.push("case containing a secret-like value must fail");
  }
} finally {
  if (tempRoot.startsWith(os.tmpdir())) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

if (failures.length) {
  console.error("\nMimesis permissioned case audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis permissioned case audit passed: public, private, and unsafe intake paths checked.");

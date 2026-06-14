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
const doc = read("docs/CASE-FROM-RECORD.md");
const completionAudit = read("docs/COMPLETION-AUDIT.md");

for (const relativePath of [
  "tools/case-from-record.mjs",
  "tools/audit-case-from-record.mjs",
  "docs/CASE-FROM-RECORD.md",
  ".mimesis/proof-intake/fixture-record.json",
]) {
  read(relativePath);
}

for (const scriptName of ["case:from-record", "audit:case-from-record"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:case-from-record")) {
  failures.push("release:check must include npm run audit:case-from-record");
}

for (const command of ["case:from-record", "audit:case-from-record"]) {
  if (!cli.includes(`"${command}"`)) {
    failures.push(`CLI missing ${command} command`);
  }
}

for (const text of [
  "proof intake record",
  "Case Status: started",
  "does not prove improvement",
  "not a real submitter artifact",
]) {
  if (!`${doc}\n${completionAudit}`.includes(text)) {
    failures.push(`case-from-record docs missing text: ${text}`);
  }
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-from-record-"));

try {
  const result = spawnSync(process.execPath, [
    path.join(root, "tools", "case-from-record.mjs"),
    ".mimesis/proof-intake/fixture-record.json",
    "--title",
    "Record Smoke",
    "--out",
    "record-smoke",
  ], {
    cwd: tempRoot,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    failures.push(`case:from-record smoke failed: ${result.stderr || result.stdout}`);
  }

  const outRoot = path.join(tempRoot, "record-smoke");
  for (const file of [
    "README.md",
    "proof-intake-record.json",
    "weak-artifact.md",
    ".mimesis/spec_lock.md",
    ".mimesis/reference-set.md",
    ".mimesis/boundary-check.md",
    ".mimesis/case-note.md",
    ".mimesis/run_ledger.md",
  ]) {
    if (!fs.existsSync(path.join(outRoot, file))) {
      failures.push(`case:from-record smoke missing ${file}`);
    }
  }

  const readOutput = (relativePath) => (
    fs.existsSync(path.join(outRoot, relativePath))
      ? fs.readFileSync(path.join(outRoot, relativePath), "utf8")
      : ""
  );

  if (!readOutput("README.md").includes("Case Status: started")) {
    failures.push("case:from-record output README must mark the case as started");
  }

  if (!readOutput("proof-intake-record.json").includes('"schemaVersion": "0.1.0"')) {
    failures.push("case:from-record output must preserve the proof intake record");
  }

  if (!readOutput(".mimesis/spec_lock.md").includes("Permission Boundary")) {
    failures.push("case:from-record output must include permission boundary");
  }

  if (!readOutput(".mimesis/boundary-check.md").includes("not a real submitter artifact")) {
    failures.push("case:from-record boundary check must preserve fixture boundary");
  }

  const caseCheck = spawnSync(process.execPath, [
    path.join(root, "tools", "check-case.mjs"),
    outRoot,
  ], {
    cwd: tempRoot,
    encoding: "utf8",
  });

  if (caseCheck.status === 0) {
    failures.push("case:from-record output must not pass case:check before transformation");
  }
} finally {
  if (tempRoot.startsWith(os.tmpdir())) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

if (failures.length) {
  console.error("\nMimesis case-from-record audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis case-from-record audit passed: proof intake record becomes started case workspace.");

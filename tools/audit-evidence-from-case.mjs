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
const doc = read("docs/EVIDENCE-FROM-CASE.md");
const completionAudit = read("docs/COMPLETION-AUDIT.md");

for (const relativePath of [
  "tools/create-evidence-from-case.mjs",
  "tools/audit-evidence-from-case.mjs",
  "docs/EVIDENCE-FROM-CASE.md",
]) {
  read(relativePath);
}

for (const scriptName of ["evidence:from-case", "audit:evidence-from-case"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:evidence-from-case")) {
  failures.push("release:check must include npm run audit:evidence-from-case");
}

for (const command of ["evidence:from-case", "audit:evidence-from-case"]) {
  if (!cli.includes(`"${command}"`)) {
    failures.push(`CLI missing ${command} command`);
  }
}

for (const text of [
  "draft evidence packet",
  "case:check",
  "does not mark the evidence as reviewed",
  "does not prove external adoption",
]) {
  if (!`${doc}\n${completionAudit}`.includes(text)) {
    failures.push(`evidence-from-case docs missing text: ${text}`);
  }
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-evidence-from-case-"));

try {
  const outPath = path.join(tempRoot, "evidence-packet.md");
  const result = spawnSync(process.execPath, [
    path.join(root, "tools", "create-evidence-from-case.mjs"),
    root,
    "--out",
    outPath,
  ], {
    cwd: tempRoot,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    failures.push(`evidence:from-case smoke failed: ${result.stderr || result.stdout}`);
  }

  if (!fs.existsSync(outPath)) {
    failures.push("evidence:from-case smoke must write evidence-packet.md");
  }

  const packet = fs.existsSync(outPath) ? fs.readFileSync(outPath, "utf8") : "";
  for (const text of [
    "Status: draft.",
    "## Claim Under Review",
    "## Evidence Type",
    "local case",
    "## Source / Artifact Links",
    ".mimesis/case-proof.md",
    "## Permission / Publication Boundary",
    "## Measurement / Observation Method",
    "npm run case:check",
    "## Before / After Or Event Evidence",
    "## Allowed Claim",
    "## Disallowed Claim",
    "## What Remains Unproven",
    "## Review Decision",
    "draft.",
  ]) {
    if (!packet.includes(text)) {
      failures.push(`evidence:from-case output missing text: ${text}`);
    }
  }

  const check = spawnSync(process.execPath, [
    path.join(root, "tools", "check-evidence-packet.mjs"),
    outPath,
  ], {
    cwd: tempRoot,
    encoding: "utf8",
  });

  if (check.status !== 0) {
    failures.push(`generated draft evidence packet should pass structural check: ${check.stderr || check.stdout}`);
  }

  const reviewedGate = spawnSync(process.execPath, [
    path.join(root, "tools", "check-evidence-packet.mjs"),
    outPath,
    "--require-reviewed",
  ], {
    cwd: tempRoot,
    encoding: "utf8",
  });

  if (reviewedGate.status === 0) {
    failures.push("generated draft evidence packet must fail --require-reviewed until a human review decision is recorded");
  }

  const startedCaseRoot = path.join(tempRoot, "started-case");
  const startResult = spawnSync(process.execPath, [
    path.join(root, "tools", "start-case.mjs"),
    path.join(root, "examples", "weak-readme.md"),
    "--reference-pack",
    path.join(root, "reference-packs", "github-readme.md"),
    "--title",
    "Started Case",
    "--out",
    startedCaseRoot,
  ], {
    cwd: tempRoot,
    encoding: "utf8",
  });

  if (startResult.status !== 0) {
    failures.push(`case:start fixture setup failed: ${startResult.stderr || startResult.stdout}`);
  }

  const startedResult = spawnSync(process.execPath, [
    path.join(root, "tools", "create-evidence-from-case.mjs"),
    startedCaseRoot,
    "--out",
    path.join(tempRoot, "started-evidence.md"),
  ], {
    cwd: tempRoot,
    encoding: "utf8",
  });

  if (startedResult.status === 0) {
    failures.push("evidence:from-case must reject started cases that do not pass case:check");
  }
} finally {
  if (tempRoot.startsWith(os.tmpdir())) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

if (failures.length) {
  console.error("\nMimesis evidence-from-case audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis evidence-from-case audit passed: completed case evidence can create a draft evidence packet.");

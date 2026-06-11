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
const doc = read("docs/CASE-START.md");

for (const scriptName of ["case:start", "audit:case-start"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:case-start")) {
  failures.push("release:check must include npm run audit:case-start");
}

if (!cli.includes('"case:start"')) {
  failures.push("CLI missing case:start command");
}

for (const text of [
  "one weak artifact",
  "Case Status: started",
  "does not prove improvement",
]) {
  if (!doc.includes(text)) {
    failures.push(`docs/CASE-START.md missing text: ${text}`);
  }
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-case-start-"));
const weakArtifactPath = path.join(tempRoot, "weak-readme.md");
fs.writeFileSync(weakArtifactPath, "# Weak README\n\nThis repo does something useful, probably.\n");

try {
  const result = spawnSync(process.execPath, [
    path.join(root, "tools", "start-case.mjs"),
    "--artifact",
    weakArtifactPath,
    "--reference-pack",
    "reference-packs/github-readme.md",
    "--title",
    "Smoke README",
    "--out",
    "smoke-case",
  ], {
    cwd: tempRoot,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    failures.push(`case:start smoke failed: ${result.stderr || result.stdout}`);
  }

  const outRoot = path.join(tempRoot, "smoke-case");
  for (const file of [
    "README.md",
    "weak-artifact.md",
    ".mimesis/spec_lock.md",
    ".mimesis/reference-set.md",
    ".mimesis/improved-artifact.md",
    ".mimesis/boundary-check.md",
    ".mimesis/case-note.md",
    ".mimesis/run_ledger.md",
  ]) {
    if (!fs.existsSync(path.join(outRoot, file))) {
      failures.push(`case:start smoke missing ${file}`);
    }
  }

  const startedCase = fs.existsSync(path.join(outRoot, ".mimesis", "case-note.md"))
    ? fs.readFileSync(path.join(outRoot, ".mimesis", "case-note.md"), "utf8")
    : "";
  if (!startedCase.includes("Case Status: started")) {
    failures.push("started case note must be marked as started");
  }

  const workspaceCheck = spawnSync(process.execPath, [
    path.join(root, "tools", "check-workspace.mjs"),
    outRoot,
  ], {
    cwd: tempRoot,
    encoding: "utf8",
  });

  if (workspaceCheck.status === 0) {
    failures.push("workspace:check must not pass a newly started case");
  }

  if (!`${workspaceCheck.stderr}\n${workspaceCheck.stdout}`.includes("Case Status: started")) {
    failures.push("workspace:check failure should explain started-case status");
  }
} finally {
  if (tempRoot.startsWith(os.tmpdir())) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

if (failures.length) {
  console.error("\nMimesis case-start audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis case-start audit passed: starter workspace created and not misclassified as complete.");

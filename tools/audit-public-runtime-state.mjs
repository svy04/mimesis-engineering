#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const forbiddenRuntimeStatePaths = [
  ".mimesis/sync-status.md",
  ".mimesis/publish-packets/local-sync-handoff.md",
  ".mimesis/worktree/review-packet.json",
];

const requiredIgnoreEntries = [
  ".mimesis/sync-status.md",
  ".mimesis/publish-packets/local-sync-handoff.md",
  ".mimesis/worktree/",
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function trackedFiles() {
  const result = spawnSync("git", ["ls-files", "--", ...forbiddenRuntimeStatePaths], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    failures.push(`git ls-files failed: ${result.stderr || result.stdout}`);
    return new Set();
  }
  return new Set(result.stdout.split(/\r?\n/).filter(Boolean));
}

const failures = [];
const tracked = trackedFiles();

for (const relativePath of forbiddenRuntimeStatePaths) {
  if (tracked.has(relativePath) && fs.existsSync(path.join(root, relativePath))) {
    failures.push(`public runtime-state packet must not be tracked: ${relativePath}`);
  }
}

const gitignore = read(".gitignore");
for (const entry of requiredIgnoreEntries) {
  if (!gitignore.split(/\r?\n/).includes(entry)) {
    failures.push(`.gitignore missing runtime-state entry: ${entry}`);
  }
}

if (failures.length > 0) {
  console.error("\nMimesis public runtime-state hygiene audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis public runtime-state hygiene audit passed: generated sync/worktree packets are absent and ignored.");

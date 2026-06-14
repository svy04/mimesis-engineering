#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const strict = process.argv.includes("--strict");
const noWrite = process.argv.includes("--no-write");
const failures = [];

function git(args) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    failures.push(`git ${args.join(" ")} failed: ${result.stderr || result.stdout || result.error?.message}`);
    return "";
  }

  return result.stdout.trim();
}

function gitOptional(args) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    return "";
  }

  return result.stdout.trim();
}

const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]);
const head = git(["rev-parse", "HEAD"]);
const upstream = gitOptional(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
const upstreamHead = upstream ? git(["rev-parse", upstream]) : "";
const remoteUrl = git(["remote", "get-url", "origin"]);
const statusShort = git(["status", "--short"]);
const branchStatus = git(["status", "--short", "--branch"]);
const aheadBehindRaw = upstream ? git(["rev-list", "--left-right", "--count", `${upstream}...HEAD`]) : "";
const [behindRaw, aheadRaw] = aheadBehindRaw.trim() ? aheadBehindRaw.trim().split(/\s+/) : [];
const behind = behindRaw || "0";
const ahead = aheadRaw || "0";
const statusLines = statusShort ? statusShort.split(/\r?\n/).filter(Boolean) : [];
const untracked = statusLines.filter((line) => line.startsWith("??")).length;
const changed = statusLines.length - untracked;
const isClean = statusLines.length === 0;
const isSameCommit = Boolean(head && upstreamHead && head === upstreamHead);
const isSynced = isClean && isSameCommit && ahead === "0" && behind === "0";

let conclusion = "remote sync unknown";
if (isSynced) {
  conclusion = "local worktree is clean and matches upstream";
} else if (!isClean && isSameCommit) {
  conclusion = "local branch matches upstream commit, but working tree has unpublished local changes";
} else if (ahead !== "0" || behind !== "0") {
  conclusion = `local branch differs from upstream: ahead=${ahead}, behind=${behind}`;
} else if (!isClean) {
  conclusion = "working tree has unpublished local changes";
}

const report = `# Sync Status

Status: ${isSynced ? "synced" : "not remote-synced"}

## Git

- branch: \`${branch || "unknown"}\`
- upstream: \`${upstream || "none"}\`
- remote: \`${remoteUrl || "unknown"}\`
- head matches upstream: ${isSameCommit ? "yes" : "no"}
- ahead: ${ahead}
- behind: ${behind}
- changed tracked files: ${changed}
- untracked files: ${untracked}

## Conclusion

${conclusion}.

## Boundary

This report proves only local git sync status against the current local upstream ref.
It does not prove that GitHub remote content contains uncommitted worktree changes.
It does not publish, push, tag, release, or create a pull request.

## Branch Status

\`\`\`text
${branchStatus || "clean"}
\`\`\`
`;

const reportPath = path.join(root, ".mimesis", "sync-status.md");
if (!noWrite) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, report);
}

if (strict && !isSynced) {
  failures.push("strict sync gate failed: local worktree is not clean and synced with upstream");
}

if (failures.length) {
  console.error("\nMimesis sync status audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  console.error(
    noWrite
      ? "[sync-status] not written (--no-write)"
      : `[sync-status] ${path.relative(root, reportPath).replaceAll(path.sep, "/")}`,
  );
  process.exit(1);
}

console.log(
  noWrite
    ? "[sync-status] not written (--no-write)"
    : `[sync-status] ${path.relative(root, reportPath).replaceAll(path.sep, "/")}`,
);
console.log(`Mimesis sync status audit passed: ${conclusion}.`);

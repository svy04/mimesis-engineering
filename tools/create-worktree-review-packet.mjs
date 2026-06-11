#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "worktree", "review-packet.json");

function git(args) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    return (result.stderr || result.stdout || result.error?.message || "").trim();
  }
  return result.stdout.trim();
}

function lines(text) {
  return text ? text.split(/\r?\n/).filter(Boolean) : [];
}

function parseDiffChange(line) {
  const [status, ...rest] = line.split(/\s+/);
  return {
    status,
    path: rest.join(" "),
  };
}

function parseStatusChange(line) {
  const match = line.match(/^(.{1,2})\s+(.*)$/);
  const rawStatus = match ? match[1] : line.slice(0, 2);
  const rawPath = match ? match[2] : line.slice(3);
  const pathPart = rawPath.includes(" -> ") ? rawPath.split(" -> ").pop().trim() : rawPath.trim();
  return {
    status: rawStatus.trim(),
    path: pathPart.replaceAll("\\", "/"),
  };
}

function rootForUntracked(filePath) {
  const [first, second] = filePath.split("/");
  if (first === ".github" || first === ".mimesis") {
    return second ? `${first}/${second}` : first;
  }
  return first;
}

const statusLines = lines(git(["status", "--short"]));
const trackedStatusLines = statusLines.filter((line) => !line.startsWith("??"));
const untrackedStatusLines = statusLines.filter((line) => line.startsWith("??"));
const diffNameStatus = lines(git(["diff", "--name-status"]));
const stagedDiffNameStatus = lines(git(["diff", "--cached", "--name-status"]));
const untrackedFiles = lines(git(["ls-files", "--others", "--exclude-standard"]));
const upstreamResult = git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
const upstream = upstreamResult.includes("fatal") ? "none" : upstreamResult || "none";
const rootCounts = new Map();

for (const filePath of untrackedFiles) {
  const rootName = rootForUntracked(filePath.replaceAll("\\", "/"));
  rootCounts.set(rootName, (rootCounts.get(rootName) ?? 0) + 1);
}

const packet = {
  schema: "mimesis.worktree-review-packet.v0.1",
  status: "dirty_worktree_review_packet_not_publication",
  generatedAt: new Date().toISOString(),
  reviewScope: "local dirty worktree only",
  completionAllowed: false,
  git: {
    branch: git(["rev-parse", "--abbrev-ref", "HEAD"]) || "unknown",
    upstream,
    head: git(["rev-parse", "HEAD"]) || "unknown",
    dirty: statusLines.length > 0,
    trackedChangedCount: trackedStatusLines.length,
    untrackedCount: untrackedStatusLines.length,
  },
  trackedChanges: trackedStatusLines.map(parseStatusChange),
  unstagedChanges: diffNameStatus.map(parseDiffChange),
  stagedChanges: stagedDiffNameStatus.map(parseDiffChange),
  trackedStatusLines,
  untrackedRoots: [...rootCounts.entries()]
    .map(([rootName, count]) => ({ root: rootName, count }))
    .sort((left, right) => left.root.localeCompare(right.root)),
  untrackedFilesSample: untrackedFiles.slice(0, 75),
  sourceCommands: [
    "git status --short",
    "git diff --name-status",
    "git diff --cached --name-status",
    "git ls-files --others --exclude-standard",
    "git rev-parse --abbrev-ref HEAD",
    "git rev-parse --abbrev-ref --symbolic-full-name @{u}",
    "git rev-parse HEAD",
  ],
  nextAction:
    "Review this local dirty worktree packet before any staging, commit, push, tag, release, or publication step.",
  boundaries: [
    "does_not_stage_commit_push_tag_release",
    "does_not_publish",
    "does_not_prove_remote_freshness",
    "does_not_close_strict_sync",
  ],
  allowedClaim:
    "Mimesis has a local worktree review packet that inventories dirty worktree evidence; it is not publication.",
  disallowedClaim:
    "The worktree review packet does not close strict sync, prove remote freshness, stage files, commit, push, tag, release, publish, choose a license, create external proof, or prove adoption.",
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(packet, null, 2)}\n`);

console.log(`[worktree-review-packet] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

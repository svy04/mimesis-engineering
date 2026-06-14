#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "publish-packets", "local-sync-handoff.md");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function git(args) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    return {
      ok: false,
      value: (result.stderr || result.stdout || result.error?.message || "").trim(),
    };
  }

  return {
    ok: true,
    value: result.stdout.trim(),
  };
}

function sectionList(lines) {
  if (!lines.length) {
    return "- none";
  }
  return lines.map((line) => `- \`${line.replaceAll("`", "'")}\``).join("\n");
}

const packageJson = JSON.parse(read("package.json"));
const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]).value || "unknown";
const head = git(["rev-parse", "HEAD"]).value || "unknown";
const upstreamResult = git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
const upstream = upstreamResult.ok ? upstreamResult.value : "none";
const upstreamHead = upstream !== "none" ? git(["rev-parse", upstream]).value || "unknown" : "unknown";
const remote = git(["remote", "get-url", "origin"]).value || "unknown";
const statusShort = git(["status", "--short"]).value;
const branchStatus = git(["status", "--short", "--branch"]).value || "unknown";
const diffStat = git(["diff", "--stat"]).value || "no tracked diff stat";
const statusLines = statusShort ? statusShort.split(/\r?\n/).filter(Boolean) : [];
const tracked = statusLines.filter((line) => !line.startsWith("??"));
const untracked = statusLines.filter((line) => line.startsWith("??"));
const isClean = statusLines.length === 0;
const isSameCommit = Boolean(head && upstreamHead && head === upstreamHead);
const conclusion = isClean && isSameCommit
  ? "local worktree is clean and matches upstream"
  : "local worktree is not publish-ready because it has unpublished local changes or does not match upstream";

const syncStatus = fs.existsSync(path.join(root, ".mimesis", "sync-status.md"))
  ? read(".mimesis/sync-status.md")
  : "Run npm run audit:sync to generate sync status.";

const generated = `# Mimesis Publish Handoff Packet

Generated from the current local repository state for Mimesis Engineering v${packageJson.version}.

Status: local handoff, not publication.

## Current Git Boundary

- branch: \`${branch}\`
- upstream: \`${upstream}\`
- remote: \`${remote}\`
- head: \`${head}\`
- upstream head: \`${upstreamHead}\`
- tracked changed entries: ${tracked.length}
- untracked entries: ${untracked.length}

Conclusion:
${conclusion}.

## Branch Status

\`\`\`text
${branchStatus}
\`\`\`

## Tracked Diff Stat

\`\`\`text
${diffStat}
\`\`\`

## Tracked Changes

${sectionList(tracked)}

## Untracked Entries

${sectionList(untracked)}

## Current Sync Report

${syncStatus}

## Required Owner Decisions Before Publish

1. Review the dirty worktree and decide what belongs in the public framework release.
2. Choose whether to commit locally, open a PR, or keep the work unpublished.
3. Choose a license before claiming open-source reuse readiness.
4. Confirm no secrets, private data, copied protected material, or unsupported proof claims are included.
5. Run \`npm run release:check:public\` immediately before any publish action.
6. Run \`npm run audit:sync:strict\` only after the worktree is intended to be clean and synced.

## Allowed Claim

The local repository has a generated publish handoff packet and a public preflight command.

## Disallowed Claim

This packet does not prove that the current local worktree has been committed, pushed, tagged, released, published to npm, or synchronized to GitHub.

## Boundary

This packet does not stage files, create a commit, push, tag, create a pull request, publish to npm, publish a GitHub Marketplace action, choose a license, create external proof, or prove remote freshness.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[publish-packet] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

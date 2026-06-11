#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "release-execution", "v0.1-owner-handoff.md");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

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

function sectionList(items) {
  if (!items.length) {
    return "- none";
  }
  return items.map((item) => `- \`${item.replaceAll("`", "'")}\``).join("\n");
}

const packageJson = JSON.parse(read("package.json"));
const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]) || "unknown";
const head = git(["rev-parse", "HEAD"]) || "unknown";
const upstreamResult = git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
const upstream = upstreamResult.includes("fatal") ? "none" : upstreamResult || "none";
const upstreamHead = upstream === "none" ? "unknown" : git(["rev-parse", upstream]) || "unknown";
const remote = git(["remote", "get-url", "origin"]) || "unknown";
const statusShort = git(["status", "--short"]);
const statusLines = statusShort ? statusShort.split(/\r?\n/).filter(Boolean) : [];
const tracked = statusLines.filter((line) => !line.startsWith("??"));
const untracked = statusLines.filter((line) => line.startsWith("??"));
const syncedCommit = head !== "unknown" && upstreamHead !== "unknown" && head === upstreamHead;
const cleanAndSynced = statusLines.length === 0 && syncedCommit;
const privatePackage = packageJson.private === true;
const unlicensed = packageJson.license === "UNLICENSED";

const syncStatus = fs.existsSync(path.join(root, ".mimesis", "sync-status.md"))
  ? read(".mimesis/sync-status.md")
  : "Run npm run audit:sync to generate sync status.";

const generated = `# Mimesis Release Execution Packet

Generated from the current local repository state for Mimesis Engineering v${packageJson.version}.

Status: owner release execution handoff, not release execution.

## Current Git Boundary

- branch: \`${branch}\`
- upstream: \`${upstream}\`
- remote: \`${remote}\`
- head: \`${head}\`
- upstream head: \`${upstreamHead}\`
- dirty worktree entries: ${statusLines.length}
- tracked changed entries: ${tracked.length}
- untracked entries: ${untracked.length}
- clean and synced: ${cleanAndSynced ? "yes" : "no"}
- package private: ${privatePackage ? "yes" : "no"}
- package license: \`${packageJson.license ?? "none"}\`

Conclusion:
${cleanAndSynced && !privatePackage && !unlicensed
  ? "The local git and package metadata gates look closer to publish execution, but owner proof gates still apply."
  : "This local checkout is not publish-ready because at least one owner, sync, package, or license gate remains open."}

## Changed Entries

Tracked:

${sectionList(tracked)}

Untracked:

${sectionList(untracked)}

## Required Preflight

Run these before any owner-controlled release action:

\`\`\`bash
npm run release:check:public
npm run audit:sync:strict
npm run audit:secrets
npm run audit:license
npm run audit:package
npm run audit:action
\`\`\`

## Owner Decisions

1. Decide whether this local work belongs in the public v0.1 framework release.
2. Choose a license or preserve the current no-reuse boundary.
3. Decide whether \`package.json private\` should remain true.
4. Decide whether npm publication is in scope.
5. Decide whether a tagged GitHub Action release or Marketplace listing is in scope.
6. Decide whether external proof, benchmark, or adoption claims are excluded from this release copy.

## Release Sequence

This is the safe order for an owner-controlled release:

1. Review \`docs/LICENSE-PACKET.md\` and choose or defer the license.
2. Run \`npm run release:check:public\`.
3. Generate and review \`.mimesis/release-decisions/owner-decision-record.json\`.
4. Resolve all intentional local changes into a reviewed commit or PR.
5. Run \`npm run audit:sync:strict\` only after the worktree should be clean and synced.
6. Review \`docs/PUBLISH-HANDOFF-PACKET.md\`.
7. Review \`docs/PACKAGE-RELEASE-CANDIDATE.md\` before any npm action.
8. Review \`docs/ACTION-RELEASE-CANDIDATE.md\` before any tag or Marketplace claim.
9. Publish only from owner-controlled accounts and only after evidence packets support any stronger claims.

## Publication Gates

| Gate | Current Signal | Required Before Claim |
| --- | --- | --- |
| public preflight | \`npm run release:check:public\` is available | fresh passing run |
| strict sync | clean and synced: ${cleanAndSynced ? "yes" : "no"} | \`npm run audit:sync:strict\` passes |
| license | \`${packageJson.license ?? "none"}\` | owner-selected license or explicit no-reuse boundary |
| npm package | private: ${privatePackage ? "true" : "false"} | owner changes package metadata and publishes from owner account |
| GitHub Action | root \`action.yml\` candidate exists | tag/release or Marketplace evidence |
| external proof | no completed permissioned external proof in current completion matrix | reviewed evidence packet |

## Current Sync Report

${syncStatus}

## Allowed Claim

The repository has a generated owner release execution handoff and public preflight path.

## Disallowed Claim

This packet does not prove that the repository has been committed, pushed, tagged, released, published to npm, published as a GitHub Marketplace action, licensed for reuse, externally adopted, benchmarked, or synchronized to the public remote.

## Boundary

This packet does not publish, does not stage files, does not create a commit, does not push, does not create a tag, does not create a release, does not publish to npm, does not publish a GitHub Marketplace action, does not choose a license, and does not create external proof.

Reference documents:

- \`docs/LICENSE-PACKET.md\`
- \`docs/RELEASE-DECISION-RECORD.md\`
- \`docs/PUBLISH-HANDOFF-PACKET.md\`
- \`docs/PUBLISH-SYNC-GATE.md\`
- \`docs/PACKAGE-RELEASE-CANDIDATE.md\`
- \`docs/ACTION-RELEASE-CANDIDATE.md\`
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[release-execution-packet] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

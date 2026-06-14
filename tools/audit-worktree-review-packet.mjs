#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
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

function readJson(relativePath) {
  const content = read(relativePath);
  if (!content) {
    return {};
  }
  try {
    return JSON.parse(content);
  } catch (error) {
    failures.push(`${relativePath} is not valid JSON: ${error.message}`);
    return {};
  }
}

function gitLines(args) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    failures.push(`git ${args.join(" ")} failed: ${result.stderr || result.stdout || result.error?.message}`);
    return [];
  }
  return result.stdout.split(/\r?\n/).filter(Boolean);
}

const packageJson = readJson("package.json");
const packet = readJson(".mimesis/worktree/review-packet.json");
const schema = readJson("spec/worktree-review-packet.schema.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/WORKTREE-REVIEW-PACKET.md");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const specReadme = read("spec/README.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const releaseOrder = read("docs/RELEASE-CHECK-ORDER.md");
const releaseCheck = packageJson.scripts?.["release:check"] ?? "";

if (packageJson.scripts?.["worktree:packet"] !== "node tools/create-worktree-review-packet.mjs") {
  failures.push("package.json missing script: worktree:packet");
}

if (packageJson.scripts?.["audit:worktree-packet"] !== "node tools/audit-worktree-review-packet.mjs") {
  failures.push("package.json missing script: audit:worktree-packet");
}

if (!releaseCheck.includes("worktree:packet")) {
  failures.push("release:check must include npm run worktree:packet");
}

if (!releaseCheck.includes("audit:worktree-packet")) {
  failures.push("release:check must include npm run audit:worktree-packet");
}

if (!cli.includes('"worktree:packet"')) {
  failures.push("CLI missing worktree:packet command");
}

if (!cli.includes('"audit:worktree-packet"')) {
  failures.push("CLI missing audit:worktree-packet command");
}

for (const [name, content] of [
  ["docs/WORKTREE-REVIEW-PACKET.md", doc],
  ["README.md", readme],
  ["tools/README.md", toolsReadme],
  ["STATUS.md", status],
  ["ROADMAP.md", roadmap],
  ["docs/COMPLETION-AUDIT.md", completion],
  ["docs/V0.1-RELEASE-PACKET.md", releasePacket],
  ["docs/RELEASE-CHECK-ORDER.md", releaseOrder],
]) {
  for (const text of ["worktree review packet", "worktree:packet", "audit:worktree-packet"]) {
    if (!content.toLowerCase().includes(text.toLowerCase())) {
      failures.push(`${name} missing worktree packet text: ${text}`);
    }
  }
}

for (const text of [
  "does not stage",
  "does not commit",
  "does not push",
  "does not publish",
  "does not close strict sync",
  "does not prove remote freshness",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`worktree review packet doc missing boundary text: ${text}`);
  }
}

if (!specReadme.includes("worktree-review-packet.schema.json")) {
  failures.push("spec README must index worktree-review-packet schema");
}

if (schema?.title !== "Mimesis Worktree Review Packet") {
  failures.push("worktree-review-packet schema must have the expected title");
}

if (packet.schema !== "mimesis.worktree-review-packet.v0.1") {
  failures.push("worktree review packet must use schema mimesis.worktree-review-packet.v0.1");
}

if (packet.status !== "dirty_worktree_review_packet_not_publication") {
  failures.push("worktree review packet status must be dirty_worktree_review_packet_not_publication");
}

if (packet.completionAllowed !== false) {
  failures.push("worktree review packet must keep completionAllowed false");
}

const statusLines = gitLines(["status", "--short"]);
const trackedChanged = statusLines.filter((line) => !line.startsWith("??"));
const untracked = statusLines.filter((line) => line.startsWith("??"));
const trackedStatusPaths = trackedChanged.map((line) => {
  const match = line.match(/^(.{1,2})\s+(.*)$/);
  const rawPath = match ? match[2] : line.slice(3);
  const pathPart = rawPath.includes(" -> ") ? rawPath.split(" -> ").pop().trim() : rawPath.trim();
  return pathPart.replaceAll("\\", "/");
});

if (packet.git?.dirty !== (statusLines.length > 0)) {
  failures.push("worktree review packet dirty flag must match git status --short");
}

if (packet.git?.trackedChangedCount !== trackedChanged.length) {
  failures.push("worktree review packet trackedChangedCount must match git status --short");
}

if (packet.git?.untrackedCount !== untracked.length) {
  failures.push("worktree review packet untrackedCount must match git status --short");
}

const changedPaths = new Set((packet.trackedChanges ?? []).map((entry) => entry.path));
for (const requiredPath of trackedStatusPaths) {
  if (!changedPaths.has(requiredPath)) {
    failures.push(`worktree review packet missing tracked status path: ${requiredPath}`);
  }
}

if (!Array.isArray(packet.trackedStatusLines) || packet.trackedStatusLines.length !== trackedChanged.length) {
  failures.push("worktree review packet trackedStatusLines must match git status --short tracked entries");
}

if (!Array.isArray(packet.stagedChanges)) {
  failures.push("worktree review packet must include stagedChanges");
}

if (!Array.isArray(packet.unstagedChanges)) {
  failures.push("worktree review packet must include unstagedChanges");
}

if (!Array.isArray(packet.untrackedRoots)) {
  failures.push("worktree review packet must include untrackedRoots");
} else if (untracked.length > 0 && packet.untrackedRoots.length === 0) {
  failures.push("worktree review packet must include untrackedRoots when untracked files exist");
} else if (untracked.length === 0 && packet.untrackedRoots.length !== 0) {
  failures.push("worktree review packet untrackedRoots must be empty when no untracked files exist");
}

if (!Array.isArray(packet.untrackedFilesSample)) {
  failures.push("worktree review packet must include untrackedFilesSample");
} else if (untracked.length > 0 && packet.untrackedFilesSample.length === 0) {
  failures.push("worktree review packet must include untrackedFilesSample when untracked files exist");
} else if (untracked.length === 0 && packet.untrackedFilesSample.length !== 0) {
  failures.push("worktree review packet untrackedFilesSample must be empty when no untracked files exist");
}

for (const boundary of [
  "does_not_stage_commit_push_tag_release",
  "does_not_publish",
  "does_not_prove_remote_freshness",
  "does_not_close_strict_sync",
]) {
  if (!packet.boundaries?.includes(boundary)) {
    failures.push(`worktree review packet missing boundary: ${boundary}`);
  }
}

if (!/local dirty worktree/i.test(packet.reviewScope ?? "")) {
  failures.push("worktree review packet reviewScope must name the local dirty worktree");
}

if (!/does not close strict sync/i.test(packet.disallowedClaim ?? "")) {
  failures.push("worktree review packet disallowedClaim must keep strict sync boundary");
}

if (!/not publication/i.test(packet.allowedClaim ?? "")) {
  failures.push("worktree review packet allowedClaim must keep not-publication wording");
}

if (failures.length) {
  console.error("\nMimesis worktree review packet audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis worktree review packet audit passed: local dirty worktree review is inventoried without publishing or closing sync.");

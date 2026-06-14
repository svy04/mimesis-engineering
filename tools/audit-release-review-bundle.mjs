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

function parseStatusPath(line) {
  const rawPath = line.slice(3).trim();
  const pathPart = rawPath.includes(" -> ") ? rawPath.split(" -> ").pop().trim() : rawPath;
  return pathPart.replaceAll("\\", "/");
}

const packageJson = readJson("package.json");
const bundle = readJson(".mimesis/release-review/v0.1-bundle.json");
const worktreePacket = readJson(".mimesis/worktree/review-packet.json");
const schema = readJson("spec/release-review-bundle.schema.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/RELEASE-REVIEW-BUNDLE.md");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const specReadme = read("spec/README.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const releaseOrder = read("docs/RELEASE-CHECK-ORDER.md");
const releaseCheck = packageJson.scripts?.["release:check"] ?? "";

if (packageJson.scripts?.["release:review-bundle"] !== "node tools/create-release-review-bundle.mjs") {
  failures.push("package.json missing script: release:review-bundle");
}

if (packageJson.scripts?.["audit:release-review-bundle"] !== "node tools/audit-release-review-bundle.mjs") {
  failures.push("package.json missing script: audit:release-review-bundle");
}

if (!releaseCheck.includes("release:review-bundle")) {
  failures.push("release:check must include npm run release:review-bundle");
}

if (!releaseCheck.includes("audit:release-review-bundle")) {
  failures.push("release:check must include npm run audit:release-review-bundle");
}

if (!cli.includes('"release:review-bundle"')) {
  failures.push("CLI missing release:review-bundle command");
}

if (!cli.includes('"audit:release-review-bundle"')) {
  failures.push("CLI missing audit:release-review-bundle command");
}

for (const [name, content] of [
  ["docs/RELEASE-REVIEW-BUNDLE.md", doc],
  ["README.md", readme],
  ["tools/README.md", toolsReadme],
  ["STATUS.md", status],
  ["ROADMAP.md", roadmap],
  ["docs/COMPLETION-AUDIT.md", completion],
  ["docs/V0.1-RELEASE-PACKET.md", releasePacket],
  ["docs/RELEASE-CHECK-ORDER.md", releaseOrder],
]) {
  for (const text of ["release review bundle", "release:review-bundle", "audit:release-review-bundle"]) {
    if (!content.toLowerCase().includes(text.toLowerCase())) {
      failures.push(`${name} missing release review bundle text: ${text}`);
    }
  }
}

for (const text of [
  "does not stage",
  "does not commit",
  "does not push",
  "does not publish",
  "does not choose a license",
  "does not close strict sync",
  "does not prove remote freshness",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`release review bundle doc missing boundary text: ${text}`);
  }
}

if (!specReadme.includes("release-review-bundle.schema.json")) {
  failures.push("spec README must index release-review-bundle schema");
}

if (schema?.title !== "Mimesis Release Review Bundle") {
  failures.push("release-review-bundle schema must have the expected title");
}

if (bundle.schema !== "mimesis.release-review-bundle.v0.1") {
  failures.push("release review bundle must use schema mimesis.release-review-bundle.v0.1");
}

if (bundle.status !== "local_release_review_bundle_not_commit") {
  failures.push("release review bundle status must be local_release_review_bundle_not_commit");
}

if (bundle.completionAllowed !== false) {
  failures.push("release review bundle must keep completionAllowed false");
}

for (const sourceFile of [
  ".mimesis/worktree/review-packet.json",
  ".mimesis/state/current-state.json",
  ".mimesis/gaps/current-gap-register.json",
  ".mimesis/release-evidence/v0.1-report.md",
]) {
  if (!bundle.sourceFiles?.includes(sourceFile)) {
    failures.push(`release review bundle missing source file: ${sourceFile}`);
  }
}

const statusLines = gitLines(["status", "--short"]);
const trackedChanged = statusLines.filter((line) => !line.startsWith("??"));
const untracked = statusLines.filter((line) => line.startsWith("??"));
const trackedStatusPaths = trackedChanged.map(parseStatusPath);

if (bundle.git?.trackedChangedCount !== trackedChanged.length) {
  failures.push("release review bundle trackedChangedCount must match git status --short");
}

if (bundle.git?.untrackedCount !== untracked.length) {
  failures.push("release review bundle untrackedCount must match git status --short");
}

if (bundle.git?.trackedChangedCount !== worktreePacket.git?.trackedChangedCount) {
  failures.push("release review bundle trackedChangedCount must match worktree packet");
}

if (bundle.git?.untrackedCount !== worktreePacket.git?.untrackedCount) {
  failures.push("release review bundle untrackedCount must match worktree packet");
}

const trackedPaths = new Set(bundle.trackedChangedPaths ?? []);
for (const trackedPath of trackedStatusPaths) {
  if (!trackedPaths.has(trackedPath)) {
    failures.push(`release review bundle missing current tracked path: ${trackedPath}`);
  }
}

const groupNames = new Set((bundle.reviewGroups ?? []).map((entry) => entry.name));
for (const groupName of [
  "tracked core edits",
  "generated protocol artifacts",
  "public documentation",
  "tooling and cli",
  "spec and schemas",
]) {
  if (!groupNames.has(groupName)) {
    failures.push(`release review bundle missing review group: ${groupName}`);
  }
}

if (!Array.isArray(bundle.requiredReviewSequence) || bundle.requiredReviewSequence.length < 5) {
  failures.push("release review bundle must include requiredReviewSequence");
}

for (const boundary of [
  "does_not_stage_commit_push_tag_release",
  "does_not_publish",
  "does_not_choose_license",
  "does_not_prove_remote_freshness",
  "does_not_close_strict_sync",
]) {
  if (!bundle.boundaries?.includes(boundary)) {
    failures.push(`release review bundle missing boundary: ${boundary}`);
  }
}

if (!/not commit/i.test(bundle.allowedClaim ?? "")) {
  failures.push("release review bundle allowedClaim must keep not-commit wording");
}

if (!/does not close strict sync/i.test(bundle.disallowedClaim ?? "")) {
  failures.push("release review bundle disallowedClaim must keep strict sync boundary");
}

if (failures.length) {
  console.error("\nMimesis release review bundle audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis release review bundle audit passed: local release review scope is classified without committing or publishing.");

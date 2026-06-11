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
const doc = read("docs/EVIDENCE-REVIEW.md");
const completionAudit = read("docs/COMPLETION-AUDIT.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");

for (const relativePath of [
  "tools/review-evidence-packet.mjs",
  "tools/audit-evidence-review.mjs",
  "docs/EVIDENCE-REVIEW.md",
]) {
  read(relativePath);
}

for (const scriptName of ["evidence:review", "audit:evidence-review"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:evidence-review")) {
  failures.push("release:check must include npm run audit:evidence-review");
}

for (const command of ["evidence:review", "audit:evidence-review"]) {
  if (!cli.includes(`"${command}"`)) {
    failures.push(`CLI missing ${command} command`);
  }
}

for (const text of [
  "reviewed evidence packet",
  "reviewer",
  "review note",
  "does not create evidence",
  "does not prove external adoption",
]) {
  if (!`${doc}\n${completionAudit}\n${releasePacket}`.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`evidence-review docs missing text: ${text}`);
  }
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-evidence-review-"));

function runReview(packetPath, extraArgs = []) {
  return spawnSync(process.execPath, [
    path.join(root, "tools", "review-evidence-packet.mjs"),
    packetPath,
    ...extraArgs,
  ], {
    cwd: tempRoot,
    encoding: "utf8",
  });
}

function runCheck(packetPath, extraArgs = []) {
  return spawnSync(process.execPath, [
    path.join(root, "tools", "check-evidence-packet.mjs"),
    packetPath,
    ...extraArgs,
  ], {
    cwd: tempRoot,
    encoding: "utf8",
  });
}

try {
  const draftSource = path.join(root, ".mimesis", "evidence-packets", "local-case-draft.md");
  const draftPath = path.join(tempRoot, "draft.md");
  fs.copyFileSync(draftSource, draftPath);

  const reviewedPath = path.join(tempRoot, "reviewed.md");
  const reviewed = runReview(draftPath, [
    "--decision",
    "reviewed",
    "--reviewer",
    "Local Reviewer",
    "--note",
    "Reviewed local case evidence against the proof boundary.",
    "--out",
    reviewedPath,
  ]);

  if (reviewed.status !== 0) {
    failures.push(`evidence:review reviewed smoke failed: ${reviewed.stderr || reviewed.stdout}`);
  }

  if (!fs.existsSync(reviewedPath)) {
    failures.push("evidence:review must write reviewed packet when --out is provided");
  }

  const reviewedContent = fs.existsSync(reviewedPath) ? fs.readFileSync(reviewedPath, "utf8") : "";
  for (const text of [
    "Status: reviewed.",
    "## Review Decision",
    "reviewed.",
    "Reviewer: Local Reviewer",
    "Review Note: Reviewed local case evidence against the proof boundary.",
    "does not create evidence",
  ]) {
    if (!reviewedContent.includes(text)) {
      failures.push(`reviewed evidence packet missing text: ${text}`);
    }
  }

  const reviewedCheck = runCheck(reviewedPath, ["--require-reviewed"]);
  if (reviewedCheck.status !== 0) {
    failures.push(`reviewed packet should pass --require-reviewed: ${reviewedCheck.stderr || reviewedCheck.stdout}`);
  }

  const missingReviewer = runReview(draftPath, [
    "--decision",
    "reviewed",
    "--note",
    "Missing reviewer should fail.",
    "--out",
    path.join(tempRoot, "missing-reviewer.md"),
  ]);
  if (missingReviewer.status === 0) {
    failures.push("evidence:review must reject reviewed decisions without reviewer");
  }

  const rejectedPath = path.join(tempRoot, "rejected.md");
  const rejected = runReview(draftPath, [
    "--decision",
    "rejected",
    "--reviewer",
    "Local Reviewer",
    "--note",
    "The evidence packet is not ready for reviewed claims.",
    "--out",
    rejectedPath,
  ]);

  if (rejected.status !== 0) {
    failures.push(`evidence:review rejected smoke failed: ${rejected.stderr || rejected.stdout}`);
  }

  const rejectedCheck = runCheck(rejectedPath, ["--require-reviewed"]);
  if (rejectedCheck.status === 0) {
    failures.push("rejected evidence packet must fail --require-reviewed");
  }
} finally {
  if (tempRoot.startsWith(os.tmpdir())) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

if (failures.length) {
  console.error("\nMimesis evidence-review audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis evidence-review audit passed: draft evidence can be reviewed without creating proof.");

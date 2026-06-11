#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "state", "current-state.json");

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
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

function statusLines() {
  const status = git(["status", "--short"]);
  return status ? status.split(/\r?\n/).filter(Boolean) : [];
}

const packageJson = readJson("package.json");
const gapRegister = readJson(".mimesis/gaps/current-gap-register.json");
const closurePlan = readJson(".mimesis/gaps/closure-plan.json");
const status = statusLines();
const trackedChanged = status.filter((line) => !line.startsWith("??"));
const untracked = status.filter((line) => line.startsWith("??"));
const upstreamResult = git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
const upstream = upstreamResult.includes("fatal") ? "none" : upstreamResult || "none";

const countsByStatus = {};
for (const gap of gapRegister.gaps ?? []) {
  countsByStatus[gap.status] = (countsByStatus[gap.status] ?? 0) + 1;
}

const closureById = new Map((closurePlan.steps ?? []).map((step) => [step.id, step]));

const summary = {
  schema: "mimesis.current-state-summary.v0.1",
  snapshotKind: "generated_local_state_snapshot",
  status: gapRegister.status ?? "open_gates_remain",
  generatedAt: new Date().toISOString(),
  package: {
    name: packageJson.name,
    version: packageJson.version,
    private: packageJson.private === true,
    license: packageJson.license ?? "none",
  },
  git: {
    branch: git(["rev-parse", "--abbrev-ref", "HEAD"]) || "unknown",
    upstream,
    head: git(["rev-parse", "HEAD"]) || "unknown",
    dirty: status.length > 0,
    trackedChangedCount: trackedChanged.length,
    untrackedCount: untracked.length,
    freshness: "generation_time_only",
    committedSnapshotCanGoStale: true,
    liveVerificationCommand: "npm run audit:sync:strict",
  },
  completionAllowed: false,
  gapCount: gapRegister.gapCount ?? gapRegister.gaps?.length ?? 0,
  counts: {
    byStatus: countsByStatus,
    blocked: countsByStatus.blocked ?? 0,
    pendingOwner: countsByStatus.pending_owner ?? 0,
    waitingForArtifact: countsByStatus.waiting_for_artifact ?? 0,
    waitingForEvidence: countsByStatus.waiting_for_evidence ?? 0,
  },
  gates: (gapRegister.gaps ?? []).map((gap) => {
    const closure = closureById.get(gap.id);
    return {
      id: gap.id,
      title: gap.title,
      kind: gap.kind,
      status: gap.status,
      closureType: closure?.closureType ?? "unknown",
      requiredEvidence: gap.requiredEvidence ?? [],
      nextAction: gap.nextAction,
      firstCommand: closure?.commands?.[0] ?? "see gap closure plan",
      stopConditions: closure?.stopConditions ?? [],
      boundary: gap.boundary,
    };
  }),
  nextBestActions: (gapRegister.gaps ?? []).slice(0, 3).map((gap) => ({
    id: gap.id,
    nextAction: gap.nextAction,
    boundary: gap.boundary,
  })),
  sourceFiles: [
    ".mimesis/gaps/current-gap-register.json",
    ".mimesis/gaps/closure-plan.json",
    ".mimesis/gates/current-gateboard.md",
    ".mimesis/owner-actions/current-action-queue.md",
    ".mimesis/release-evidence/v0.1-report.md",
  ],
  boundaries: [
    "does_not_close_gates",
    "does_not_prove_completion",
    "does_not_publish",
    "does_not_stage_commit_push_tag_release",
    "does_not_choose_license",
    "does_not_create_external_proof",
    "does_not_prove_adoption",
  ],
  allowedClaim:
    "Mimesis has a local current state summary that is a generation-time snapshot, not proof; it summarizes open gates and next actions from existing local packets.",
  disallowedClaim:
    "The current state summary is not live git freshness proof; committed snapshots can go stale and live sync requires npm run audit:sync:strict. It does not close gates, prove completion, publish, choose a license, create external proof, prove adoption, prove benchmarked productivity, or prove shipped-plugin status.",
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`);

console.log(`[current-state-summary] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

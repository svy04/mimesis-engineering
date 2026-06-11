#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "release-review", "v0.1-bundle.json");

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

function lines(text) {
  return text ? text.split(/\r?\n/).filter(Boolean) : [];
}

function parseStatusPath(line) {
  const match = line.match(/^(.{1,2})\s+(.*)$/);
  const rawPath = match ? match[2].trim() : line.slice(3).trim();
  const pathPart = rawPath.includes(" -> ") ? rawPath.split(" -> ").pop().trim() : rawPath;
  return pathPart.replaceAll("\\", "/");
}

function groupFiles(name, files, note) {
  const sorted = [...new Set(files)].sort((left, right) => left.localeCompare(right));
  return {
    name,
    count: sorted.length,
    sample: sorted.slice(0, 30),
    note,
  };
}

function isPublicDoc(filePath) {
  return (
    filePath === "README.md" ||
    filePath === "STATUS.md" ||
    filePath === "ROADMAP.md" ||
    filePath === "CHANGELOG.md" ||
    filePath === "CONTRIBUTING.md" ||
    filePath === "SECURITY.md" ||
    filePath === "LICENSE.md" ||
    filePath.startsWith("docs/") ||
    filePath.startsWith("cases/") ||
    filePath.startsWith("examples/") ||
    filePath.startsWith("prompts/")
  );
}

function isTooling(filePath) {
  return (
    filePath === "package.json" ||
    filePath === "action.yml" ||
    filePath.startsWith("tools/") ||
    filePath.startsWith("bin/") ||
    filePath.startsWith(".github/") ||
    filePath.startsWith("plugins/") ||
    filePath.startsWith("adapters/")
  );
}

function isSpec(filePath) {
  return filePath.startsWith("spec/") || filePath.startsWith("templates/") || filePath.startsWith("reference-packs/");
}

const worktreePacket = readJson(".mimesis/worktree/review-packet.json");
const currentState = readJson(".mimesis/state/current-state.json");
const gapRegister = readJson(".mimesis/gaps/current-gap-register.json");
const releaseEvidenceReport = readText(".mimesis/release-evidence/v0.1-report.md");
const statusLines = lines(git(["status", "--short"]));
const trackedStatusLines = statusLines.filter((line) => !line.startsWith("??"));
const untrackedFiles = lines(git(["ls-files", "--others", "--exclude-standard"])).map((entry) =>
  entry.replaceAll("\\", "/"),
);
const trackedChangedPaths = trackedStatusLines.map(parseStatusPath);
const changedPaths = [...trackedChangedPaths, ...untrackedFiles];

const generatedProtocolArtifacts = changedPaths.filter((filePath) => filePath.startsWith(".mimesis/"));
const publicDocumentation = changedPaths.filter(isPublicDoc);
const toolingAndCli = changedPaths.filter(isTooling);
const specsAndSchemas = changedPaths.filter(isSpec);
const trackedCoreEdits = trackedChangedPaths.filter((filePath) =>
  ["FRAMEWORK.md", "GLOSSARY.md", "MANIFESTO.md", "PROOF-BOUNDARY.md", "README.md"].includes(filePath),
);

const bundle = {
  schema: "mimesis.release-review-bundle.v0.1",
  status: "local_release_review_bundle_not_commit",
  generatedAt: new Date().toISOString(),
  completionAllowed: false,
  package: currentState.package,
  git: {
    branch: worktreePacket.git?.branch ?? git(["rev-parse", "--abbrev-ref", "HEAD"]) ?? "unknown",
    upstream: worktreePacket.git?.upstream ?? "unknown",
    head: worktreePacket.git?.head ?? git(["rev-parse", "HEAD"]) ?? "unknown",
    dirty: statusLines.length > 0,
    trackedChangedCount: statusLines.filter((line) => !line.startsWith("??")).length,
    untrackedCount: statusLines.filter((line) => line.startsWith("??")).length,
  },
  sourceFiles: [
    ".mimesis/worktree/review-packet.json",
    ".mimesis/state/current-state.json",
    ".mimesis/gaps/current-gap-register.json",
    ".mimesis/release-evidence/v0.1-report.md",
  ],
  trackedChangedPaths,
  reviewGroups: [
    groupFiles("tracked core edits", trackedCoreEdits, "Tracked root-framework files that need human review."),
    groupFiles("generated protocol artifacts", generatedProtocolArtifacts, "Generated .mimesis packets and reports."),
    groupFiles("public documentation", publicDocumentation, "Public-facing docs, examples, cases, and status pages."),
    groupFiles("tooling and cli", toolingAndCli, "Scripts, CLI, actions, adapters, and plugin scaffolds."),
    groupFiles("spec and schemas", specsAndSchemas, "Spec contracts, templates, and reference packs."),
  ],
  requiredReviewSequence: [
    "Read .mimesis/worktree/review-packet.json for dirty worktree scope.",
    "Review public documentation claims before staging anything.",
    "Run npm run audit:secrets and inspect .mimesis/security/secret-safety-report.md.",
    "Run npm run release:check and keep all proof boundaries green.",
    "Owner decides whether to stage, commit, push, tag, release, publish, or keep changes local.",
    "Run npm run audit:sync:strict only after the intended worktree is clean and synced.",
  ],
  openGateSummary: {
    status: currentState.status,
    gapCount: gapRegister.gapCount,
    topNextActions: currentState.nextBestActions ?? [],
  },
  releaseEvidenceBoundary: releaseEvidenceReport.includes("does not publish")
    ? "release evidence report keeps publication boundary visible"
    : "release evidence report requires review",
  boundaries: [
    "does_not_stage_commit_push_tag_release",
    "does_not_publish",
    "does_not_choose_license",
    "does_not_prove_remote_freshness",
    "does_not_close_strict_sync",
    "does_not_create_external_proof",
    "does_not_prove_adoption",
  ],
  allowedClaim:
    "Mimesis has a local release review bundle that classifies dirty worktree review scope; it is not commit, push, tag, release, or publication.",
  disallowedClaim:
    "The release review bundle does not close strict sync, prove remote freshness, stage files, commit, push, tag, release, publish, choose a license, create external proof, or prove adoption.",
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(bundle, null, 2)}\n`);

console.log(`[release-review-bundle] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flags = new Map();
const repository = "svy04/mimesis-engineering";
const sourceQueue = ".mimesis/owner-actions/v0.2-issue-queue.md";

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (!arg.startsWith("--")) {
    continue;
  }
  const key = arg.slice(2);
  const next = args[index + 1];
  if (next && !next.startsWith("--")) {
    flags.set(key, next);
    index += 1;
  } else {
    flags.set(key, true);
  }
}

const outputPath = path.resolve(root, String(flags.get("output") || ".mimesis/owner-actions/remote-issue-sync.json"));
const reportPath = path.resolve(root, String(flags.get("report") || ".mimesis/owner-actions/remote-issue-sync.md"));
const issueListJsonPath = flags.has("issue-list-json")
  ? path.resolve(root, String(flags.get("issue-list-json")))
  : "";

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function repoRelative(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, "/");
}

function labelForGap(gap) {
  const common = ["mimesis-v0.2", "mimesis-gap"];

  if (gap.kind === "owner_decision" || gap.kind === "git_sync") {
    return ["mimesis-owner-gate", ...common];
  }

  if (gap.kind === "external_artifact" || gap.kind === "proof_case") {
    return ["mimesis-proof-gate", ...common];
  }

  if (gap.kind === "publication" || gap.kind === "integration") {
    return ["mimesis-publication-gate", ...common];
  }

  if (gap.kind === "measurement" || gap.kind === "adoption") {
    return ["mimesis-measurement-gate", ...common];
  }

  return ["mimesis-owner-gate", ...common];
}

function issueTitle(gap) {
  return `[Mimesis v0.2 gate] ${gap.title}`;
}

function normalizeIssue(issue) {
  const labels = (issue.labels ?? [])
    .map((label) => (typeof label === "string" ? label : label.name))
    .filter(Boolean)
    .sort();

  return {
    number: Number(issue.number),
    title: String(issue.title || ""),
    state: String(issue.state || "UNKNOWN"),
    url: String(issue.url || ""),
    labels,
    createdAt: issue.createdAt ? String(issue.createdAt) : "",
    updatedAt: issue.updatedAt ? String(issue.updatedAt) : "",
  };
}

function fetchIssues() {
  if (issueListJsonPath) {
    return {
      issues: JSON.parse(fs.readFileSync(issueListJsonPath, "utf8")).map(normalizeIssue),
      fetchError: "",
      source: repoRelative(issueListJsonPath),
    };
  }

  const result = spawnSync(
    "gh",
    [
      "issue",
      "list",
      "--repo",
      repository,
      "--state",
      "all",
      "--limit",
      "100",
      "--json",
      "number,title,state,url,labels,createdAt,updatedAt",
    ],
    {
      cwd: root,
      encoding: "utf8",
      windowsHide: true,
    },
  );

  if (result.status !== 0) {
    return {
      issues: [],
      fetchError: (result.stderr || result.stdout || result.error?.message || "unknown gh issue list failure").trim(),
      source: "gh issue list --repo svy04/mimesis-engineering",
    };
  }

  return {
    issues: JSON.parse(result.stdout).map(normalizeIssue),
    fetchError: "",
    source: "gh issue list --repo svy04/mimesis-engineering",
  };
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value);
}

function tableRows(matches) {
  return matches
    .map((entry) => {
      const remote = entry.remoteIssue
        ? `#${entry.remoteIssue.number} ${entry.remoteIssue.state} ${entry.remoteIssue.url}`
        : "missing";
      return `| \`${entry.gapId}\` | ${entry.expectedTitle} | ${entry.remoteState} (not proof) | ${remote} | ${entry.labels.join("<br>")} |`;
    })
    .join("\n");
}

function missingRows(matches) {
  const missing = matches.filter((entry) => entry.remoteState === "missing");
  if (missing.length === 0) {
    return "- No missing gate issues in this read-only snapshot.";
  }
  return missing.map((entry) => `- \`${entry.gapId}\`: ${entry.expectedTitle} (not proof)`).join("\n");
}

function existingRows(issues) {
  if (issues.length === 0) {
    return "- No existing non-gate issues were returned by the remote read.";
  }
  return issues
    .map((issue) => `- #${issue.number} ${issue.state}: ${issue.title} (${issue.url})`)
    .join("\n");
}

function buildReport(snapshot) {
  return `# Mimesis Owner Issue Remote Sync

Status: read-only remote issue sync snapshot, not remote issue creation.

This report compares the local owner issue queue against live GitHub issue metadata. It does not create GitHub issues and does not store issue bodies.

## Source Packets

- ${snapshot.sourceQueue}
- .mimesis/gaps/current-gap-register.json
- remote source: ${snapshot.remoteSource}
- repository: ${snapshot.repository}
- fetch error: ${snapshot.fetchError || "none"}

## Remote Issue Match Table

| Gap ID | Expected Remote Title | Remote State | Remote Issue | Labels |
| --- | --- | --- | --- | --- |
${tableRows(snapshot.matches)}

## Missing Gate Issues

${missingRows(snapshot.matches)}

## Existing Non-Gate Issues

${existingRows(snapshot.existingNonGateIssues)}

## Allowed Claim

${snapshot.allowedClaim}

## Disallowed Claim

${snapshot.disallowedClaim}

## Boundary

This snapshot is read-only.
It does not create GitHub issues.
It does not close gates.
It does not choose a license.
It does not collect an artifact.
It does not grant permission.
It does not create external proof.
It does not prove adoption.
It does not prove benchmark results.
It does not publish, tag, stage, commit, or push.
`;
}

const packageJson = readJson("package.json");
const gapRegister = readJson(".mimesis/gaps/current-gap-register.json");
const queuePresent = fs.existsSync(path.join(root, sourceQueue));
const { issues, fetchError, source } = fetchIssues();
const issuesByTitle = new Map(issues.map((issue) => [issue.title, issue]));
const expectedTitles = new Set();
const gaps = Array.isArray(gapRegister.gaps) ? gapRegister.gaps : [];

const matches = gaps.map((gap) => {
  const expectedTitle = issueTitle(gap);
  expectedTitles.add(expectedTitle);
  const issue = issuesByTitle.get(expectedTitle);
  return {
    gapId: gap.id,
    title: gap.title,
    kind: gap.kind,
    gateStatus: gap.status,
    expectedTitle,
    labels: labelForGap(gap),
    remoteState: issue ? "matched" : "missing",
    remoteIssue: issue ?? null,
    nextAction: gap.nextAction,
  };
});

const existingNonGateIssues = issues.filter((issue) => !expectedTitles.has(issue.title));
const matchedGateCount = matches.filter((entry) => entry.remoteState === "matched").length;
const missingGateCount = matches.length - matchedGateCount;
const status = fetchError
  ? "remote_unavailable"
  : matchedGateCount === matches.length
    ? "remote_gate_issues_matched"
    : matchedGateCount === 0
      ? "remote_gate_issues_missing"
      : "remote_gate_issues_partial";

const snapshot = {
  schema: "mimesis.owner-issue-remote-sync.v0.1",
  generatedAt: new Date().toISOString(),
  snapshotKind: "read_only_remote_snapshot",
  status,
  repository,
  remoteSource: source,
  sourceQueue,
  queuePresent,
  package: {
    name: packageJson.name,
    version: packageJson.version,
    private: packageJson.private === true,
    license: packageJson.license ?? "none",
  },
  requiredGateCount: matches.length,
  matchedGateCount,
  missingGateCount,
  existingNonGateIssueCount: existingNonGateIssues.length,
  matches,
  existingNonGateIssues,
  fetchError,
  allowedClaim: "Mimesis has a read-only owner issue remote sync snapshot comparing local gate issue drafts against GitHub issue metadata.",
  disallowedClaim: "This read-only sync is not remote issue creation, not gate closure, not proof, not owner approval, not package publication, not benchmark evidence, and not adoption evidence.",
  boundaries: [
    "read_only_remote_snapshot",
    "does_not_create_github_issues",
    "does_not_store_issue_bodies",
    "does_not_close_gates",
    "does_not_choose_license",
    "does_not_collect_artifact",
    "does_not_create_external_proof",
    "does_not_prove_adoption",
  ],
};

writeJson(outputPath, snapshot);
writeText(reportPath, buildReport(snapshot));

console.log(`[owner-issue-remote-sync] ${repoRelative(outputPath)}`);
console.log(`[owner-issue-remote-sync] ${repoRelative(reportPath)}`);

#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const executeMode = args.includes("--execute");
const dryRun = !executeMode;
const repository = "svy04/mimesis-engineering";
const sourceQueue = ".mimesis/owner-actions/v0.2-issue-queue.md";
const outputPath = path.join(root, ".mimesis", "owner-actions", "remote-issue-create.json");
const reportPath = path.join(root, ".mimesis", "owner-actions", "remote-issue-create.md");

const labelSpecs = {
  "mimesis-owner-gate": {
    color: "5319E7",
    description: "Mimesis owner decision or sync gate.",
  },
  "mimesis-proof-gate": {
    color: "0E8A16",
    description: "Mimesis proof artifact or case gate.",
  },
  "mimesis-publication-gate": {
    color: "D93F0B",
    description: "Mimesis package, action, plugin, or publication gate.",
  },
  "mimesis-measurement-gate": {
    color: "1D76DB",
    description: "Mimesis benchmark, measurement, or adoption evidence gate.",
  },
  "mimesis-v0.2": {
    color: "C5DEF5",
    description: "Mimesis v0.2 follow-up gate.",
  },
  "mimesis-gap": {
    color: "BFD4F2",
    description: "Open Mimesis gap requiring direct evidence.",
  },
};

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

function runGh(argsForGh, options = {}) {
  const result = spawnSync("gh", argsForGh, {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
  });

  if (result.status !== 0 && options.allowFailure !== true) {
    const message = (result.stderr || result.stdout || result.error?.message || "unknown gh failure").trim();
    throw new Error(`gh ${argsForGh.join(" ")} failed: ${message}`);
  }

  return {
    ok: result.status === 0,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
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
  };
}

function fetchIssues() {
  const result = runGh([
    "issue",
    "list",
    "--repo",
    repository,
    "--state",
    "all",
    "--limit",
    "100",
    "--json",
    "number,title,state,url,labels",
  ]);

  return JSON.parse(result.stdout).map(normalizeIssue);
}

function fetchLabels() {
  const result = runGh([
    "label",
    "list",
    "--repo",
    repository,
    "--limit",
    "100",
    "--json",
    "name,color,description",
  ]);

  return JSON.parse(result.stdout);
}

function bodyForGap(gap, labels, packageJson, closure) {
  const directEvidence = Array.isArray(gap.requiredEvidence) && gap.requiredEvidence.length
    ? gap.requiredEvidence.map((item) => `- ${item}`).join("\n")
    : "- Attach direct evidence before changing any claim.";
  const commands = Array.isArray(closure?.commands) && closure.commands.length
    ? closure.commands.map((item) => `- ${item}`).join("\n")
    : "- Attach direct evidence before changing any claim.";
  const stopConditions = Array.isArray(closure?.stopConditions) && closure.stopConditions.length
    ? closure.stopConditions.map((item) => `- ${item}`).join("\n")
    : "- Stop if direct evidence is missing.";

  return `## Why This Issue Exists

This issue tracks the \`${gap.id}\` gate for Mimesis Engineering v${packageJson.version}.

Current status: ${gap.status}

Owner-facing action: ${gap.nextAction}

## Direct Evidence Needed

${directEvidence}

## Suggested Local Commands

${commands}

## Stop Conditions

${stopConditions}

## Allowed Claim After Direct Evidence

${closure?.allowedClaimAfterClosure ?? "Only the directly evidenced closure can be claimed."}

## Boundary

${gap.boundary}

Remote issue creation is coordination metadata only.
It does not close gates.
It does not choose a license.
It does not collect an artifact.
It does not grant permission.
It does not create external proof.
It does not prove adoption.
It does not prove benchmark results.
It does not publish.

## Local Labels

${labels.map((label) => `- ${label}`).join("\n")}
`;
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value);
}

function resultRows(results) {
  return results
    .map((entry) => {
      const issue = entry.remoteIssue
        ? `#${entry.remoteIssue.number} ${entry.remoteIssue.state} ${entry.remoteIssue.url}`
        : "not created";
      return `| \`${entry.gapId}\` | ${entry.expectedTitle} | ${entry.remoteState} (not proof) | ${issue} | ${entry.labels.join("<br>")} |`;
    })
    .join("\n");
}

function labelRows(labelResults) {
  if (labelResults.length === 0) {
    return "- No label changes were needed or attempted.";
  }
  return labelResults
    .map((entry) => `- ${entry.name}: ${entry.remoteState}`)
    .join("\n");
}

function buildReport(report) {
  return `# Mimesis Owner Issue Remote Create

Status: ${report.executeMode ? "executed remote issue creation metadata, not gate closure." : "dry-run remote issue creation plan, not gate closure."}

This report records only remote issue and label metadata. It does not store issue bodies.

## Created Or Existing Gate Issues

| Gap ID | Expected Remote Title | Remote State | Remote Issue | Labels |
| --- | --- | --- | --- | --- |
${resultRows(report.issueResults)}

## Labels

${labelRows(report.labelResults)}

## Allowed Claim

${report.allowedClaim}

## Disallowed Claim

${report.disallowedClaim}

## Boundary

Remote issue creation is coordination only.
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
const closurePlan = readJson(".mimesis/gaps/closure-plan.json");
const closureById = new Map((closurePlan.steps ?? []).map((step) => [step.id, step]));
const gaps = Array.isArray(gapRegister.gaps) ? gapRegister.gaps : [];

let issues = fetchIssues();
let issuesByTitle = new Map(issues.map((issue) => [issue.title, issue]));
let labels = fetchLabels();
const labelNames = new Set(labels.map((label) => label.name));
const labelResults = [];

for (const labelName of Object.keys(labelSpecs)) {
  if (labelNames.has(labelName)) {
    labelResults.push({ name: labelName, remoteState: "existing" });
    continue;
  }

  if (!executeMode) {
    labelResults.push({ name: labelName, remoteState: "would_create" });
    continue;
  }

  const spec = labelSpecs[labelName];
  runGh([
    "label",
    "create",
    labelName,
    "--repo",
    repository,
    "--description",
    spec.description,
    "--color",
    spec.color,
  ]);
  labelResults.push({ name: labelName, remoteState: "created" });
}

if (executeMode) {
  labels = fetchLabels();
}

const issueResults = [];

for (const gap of gaps) {
  const expectedTitle = issueTitle(gap);
  const existing = issuesByTitle.get(expectedTitle);
  const labelsForGap = labelForGap(gap);

  if (existing) {
    issueResults.push({
      gapId: gap.id,
      expectedTitle,
      labels: labelsForGap,
      remoteState: "existing",
      remoteIssue: existing,
    });
    continue;
  }

  if (!executeMode) {
    issueResults.push({
      gapId: gap.id,
      expectedTitle,
      labels: labelsForGap,
      remoteState: "would_create",
      remoteIssue: null,
    });
    continue;
  }

  const body = bodyForGap(gap, labelsForGap, packageJson, closureById.get(gap.id));
  const createArgs = [
    "issue",
    "create",
    "--repo",
    repository,
    "--title",
    expectedTitle,
    "--body",
    body,
  ];

  for (const label of labelsForGap) {
    createArgs.push("--label", label);
  }

  const created = runGh(createArgs, { allowFailure: true });
  if (!created.ok) {
    issueResults.push({
      gapId: gap.id,
      expectedTitle,
      labels: labelsForGap,
      remoteState: "failed",
      remoteIssue: null,
      error: created.stderr || created.stdout,
    });
    continue;
  }

  issues = fetchIssues();
  issuesByTitle = new Map(issues.map((issue) => [issue.title, issue]));
  const issue = issuesByTitle.get(expectedTitle);
  issueResults.push({
    gapId: gap.id,
    expectedTitle,
    labels: labelsForGap,
    remoteState: issue ? "created" : "failed",
    remoteIssue: issue ?? null,
    error: issue ? "" : "created issue was not found by exact title after creation",
  });
}

const createdIssueCount = issueResults.filter((entry) => entry.remoteState === "created").length;
const existingMatchCount = issueResults.filter((entry) => entry.remoteState === "existing").length;
const failedIssueCount = issueResults.filter((entry) => entry.remoteState === "failed").length;
const missingAfterCreateCount = issueResults.filter((entry) => !entry.remoteIssue).length;
const labelCreatedCount = labelResults.filter((entry) => entry.remoteState === "created").length;

const status = executeMode
  ? failedIssueCount > 0 || missingAfterCreateCount > 0
    ? "remote_create_partial"
    : createdIssueCount > 0
      ? "remote_gate_issues_created"
      : "remote_gate_issues_already_present"
  : "dry_run_pending_execute";

const report = {
  schema: "mimesis.owner-issue-remote-create.v0.1",
  generatedAt: new Date().toISOString(),
  status,
  repository,
  sourceQueue,
  executeMode,
  dryRun,
  requiredGateCount: issueResults.length,
  createdIssueCount,
  existingMatchCount,
  missingAfterCreateCount,
  failedIssueCount,
  labelCreatedCount,
  labelResults,
  issueResults,
  allowedClaim: executeMode
    ? "Mimesis has remote GitHub gate issues for the current v0.2 open gates."
    : "Mimesis has a dry-run plan for creating remote GitHub gate issues.",
  disallowedClaim: "Remote issue creation is not gate closure, not proof, not owner approval, not license choice, not artifact submission, not benchmark evidence, not adoption evidence, and not publication.",
  boundaries: [
    "does_not_close_gates",
    "does_not_choose_license",
    "does_not_collect_artifact",
    "does_not_create_external_proof",
    "does_not_prove_adoption",
    "does_not_prove_benchmark",
    "does_not_publish",
  ],
};

writeJson(outputPath, report);
writeText(reportPath, buildReport(report));

console.log(`[owner-issue-remote-create] ${repoRelative(outputPath)}`);
console.log(`[owner-issue-remote-create] ${repoRelative(reportPath)}`);

#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flags = new Map();

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg.startsWith("--")) {
    const key = arg.slice(2);
    const next = args[index + 1];
    if (next && !next.startsWith("--")) {
      flags.set(key, next);
      index += 1;
    } else {
      flags.set(key, true);
    }
  }
}

const issueNumber = String(flags.get("issue") || "7");
const outputPath = path.resolve(
  root,
  String(flags.get("output") || ".mimesis/owner-actions/remote-proof-input-issue-snapshot.json"),
);
const reportPath = path.resolve(
  root,
  String(flags.get("report") || ".mimesis/owner-actions/remote-proof-input-issue-snapshot.md"),
);
const issueUrl = `https://github.com/svy04/mimesis-engineering/issues/${issueNumber}`;
const expectedLabel = "owner-proof-input";
const placeholderPattern = /\[owner to fill|_No response_|pending owner input|not provided|TBD|TODO|<fill/i;
const secretPattern = /\b(api[_-]?key|secret|password|token|oauth[_-]?token)\b\s*[:=]\s*["']?[A-Za-z0-9._\-]{8,}/i;

function repoRelative(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, "/");
}

function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function normalizeHeading(value) {
  return value
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function section(markdown, aliases) {
  const headingPattern = /^#{2,3}\s+(?:\d+\.\s*)?(.+?)\s*$/gm;
  const matches = [...markdown.matchAll(headingPattern)];
  const wanted = new Set(aliases.map((alias) => normalizeHeading(alias)));

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    if (!wanted.has(normalizeHeading(match[1]))) {
      continue;
    }
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? markdown.length;
    return markdown.slice(start, end).trim();
  }

  return "";
}

function hasOwnerValue(value) {
  if (!value) {
    return false;
  }
  return !placeholderPattern.test(value);
}

function fetchIssue() {
  const result = spawnSync(
    "gh",
    [
      "issue",
      "view",
      issueNumber,
      "--json",
      "number,title,state,url,labels,body,createdAt,updatedAt",
    ],
    {
      cwd: root,
      encoding: "utf8",
      windowsHide: true,
    },
  );

  if (result.status !== 0) {
    const message = (result.stderr || result.stdout || result.error?.message || "unknown gh issue view failure").trim();
    throw new Error(message);
  }

  return JSON.parse(result.stdout);
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value);
}

function buildReport(snapshot) {
  return `# Mimesis Remote Owner Proof Input Issue Snapshot

Status: metadata-only remote owner input issue snapshot, not owner decision or proof.

This report records live GitHub issue metadata and a body hash without storing the raw issue body.

## Issue

- issue: ${snapshot.issue.url}
- number: ${snapshot.issue.number}
- state: ${snapshot.issue.state}
- expected label present: ${snapshot.issue.expectedLabelPresent ? "yes" : "no"}
- owner input status: ${snapshot.ownerInputStatus}
- ready for local conversion: ${snapshot.readyForLocalConversion ? "yes" : "no"}
- body stored: no
- body sha256: ${snapshot.bodySha256}
- body omitted reason: ${snapshot.bodyOmittedReason}

## Signals

- license_or_no_reuse heading present: ${snapshot.requiredSignals.licenseHeadingPresent ? "yes" : "no"}
- weak_artifact_permission heading present: ${snapshot.requiredSignals.weakArtifactHeadingPresent ? "yes" : "no"}
- placeholders present: ${snapshot.requiredSignals.placeholdersPresent ? "yes" : "no"}
- secret-like pattern detected: ${snapshot.requiredSignals.secretLikePatternDetected ? "yes" : "no"}

## Next Safe Steps

${snapshot.nextSafeSteps.map((step) => `- ${step}`).join("\n")}

## Allowed Claim

${snapshot.allowedClaim}

## Disallowed Claim

${snapshot.disallowedClaim}

## Boundary

This snapshot does not store the raw issue body.
It is not owner decision.
It is not proof.
It does not choose a license.
It does not provide legal advice.
It does not grant permission.
It does not submit an artifact.
It does not create external proof.
It does not approve proof.
It does not publish.
It does not close gates.
`;
}

let issue;
try {
  issue = fetchIssue();
} catch (error) {
  const unavailable = {
    schema: "mimesis.owner-proof-input-remote-issue-snapshot.v0.1",
    generatedAt: new Date().toISOString(),
    snapshotKind: "metadata_only_remote_issue_snapshot",
    issue: {
      number: Number(issueNumber),
      url: issueUrl,
      title: "unavailable",
      state: "unavailable",
      expectedLabel,
      expectedLabelPresent: false,
      labels: [],
      createdAt: "",
      updatedAt: "",
    },
    bodyStored: false,
    bodyOmittedReason: "raw issue body is never stored by this snapshot command",
    bodySha256: sha256(""),
    bodyCharacterCount: 0,
    requiredSignals: {
      licenseHeadingPresent: false,
      weakArtifactHeadingPresent: false,
      safetyConfirmationPresent: false,
      placeholdersPresent: false,
      secretLikePatternDetected: false,
    },
    ownerInputStatus: "missing_or_unavailable",
    readyForLocalConversion: false,
    fetchError: error.message,
    nextSafeSteps: [
      "Retry gh issue view 7 after GitHub CLI and network access are available.",
      "Do not treat a missing remote snapshot as owner input, permission, proof, publication, or gate closure.",
    ],
    allowedClaim: "Mimesis can attempt a metadata-only remote owner proof input issue snapshot.",
    disallowedClaim: "The metadata-only remote issue snapshot is not owner decision, not permission, and not proof.",
    boundaries: [
      "does_not_store_issue_body",
      "does_not_choose_license",
      "does_not_grant_permission",
      "does_not_create_external_proof",
      "does_not_close_gates",
    ],
  };
  writeJson(outputPath, unavailable);
  writeText(reportPath, buildReport(unavailable));
  console.log(`[owner-proof-input-remote-issue-snapshot] ${repoRelative(outputPath)}`);
  console.log(`[owner-proof-input-remote-issue-snapshot] ${repoRelative(reportPath)}`);
  process.exit(0);
}

const body = String(issue.body || "");
const licenseSection = section(body, ["license_or_no_reuse", "license or no-reuse"]);
const weakArtifactSection = section(body, ["weak_artifact_permission", "weak artifact permission"]);
const labels = (issue.labels ?? []).map((label) => label.name).filter(Boolean);
const expectedLabelPresent = labels.includes(expectedLabel);
const licenseHeadingPresent = body.includes("license_or_no_reuse");
const weakArtifactHeadingPresent = body.includes("weak_artifact_permission");
const placeholdersPresent = placeholderPattern.test(body);
const secretLikePatternDetected = secretPattern.test(body);
const requestOnly = placeholdersPresent || !hasOwnerValue(licenseSection) || !hasOwnerValue(weakArtifactSection);
const unsafe = secretLikePatternDetected || issue.state !== "OPEN" || !expectedLabelPresent;
const ownerInputStatus = unsafe
  ? "unsafe_blocked"
  : requestOnly
    ? "request_only_pending_owner"
    : "candidate_owner_input";

const snapshot = {
  schema: "mimesis.owner-proof-input-remote-issue-snapshot.v0.1",
  generatedAt: new Date().toISOString(),
  snapshotKind: "metadata_only_remote_issue_snapshot",
  issue: {
    number: Number(issue.number),
    url: issue.url,
    title: issue.title,
    state: issue.state,
    expectedLabel,
    expectedLabelPresent,
    labels,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
  },
  bodyStored: false,
  bodyOmittedReason: "raw issue body is never stored by this snapshot command; only metadata, hash, and readiness signals are recorded",
  bodySha256: sha256(body),
  bodyCharacterCount: body.length,
  requiredSignals: {
    licenseHeadingPresent,
    weakArtifactHeadingPresent,
    safetyConfirmationPresent: /Safety Confirmation/i.test(body),
    placeholdersPresent,
    secretLikePatternDetected,
  },
  ownerInputStatus,
  readyForLocalConversion: ownerInputStatus === "candidate_owner_input",
  nextSafeSteps: ownerInputStatus === "candidate_owner_input"
    ? [
        "Deliberately export the issue body to a private local file outside committed artifacts.",
        "Run owner:proof-input-issue-convert on that reviewed local file with --require-complete.",
        "Run owner:proof-input-review, owner:proof-input-check --require-ready, and owner:proof-input-split --require-ready.",
      ]
    : [
        "Wait for the owner to fill issue #7 or provide an equivalent reviewed owner proof input record.",
        "Do not export, commit, or treat the request-only issue body as owner input.",
        "Keep owner/proof/publication/benchmark/adoption gates open.",
      ],
  allowedClaim: "Mimesis has a metadata-only remote owner proof input issue snapshot for issue #7.",
  disallowedClaim: "The metadata-only remote issue snapshot is not owner decision, not permission, not proof, not publication, not adoption evidence, not benchmark evidence, and not gate closure.",
  boundaries: [
    "does_not_store_issue_body",
    "does_not_choose_license",
    "does_not_grant_permission",
    "does_not_create_external_proof",
    "does_not_close_gates",
  ],
};

writeJson(outputPath, snapshot);
writeText(reportPath, buildReport(snapshot));

console.log(`[owner-proof-input-remote-issue-snapshot] ${repoRelative(outputPath)}`);
console.log(`[owner-proof-input-remote-issue-snapshot] ${repoRelative(reportPath)}`);

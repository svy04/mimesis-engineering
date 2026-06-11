#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flags = new Map();
const positional = [];
const issueNumber = 7;
const issueUrl = "https://github.com/svy04/mimesis-engineering/issues/7";
const privateIgnoredPath = ".mimesis/private/owner-actions/remote-proof-input-issue-7.md";
const defaultReport = ".mimesis/private/owner-actions/remote-proof-input-issue-7-export.md";
const placeholderPattern = /\[owner to fill\b|\bTBD\b|<fill|TODO|pending owner input|not provided|none yet|_No response_/i;
const secretPattern = /\b(api[_-]?key|secret|password|token|oauth[_-]?token)\b\s*[:=]\s*["']?[A-Za-z0-9._\-]{8,}/i;
const checkedBoxPattern = /-\s*\[[xX]\]/g;

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
  } else {
    positional.push(arg);
  }
}

function usage() {
  console.log(`Usage: mimesis owner:proof-input-remote-issue-export [--output .mimesis/private/owner-actions/remote-proof-input-issue-7.md] [--report .mimesis/private/owner-actions/remote-proof-input-issue-7-export.md] [--dry-run]

Fetches GitHub issue #7 and exports the raw issue body only when it is candidate owner input.
The default output is gitignored under .mimesis/private/.
The command refuses request-only issue bodies, secret-like content, and non-private output paths.
It does not choose a license, grant permission, create external proof, publish, or close gates.
`);
}

function repoRelative(filePath) {
  const relative = path.relative(root, filePath).replaceAll(path.sep, "/");
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative) ? relative : filePath;
}

function resolvePrivatePath(input, fallback) {
  const value = input || fallback;
  const fullPath = path.resolve(root, value);
  const relative = repoRelative(fullPath);
  if (!relative.startsWith(".mimesis/private/")) {
    throw new Error(`owner proof input remote issue export output must stay under .mimesis/private/: ${relative}`);
  }
  return fullPath;
}

function normalizeHeading(value) {
  return value
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/^\d+\.\s*/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseSections(markdown) {
  const sections = new Map();
  const headingPattern = /^#{2,3}\s+(.+?)\s*$/gm;
  const matches = [...markdown.matchAll(headingPattern)];

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const title = normalizeHeading(match[1]);
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? markdown.length;
    sections.set(title, markdown.slice(start, end).trim());
  }

  return sections;
}

function sectionValue(sections, aliases) {
  for (const alias of aliases) {
    const value = sections.get(normalizeHeading(alias));
    if (value) {
      return value;
    }
  }
  return "";
}

function fetchIssue() {
  const output = execFileSync("gh", [
    "issue",
    "view",
    String(issueNumber),
    "--json",
    "number,title,state,url,labels,body,createdAt,updatedAt",
  ], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return JSON.parse(output);
}

function classifyIssue(issue) {
  const body = String(issue.body || "");
  const sections = parseSections(body);
  const labelNames = (issue.labels || []).map((label) => label.name);
  const licenseSection = sectionValue(sections, ["license_or_no_reuse", "License or no-reuse"]);
  const weakArtifactSection = sectionValue(sections, ["weak_artifact_permission", "Weak artifact permission"]);
  const safetySection = sectionValue(sections, ["Safety Confirmation"]);
  const publicationSection = sectionValue(sections, ["Publication preference"]);
  const bodySha256 = crypto.createHash("sha256").update(body).digest("hex");
  const secretLikePatternDetected = secretPattern.test(body);
  const placeholdersPresent = placeholderPattern.test(body);
  const checkedSafetyCount = (safetySection.match(checkedBoxPattern) || []).length;
  const licenseChoiceChecked = checkedBoxPattern.test(licenseSection);
  checkedBoxPattern.lastIndex = 0;
  const publicationChoiceChecked = checkedBoxPattern.test(publicationSection);
  checkedBoxPattern.lastIndex = 0;
  const expectedLabelPresent = labelNames.includes("owner-proof-input");

  let ownerInputStatus = "candidate_owner_input";
  if (secretLikePatternDetected) {
    ownerInputStatus = "unsafe_blocked";
  } else if (!expectedLabelPresent || !body.trim()) {
    ownerInputStatus = "missing_or_unavailable";
  } else if (
    placeholdersPresent
    || !licenseSection
    || !weakArtifactSection
    || !safetySection
    || !licenseChoiceChecked
    || !publicationChoiceChecked
    || checkedSafetyCount < 3
  ) {
    ownerInputStatus = "request_only_pending_owner";
  }

  const readyForLocalConversion = ownerInputStatus === "candidate_owner_input";

  return {
    issue: {
      number: issue.number,
      url: issue.url,
      title: issue.title,
      state: issue.state,
      expectedLabel: "owner-proof-input",
      expectedLabelPresent,
      labels: labelNames,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
    },
    body,
    bodySha256,
    bodyCharacterCount: body.length,
    requiredSignals: {
      licenseHeadingPresent: Boolean(licenseSection),
      weakArtifactHeadingPresent: Boolean(weakArtifactSection),
      safetyConfirmationPresent: Boolean(safetySection),
      licenseChoiceChecked,
      publicationChoiceChecked,
      checkedSafetyCount,
      placeholdersPresent,
      secretLikePatternDetected,
    },
    ownerInputStatus,
    readyForLocalConversion,
    boundaries: [
      "refuses_to_export_request_only_issue",
      "privateIgnoredPath",
      "does_not_commit_issue_body",
      "does_not_choose_license",
      "does_not_grant_permission",
      "does_not_create_external_proof",
      "does_not_close_gates",
    ],
  };
}

function buildReport({ classification, outputPath, reportPath, wroteBody, dryRun }) {
  return `# Mimesis Owner Proof Input Remote Issue Export

Status: ${classification.readyForLocalConversion ? "candidate owner input can be exported privately" : "not exported; issue is not candidate owner input"}.

This report describes a private export attempt for GitHub issue #7.
The raw issue body is written only to a gitignored path under \`.mimesis/private/\` and only when the issue is candidate owner input.

## Issue

- issue: ${classification.issue.url || issueUrl}
- number: ${classification.issue.number || issueNumber}
- state: ${classification.issue.state || "unknown"}
- owner input status: ${classification.ownerInputStatus}
- ready for local conversion: ${classification.readyForLocalConversion ? "yes" : "no"}
- body sha256: ${classification.bodySha256}
- body character count: ${classification.bodyCharacterCount}
- body export written: ${wroteBody ? "yes" : "no"}
- dry run: ${dryRun ? "yes" : "no"}
- private output path: \`${repoRelative(outputPath)}\`
- private report path: \`${repoRelative(reportPath)}\`

## Signals

- expected owner-proof-input label present: ${classification.issue.expectedLabelPresent ? "yes" : "no"}
- license choice checked: ${classification.requiredSignals.licenseChoiceChecked ? "yes" : "no"}
- weak artifact heading present: ${classification.requiredSignals.weakArtifactHeadingPresent ? "yes" : "no"}
- publication choice checked: ${classification.requiredSignals.publicationChoiceChecked ? "yes" : "no"}
- safety confirmations checked: ${classification.requiredSignals.checkedSafetyCount}
- placeholders present: ${classification.requiredSignals.placeholdersPresent ? "yes" : "no"}
- secret-like pattern detected: ${classification.requiredSignals.secretLikePatternDetected ? "yes" : "no"}

## Next Safe Command

\`\`\`bash
npm run cli -- owner:proof-input-issue-convert ${repoRelative(outputPath)} --output .mimesis/private/owner-actions/remote-proof-input-issue-7-record.json --report .mimesis/private/owner-actions/remote-proof-input-issue-7-conversion.md --status reviewed --require-complete
\`\`\`

## Boundary

This command refuses request-only issue bodies.
It writes raw issue body only to a gitignored private path.
It does not commit issue body.
It does not choose a license.
It does not provide legal advice.
It does not grant permission.
It does not create external proof.
It does not approve proof.
It does not publish.
It does not close gates.
`;
}

function writeText(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

if (flags.has("help") || flags.has("h")) {
  usage();
  process.exit(0);
}

const outputPath = resolvePrivatePath(String(flags.get("output") || positional[0] || privateIgnoredPath), privateIgnoredPath);
const reportPath = resolvePrivatePath(String(flags.get("report") || defaultReport), defaultReport);
const dryRun = flags.has("dry-run");
let classification;

try {
  classification = classifyIssue(fetchIssue());
} catch (error) {
  console.error(`Owner proof input remote issue export could not fetch issue #${issueNumber}: ${error.message}`);
  process.exit(1);
}

let wroteBody = false;

if (classification.readyForLocalConversion && !dryRun) {
  writeText(outputPath, classification.body);
  wroteBody = true;
}

const report = buildReport({
  classification,
  outputPath,
  reportPath,
  wroteBody,
  dryRun,
});

if (!dryRun) {
  writeText(reportPath, report);
}

console.log(`[owner-proof-input-remote-issue-export] issue=${classification.issue.url || issueUrl}`);
console.log(`[owner-proof-input-remote-issue-export] status=${classification.ownerInputStatus}`);
console.log(`[owner-proof-input-remote-issue-export] readyForLocalConversion=${classification.readyForLocalConversion}`);
console.log(`[owner-proof-input-remote-issue-export] bodySha256=${classification.bodySha256}`);
console.log(`[owner-proof-input-remote-issue-export] privateIgnoredPath=${repoRelative(outputPath)}`);

if (dryRun) {
  console.log("[owner-proof-input-remote-issue-export] dry run; no files written");
}

if (!classification.readyForLocalConversion) {
  console.error("Owner proof input remote issue export refused: issue #7 is not candidate owner input.");
  process.exit(1);
}

console.log("Mimesis owner proof input remote issue export wrote a private gitignored issue body for downstream local review.");

#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const requirePublic = args.includes("--require-public");
const writeReport = args.includes("--write-report");
const targetArg = args.find((arg) => !arg.startsWith("--"));
const failures = [];

const requiredSections = [
  ["Starting artifact", ["starting artifact"]],
  ["Artifact owner", ["artifact owner", "owner"]],
  ["Permission status", ["permission status", "permission"]],
  ["Publication preference", ["publication preference", "publication"]],
  ["Redaction requirements", ["redaction requirements", "redaction"]],
  ["References studied", ["references studied", "references"]],
  ["Desired transformation", ["desired transformation", "what changed", "transformation"]],
  ["Proof boundary", ["proof boundary", "boundary"]],
  ["Safety confirmation", ["safety confirmation", "safety"]],
];

const placeholderPattern = /\bTBD\b|<fill|TODO|not provided|none yet/i;
const secretPattern = /\b(api[_-]?key|secret|password|token)\b\s*[:=]\s*["']?[A-Za-z0-9._\-]{8,}/i;

function usage() {
  console.log(`Usage: mimesis case:review path/to/permissioned-case.md [--require-public] [--write-report]

Reviews a permissioned external case intake for permission, redaction, safety, proof boundary, and publication decision.
This does not create proof, grant legal rights, or publish anything.
`);
}

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function extractHeadingSection(content, aliases) {
  const lines = content.split(/\r?\n/);
  let start = -1;
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^#{1,6}\s+(.+)$/);
    if (!match) {
      continue;
    }
    const heading = normalize(match[1]);
    if (aliases.some((alias) => {
      const normalizedAlias = normalize(alias);
      return (
        heading === normalizedAlias ||
        heading.startsWith(`${normalizedAlias} `) ||
        heading.endsWith(` ${normalizedAlias}`)
      );
    })) {
      start = index + 1;
      break;
    }
  }

  if (start < 0) {
    return "";
  }

  const collected = [];
  for (const line of lines.slice(start)) {
    if (/^#{1,6}\s+/.test(line)) {
      break;
    }
    collected.push(line);
  }

  return collected.join("\n").trim();
}

function extractInlineField(content, aliases) {
  for (const alias of aliases) {
    const pattern = new RegExp(`^\\s*${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:\\s*(.+)$`, "im");
    const match = content.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return "";
}

function sectionValue(content, aliases) {
  return extractHeadingSection(content, aliases) || extractInlineField(content, aliases);
}

if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

if (!targetArg) {
  console.error("Missing permissioned case file.");
  usage();
  process.exit(1);
}

const targetPath = path.resolve(process.cwd(), targetArg);
if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
  console.error(`Permissioned case file does not exist: ${targetPath}`);
  process.exit(1);
}

const content = fs.readFileSync(targetPath, "utf8");
const values = new Map();

for (const [label, aliases] of requiredSections) {
  const value = sectionValue(content, aliases);
  values.set(label, value);
  if (!value || placeholderPattern.test(value)) {
    failures.push(`missing or unfinished section: ${label}`);
  }
}

if (secretPattern.test(content)) {
  failures.push("case intake appears to include a secret, token, password, or API key");
}

const permission = values.get("Permission status")?.toLowerCase() ?? "";
const publication = values.get("Publication preference")?.toLowerCase() ?? "";
const redaction = values.get("Redaction requirements")?.toLowerCase() ?? "";
const proofBoundary = values.get("Proof boundary")?.toLowerCase() ?? "";
const safety = values.get("Safety confirmation")?.toLowerCase() ?? "";

if (!/(own|permission|redaction|private)/i.test(permission)) {
  failures.push("permission status must say whether the submitter owns it, has permission, needs redaction, or is private only");
}

if (!/(public|anonymized|redacted|private)/i.test(publication)) {
  failures.push("publication preference must be public, anonymized, redacted, or private only");
}

if (!/(universal|benchmark|commercial|customer|adoption|outcome|originality|claim|proof|not|unproven)/i.test(proofBoundary)) {
  failures.push("proof boundary must name at least one claim this case must not make");
}

if (!/(no secrets|no private|no customer|no tokens|did not include|redacted)/i.test(safety)) {
  failures.push("safety confirmation must explicitly address secrets, private data, or customer data");
}

const privateOnly = /private only/i.test(permission) || /private only/i.test(publication);
const redacted = /redact|anonym/i.test(permission) || /redact|anonym/i.test(publication) || /remove|redact|anonym/i.test(redaction);
const permissioned = /(own|have permission|permission)/i.test(permission);
const publicPreferred = /public/i.test(publication) || /redacted|anonymized/i.test(publication);
const publicReady = !privateOnly && publicPreferred && (permissioned || redacted);

let decision = "request more information";
if (failures.length) {
  decision = "reject or request more information";
} else if (privateOnly) {
  decision = "keep private";
} else if (redacted) {
  decision = "publish redacted";
} else if (publicReady) {
  decision = "publish";
}

if (requirePublic && !publicReady) {
  failures.push("require-public gate failed: case is not publishable as public, anonymized, or redacted evidence");
}

const report = `# Permissioned Case Review

Status: ${failures.length ? "not publish-ready" : "reviewed"}

Source: \`${path.relative(process.cwd(), targetPath).replaceAll(path.sep, "/") || targetPath}\`

## Decision

${decision}

## Checks

- starting artifact: ${values.get("Starting artifact") ? "present" : "missing"}
- artifact owner: ${values.get("Artifact owner") ? "present" : "missing"}
- permission status: ${values.get("Permission status") ? "present" : "missing"}
- publication preference: ${values.get("Publication preference") ? "present" : "missing"}
- redaction requirements: ${values.get("Redaction requirements") ? "present" : "missing"}
- references studied: ${values.get("References studied") ? "present" : "missing"}
- desired transformation: ${values.get("Desired transformation") ? "present" : "missing"}
- proof boundary: ${values.get("Proof boundary") ? "present" : "missing"}
- safety confirmation: ${values.get("Safety confirmation") ? "present" : "missing"}

## Boundary

This review checks intake completeness and publication boundary only.
It does not prove external adoption, commercial outcomes, benchmarked productivity, legal originality, or that the transformation has already been completed.
`;

if (writeReport) {
  const reportPath = path.join(path.dirname(targetPath), "permissioned-case-review.md");
  fs.writeFileSync(reportPath, report);
  console.log(`[permissioned-case-review] ${path.relative(process.cwd(), reportPath).replaceAll(path.sep, "/")}`);
}

if (failures.length) {
  console.error("\nMimesis permissioned case review failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log(`Mimesis permissioned case review passed: ${decision}.`);

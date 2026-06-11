#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const positional = [];
const options = new Map();
let force = false;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--force") {
    force = true;
    continue;
  }
  if (arg.startsWith("--")) {
    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${arg}`);
    }
    options.set(arg, value);
    index += 1;
    continue;
  }
  positional.push(arg);
}

function usage() {
  console.log(`Usage: mimesis evidence:review path/to/evidence-packet.md --decision reviewed|accepted|publish|publish-redacted|rejected --reviewer "name" --note "review note" [--out path] [--force]

Writes a reviewed or rejected copy of an evidence packet after a named reviewer records a decision.
It does not create evidence, publish anything, or prove external adoption.
`);
}

function normalizeDecision(value) {
  return value.toLowerCase().replace(/_/g, "-").trim();
}

function displayDecision(value) {
  if (value === "publish-redacted") {
    return "publish redacted";
  }
  return value;
}

function replaceSection(content, heading, body) {
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim().toLowerCase() === `## ${heading}`.toLowerCase());

  if (start < 0) {
    return `${content.trimEnd()}\n\n## ${heading}\n\n${body.trim()}\n`;
  }

  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^#{1,6}\s+/.test(lines[index])) {
      end = index;
      break;
    }
  }

  return [
    ...lines.slice(0, start + 1),
    "",
    body.trim(),
    "",
    ...lines.slice(end),
  ].join("\n").trimEnd() + "\n";
}

function setStatus(content, status) {
  if (/^Status:\s*.+$/im.test(content)) {
    return content.replace(/^Status:\s*.+$/im, `Status: ${status}.`);
  }
  return content.replace(/^#\s+Evidence Packet\s*$/im, `# Evidence Packet\n\nStatus: ${status}.`);
}

if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

const targetArg = positional[0];
if (!targetArg) {
  console.error("Missing evidence packet file.");
  usage();
  process.exit(1);
}

const targetPath = path.resolve(process.cwd(), targetArg);
if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
  console.error(`Evidence packet file does not exist: ${targetPath}`);
  process.exit(1);
}

const decision = normalizeDecision(options.get("--decision") ?? "");
const reviewer = options.get("--reviewer")?.trim() ?? "";
const note = options.get("--note")?.trim() ?? "";
const outPath = path.resolve(process.cwd(), options.get("--out") ?? targetArg);

const allowedDecisions = new Set(["reviewed", "accepted", "publish", "publish-redacted", "rejected"]);
if (!allowedDecisions.has(decision)) {
  console.error("Decision must be one of: reviewed, accepted, publish, publish-redacted, rejected.");
  process.exit(1);
}

if (!reviewer) {
  console.error("Missing required --reviewer.");
  process.exit(1);
}

if (!note) {
  console.error("Missing required --note.");
  process.exit(1);
}

if (fs.existsSync(outPath) && outPath !== targetPath && !force) {
  console.error(`Output already exists: ${outPath}. Pass --force to overwrite.`);
  process.exit(1);
}

const structuralCheck = spawnSync(process.execPath, [
  path.join(root, "tools", "check-evidence-packet.mjs"),
  targetPath,
], {
  cwd: process.cwd(),
  encoding: "utf8",
});

if (structuralCheck.status !== 0) {
  console.error(structuralCheck.stderr || structuralCheck.stdout);
  console.error("Cannot review an evidence packet until its structure passes evidence:check.");
  process.exit(structuralCheck.status ?? 1);
}

const now = new Date().toISOString();
const status = decision === "rejected" ? "rejected" : "reviewed";
const decisionText = displayDecision(decision);
const reviewBody = `${decisionText}.

Reviewer: ${reviewer}
Review Note: ${note}
Reviewed At: ${now}

Review Boundary: This review records a human decision about the packet structure and claim boundary. It does not create evidence, prove external adoption, prove benchmarked productivity, prove customer outcomes, publish a package, release an action, ship a plugin, choose a license, or guarantee legal originality.`;

let content = fs.readFileSync(targetPath, "utf8");
content = setStatus(content, status);
content = replaceSection(content, "Review Decision", reviewBody);

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, content);

console.log(`[evidence-review] ${path.relative(process.cwd(), outPath).replaceAll(path.sep, "/")}`);

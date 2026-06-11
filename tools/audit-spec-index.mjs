#!/usr/bin/env node

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

const packageJson = readJson("package.json");
const cli = read("bin/mimesis.mjs");
const specIndex = read("spec/README.md");
const readme = read("README.md");
const toolsReadme = read("tools/README.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const validator = read("tools/validate-mimesis.mjs");
const releaseCheck = packageJson.scripts?.["release:check"] ?? "";

if (!packageJson.scripts?.["audit:spec-index"]) {
  failures.push("package.json missing script: audit:spec-index");
}

if (!releaseCheck.includes("audit:spec-index")) {
  failures.push("release:check must include npm run audit:spec-index");
}

if (!cli.includes('"audit:spec-index"')) {
  failures.push("CLI missing audit:spec-index command");
}

const requiredSpecFiles = [
  "mimesis-v0.1.md",
  "file-protocol.md",
  "framework-manifest.schema.json",
  "current-state-summary.schema.json",
  "gate-closure-readiness.schema.json",
  "gate-closure-review.schema.json",
  "worktree-review-packet.schema.json",
  "release-review-bundle.schema.json",
  "proof-intake.schema.json",
  "proof-execution-record.schema.json",
  "owner-decision-answer.schema.json",
  "owner-evidence-intake.schema.json",
  "owner-evidence-submission.schema.json",
  "owner-proof-input.schema.json",
  "quality-bar.md",
  "adapter-contract.md",
];

for (const file of requiredSpecFiles) {
  if (!specIndex.includes(file)) {
    failures.push(`spec/README.md missing spec file: ${file}`);
  }
}

for (const text of [
  "spec index",
  "json schema",
  "owner decision answer record",
  "owner evidence intake record",
  "owner evidence submission record",
  "owner proof input record",
  "proof execution record",
  "gate closure readiness",
  "worktree review packet",
  "release review bundle",
  "not owner decision",
  "not evidence",
  "not submitted evidence",
  "not proof approval",
  "strict sync closure",
  "does not prove adoption",
  "No proof, no claim.",
]) {
  if (!specIndex.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`spec/README.md missing boundary text: ${text}`);
  }
}

for (const text of [
  "spec/README.md",
  "audit:spec-index",
]) {
  for (const [name, content] of [
    ["README.md", readme],
    ["tools/README.md", toolsReadme],
    ["STATUS.md", status],
    ["ROADMAP.md", roadmap],
    ["docs/COMPLETION-AUDIT.md", completion],
    ["docs/V0.1-RELEASE-PACKET.md", releasePacket],
  ]) {
    if (!content.includes(text)) {
      failures.push(`${name} missing spec index text: ${text}`);
    }
  }
}

if (!validator.includes("tools/audit-spec-index.mjs")) {
  failures.push("tools/validate-mimesis.mjs missing tools/audit-spec-index.mjs");
}

if (failures.length) {
  console.error("\nMimesis spec index audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis spec index audit passed: spec/README.md indexes all local contracts and boundaries.");

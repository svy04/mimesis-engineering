#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const recordPath = path.join(root, ".mimesis", "release-decisions", "owner-decision-record.json");
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
const doc = read("docs/RELEASE-DECISION-RECORD.md");

if (!packageJson.scripts?.["release:decision-record"]) {
  failures.push("package.json missing script: release:decision-record");
}

if (!packageJson.scripts?.["audit:release-decision-record"]) {
  failures.push("package.json missing script: audit:release-decision-record");
}

if (!packageJson.scripts?.["release:check"]?.includes("release:decision-record")) {
  failures.push("release:check must generate npm run release:decision-record");
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:release-decision-record")) {
  failures.push("release:check must include npm run audit:release-decision-record");
}

if (!cli.includes('"release:decision-record"') || !cli.includes('"audit:release-decision-record"')) {
  failures.push("CLI missing release:decision-record or audit:release-decision-record command");
}

for (const text of [
  "owner release decision record",
  "does not choose a license",
  "does not publish",
  "does not stage",
  "pending owner decision",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/RELEASE-DECISION-RECORD.md missing text: ${text}`);
  }
}

if (!fs.existsSync(recordPath)) {
  failures.push("missing .mimesis/release-decisions/owner-decision-record.json; run npm run release:decision-record");
} else {
  const record = readJson(".mimesis/release-decisions/owner-decision-record.json");

  if (record.status !== "owner_decision_required") {
    failures.push("release decision record status must be owner_decision_required");
  }

  if (record.license?.decision !== "pending") {
    failures.push("release decision record license decision must be pending");
  }

  if (record.publicRelease?.decision !== "pending") {
    failures.push("release decision record publicRelease decision must be pending");
  }

  if (record.npmPublication?.decision !== "blocked") {
    failures.push("release decision record npmPublication decision must be blocked");
  }

  if (record.actionPublication?.decision !== "blocked") {
    failures.push("release decision record actionPublication decision must be blocked");
  }

  if (record.externalProof?.decision !== "waiting_for_artifact") {
    failures.push("release decision record externalProof decision must be waiting_for_artifact");
  }

  if (record.benchmarkOrAdoption?.decision !== "waiting_for_evidence") {
    failures.push("release decision record benchmarkOrAdoption decision must be waiting_for_evidence");
  }

  for (const command of [
    "npm run release:check:public",
    "npm run audit:sync:strict",
    "npm run audit:license",
    "npm run audit:package",
    "npm run audit:action",
  ]) {
    if (!record.requiredFreshCommands?.includes(command)) {
      failures.push(`release decision record missing command: ${command}`);
    }
  }

  for (const source of [
    "docs/LICENSE-DECISION.md",
    "docs/RELEASE-EXECUTION-PACKET.md",
    "docs/PUBLISH-HANDOFF-PACKET.md",
    ".mimesis/gates/current-gateboard.md",
  ]) {
    if (!record.sourceFiles?.includes(source)) {
      failures.push(`release decision record missing source file: ${source}`);
    }
  }

  for (const boundary of [
    "does_not_choose_license",
    "does_not_publish",
    "does_not_stage_commit_push_tag_release",
    "does_not_create_external_proof",
    "does_not_prove_adoption",
  ]) {
    if (!record.boundaries?.includes(boundary)) {
      failures.push(`release decision record missing boundary: ${boundary}`);
    }
  }
}

if (failures.length) {
  console.error("\nMimesis release decision record audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis release decision record audit passed: owner decisions are recorded as pending and bounded.");

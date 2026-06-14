#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
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

const packageJson = JSON.parse(read("package.json") || "{}");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/PERMISSIONED-CASE-FIXTURE.md");
const template = read("templates/permissioned-case-intake.md");
const example = read("examples/permissioned-case-intake.md");

if (!packageJson.scripts?.["audit:permissioned-fixture"]) {
  failures.push("package.json missing script: audit:permissioned-fixture");
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:permissioned-fixture")) {
  failures.push("release:check must include npm run audit:permissioned-fixture");
}

if (!cli.includes('"audit:permissioned-fixture"')) {
  failures.push("CLI missing audit:permissioned-fixture command");
}

for (const text of [
  "reviewable fixture",
  "does not create external proof",
  "not a real submitter artifact",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/PERMISSIONED-CASE-FIXTURE.md missing text: ${text}`);
  }
}

for (const heading of [
  "## Starting Artifact",
  "## Artifact Owner",
  "## Permission Status",
  "## Publication Preference",
  "## Redaction Requirements",
  "## References Studied",
  "## Desired Transformation",
  "## Proof Boundary",
  "## Safety Confirmation",
]) {
  if (!template.includes(heading)) {
    failures.push(`permissioned intake template missing heading: ${heading}`);
  }
}

for (const text of [
  "Fixture only",
  "not a real submitter artifact",
  "Safety Confirmation",
  "must not claim external adoption",
]) {
  if (!example.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`permissioned fixture example missing text: ${text}`);
  }
}

if (!/\bTBD\b|<fill|TODO|not provided|none yet/i.test(template)) {
  failures.push("permissioned intake template must remain visibly fillable and not masquerade as completed proof");
}

if (/\bTBD\b|<fill|TODO|not provided|none yet/i.test(example)) {
  failures.push("permissioned fixture example must be fully reviewable without placeholders");
}

if (!failures.length) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mimesis-permissioned-fixture-"));
  try {
    const fixturePath = path.join(tempRoot, "permissioned-case-intake.md");
    fs.writeFileSync(fixturePath, example);
    const result = spawnSync(process.execPath, [
      path.join(root, "tools", "check-permissioned-case.mjs"),
      fixturePath,
      "--require-public",
      "--write-report",
    ], {
      cwd: tempRoot,
      encoding: "utf8",
    });

    if (result.status !== 0) {
      failures.push(`permissioned fixture example should pass case:review --require-public: ${result.stderr || result.stdout}`);
    }

    const reportPath = path.join(tempRoot, "permissioned-case-review.md");
    if (!fs.existsSync(reportPath)) {
      failures.push("permissioned fixture review must write permissioned-case-review.md");
    } else {
      const report = fs.readFileSync(reportPath, "utf8");
      for (const text of ["Status: reviewed", "Decision", "does not prove external adoption"]) {
        if (!report.includes(text)) {
          failures.push(`permissioned fixture review report missing text: ${text}`);
        }
      }
    }
  } finally {
    if (tempRoot.startsWith(os.tmpdir())) {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  }
}

if (failures.length) {
  console.error("\nMimesis permissioned fixture audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis permissioned fixture audit passed: intake template and reviewable fixture are bounded.");

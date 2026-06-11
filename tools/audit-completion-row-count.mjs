#!/usr/bin/env node

import { spawnSync } from "node:child_process";
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

function countMatrixRows(markdown) {
  const section = markdown.split("## Requirement Matrix", 2)[1]?.split("## Allowed Completion Claim", 1)[0] ?? "";
  return section
    .split(/\r?\n/)
    .filter((line) => line.startsWith("| "))
    .filter((line) => !line.includes("---"))
    .filter((line) => !line.includes("Requirement | Current Status"))
    .length;
}

const actualRows = countMatrixRows(read("docs/COMPLETION-AUDIT.md"));
const result = spawnSync(process.execPath, [path.join(root, "tools", "audit-completion-matrix.mjs")], {
  cwd: root,
  encoding: "utf8",
});

const output = `${result.stdout}\n${result.stderr}`;

if (result.status !== 0) {
  failures.push(`audit-completion-matrix failed before row-count check:\n${output.trim()}`);
}

if (!output.includes(`visible matrix rows checked: ${actualRows}`)) {
  failures.push(`audit-completion output must include visible matrix rows checked: ${actualRows}`);
}

if (!output.includes("required row names checked:")) {
  failures.push("audit-completion output must include required row names checked");
}

if (failures.length) {
  console.error("\nMimesis completion row-count audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log(`Mimesis completion row-count audit passed: visible matrix rows checked: ${actualRows}.`);

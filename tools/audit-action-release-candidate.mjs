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

const rootAction = read("action.yml");
const localAction = read(".github/actions/release-check/action.yml");
const actionDoc = read("docs/ACTION-RELEASE-CANDIDATE.md");
const pluginDoc = read("plugins/github-action.md");
const packageJson = JSON.parse(read("package.json"));

for (const required of [
  "name:",
  "description:",
  "inputs:",
  "working-directory:",
  "command:",
  "using: composite",
  "$GITHUB_ACTION_PATH/bin/mimesis.mjs",
  "workspace:check",
]) {
  if (!rootAction.includes(required)) {
    failures.push(`root action.yml missing ${required}`);
  }
}

if (!/npm run release:check/.test(localAction)) {
  failures.push("repository-local action must still run npm run release:check");
}

for (const text of [
  "not a marketplace action",
  "not a tagged public action release",
  "root action.yml",
  "workspace:check",
]) {
  if (!actionDoc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/ACTION-RELEASE-CANDIDATE.md missing boundary text: ${text}`);
  }
}

if (!/root action/i.test(pluginDoc) || !/marketplace/i.test(pluginDoc)) {
  failures.push("plugins/github-action.md must describe the root action candidate and marketplace boundary");
}

for (const scriptName of ["workspace:check", "audit:action"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:action")) {
  failures.push("release:check must include npm run audit:action");
}

if (failures.length) {
  console.error("\nMimesis action release-candidate audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis action release-candidate audit passed: root action metadata is present and bounded.");

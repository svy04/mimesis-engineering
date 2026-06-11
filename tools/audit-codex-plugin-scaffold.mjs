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
const manifest = readJson("plugins/mimesis-codex/.codex-plugin/plugin.json");
const pluginReadme = read("plugins/mimesis-codex/README.md");
const skill = read("plugins/mimesis-codex/skills/mimesis-loop/SKILL.md");
const codexDoc = read("plugins/codex-plugin.md");
const statusMatrix = read("plugins/status.md");
const pluginsReadme = read("plugins/README.md");
const cli = read("bin/mimesis.mjs");

if (manifest.name !== "mimesis-codex") {
  failures.push("Codex plugin manifest name must be mimesis-codex");
}

if (manifest.version !== "0.1.0") {
  failures.push("Codex plugin manifest version must match local v0.1 scaffold");
}

if (manifest.skills !== "./skills/") {
  failures.push("Codex plugin manifest must expose ./skills/");
}

if (!manifest.interface?.displayName || !manifest.interface?.shortDescription) {
  failures.push("Codex plugin manifest must include displayName and shortDescription");
}

for (const text of [
  "prototype scaffold",
  "not a shipped plugin",
  "does not publish",
  "does not prove external adoption",
  "npm run release:check",
  "npm run validate",
]) {
  if (!pluginReadme.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`plugins/mimesis-codex/README.md missing boundary text: ${text}`);
  }
}

for (const text of [
  "Give AI standards, not roles",
  "Bring one weak artifact",
  "source-first",
  "proof boundary",
  "no completion claim without files",
]) {
  if (!skill.includes(text)) {
    failures.push(`mimesis-loop skill missing text: ${text}`);
  }
}

if (!/Status:\s*`prototype`/.test(codexDoc)) {
  failures.push("plugins/codex-plugin.md must mark Codex plugin as prototype");
}

if (!/mimesis-codex\/\.codex-plugin\/plugin\.json/.test(codexDoc)) {
  failures.push("plugins/codex-plugin.md must cite the local plugin manifest");
}

if (!/Codex Plugin \| `prototype`/.test(statusMatrix)) {
  failures.push("plugins/status.md must mark Codex Plugin as prototype");
}

if (!/plugins\/mimesis-codex/.test(statusMatrix)) {
  failures.push("plugins/status.md must cite the local Codex plugin scaffold");
}

if (!/mimesis-codex/.test(pluginsReadme) || !/not a shipped plugin/i.test(pluginsReadme)) {
  failures.push("plugins/README.md must describe the local Codex scaffold boundary");
}

if (!packageJson.scripts?.["audit:codex-plugin"]) {
  failures.push("package.json missing script: audit:codex-plugin");
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:codex-plugin")) {
  failures.push("release:check must include npm run audit:codex-plugin");
}

if (!cli.includes('"audit:codex-plugin"')) {
  failures.push("CLI missing audit:codex-plugin command");
}

if (failures.length) {
  console.error("\nMimesis Codex plugin scaffold audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis Codex plugin scaffold audit passed: local scaffold is present and bounded.");

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

function section(markdown, heading, nextHeadingPattern = /^## /m) {
  const start = markdown.indexOf(heading);
  if (start < 0) {
    failures.push(`missing section: ${heading}`);
    return "";
  }
  const rest = markdown.slice(start + heading.length);
  const next = rest.search(nextHeadingPattern);
  return next < 0 ? rest : rest.slice(0, next);
}

function requireText(label, content, text) {
  if (!content.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`${label} missing text: ${text}`);
  }
}

const packageJson = JSON.parse(read("package.json") || "{}");
const cli = read("bin/mimesis.mjs");
const readme = read("README.md");
const quickstart = read("docs/QUICKSTART.md");
const whatYouGet = read("docs/WHAT-YOU-GET.md");
const activationDoc = read("docs/ACTIVATION-SURFACE.md");

if (!packageJson.scripts?.["audit:activation"]) {
  failures.push("package.json missing script: audit:activation");
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:activation")) {
  failures.push("release:check must include npm run audit:activation");
}

if (!cli.includes('"audit:activation"')) {
  failures.push("CLI missing audit:activation command");
}

const firstScreen = readme.split(/\r?\n/).slice(0, 34).join("\n");
for (const text of [
  "Give AI standards, not roles.",
  "Bring one weak artifact.",
  "Show the proof boundary.",
]) {
  requireText("README first screen", firstScreen, text);
}

const understand = section(readme, "## Understand In 30 Seconds");
for (const text of [
  "AI에게 역할이 아니라 기준을 줘라.",
  "a visible artifact trail",
  "before/after case",
]) {
  requireText("README 30-second section", understand, text);
}

const firstLoop = section(readme, "## 5-Minute First Loop");
for (const text of [
  "docs/QUICKSTART.md",
  "Choose one weak artifact.",
  "Pick a reference pack.",
  "Inspect the boundary.",
  "Write a case note.",
]) {
  requireText("README 5-minute section", firstLoop, text);
}

for (const text of [
  "npm run first-loop:demo",
  "npm run audit:first-loop",
  ".mimesis/first-loop-demo/",
  "workspace:check",
  "case:check",
  "does not prove external adoption",
  "npm run cli -- case:start",
  "node tools/validate-mimesis.mjs",
  "npm run cli -- case:check",
  "not a completed proof artifact yet",
]) {
  requireText("Quickstart", quickstart, text);
}

for (const heading of [
  "## Artifact Brief",
  "## Reference Set",
  "## Structure Map",
  "## Transformation Plan",
  "## Improved Artifact",
  "## Boundary Check",
  "## Case Note",
]) {
  requireText("What You Get", whatYouGet, heading);
}

for (const text of [
  "30-second understanding",
  "5-minute first loop",
  "first-screen promise",
  "does not prove external adoption",
]) {
  requireText("Activation Surface doc", activationDoc, text);
}

if (failures.length) {
  console.error("\nMimesis activation surface audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis activation surface audit passed: README and quickstart preserve the first-action path.");

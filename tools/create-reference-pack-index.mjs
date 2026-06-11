#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "reference-packs", "index.json");
const checkOnly = process.argv.includes("--check");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function stableStringify(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function slugFromFile(fileName) {
  return fileName.replace(/\.md$/i, "");
}

function titleFromMarkdown(content, fallback) {
  return content.match(/^#\s+(.+)$/m)?.[1].trim() ?? fallback;
}

function section(content, heading) {
  const lines = content.split(/\r?\n/);
  const headingPattern = new RegExp(`^##\\s+${heading}\\s*$`, "i");
  const start = lines.findIndex((line) => headingPattern.test(line));
  if (start < 0) {
    return "";
  }

  const collected = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) {
      break;
    }
    collected.push(lines[index]);
  }
  return collected.join("\n").trim();
}

function introAfterTitle(content) {
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((line) => /^#\s+/.test(line));
  if (start < 0) {
    return "";
  }

  const collected = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) {
      break;
    }
    collected.push(lines[index]);
  }
  return collected.join("\n").trim();
}

function bullets(content) {
  return content
    .split(/\r?\n/)
    .map((line) => line.match(/^-\s+(.+)$/)?.[1]?.trim())
    .filter(Boolean);
}

function starterPrompt(content) {
  const starter = section(content, "Starter Prompt");
  const fenced = starter.match(/```(?:text)?\s*([\s\S]*?)```/i)?.[1]?.trim();
  return fenced || starter;
}

const packageJson = readJson("package.json");
const packDir = path.join(root, "reference-packs");
const packFiles = fs
  .readdirSync(packDir)
  .filter((file) => file.endsWith(".md") && file !== "README.md")
  .sort((a, b) => a.localeCompare(b));

const packs = packFiles.map((file) => {
  const relativePath = `reference-packs/${file}`;
  const content = read(relativePath);
  const id = slugFromFile(file);
  return {
    id,
    title: titleFromMarkdown(content, id),
    path: relativePath,
    useWhen: section(content, "Use When") || introAfterTitle(content),
    sourceQuality: section(content, "Source Quality"),
    inspect: bullets(section(content, "What to Inspect")),
    transferablePatterns: bullets(section(content, "Transferable Patterns")),
    doNotCopy: bullets(section(content, "Do Not Copy")),
    starterPrompt: starterPrompt(content),
  };
});

const index = {
  name: "mimesis-reference-pack-index",
  version: packageJson.version,
  status: "local-source-first-index-v0.1",
  purpose: "Machine-readable source-first standards index for choosing reference packs before transforming one weak artifact.",
  principle: "Give AI standards, not roles.",
  generatedFrom: ["reference-packs/README.md", ...packs.map((pack) => pack.path)],
  packs,
  boundary: [
    "local index only",
    "not a source-quality guarantee",
    "does not prove external adoption",
    "does not prove package publication",
    "does not create external proof",
    "does not permit copying protected surface",
  ],
};

const serialized = stableStringify(index);

if (checkOnly) {
  if (!fs.existsSync(outputPath)) {
    throw new Error(".mimesis/reference-packs/index.json is missing; run npm run reference:index");
  }

  const current = fs.readFileSync(outputPath, "utf8");
  if (current !== serialized) {
    throw new Error(".mimesis/reference-packs/index.json is stale; run npm run reference:index");
  }

  console.log("Mimesis reference pack index check passed.");
  process.exit(0);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, serialized);

console.log(`[reference-pack-index] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = path.resolve(root, "..");
const outputPath = path.join(root, ".mimesis", "ecosystem-resources", "current-resource-packet.md");

function exists(relativePath) {
  return fs.existsSync(path.join(workspaceRoot, relativePath));
}

function readFromWorkspace(relativePath) {
  return fs.readFileSync(path.join(workspaceRoot, relativePath), "utf8");
}

function titleFor(relativePath) {
  if (!exists(relativePath)) {
    return "missing";
  }

  const content = readFromWorkspace(relativePath);
  const firstHeading = content.split(/\r?\n/).find((line) => line.startsWith("# "));
  return firstHeading ? firstHeading.replace(/^#\s+/, "").trim() : path.basename(relativePath);
}

function row(relativePath, use) {
  const status = exists(relativePath) ? "available locally" : "missing locally";
  return `| \`${relativePath}\` | ${status} | ${titleFor(relativePath)} | ${use} |`;
}

const canvasResources = [
  ["mimesis-canvas/canvas.en.md", "English worksheet for fuzzy artifact shaping"],
  ["mimesis-canvas/canvas.ko.md", "Korean worksheet for fuzzy artifact shaping"],
  ["mimesis-canvas/notion-template.md", "Notion-ready worksheet structure"],
  ["mimesis-canvas/examples/product.md", "product artifact example"],
  ["mimesis-canvas/examples/blog.md", "blog artifact example"],
  ["mimesis-canvas/examples/landing-page.md", "landing-page artifact example"],
  ["mimesis-canvas/examples/research.md", "research artifact example"],
];

const casebookResources = [
  ["mimesis-casebook/cases/001-quantflow-alpha-court.md", "strategy and proof-boundary case grammar"],
  ["mimesis-casebook/cases/002-blog-homepage-mimesis.md", "homepage before/after case grammar"],
  ["mimesis-casebook/cases/003-github-profile-mimesis.md", "profile positioning case grammar"],
  ["mimesis-casebook/cases/004-linkedin-positioning-mimesis.md", "social positioning case grammar"],
];

const engineeringResources = [
  ["mimesis-engineering/README.md", "30-second orientation and first-loop commands"],
  ["mimesis-engineering/docs/OPERATOR-RUNBOOK.md", "ecosystem operating path"],
  ["mimesis-engineering/docs/COMPLETION-AUDIT.md", "completion matrix and remaining gates"],
  ["mimesis-engineering/docs/V0.2-PROOF-QUEUE.md", "first permissioned proof queue"],
  ["mimesis-engineering/reference-packs/github-readme.md", "README reference pack"],
  ["mimesis-engineering/reference-packs/landing-page.md", "landing page reference pack"],
];

const allResources = [...engineeringResources, ...canvasResources, ...casebookResources];
const missing = allResources.filter(([relativePath]) => !exists(relativePath)).map(([relativePath]) => relativePath);

const generated = `# Mimesis Ecosystem Resource Packet

Generated from the current local workspace.

Status: local resource index, not external proof.

## Repository Inventory

| Repository | Local Signal | Role |
| --- | --- | --- |
| \`mimesis-engineering\` | ${exists("mimesis-engineering/README.md") ? "available locally" : "missing locally"} | framework hub, file protocol, packets, validators |
| \`mimesis-canvas\` | ${exists("mimesis-canvas/README.md") ? "available locally" : "missing locally"} | worksheet and 10-part canvas |
| \`mimesis-casebook\` | ${exists("mimesis-casebook/README.md") ? "available locally" : "missing locally"} | before/after case grammar and proof-boundary examples |

Missing resources:

${missing.length ? missing.map((item) => `- \`${item}\``).join("\n") : "- none in the expected local resource set"}

## Engineering Resources

| Path | Local Status | Title | Recommended Use |
| --- | --- | --- | --- |
${engineeringResources.map(([relativePath, use]) => row(relativePath, use)).join("\n")}

## Canvas Resources

| Path | Local Status | Title | Recommended Use |
| --- | --- | --- | --- |
${canvasResources.map(([relativePath, use]) => row(relativePath, use)).join("\n")}

## Casebook Resources

| Path | Local Status | Title | Recommended Use |
| --- | --- | --- | --- |
${casebookResources.map(([relativePath, use]) => row(relativePath, use)).join("\n")}

## Recommended Use

1. Start with \`mimesis-engineering/README.md\` for the frame: Give AI standards, not roles.
2. Pick one weak artifact.
3. Use \`mimesis-canvas/canvas.en.md\` or \`mimesis-canvas/canvas.ko.md\` if the artifact is still fuzzy.
4. Pick a reference pack from \`mimesis-engineering/reference-packs/\`.
5. Inspect one case from \`mimesis-casebook/cases/\` only for case-note grammar and proof-boundary rhythm.
6. Run \`npm run operator:runbook\` to refresh the operating path.
7. Run \`npm run audit:ecosystem\` to confirm the neighboring local resources are present.

## Allowed Claim

The local workspace has an ecosystem resource packet that indexes framework, canvas, and casebook resources for operator selection.

## Disallowed Claim

This packet does not prove external adoption, does not prove remote freshness, does not publish, does not create a case, and does not prove that neighboring repositories contain the current local worktree state.

## Boundary

This packet does not copy neighboring repository content.
It indexes local file paths and titles so the operator can inspect the original resources directly.
It does not prove external adoption, does not publish anything, does not choose a license, does not create external proof, and does not make benchmark, customer, or commercial outcome claims.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[ecosystem-resources] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

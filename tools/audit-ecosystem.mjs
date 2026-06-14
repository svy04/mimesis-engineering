#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = path.resolve(repoRoot, "..");

const repositories = [
  {
    name: "mimesis-engineering",
    path: repoRoot,
    required: [
      "README.md",
      "spec/mimesis-v0.1.md",
      ".mimesis/run_ledger.md",
      "tools/validate-mimesis.mjs",
      "docs/ECOSYSTEM.md",
    ],
  },
  {
    name: "mimesis-canvas",
    path: path.join(workspaceRoot, "mimesis-canvas"),
    required: [
      "README.md",
      "canvas.en.md",
      "canvas.ko.md",
      "notion-template.md",
      "examples/product.md",
      "examples/blog.md",
      "examples/landing-page.md",
      "examples/research.md",
    ],
  },
  {
    name: "mimesis-casebook",
    path: path.join(workspaceRoot, "mimesis-casebook"),
    required: [
      "README.md",
      "cases/001-quantflow-alpha-court.md",
      "cases/002-blog-homepage-mimesis.md",
      "cases/003-github-profile-mimesis.md",
      "cases/004-linkedin-positioning-mimesis.md",
    ],
  },
];

const failures = [];

for (const repository of repositories) {
  if (!fs.existsSync(repository.path)) {
    failures.push(`${repository.name}: missing repository at ${repository.path}`);
    continue;
  }

  console.log(`[repo] ${repository.name}`);
  for (const file of repository.required) {
    const fullPath = path.join(repository.path, file);
    if (!fs.existsSync(fullPath)) {
      failures.push(`${repository.name}: missing ${file}`);
    } else {
      console.log(`  [ok] ${file}`);
    }
  }
}

if (failures.length) {
  console.error("\nMimesis ecosystem audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("\nMimesis ecosystem audit passed.");

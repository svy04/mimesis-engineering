#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const adaptersDir = path.join(root, "adapters");
const validStatuses = new Set(["contract", "prototype", "usable", "verified"]);
const evidenceStatuses = new Set(["prototype", "usable", "verified"]);
const failures = [];
const adapterFiles = fs
  .readdirSync(adaptersDir)
  .filter((name) => name.endsWith(".md") && name !== "README.md");

for (const file of adapterFiles) {
  const relative = `adapters/${file}`;
  const content = fs.readFileSync(path.join(adaptersDir, file), "utf8");
  const statusMatch = content.match(/Status:\s*`([^`]+)`/);

  if (!statusMatch) {
    failures.push(`${relative}: missing Status label`);
    continue;
  }

  const status = statusMatch[1];
  if (!validStatuses.has(status)) {
    failures.push(`${relative}: invalid status ${status}`);
    continue;
  }

  console.log(`[adapter] ${relative} status=${status}`);

  if (evidenceStatuses.has(status)) {
    if (!/## Evidence/i.test(content)) {
      failures.push(`${relative}: ${status} status requires an Evidence section`);
    }
    if (!/\.mimesis\/run_ledger\.md|tools\/validate-mimesis\.mjs|npm run validate|tools\/audit-issue-forms\.mjs|npm run audit:issues|\.github\/ISSUE_TEMPLATE|tools\/create-cli-packet\.mjs|npm run adapter:gemini|npm run adapter:claude|\.mimesis\/adapter-packets/i.test(content)) {
      failures.push(`${relative}: ${status} status requires local evidence references`);
    }
  }
}

if (failures.length) {
  console.error("\nMimesis adapter audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log(`\nMimesis adapter audit passed: ${adapterFiles.length} adapters checked.`);

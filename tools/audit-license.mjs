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

const licenseStatus = read("LICENSE.md");
const decision = read("docs/LICENSE-DECISION.md");
const status = read("STATUS.md");
const readme = read("README.md");

if (!/No explicit open-source license has been selected yet/i.test(licenseStatus)) {
  failures.push("LICENSE.md must state that no explicit license has been selected yet");
}

if (!/owner decision required/i.test(decision)) {
  failures.push("docs/LICENSE-DECISION.md must mark owner decision required");
}

if (!/not legal advice/i.test(decision)) {
  failures.push("docs/LICENSE-DECISION.md must include legal-advice boundary");
}

if (/open-source and freely reusable/i.test(`${readme}\n${status}`)) {
  failures.push("public docs contain unsafe open-source reuse claim");
}

if (!/license/i.test(status)) {
  failures.push("STATUS.md should mention license status");
}

if (failures.length) {
  console.error("\nMimesis license audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis license audit passed: license decision remains explicit and bounded.");

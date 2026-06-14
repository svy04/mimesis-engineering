#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const result = spawnSync(process.execPath, [path.join(root, "tools", "audit-remote-ecosystem.mjs")], {
  cwd: root,
  encoding: "utf8",
  env: {
    ...process.env,
    MIMESIS_REMOTE_AUDIT_FORCE_GH_FAIL: "1",
  },
});

const output = `${result.stdout}\n${result.stderr}`;
const failures = [];

if (result.status !== 0) {
  failures.push(`remote fallback audit command failed:\n${output.trim()}`);
}

for (const repo of ["svy04/mimesis-engineering", "svy04/mimesis-canvas", "svy04/mimesis-casebook"]) {
  if (!output.includes(repo)) {
    failures.push(`remote fallback output missing ${repo}`);
  }
}

if (!output.includes("[remote:fallback]")) {
  failures.push("remote fallback output must show [remote:fallback] when gh is forced to fail");
}

if (failures.length) {
  console.error("\nMimesis remote fallback audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis remote fallback audit passed: public visibility check survives gh auth failure.");

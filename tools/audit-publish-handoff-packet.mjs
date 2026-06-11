#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packetPath = path.join(root, ".mimesis", "publish-packets", "local-sync-handoff.md");
const failures = [];

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

const packageJson = JSON.parse(read("package.json"));
const cli = read("bin/mimesis.mjs");
const doc = read("docs/PUBLISH-HANDOFF-PACKET.md");

if (!packageJson.scripts?.["publish:packet"]) {
  failures.push("package.json missing script: publish:packet");
}

if (!packageJson.scripts?.["audit:publish-packet"]) {
  failures.push("package.json missing script: audit:publish-packet");
}

if (!packageJson.scripts?.["release:check"]?.includes("publish:packet")) {
  failures.push("release:check must generate npm run publish:packet");
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:publish-packet")) {
  failures.push("release:check must include npm run audit:publish-packet");
}

if (!cli.includes('"publish:packet"') || !cli.includes('"audit:publish-packet"')) {
  failures.push("CLI missing publish:packet or audit:publish-packet command");
}

if (!/does not stage, commit, push/i.test(doc) || !/does not publish/i.test(doc)) {
  failures.push("publish packet doc must keep non-publication boundary visible");
}

if (!fs.existsSync(packetPath)) {
  failures.push("missing .mimesis/publish-packets/local-sync-handoff.md; run npm run publish:packet");
} else {
  const packet = fs.readFileSync(packetPath, "utf8");
  for (const section of [
    "# Mimesis Publish Handoff Packet",
    "## Current Git Boundary",
    "## Branch Status",
    "## Tracked Diff Stat",
    "## Tracked Changes",
    "## Untracked Entries",
    "## Current Sync Report",
    "## Required Owner Decisions Before Publish",
    "## Allowed Claim",
    "## Disallowed Claim",
    "## Boundary",
  ]) {
    if (!packet.includes(section)) {
      failures.push(`publish packet missing section: ${section}`);
    }
  }

  for (const text of [
    "local handoff, not publication",
    "not publish-ready",
    "dirty worktree",
    "release:check:public",
    "audit:sync:strict",
    "does not stage files",
    "create a commit",
    "push",
    "tag",
    "publish to npm",
    "prove remote freshness",
  ]) {
    if (!packet.includes(text)) {
      failures.push(`publish packet missing boundary text: ${text}`);
    }
  }
}

if (failures.length) {
  console.error("\nMimesis publish handoff packet audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis publish handoff packet audit passed: local sync handoff is generated and bounded.");

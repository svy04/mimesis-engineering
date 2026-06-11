#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packetPath = path.join(root, ".mimesis", "plugin-install-packets", "codex-local.md");
const failures = [];

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

const packageJson = JSON.parse(read("package.json") || "{}");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/PLUGIN-INSTALL-PACKET.md");

if (!packageJson.scripts?.["plugin:install-packet"]) {
  failures.push("package.json missing script: plugin:install-packet");
}

if (!packageJson.scripts?.["audit:plugin-install-packet"]) {
  failures.push("package.json missing script: audit:plugin-install-packet");
}

if (!packageJson.scripts?.["release:check"]?.includes("plugin:install-packet")) {
  failures.push("release:check must generate npm run plugin:install-packet");
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:plugin-install-packet")) {
  failures.push("release:check must include npm run audit:plugin-install-packet");
}

if (!cli.includes('"plugin:install-packet"') || !cli.includes('"audit:plugin-install-packet"')) {
  failures.push("CLI missing plugin:install-packet or audit:plugin-install-packet command");
}

for (const text of [
  "local Codex plugin install packet",
  "prototype scaffold",
  "does not install",
  "does not publish",
  "not a shipped plugin",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/PLUGIN-INSTALL-PACKET.md missing text: ${text}`);
  }
}

if (!fs.existsSync(packetPath)) {
  failures.push("missing .mimesis/plugin-install-packets/codex-local.md; run npm run plugin:install-packet");
} else {
  const packet = fs.readFileSync(packetPath, "utf8");

  for (const section of [
    "# Mimesis Local Codex Plugin Install Packet",
    "## Install Candidate",
    "## Local Verification",
    "## Manual Install Steps",
    "## Rollback",
    "## Allowed Claim",
    "## Disallowed Claim",
    "## Boundary",
  ]) {
    if (!packet.includes(section)) {
      failures.push(`plugin install packet missing section: ${section}`);
    }
  }

  for (const text of [
    "mimesis-codex",
    ".codex-plugin/plugin.json",
    "skills/mimesis-loop/SKILL.md",
    "prototype scaffold",
    "not a shipped plugin",
    "does not install",
    "does not publish",
    "does not prove external adoption",
    "owner-controlled Codex environment",
    "audit:codex-plugin",
    "audit:plugin-packet",
  ]) {
    if (!packet.includes(text)) {
      failures.push(`plugin install packet missing boundary text: ${text}`);
    }
  }
}

if (failures.length) {
  console.error("\nMimesis plugin install packet audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis plugin install packet audit passed: local Codex plugin install candidate is bounded.");

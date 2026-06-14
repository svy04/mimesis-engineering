#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packetPath = path.join(root, ".mimesis", "plugin-release-packets", "v0.1-action-candidate.md");
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
const doc = read("docs/PLUGIN-RELEASE-PACKET.md");

if (!packageJson.scripts?.["plugin:packet"]) {
  failures.push("package.json missing script: plugin:packet");
}

if (!packageJson.scripts?.["audit:plugin-packet"]) {
  failures.push("package.json missing script: audit:plugin-packet");
}

if (!packageJson.scripts?.["release:check"]?.includes("plugin:packet")) {
  failures.push("release:check must generate npm run plugin:packet");
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:plugin-packet")) {
  failures.push("release:check must include npm run audit:plugin-packet");
}

if (!cli.includes('"plugin:packet"') || !cli.includes('"audit:plugin-packet"')) {
  failures.push("CLI missing plugin:packet or audit:plugin-packet command");
}

if (!/does not publish a marketplace action/i.test(doc) || !/does not create a tag/i.test(doc)) {
  failures.push("plugin release packet doc must keep release-candidate boundaries visible");
}

if (!fs.existsSync(packetPath)) {
  failures.push("missing .mimesis/plugin-release-packets/v0.1-action-candidate.md; run npm run plugin:packet");
} else {
  const packet = fs.readFileSync(packetPath, "utf8");
  for (const section of [
    "# Mimesis Plugin / Action Release Packet",
    "## Current Plugin Status",
    "## Current Action Candidate Surface",
    "## Local Codex Plugin Scaffold",
    "## Local MCP Server Scaffold",
    "## Root Action Metadata",
    "## Repository-Local Action Evidence",
    "## Owner Gates Before Marketplace Or Shipped-Plugin Claim",
    "## Allowed Claim",
    "## Disallowed Claim",
    "## Boundary",
  ]) {
    if (!packet.includes(section)) {
      failures.push(`plugin release packet missing section: ${section}`);
    }
  }

  for (const text of [
    "release-candidate handoff",
    "not shipped plugin proof",
    "not a marketplace action",
    "not a tagged public action release",
    "mimesis-codex",
    "Install Readiness Packet",
    "generated local packet",
    "mimesis-mcp",
    "MCP Stdio Server Candidate",
    "does not execute tool commands",
    "not a shipped MCP server",
    "not a shipped plugin",
    "does not create a tag",
    "publish a Marketplace listing",
    "prove adoption",
    "workspace:check",
  ]) {
    if (!packet.includes(text)) {
      failures.push(`plugin release packet missing boundary text: ${text}`);
    }
  }

  if (/has shipped a Marketplace action|external adoption proof/i.test(packet) && !/Disallowed Claim/i.test(packet)) {
    failures.push("plugin release packet contains unsafe shipped/adoption claim outside disallowed section");
  }
}

if (failures.length) {
  console.error("\nMimesis plugin release packet audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis plugin release packet audit passed: plugin/action release candidate handoff is generated and bounded.");

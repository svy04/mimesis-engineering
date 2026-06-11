#!/usr/bin/env node

import { spawnSync } from "node:child_process";
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

function readJson(relativePath) {
  const content = read(relativePath);
  if (!content) {
    return {};
  }
  try {
    return JSON.parse(content);
  } catch (error) {
    failures.push(`${relativePath} is not valid JSON: ${error.message}`);
    return {};
  }
}

const packageJson = readJson("package.json");
const cli = read("bin/mimesis.mjs");
const mcpDoc = read("plugins/mcp-server.md");
const scaffoldReadme = read("plugins/mimesis-mcp/README.md");
const scaffoldManifest = readJson("plugins/mimesis-mcp/manifest.json");
const staticResources = readJson("plugins/mimesis-mcp/resources.json");
const staticTools = readJson("plugins/mimesis-mcp/tools.json");
const statusMatrix = read("plugins/status.md");
const resourceIndex = readJson(".mimesis/mcp/resource-index.json");

if (scaffoldManifest.name !== "mimesis-mcp") {
  failures.push("MCP scaffold manifest name must be mimesis-mcp");
}

if (scaffoldManifest.status !== "prototype") {
  failures.push("MCP scaffold manifest status must be prototype");
}

if (scaffoldManifest.transport !== "stdio-scaffold") {
  failures.push("MCP scaffold manifest must identify stdio-scaffold transport boundary");
}

for (const text of [
  "prototype scaffold",
  "not a shipped MCP server",
  "does not start a long-running server",
  "does not prove external adoption",
  "Model Context Protocol",
  "resources",
  "tools",
  "prompts",
  "JSON-RPC",
]) {
  if (!scaffoldReadme.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`plugins/mimesis-mcp/README.md missing text: ${text}`);
  }
}

for (const text of [
  "Status: `prototype`",
  "plugins/mimesis-mcp/manifest.json",
  "npm run mcp:resources",
  "not a shipped MCP server",
]) {
  if (!mcpDoc.includes(text)) {
    failures.push(`plugins/mcp-server.md missing text: ${text}`);
  }
}

if (!/MCP Server \| `prototype`/.test(statusMatrix)) {
  failures.push("plugins/status.md must mark MCP Server as prototype");
}

if (!/plugins\/mimesis-mcp/.test(statusMatrix)) {
  failures.push("plugins/status.md must cite the local MCP scaffold");
}

for (const scriptName of ["mcp:resources", "audit:mcp-server"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!packageJson.scripts?.["release:check"]?.includes("mcp:resources")) {
  failures.push("release:check must generate npm run mcp:resources");
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:mcp-server")) {
  failures.push("release:check must include npm run audit:mcp-server");
}

if (!cli.includes('"mcp:resources"') || !cli.includes('"audit:mcp-server"')) {
  failures.push("CLI missing mcp:resources or audit:mcp-server command");
}

if (!Array.isArray(staticResources.resources) || staticResources.resources.length < 8) {
  failures.push("plugins/mimesis-mcp/resources.json must define at least 8 resources");
}

if (!Array.isArray(staticTools.tools) || staticTools.tools.length < 6) {
  failures.push("plugins/mimesis-mcp/tools.json must define at least 6 tools");
}

for (const resource of staticResources.resources ?? []) {
  if (!resource.uri?.startsWith("mimesis://")) {
    failures.push(`resource missing mimesis:// URI: ${resource.name || JSON.stringify(resource)}`);
  }
  if (!resource.path || !fs.existsSync(path.join(root, resource.path))) {
    failures.push(`resource path missing: ${resource.path || resource.uri}`);
  }
}

if (!Array.isArray(resourceIndex.resources) || resourceIndex.resources.length < 8) {
  failures.push(".mimesis/mcp/resource-index.json must include generated resources");
}

if (!Array.isArray(resourceIndex.tools) || resourceIndex.tools.length < 6) {
  failures.push(".mimesis/mcp/resource-index.json must include generated tool descriptors");
}

for (const text of [
  "local scaffold only",
  "not a shipped MCP server",
  "does not expose secrets",
  "does not prove external adoption",
]) {
  if (!JSON.stringify(resourceIndex).toLowerCase().includes(text.toLowerCase())) {
    failures.push(`generated MCP resource index missing boundary text: ${text}`);
  }
}

const generation = spawnSync(process.execPath, [path.join(root, "tools", "create-mcp-resource-index.mjs"), "--check"], {
  cwd: root,
  encoding: "utf8",
});

if (generation.status !== 0) {
  failures.push(`mcp resource index check failed:\n${generation.stdout}\n${generation.stderr}`.trim());
}

if (failures.length) {
  console.error("\nMimesis MCP server scaffold audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis MCP server scaffold audit passed: local MCP scaffold is generated and bounded.");

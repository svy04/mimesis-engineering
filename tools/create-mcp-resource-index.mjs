#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "mcp", "resource-index.json");
const checkOnly = process.argv.includes("--check");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function stableStringify(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function assertExistingPath(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    throw new Error(`resource path does not exist: ${relativePath}`);
  }
}

const manifest = readJson("plugins/mimesis-mcp/manifest.json");
const resources = readJson("plugins/mimesis-mcp/resources.json").resources ?? [];
const tools = readJson("plugins/mimesis-mcp/tools.json").tools ?? [];

for (const resource of resources) {
  assertExistingPath(resource.path);
}

const generated = {
  name: manifest.name,
  version: manifest.version,
  status: manifest.status,
  transport: manifest.transport,
  generatedFrom: [
    "plugins/mimesis-mcp/manifest.json",
    "plugins/mimesis-mcp/resources.json",
    "plugins/mimesis-mcp/tools.json"
  ],
  protocolShape: {
    layer: "JSON-RPC shaped MCP scaffold",
    serverFeatures: ["resources", "tools", "prompts"],
    prompts: [
      {
        name: "mimesis_loop",
        purpose: "Guide a human operator through Import, Distill, Capsule, Shard, Verify, Remember.",
        boundary: "prompt descriptor only; not hidden automation"
      }
    ]
  },
  resources,
  tools,
  boundary: [
    "local scaffold only",
    "not a shipped MCP server",
    "does not start a long-running server",
    "does not expose secrets",
    "does not prove external adoption",
    "does not prove benchmarked productivity",
    "does not create external proof"
  ]
};

const serialized = stableStringify(generated);

if (checkOnly) {
  if (!fs.existsSync(outputPath)) {
    throw new Error(".mimesis/mcp/resource-index.json is missing; run npm run mcp:resources");
  }

  const current = fs.readFileSync(outputPath, "utf8");
  if (current !== serialized) {
    throw new Error(".mimesis/mcp/resource-index.json is stale; run npm run mcp:resources");
  }

  console.log("Mimesis MCP resource index check passed.");
  process.exit(0);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, serialized);

console.log(`[mcp-resource-index] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

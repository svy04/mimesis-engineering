#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = readJson("plugins/mimesis-mcp/manifest.json");
const resources = readJson("plugins/mimesis-mcp/resources.json").resources ?? [];
const tools = readJson("plugins/mimesis-mcp/tools.json").tools ?? [];

const prompts = [
  {
    name: "mimesis_loop",
    title: "Mimesis Loop",
    description: "Guide a human operator through Import, Distill, Capsule, Shard, Verify, Remember.",
    arguments: [
      {
        name: "weak_artifact",
        description: "The weak artifact path, excerpt, or summary to improve.",
        required: true,
      },
      {
        name: "reference_pack",
        description: "The reference pack or strong-artifact standard to study.",
        required: false,
      },
    ],
  },
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function resourcePath(resource) {
  const fullPath = path.resolve(root, resource.path);
  if (!fullPath.startsWith(`${root}${path.sep}`) && fullPath !== root) {
    throw new Error(`resource path escapes repository root: ${resource.path}`);
  }
  return fullPath;
}

function jsonRpcResult(id, result) {
  return { jsonrpc: "2.0", id, result };
}

function jsonRpcError(id, code, message) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function publicResource(resource) {
  return {
    uri: resource.uri,
    name: resource.name,
    mimeType: resource.mimeType,
    description: `Mimesis local resource: ${resource.name}`,
  };
}

function publicTool(tool) {
  return {
    name: tool.name,
    title: tool.name.replaceAll("_", " "),
    description: `${tool.purpose} Boundary: ${tool.boundary}`,
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {},
    },
  };
}

function initialize() {
  return {
    protocolVersion: "2025-11-25",
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
    serverInfo: {
      name: manifest.name,
      version: manifest.version,
    },
    instructions:
      "Mimesis MCP local stdio candidate. Use resources/read to inspect framework artifacts. Tool command execution is disabled in v0.1.",
  };
}

function listResources() {
  return {
    resources: resources.map(publicResource),
  };
}

function readResource(params = {}) {
  const uri = params.uri;
  const resource = resources.find((item) => item.uri === uri);
  if (!resource) {
    throw Object.assign(new Error(`Unknown resource URI: ${uri}`), { code: -32602 });
  }

  const text = fs.readFileSync(resourcePath(resource), "utf8");
  return {
    contents: [
      {
        uri: resource.uri,
        mimeType: resource.mimeType,
        text,
      },
    ],
  };
}

function listTools() {
  return {
    tools: tools.map(publicTool),
  };
}

function listPrompts() {
  return { prompts };
}

function disabledToolCall() {
  throw Object.assign(
    new Error("Mimesis v0.1 stdio runtime keeps tool command execution disabled; run local npm scripts explicitly."),
    { code: -32000 },
  );
}

function handleRequest(request) {
  switch (request.method) {
    case "initialize":
      return jsonRpcResult(request.id, initialize());
    case "resources/list":
      return jsonRpcResult(request.id, listResources());
    case "resources/read":
      return jsonRpcResult(request.id, readResource(request.params));
    case "tools/list":
      return jsonRpcResult(request.id, listTools());
    case "tools/call":
      return jsonRpcResult(request.id, disabledToolCall());
    case "prompts/list":
      return jsonRpcResult(request.id, listPrompts());
    default:
      return jsonRpcError(request.id, -32601, `Method not found: ${request.method}`);
  }
}

const input = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
});

input.on("line", (line) => {
  if (!line.trim()) {
    return;
  }

  let response;
  try {
    const request = JSON.parse(line);
    response = handleRequest(request);
  } catch (error) {
    const parsedId = (() => {
      try {
        return JSON.parse(line).id ?? null;
      } catch {
        return null;
      }
    })();
    response = jsonRpcError(parsedId, error.code ?? -32603, error.message);
  }

  process.stdout.write(`${JSON.stringify(response)}\n`);
});

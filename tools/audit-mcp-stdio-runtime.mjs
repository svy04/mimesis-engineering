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
const server = read("tools/mcp-stdio-server.mjs");
const mcpDoc = read("plugins/mcp-server.md");
const scaffoldReadme = read("plugins/mimesis-mcp/README.md");
const status = read("STATUS.md");

for (const scriptName of ["mcp:serve", "audit:mcp-stdio"]) {
  if (!packageJson.scripts?.[scriptName]) {
    failures.push(`package.json missing script: ${scriptName}`);
  }
}

if (!packageJson.scripts?.["release:check"]?.includes("audit:mcp-stdio")) {
  failures.push("release:check must include npm run audit:mcp-stdio");
}

if (!cli.includes('"mcp:serve"') || !cli.includes('"audit:mcp-stdio"')) {
  failures.push("CLI missing mcp:serve or audit:mcp-stdio command");
}

for (const text of [
  "line-delimited JSON-RPC",
  "resources/list",
  "resources/read",
  "tools/list",
  "prompts/list",
  "does not execute tool commands",
  "not a shipped MCP server",
]) {
  const combined = `${server}\n${mcpDoc}\n${scaffoldReadme}\n${status}`.toLowerCase();
  if (!combined.includes(text.toLowerCase())) {
    failures.push(`MCP stdio runtime surface missing text: ${text}`);
  }
}

if (!failures.length) {
  const requests = [
    {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-11-25",
        capabilities: {},
        clientInfo: { name: "mimesis-audit", version: "0.1.0" },
      },
    },
    { jsonrpc: "2.0", id: 2, method: "resources/list", params: {} },
    { jsonrpc: "2.0", id: 3, method: "resources/read", params: { uri: "mimesis://spec/v0.1" } },
    { jsonrpc: "2.0", id: 4, method: "tools/list", params: {} },
    { jsonrpc: "2.0", id: 5, method: "prompts/list", params: {} },
    { jsonrpc: "2.0", id: 6, method: "tools/call", params: { name: "mimesis_validate", arguments: {} } },
  ];

  const result = spawnSync(process.execPath, [path.join(root, "tools", "mcp-stdio-server.mjs")], {
    cwd: root,
    input: `${requests.map((request) => JSON.stringify(request)).join("\n")}\n`,
    encoding: "utf8",
    timeout: 10000,
  });

  if (result.status !== 0) {
    failures.push(`mcp stdio server exited ${result.status}:\n${result.stdout}\n${result.stderr}`.trim());
  } else if (result.stderr.trim()) {
    failures.push(`mcp stdio server wrote to stderr:\n${result.stderr.trim()}`);
  } else {
    const responses = result.stdout
      .trim()
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch (error) {
          failures.push(`invalid JSON-RPC response line: ${line} (${error.message})`);
          return null;
        }
      })
      .filter(Boolean);

    if (responses.length !== requests.length) {
      failures.push(`expected ${requests.length} JSON-RPC responses, got ${responses.length}`);
    }

    const byId = new Map(responses.map((response) => [response.id, response]));
    const initialize = byId.get(1)?.result;
    if (initialize?.serverInfo?.name !== "mimesis-mcp") {
      failures.push("initialize response must identify serverInfo.name=mimesis-mcp");
    }

    if (!initialize?.capabilities?.resources || !initialize?.capabilities?.tools || !initialize?.capabilities?.prompts) {
      failures.push("initialize response must advertise resources, tools, and prompts capabilities");
    }

    const resources = byId.get(2)?.result?.resources ?? [];
    if (!Array.isArray(resources) || resources.length < 8) {
      failures.push("resources/list response must include at least 8 resources");
    }

    if (resources.some((resource) => resource.path)) {
      failures.push("resources/list response must not expose filesystem paths");
    }

    const specRead = byId.get(3)?.result?.contents?.[0];
    if (specRead?.uri !== "mimesis://spec/v0.1" || !specRead?.text?.includes("Mimesis Engineering")) {
      failures.push("resources/read response must return the requested spec text");
    }

    const tools = byId.get(4)?.result?.tools ?? [];
    if (!Array.isArray(tools) || tools.length < 6) {
      failures.push("tools/list response must include at least 6 tool descriptors");
    }

    if (tools.some((tool) => !tool.inputSchema)) {
      failures.push("tools/list response must include inputSchema on each descriptor");
    }

    const prompts = byId.get(5)?.result?.prompts ?? [];
    if (!Array.isArray(prompts) || !prompts.some((prompt) => prompt.name === "mimesis_loop")) {
      failures.push("prompts/list response must include the mimesis_loop prompt");
    }

    const toolCall = byId.get(6);
    if (toolCall?.error?.code !== -32000 || !/disabled/i.test(toolCall?.error?.message ?? "")) {
      failures.push("tools/call must fail safely because v0.1 does not execute tool commands over stdio");
    }
  }
}

if (failures.length) {
  console.error("\nMimesis MCP stdio runtime audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis MCP stdio runtime audit passed: local JSON-RPC stdio candidate is executable and bounded.");

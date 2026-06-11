#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "plugin-release-packets", "v0.1-action-candidate.md");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function extractSection(content, heading) {
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start < 0) {
    return "";
  }

  const collected = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("## ")) {
      break;
    }
    collected.push(line);
  }
  return collected.join("\n").trim();
}

function rewriteRelativeLinks(markdown, sourceDir, outputDir) {
  return markdown.replace(/(!?\[[^\]]*\])\(([^)]+)\)/g, (match, label, target) => {
    if (
      !target ||
      target.startsWith("#") ||
      target.startsWith("http://") ||
      target.startsWith("https://") ||
      target.startsWith("mailto:") ||
      /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(target)
    ) {
      return match;
    }

    const [targetPath, fragment = ""] = target.split("#", 2);
    const absoluteTarget = path.resolve(root, sourceDir, targetPath);
    let rewritten = path.relative(path.join(root, outputDir), absoluteTarget).replaceAll(path.sep, "/");
    if (!rewritten.startsWith(".")) {
      rewritten = `./${rewritten}`;
    }
    if (fragment) {
      rewritten = `${rewritten}#${fragment}`;
    }
    return `${label}(${rewritten})`;
  });
}

const packageJson = JSON.parse(read("package.json"));
const pluginStatus = read("plugins/status.md");
const actionCandidate = read("docs/ACTION-RELEASE-CANDIDATE.md");
const githubAction = read("plugins/github-action.md");
const rootAction = read("action.yml");
const localAction = read(".github/actions/release-check/action.yml");
const installPacket = fs.existsSync(path.join(root, ".mimesis", "plugin-install-packets", "codex-local.md"))
  ? read(".mimesis/plugin-install-packets/codex-local.md")
  : "Run npm run plugin:install-packet to generate the local Codex plugin install-readiness packet.";

const ownerGates = extractSection(actionCandidate, "Owner Gates Before Marketplace Claim");
const currentCandidateSurface = extractSection(actionCandidate, "Current Candidate Surface");
const localEvidence = extractSection(actionCandidate, "Local Evidence");
const boundary = extractSection(actionCandidate, "Boundary");

const rewrittenPluginStatus = rewriteRelativeLinks(pluginStatus, "plugins", path.join(".mimesis", "plugin-release-packets"));

const generated = `# Mimesis Plugin / Action Release Packet

Generated from the current local repository state for Mimesis Engineering v${packageJson.version}.

Status: release-candidate handoff, not shipped plugin proof.

## Current Plugin Status

${rewrittenPluginStatus.trim()}

## Current Action Candidate Surface

${currentCandidateSurface}

## Root Action Metadata

\`\`\`yaml
${rootAction.trim()}
\`\`\`

## Repository-Local Action Evidence

\`\`\`yaml
${localAction.trim()}
\`\`\`

${localEvidence}

## Owner Gates Before Marketplace Or Shipped-Plugin Claim

${ownerGates}

## Local Codex Plugin Scaffold

- [Manifest](../../plugins/mimesis-codex/.codex-plugin/plugin.json)
- [Skill](../../plugins/mimesis-codex/skills/mimesis-loop/SKILL.md)
- [Scaffold README](../../plugins/mimesis-codex/README.md)
- [Install Readiness Packet](../plugin-install-packets/codex-local.md)

This is local prototype evidence only.
It is not a shipped plugin, Marketplace listing, installation proof, or external adoption proof.

Install-readiness status: ${installPacket.includes("local Codex plugin install packet") ? "generated local packet" : "missing local packet"}

## Local MCP Server Scaffold

- [Manifest](../../plugins/mimesis-mcp/manifest.json)
- [Resources](../../plugins/mimesis-mcp/resources.json)
- [Tools](../../plugins/mimesis-mcp/tools.json)
- [Stdio Server Candidate](../../tools/mcp-stdio-server.mjs)
- [Stdio Runtime Audit](../../tools/audit-mcp-stdio-runtime.mjs)
- [Generated Resource Index](../../.mimesis/mcp/resource-index.json)

This is local prototype evidence only.
It is not a shipped MCP server, connector installation, long-running service, secret exposure, official host compliance proof, or external adoption proof.
The stdio candidate does not execute tool commands.

## Allowed Claim

Mimesis Engineering includes a repository-local composite action, a root GitHub Action release-candidate metadata surface, a local Codex plugin scaffold, and a local MCP resource-index scaffold.

## Disallowed Claim

Mimesis Engineering has shipped a Marketplace action, verified external integration, or external adoption proof.

## Boundary

${boundary}

This packet does not create a tag, publish a Marketplace listing, publish an npm package, ship a plugin, verify external integration, or prove adoption.
It is not a marketplace action, not a tagged public action release, and not external adoption proof.

## Source Files

- [Plugin Status](../../plugins/status.md)
- [Codex Plugin Shape](../../plugins/codex-plugin.md)
- [Codex Plugin Manifest](../../plugins/mimesis-codex/.codex-plugin/plugin.json)
- [Codex Plugin Skill](../../plugins/mimesis-codex/skills/mimesis-loop/SKILL.md)
- [MCP Server Shape](../../plugins/mcp-server.md)
- [MCP Stdio Server Candidate](../../tools/mcp-stdio-server.mjs)
- [MCP Stdio Runtime Audit](../../tools/audit-mcp-stdio-runtime.mjs)
- [MCP Resource Index](../../.mimesis/mcp/resource-index.json)
- [GitHub Action Shape](../../plugins/github-action.md)
- [Action Release Candidate](../../docs/ACTION-RELEASE-CANDIDATE.md)
- [Root action.yml](../../action.yml)
- [Repository-local release-check action](../../.github/actions/release-check/action.yml)
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[plugin-release-packet] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

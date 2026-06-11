#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "plugin-install-packets", "codex-local.md");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function firstHeading(markdown) {
  return markdown.split(/\r?\n/).find((line) => line.startsWith("# "))?.replace(/^#\s+/, "") ?? "unknown";
}

const packageJson = readJson("package.json");
const manifest = readJson("plugins/mimesis-codex/.codex-plugin/plugin.json");
const skill = read("plugins/mimesis-codex/skills/mimesis-loop/SKILL.md");
const pluginReadme = read("plugins/mimesis-codex/README.md");
const statusMatrix = read("plugins/status.md");

const generated = `# Mimesis Local Codex Plugin Install Packet

Generated from the current local repository state for Mimesis Engineering v${packageJson.version}.

Status: local Codex plugin install packet, not installation proof.

## Install Candidate

- plugin name: \`${manifest.name}\`
- plugin version: \`${manifest.version}\`
- display name: \`${manifest.interface?.displayName ?? "unknown"}\`
- manifest: \`plugins/mimesis-codex/.codex-plugin/plugin.json\`
- skills directory: \`plugins/mimesis-codex/skills/\`
- primary skill: \`plugins/mimesis-codex/skills/mimesis-loop/SKILL.md\`
- skill heading: \`${firstHeading(skill)}\`
- current status: prototype scaffold

This candidate is local repository evidence only.
It is not a shipped plugin, Marketplace listing, installation proof, or external adoption proof.

## Local Verification

Run before any manual install attempt:

\`\`\`bash
npm run audit:codex-plugin
npm run audit:plugin-packet
npm run validate
\`\`\`

The current local scaffold must keep these signals:

- manifest exposes \`./skills/\`
- skill includes \`Give AI standards, not roles\`
- skill includes \`Bring one weak artifact\`
- skill keeps source-first and proof-boundary guardrails
- plugin README states prototype scaffold and not a shipped plugin
- status matrix keeps Codex Plugin at \`prototype\`

## Manual Install Steps

Use only in an owner-controlled Codex environment.

1. Review \`plugins/mimesis-codex/.codex-plugin/plugin.json\`.
2. Review \`plugins/mimesis-codex/skills/mimesis-loop/SKILL.md\`.
3. Copy or symlink \`plugins/mimesis-codex\` into the owner-controlled local Codex plugin location.
4. Restart or reload Codex according to the local Codex plugin workflow.
5. Confirm the \`mimesis-loop\` skill appears.
6. Run a local weak-artifact loop and cite the case evidence before making any install or usage claim.

This packet does not install anything and does not assume a specific user plugin directory.

## Rollback

If the local install attempt fails:

1. Remove the copied or symlinked \`mimesis-codex\` directory from the owner-controlled Codex plugin location.
2. Restart or reload Codex.
3. Keep any failure notes in a local evidence packet before claiming plugin readiness.

## Source Snapshot

Manifest excerpt:

\`\`\`json
${JSON.stringify(
  {
    name: manifest.name,
    version: manifest.version,
    skills: manifest.skills,
    displayName: manifest.interface?.displayName,
    shortDescription: manifest.interface?.shortDescription,
  },
  null,
  2,
)}
\`\`\`

Skill guardrail snapshot:

\`\`\`text
${skill
  .split(/\r?\n/)
  .filter((line) =>
    /Give AI standards|Bring one weak artifact|source-first|proof boundary|not a shipped plugin|fake proof|external proof/i.test(line),
  )
  .join("\n")}
\`\`\`

Status matrix contains Codex prototype: ${/Codex Plugin \| `prototype`/.test(statusMatrix) ? "yes" : "missing"}
README boundary contains not shipped plugin: ${/not a shipped plugin/i.test(pluginReadme) ? "yes" : "missing"}

## Allowed Claim

Mimesis Engineering includes a local Codex plugin prototype scaffold and a generated local install candidate packet.

## Disallowed Claim

Do not claim the Codex plugin is shipped, installed, marketplace-listed, externally adopted, verified by Codex, or used by a real external operator because this packet exists.

## Boundary

This packet does not install the plugin, does not publish, does not create a Marketplace listing, does not create a tag, does not ship a plugin, does not verify external integration, does not prove external adoption, does not prove official host compliance, and does not replace owner review.

It is a local install-readiness handoff for a prototype scaffold.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[plugin-install-packet] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

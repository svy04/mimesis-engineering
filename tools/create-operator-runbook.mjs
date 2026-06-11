#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = path.resolve(root, "..");
const outputPath = path.join(root, ".mimesis", "operator-runbooks", "current-runbook.md");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function existsFromWorkspace(relativePath) {
  return fs.existsSync(path.join(workspaceRoot, relativePath));
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

const packageJson = JSON.parse(read("package.json"));
const ecosystem = read("docs/ECOSYSTEM.md");
const completionAudit = read("docs/COMPLETION-AUDIT.md");
const proofQueue = read("docs/V0.2-PROOF-QUEUE.md");
const releasePacket = read("docs/V0.1-RELEASE-PACKET.md");
const gateBoard = fs.existsSync(path.join(root, ".mimesis", "gates", "current-gateboard.md"))
  ? read(".mimesis/gates/current-gateboard.md")
  : "Run npm run gate:board to generate current gates.";

const repoRows = [
  ["mimesis-engineering", "framework hub", "method, protocol, templates, packets, validators"],
  ["mimesis-canvas", existsFromWorkspace("mimesis-canvas/README.md") ? "available locally" : "not found locally", "worksheet and 10-part canvas"],
  ["mimesis-casebook", existsFromWorkspace("mimesis-casebook/README.md") ? "available locally" : "not found locally", "before/after cases and proof-boundary examples"],
];

const nextGates = extractSection(completionAudit, "Next Gates");
const proofCommandPath = extractSection(proofQueue, "Required Command Path");
const releaseStopConditions = extractSection(releasePacket, "Stop Conditions");

const generated = `# Mimesis Operator Runbook

Generated from the current local repository state for Mimesis Engineering v${packageJson.version}.

Status: local operator runbook, not external proof.

## 30-Second Orientation

Give AI standards, not roles.
Bring one weak artifact.
Use the ecosystem this way:

- \`mimesis-engineering\` defines the protocol and validates the artifact trail.
- \`mimesis-canvas\` helps shape fuzzy work before the full protocol.
- \`mimesis-casebook\` shows before/after case grammar and proof-boundary writing.

## Repository Roles

| Repository | Local Status | Role |
| --- | --- | --- |
${repoRows.map((row) => `| \`${row[0]}\` | ${row[1]} | ${row[2]} |`).join("\n")}

Source map:

${extractSection(ecosystem, "Repositories")}

## 5-Minute First Loop

1. Read \`README.md\` for the 30-second frame.
2. Pick one weak artifact.
3. If the artifact is still fuzzy, use \`mimesis-canvas\` to fill the canvas.
4. Pick one reference pack from \`reference-packs/\`.
5. Run:

\`\`\`bash
npm run cli -- case:start --artifact path/to/weak.md --reference-pack reference-packs/github-readme.md --title "First Loop"
\`\`\`

6. Complete the generated \`.mimesis\` files.
7. Run:

\`\`\`bash
npm run ecosystem:resources
npm run cli -- case:check path/to/case
npm run release:check:public
\`\`\`

## First External Proof Loop

Generate the submitter kit:

\`\`\`bash
npm run proof:intake
\`\`\`

Then run the first permissioned or clearly redacted external weak artifact through:

${proofCommandPath}

Use \`mimesis-casebook\` for case-note grammar only.
Do not treat casebook examples as proof that the new case is complete.

## Publication Readiness Loop

Before any public release, generate current handoffs:

\`\`\`bash
npm run release:packet
npm run proof:packet
npm run license:packet
npm run plugin:packet
npm run publish:packet
npm run gate:board
npm run operator:runbook
npm run ecosystem:resources
npm run release:check:public
\`\`\`

Strict publish readiness still requires:

\`\`\`bash
npm run release:ready:publish
\`\`\`

## Evidence Commands

- \`npm run audit:ecosystem\` checks neighboring local resources.
- \`npm run ecosystem:resources\` indexes local ecosystem resources without copying neighboring repository content.
- \`npm run audit:remote\` checks public repository visibility only.
- \`npm run gate:board\` summarizes current owner/proof/publication gates.
- \`npm run proof:intake\` creates the first external proof intake kit.
- \`npm run case:review\` checks permissioned intake.
- \`npm run case:from-intake\` creates a started external case workspace.
- \`npm run case:check\` checks completed local case evidence.
- \`npm run evidence:check\` checks strong-claim evidence packets.
- \`npm run audit:sync:strict\` requires a clean synced worktree before publish readiness.

## Current Gate Snapshot

${gateBoard}

## Stop Conditions

${releaseStopConditions}

Additional operator stop conditions:

- Do not publish a case without permission, redaction, and proof boundary.
- Do not describe \`mimesis-canvas\` or \`mimesis-casebook\` as external adoption proof.
- Do not describe the ecosystem resource packet as copied neighboring repository content.
- Do not describe local packet generation as publication.
- Do not describe remote visibility as remote freshness.

## Remaining Gates

${nextGates}

## Boundary

This runbook does not prove external adoption, does not choose a license, does not create external proof, does not publish to npm, does not publish a GitHub Marketplace action, does not tag a release, and does not push commits.
It is a local operating path through the current repo resources.
It does not copy neighboring repository content.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[operator-runbook] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

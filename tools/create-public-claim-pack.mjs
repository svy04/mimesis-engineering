#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "claim-packs", "public-v0.1.md");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function has(relativePath, text) {
  return read(relativePath).toLowerCase().includes(text.toLowerCase());
}

function countRequirementRows(markdown) {
  const section = markdown.split("## Requirement Matrix", 2)[1]?.split("## Allowed Completion Claim", 1)[0] ?? "";
  return section
    .split(/\r?\n/)
    .filter((line) => line.startsWith("| "))
    .filter((line) => !line.includes("---"))
    .filter((line) => !line.includes("Requirement | Current Status"))
    .length;
}

const packageJson = JSON.parse(read("package.json"));
const status = has("STATUS.md", "Public working framework")
  ? "public working framework"
  : "local framework candidate";
const completionRows = countRequirementRows(read("docs/COMPLETION-AUDIT.md"));
const releasePreflight = packageJson.scripts?.["release:check:public"]
  ? "npm run release:check:public"
  : "npm run release:check";

const generated = `# Mimesis Public Claim Pack

Generated from the local repository evidence for Mimesis Engineering v${packageJson.version}.

Status: ${status}.

## Allowed Public Claims

- Mimesis Engineering v0.1 is a Markdown-first, artifact-first AI-native work framework.
- Give AI standards, not roles.
- Bring one weak artifact.
- The repository includes a \`.mimesis\` file protocol, templates, reference packs, prompts, cases, adapters, plugin shapes, and local validators.
- The repository includes local handoff packets for proof intake, license decision, plugin/action release candidates, publish/sync, gate status, operator runbook, and public claims.
- The local preflight command is \`${releasePreflight}\`.
- The completion matrix currently tracks ${Math.max(0, completionRows)} requirement rows in \`docs/COMPLETION-AUDIT.md\`.

## Disallowed Public Claims

- This does not prove external adoption.
- This does not prove benchmarked productivity.
- This does not choose a license.
- This does not publish to npm, GitHub Marketplace, a package registry, or a tagged action release.
- This does not prove remote content freshness.
- This does not prove legal originality, customer outcomes, production-grade security, or commercial results.

## Evidence To Cite

- \`README.md\`
- \`STATUS.md\`
- \`docs/ACTIVATION-SURFACE.md\`
- \`docs/COMPLETION-AUDIT.md\`
- \`docs/PROOF-BOUNDARY.md\`
- \`docs/V0.1-RELEASE-PACKET.md\`
- \`docs/GATEBOARD.md\`
- \`docs/PUBLISH-HANDOFF-PACKET.md\`
- \`docs/SECRET-SAFETY-GATE.md\`
- \`.mimesis/run_ledger.md\`

## Copy Snippets

Short:

\`\`\`text
Mimesis Engineering v0.1 is a locally validated, Markdown-first public framework for giving AI standards, not roles.
\`\`\`

Action:

\`\`\`text
Bring one weak artifact, study strong references, transform the artifact, and show the proof boundary.
\`\`\`

Boundary:

\`\`\`text
This is local framework evidence, not proof of external adoption, benchmarked productivity, package publication, or customer outcomes.
\`\`\`

## Stop Conditions

Do not publish a stronger public claim if:

- \`${releasePreflight}\` fails
- \`docs/COMPLETION-AUDIT.md\` does not support the claim
- \`docs/PROOF-BOUNDARY.md\` conflicts with the claim
- a copy snippet implies adoption, benchmark, release, legal originality, security, or customer proof without evidence
- the claim says a license has been chosen before the owner decision is made
- the claim says npm, Marketplace, plugin, tag, PR, or remote publication happened without current proof

## Boundary

This claim pack is a local copy guardrail.

It does not publish, post, stage, commit, push, tag, create a pull request, choose a license, create external proof, create engagement, prove remote freshness, or certify marketing copy.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[claim-pack] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

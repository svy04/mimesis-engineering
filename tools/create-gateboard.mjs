#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "gates", "current-gateboard.md");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function has(text, pattern) {
  return pattern.test(text);
}

function statusText(done, blocked, waiting) {
  if (done) {
    return "ready locally";
  }
  if (blocked) {
    return "blocked by owner or external evidence";
  }
  if (waiting) {
    return "waiting for proof";
  }
  return "not verified";
}

const packageJson = JSON.parse(read("package.json"));
const completionAudit = read("docs/COMPLETION-AUDIT.md");
const proofQueue = read("docs/V0.2-PROOF-QUEUE.md");
const licenseDecision = read("docs/LICENSE-DECISION.md");
const publishSyncGate = read("docs/PUBLISH-SYNC-GATE.md");
const packageCandidate = read("docs/PACKAGE-RELEASE-CANDIDATE.md");
const actionCandidate = read("docs/ACTION-RELEASE-CANDIDATE.md");
const pluginPacket = read("docs/PLUGIN-RELEASE-PACKET.md");
const benchmarkPacket = read("docs/BENCHMARK-PACKET.md");

const gates = [
  {
    name: "v0.1 local framework preflight",
    status: statusText(
      has(completionAudit, /Release preflight \| complete/i),
      false,
      false,
    ),
    evidence: "docs/COMPLETION-AUDIT.md, npm run release:check:public",
    next: "Run release preflight after each public-surface edit.",
    boundary: "Local coherence only; not external adoption or publication.",
  },
  {
    name: "strict publish sync",
    status: "requires runtime audit",
    evidence: "npm run audit:sync:strict; optional report: npm run audit:sync",
    next: "Run the runtime-only strict sync audit after the intended branch is clean and pushed.",
    boundary: "The committed gate board is not a sync proof and does not stage, commit, push, tag, or release.",
  },
  {
    name: "owner license decision",
    status: statusText(false, has(licenseDecision, /owner decision required/i), false),
    evidence: "docs/LICENSE-DECISION.md, .mimesis/license-packets/owner-decision.md",
    next: "Owner chooses license text before open-source reuse or npm publish claims.",
    boundary: "No legal advice and no license choice is made by this board.",
  },
  {
    name: "first permissioned external proof",
    status: statusText(
      false,
      has(proofQueue, /No permissioned external weak artifact has been submitted yet/i),
      true,
    ),
    evidence: "docs/V0.2-PROOF-QUEUE.md, docs/PROOF-READINESS-PACKET.md, .mimesis/proof-runs/readiness.md, templates/permissioned-case-intake.md",
    next: "Run proof:readiness, collect one permissioned or clearly redacted weak artifact, then run the full proof path.",
    boundary: "No v0.2 external proof claim until case:review, case:from-intake, case:check, evidence:check, and public preflight pass.",
  },
  {
    name: "package publication",
    status: statusText(false, has(packageCandidate, /not an npm package release/i), false),
    evidence: "docs/PACKAGE-RELEASE-CANDIDATE.md, npm run audit:package",
    next: "Owner chooses license, then publish from owner-controlled npm account if desired.",
    boundary: "Dry-run package surface only; not npm publication.",
  },
  {
    name: "action publication",
    status: statusText(false, has(actionCandidate, /not a marketplace action/i), false),
    evidence: "docs/ACTION-RELEASE-CANDIDATE.md, npm run audit:action",
    next: "Create tag/release or Marketplace listing only after owner publication decision.",
    boundary: "Repository-local action candidate only; not Marketplace publication.",
  },
  {
    name: "shipped plugin claim",
    status: statusText(false, has(pluginPacket, /does not publish a marketplace action/i), false),
    evidence: "docs/PLUGIN-RELEASE-PACKET.md, .mimesis/plugin-release-packets/v0.1-action-candidate.md",
    next: "Produce a real tagged plugin/action release and evidence packet before shipped-plugin claims.",
    boundary: "Release-candidate handoff only; not a shipped plugin.",
  },
  {
    name: "benchmark or adoption claim",
    status: statusText(
      false,
      has(completionAudit, /no benchmark study/i) || has(completionAudit, /no external adoption evidence/i),
      false,
    ),
    evidence: "docs/COMPLETION-AUDIT.md, docs/BENCHMARK-PACKET.md, .mimesis/benchmark-packets/v0.2-first-benchmark.md, templates/evidence-packet.md",
    next: "Use the benchmark packet, then create a reviewed evidence packet from a real measurement or adoption event.",
    boundary: "Measurement protocol only; no broad productivity, customer outcome, or adoption claim without direct evidence.",
  },
];

const generated = `# Mimesis Current Gate Board

Generated from the current local repository state for Mimesis Engineering v${packageJson.version}.

Status: local gate board, not completion proof.

## Runtime Sync Gate

- authoritative check: \`npm run audit:sync:strict\`
- optional report file: \`npm run audit:sync\` writes \`.mimesis/sync-status.md\`
- committed gate board is not a sync proof
- runtime-only strict sync audit is required after the intended branch is clean and pushed
- this board intentionally avoids branch, commit hash, upstream head, and dirty-worktree snapshot lines

## Gate Table

| Gate | Current Status | Evidence | Next Action | Boundary |
| --- | --- | --- | --- | --- |
${gates.map((gate) => `| ${gate.name} | ${gate.status} | ${gate.evidence} | ${gate.next} | ${gate.boundary} |`).join("\n")}

## Allowed Claim

The repository has a local gate board that summarizes remaining owner, proof, sync, package, action, plugin, benchmark, and adoption gates.

## Disallowed Claim

This board does not prove that the framework is externally adopted, benchmarked, legally licensed for reuse, published to npm, published as a GitHub Marketplace action, shipped as a plugin, remotely fresh, synced to upstream, or production-ready.

## Boundary

This gate board does not choose a license, create external proof, run a transformation, stage files, create a commit, push, tag, create a pull request, publish to npm, publish a GitHub Marketplace action, prove remote freshness, close the runtime-only strict sync audit, prove benchmarked productivity, or prove external adoption.

Source boundaries:

- ${publishSyncGate.split(/\r?\n/)[0]}
- ${proofQueue.split(/\r?\n/)[0]}
- ${licenseDecision.split(/\r?\n/)[0]}
- ${benchmarkPacket.split(/\r?\n/)[0]}
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[gate-board] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

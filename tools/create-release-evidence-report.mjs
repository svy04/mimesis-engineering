#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "release-evidence", "v0.1-report.md");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function has(content, text) {
  return content.toLowerCase().includes(text.toLowerCase()) ? "yes" : "missing";
}

const packageJson = readJson("package.json");
const releaseExecution = read(".mimesis/release-execution/v0.1-owner-handoff.md");
const decisionRecord = readJson(".mimesis/release-decisions/owner-decision-record.json");
const publishHandoff = read(".mimesis/publish-packets/local-sync-handoff.md");
const packageCandidate = read("docs/PACKAGE-RELEASE-CANDIDATE.md");
const actionCandidate = read("docs/ACTION-RELEASE-CANDIDATE.md");
const pluginPacket = read("docs/PLUGIN-RELEASE-PACKET.md");
const gateBoard = read(".mimesis/gates/current-gateboard.md");

const evidenceRows = [
  ["commit", "git commit hash or PR URL", "not_captured", "required before claiming the local work was committed"],
  ["push", "remote branch URL and commit hash", "not_captured", "required before claiming GitHub remote freshness"],
  ["tag", "git tag and GitHub release URL", "not_captured", "required before claiming a tagged release"],
  ["npm", "npm package URL and published version", "not_captured", "required before claiming npm publication"],
  ["GitHub Action", "GitHub Marketplace URL or tagged action release URL", "not_captured", "required before claiming action publication"],
  ["plugin", "plugin release URL, install proof, or host listing", "not_captured", "not shipped plugin evidence; required before claiming shipped plugin status"],
  ["external proof", "reviewed evidence packet and case URL or path", "not_captured", "not proof; required before claiming external proof"],
  ["benchmark or adoption", "reviewed benchmark/adoption evidence packet", "not_captured", "not benchmark/adoption proof; required before productivity or adoption claims"],
];

const evidenceTable = evidenceRows
  .map(([surface, evidence, state, boundary]) => `| ${surface} | ${evidence} | ${state} | ${boundary} |`)
  .join("\n");

const generated = `# Mimesis Release Evidence Report

Status: release evidence report packet, not publication.

Generated for Mimesis Engineering v${packageJson.version} from the owner release execution handoff, release decision record, publish handoff, package candidate, action candidate, plugin packet, and gate board.

## Report Inputs

Required local inputs:

- docs/RELEASE-EXECUTION-PACKET.md
- .mimesis/release-execution/v0.1-owner-handoff.md
- docs/RELEASE-DECISION-RECORD.md
- .mimesis/release-decisions/owner-decision-record.json
- docs/PUBLISH-HANDOFF-PACKET.md
- .mimesis/publish-packets/local-sync-handoff.md
- docs/PACKAGE-RELEASE-CANDIDATE.md
- docs/ACTION-RELEASE-CANDIDATE.md
- docs/PLUGIN-RELEASE-PACKET.md
- .mimesis/gates/current-gateboard.md

Source checks:

- release execution handoff says not release execution: ${has(releaseExecution, "not release execution")}
- release decision status: ${decisionRecord.status ?? "missing"}
- publish handoff says not publication: ${has(publishHandoff, "not publication")}
- package candidate says not an npm package release: ${has(packageCandidate, "not an npm package release")}
- action candidate says not a marketplace action: ${has(actionCandidate, "not a marketplace action")}
- plugin packet says not a shipped plugin: ${has(pluginPacket, "not a shipped plugin")}
- gate board blocks publication or proof claims: ${has(gateBoard, "blocked by owner or external evidence")}

## Publication Evidence Table

| Surface | Required Evidence | Current State | Claim Boundary |
| --- | --- | --- | --- |
${evidenceTable}

## Required Release Evidence

Before making any release or publication claim, attach direct evidence for the specific surface:

- git commit hash
- pushed branch URL
- git tag
- GitHub release URL
- npm package URL
- published npm version
- GitHub Marketplace URL
- tagged GitHub Action release URL
- plugin release URL
- plugin install proof
- release:check:public output
- audit:sync:strict output after the worktree is intended to be clean
- owner license decision
- reviewed evidence packet for any external proof, benchmark, adoption, customer outcome, or shipped-plugin claim

## Stop Conditions

Stop before a release claim if:

- release:check:public has not passed fresh
- audit:sync:strict has not passed after the worktree is intended to be clean
- package.json remains private while npm publication is being claimed
- package.json remains UNLICENSED while open-source reuse is being claimed
- there is no git tag while tagged release is being claimed
- there is no GitHub release URL while release publication is being claimed
- there is no npm package URL while npm publication is being claimed
- there is no GitHub Marketplace URL or tagged action release URL while action publication is being claimed
- there is no plugin release URL or install proof while shipped plugin status is being claimed
- there is no reviewed evidence packet while external proof, benchmark, adoption, customer outcome, or endorsement is being claimed

## Allowed Claim

Mimesis has a local release evidence report packet that names the direct evidence required before release, npm, action, plugin, proof, benchmark, or adoption claims.

## Disallowed Claim

This report does not publish.
It does not stage files.
It does not create a commit.
It does not push.
It does not create a tag.
It does not create a GitHub release.
It does not publish to npm.
It does not publish a GitHub Marketplace action.
It does not ship a plugin.
It does not choose a license.
It does not create external proof.
It does not prove external adoption, benchmarked productivity, customer outcomes, legal originality, endorsement, npm publication, Marketplace publication, or shipped plugin status.

## Boundary

This release evidence report is an evidence checklist only.
It does not publish.
It does not create a tag.
It does not publish to npm.
It does not publish a GitHub Marketplace action.
It does not create external proof.
It does not replace owner review, legal review, release preflight, npm account control, GitHub release evidence, Marketplace evidence, plugin install evidence, or reviewed evidence packets.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[release-evidence-report] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

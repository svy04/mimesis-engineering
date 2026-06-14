#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "release-decisions", "owner-decision-record.json");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const packageJson = JSON.parse(read("package.json"));
const gateBoard = fs.existsSync(path.join(root, ".mimesis", "gates", "current-gateboard.md"))
  ? read(".mimesis/gates/current-gateboard.md")
  : "";

const record = {
  schema: "mimesis.release-decision-record.v0.1",
  generatedAt: new Date().toISOString(),
  status: "owner_decision_required",
  package: {
    name: packageJson.name,
    version: packageJson.version,
    private: packageJson.private === true,
    license: packageJson.license ?? "none",
  },
  syncProof: {
    currentSignal: "runtime_sync_audit_required",
    requiredCommand: "npm run audit:sync:strict",
    committedRecordIsNotSyncProof: true,
  },
  license: {
    decision: "pending",
    currentSignal: packageJson.license === "UNLICENSED" ? "UNLICENSED" : packageJson.license ?? "none",
    ownerQuestion: "Choose a reuse license or keep the no-reuse boundary.",
    requiredEvidence: ["docs/LICENSE-DECISION.md", ".mimesis/license-packets/owner-decision.md"],
  },
  publicRelease: {
    decision: "pending",
    currentSignal: "runtime_sync_audit_required",
    ownerQuestion: "Decide whether this local work belongs in a public release, PR, or unpublished local packet.",
    requiredEvidence: ["npm run release:check:public", "npm run audit:sync:strict"],
  },
  npmPublication: {
    decision: "blocked",
    currentSignal: packageJson.private === true ? "package_private_true" : "package_private_false",
    ownerQuestion: "Decide whether npm publication is in scope after license and sync gates close.",
    requiredEvidence: ["docs/PACKAGE-RELEASE-CANDIDATE.md", "npm run audit:package"],
  },
  actionPublication: {
    decision: "blocked",
    currentSignal: "root_action_candidate_only",
    ownerQuestion: "Decide whether a tagged GitHub Action release or Marketplace listing is in scope.",
    requiredEvidence: ["docs/ACTION-RELEASE-CANDIDATE.md", "npm run audit:action"],
  },
  pluginPublication: {
    decision: "blocked",
    currentSignal: "plugin_scaffold_and_install_readiness_only",
    ownerQuestion: "Decide whether any plugin should be shipped after real installation or release proof exists.",
    requiredEvidence: ["docs/PLUGIN-INSTALL-PACKET.md", "docs/PLUGIN-RELEASE-PACKET.md"],
  },
  externalProof: {
    decision: "waiting_for_artifact",
    currentSignal: gateBoard.includes("first permissioned external proof") ? "gate_board_blocks_external_proof" : "proof_gate_not_refreshed",
    ownerQuestion: "Bring one permissioned or clearly redacted weak artifact before v0.2 proof claims.",
    requiredEvidence: ["docs/V0.2-PROOF-QUEUE.md", ".mimesis/proof-runs/readiness.md"],
  },
  benchmarkOrAdoption: {
    decision: "waiting_for_evidence",
    currentSignal: "protocol_only",
    ownerQuestion: "Collect reviewed benchmark or adoption evidence before productivity/adoption claims.",
    requiredEvidence: ["docs/BENCHMARK-PACKET.md", "templates/evidence-packet.md"],
  },
  requiredFreshCommands: [
    "npm run release:check:public",
    "npm run audit:sync:strict",
    "npm run audit:license",
    "npm run audit:package",
    "npm run audit:action",
  ],
  sourceFiles: [
    "docs/LICENSE-DECISION.md",
    "docs/RELEASE-EXECUTION-PACKET.md",
    "docs/PUBLISH-HANDOFF-PACKET.md",
    ".mimesis/gates/current-gateboard.md",
  ],
  boundaries: [
    "does_not_choose_license",
    "does_not_publish",
    "does_not_stage_commit_push_tag_release",
    "does_not_create_external_proof",
    "does_not_prove_adoption",
    "does_not_prove_sync",
  ],
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(record, null, 2)}\n`);

console.log(`[release-decision-record] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

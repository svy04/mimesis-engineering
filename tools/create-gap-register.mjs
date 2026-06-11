#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "gaps", "current-gap-register.json");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

const packageJson = readJson("package.json");
const releaseDecision = fs.existsSync(path.join(root, ".mimesis", "release-decisions", "owner-decision-record.json"))
  ? readJson(".mimesis/release-decisions/owner-decision-record.json")
  : {};
const gateBoard = fs.existsSync(path.join(root, ".mimesis", "gates", "current-gateboard.md"))
  ? read(".mimesis/gates/current-gateboard.md")
  : "";
const syncStatus = fs.existsSync(path.join(root, ".mimesis", "sync-status.md"))
  ? read(".mimesis/sync-status.md")
  : "";

const dirtySignal = releaseDecision.git?.cleanAndSynced === false || /clean and synced:\s*no/i.test(gateBoard);
const syncReady = /Status: synced/i.test(syncStatus) && /clean and synced:\s*yes/i.test(gateBoard);

const strictSyncGap = {
  id: "strict_publish_sync",
  title: "Strict publish sync gate",
  kind: "git_sync",
  status: dirtySignal ? "blocked" : "needs_fresh_verification",
  requiredEvidence: ["npm run audit:sync:strict", ".mimesis/sync-status.md"],
  nextAction: "Clean or intentionally publish local changes, then rerun the strict sync gate.",
  boundary: "Does not stage, commit, push, tag, release, or publish.",
};

const gaps = [
  ...(syncReady ? [] : [strictSyncGap]),
  {
    id: "owner_license_decision",
    title: "Owner license decision",
    kind: "owner_decision",
    status: releaseDecision.license?.decision === "pending" ? "pending_owner" : "needs_owner_review",
    requiredEvidence: ["docs/LICENSE-DECISION.md", ".mimesis/license-packets/owner-decision.md"],
    nextAction: "Owner chooses a reuse license or keeps the no-reuse boundary.",
    boundary: "Does not choose a license or provide legal advice.",
  },
  {
    id: "permissioned_external_artifact",
    title: "One permissioned external weak artifact",
    kind: "external_artifact",
    status: "waiting_for_artifact",
    requiredEvidence: ["docs/PROOF-INTAKE-KIT.md", ".mimesis/proof-intake/first-external-proof-kit.md"],
    nextAction: "Collect one user-submitted, permissioned, or clearly redacted weak artifact.",
    boundary: "Does not create external proof or grant permission.",
  },
  {
    id: "completed_external_case",
    title: "Completed permissioned before/after case",
    kind: "proof_case",
    status: "waiting_for_artifact",
    requiredEvidence: ["npm run cli -- case:review path/to/intake.md", "npm run cli -- case:from-intake path/to/intake.md", "npm run cli -- case:check path/to/case"],
    nextAction: "Run the reviewed artifact through the full case path and preserve the boundary check.",
    boundary: "Does not prove improvement, adoption, or outcome until the before/after case evidence exists.",
  },
  {
    id: "package_publication",
    title: "npm package publication",
    kind: "publication",
    status: packageJson.private === true ? "blocked" : "needs_owner_review",
    requiredEvidence: ["docs/PACKAGE-RELEASE-CANDIDATE.md", "npm run audit:package", "owner-controlled npm publish evidence"],
    nextAction: "After license and sync gates close, owner decides whether npm publication is in scope.",
    boundary: "Dry-run package checks are not npm publication.",
  },
  {
    id: "action_publication",
    title: "Tagged GitHub Action or Marketplace publication",
    kind: "publication",
    status: "blocked",
    requiredEvidence: ["docs/ACTION-RELEASE-CANDIDATE.md", "npm run audit:action", "tag or Marketplace release evidence"],
    nextAction: "Owner decides whether a tagged public action release or Marketplace listing is in scope.",
    boundary: "Repository-local action metadata is not Marketplace publication.",
  },
  {
    id: "shipped_plugin",
    title: "Shipped plugin or connector proof",
    kind: "integration",
    status: "blocked",
    requiredEvidence: ["docs/PLUGIN-RELEASE-PACKET.md", ".mimesis/plugin-release-packets/v0.1-action-candidate.md", "installation or release evidence packet"],
    nextAction: "Produce a real tagged plugin/action release or installation proof before shipped-plugin claims.",
    boundary: "Local plugin scaffolds and install-readiness packets are not shipped plugins.",
  },
  {
    id: "benchmark_study",
    title: "Benchmarked productivity evidence",
    kind: "measurement",
    status: "waiting_for_evidence",
    requiredEvidence: ["docs/BENCHMARK-PACKET.md", ".mimesis/benchmark-packets/v0.2-first-benchmark.md", "reviewed evidence packet"],
    nextAction: "Run the measurement protocol and review the resulting evidence before productivity claims.",
    boundary: "Measurement protocol only; no benchmark claim without direct evidence.",
  },
  {
    id: "external_adoption",
    title: "External adoption evidence",
    kind: "adoption",
    status: "waiting_for_evidence",
    requiredEvidence: ["templates/evidence-packet.md", "reviewed adoption evidence packet"],
    nextAction: "Collect and review real external usage evidence before adoption claims.",
    boundary: "Read-only public repository visibility is not external adoption.",
  },
];

const register = {
  schema: "mimesis.gap-register.v0.1",
  generatedAt: new Date().toISOString(),
  status: "open_gates_remain",
  completionAllowed: false,
  package: {
    name: packageJson.name,
    version: packageJson.version,
    private: packageJson.private === true,
    license: packageJson.license ?? "none",
  },
  gapCount: gaps.length,
  gaps,
  sourceFiles: [
    ".mimesis/gates/current-gateboard.md",
    ".mimesis/release-decisions/owner-decision-record.json",
    "docs/COMPLETION-AUDIT.md",
    "STATUS.md",
    "ROADMAP.md",
  ],
  boundaries: [
    "does_not_prove_completion",
    "does_not_publish",
    "does_not_stage_commit_push_tag_release",
    "does_not_choose_license",
    "does_not_create_external_proof",
    "does_not_prove_adoption",
  ],
  allowedClaim: "Mimesis has a local gap register that keeps remaining owner, proof, publication, benchmark, and adoption gates visible.",
  disallowedClaim: "The gap register does not mean the framework is externally proven, adopted, published, legally licensed for reuse, or complete.",
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(register, null, 2)}\n`);

console.log(`[gap-register] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

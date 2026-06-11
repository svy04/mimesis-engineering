#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "completion", "goal-completion-audit.json");
const objective = "전 레포 자원과 잘사용해서 프레임워크 완성할때까지 달리자";

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function includes(relativePath, text) {
  try {
    return readText(relativePath).includes(text);
  } catch {
    return false;
  }
}

const packageJson = readJson("package.json");
const gapRegister = readJson(".mimesis/gaps/current-gap-register.json");
const closureReview = readJson(".mimesis/gates/closure-review.json");
const state = readJson(".mimesis/state/current-state.json");
const releaseReview = readJson(".mimesis/release-review/v0.1-bundle.json");
const gapById = new Map((gapRegister.gaps ?? []).map((gap) => [gap.id, gap]));
const openGateIds = (gapRegister.gaps ?? []).map((gap) => gap.id);

function doneRequirement(id, title, evidence) {
  return {
    id,
    title,
    status: "proven_local",
    evidence,
    boundary: "local repository evidence only; does not prove external adoption or publication",
  };
}

function openGateRequirement(id, title) {
  const gap = gapById.get(id);
  return {
    id,
    title,
    status: "not_complete_open_gate",
    evidence: gap?.requiredEvidence ?? [],
    nextAction: gap?.nextAction ?? "See the current gap register.",
    boundary: gap?.boundary ?? "Does not close gates.",
  };
}

const requirements = [
  doneRequirement("readme_30_second", "README gives a 30-second understanding path", [
    "README.md",
    "docs/ACTIVATION-SURFACE.md",
  ]),
  doneRequirement("five_minute_execution", "Framework has a 5-minute execution path", [
    "README.md",
    "examples/weak-readme.md",
    "tools/create-first-loop-demo.mjs",
  ]),
  doneRequirement("mimesis_protocol", "Mimesis file protocol and loop are present", [
    "spec/file-protocol.md",
    ".mimesis/spec_lock.md",
    ".mimesis/procedure_tree.md",
    ".mimesis/run_ledger.md",
  ]),
  doneRequirement("ai_native_structure", "AI-native structure is exposed", [
    ".mimesis/framework-manifest.json",
    "adapters/README.md",
    "plugins/README.md",
    "reference-packs/",
    "prompts/README.md",
  ]),
  doneRequirement("proof_boundary", "Originality and proof boundary are explicit", [
    "PROOF-BOUNDARY.md",
    "docs/COMPLETION-AUDIT.md",
    ".mimesis/gates/closure-review.json",
  ]),
  doneRequirement("release_preflight", "Local release preflight is wired", [
    "npm run release:check",
    "tools/validate-mimesis.mjs",
    "tools/audit-release-readiness.mjs",
  ]),
  openGateRequirement("strict_publish_sync", "Strict publish sync gate"),
  openGateRequirement("owner_license_decision", "Owner license decision"),
  openGateRequirement("permissioned_external_artifact", "Permissioned external weak artifact"),
  openGateRequirement("completed_external_case", "Completed permissioned before/after case"),
  openGateRequirement("package_publication", "npm package publication"),
  openGateRequirement("action_publication", "Tagged GitHub Action or Marketplace publication"),
  openGateRequirement("shipped_plugin", "Shipped plugin or connector proof"),
  openGateRequirement("benchmark_study", "Benchmarked productivity evidence"),
  openGateRequirement("external_adoption", "External adoption evidence"),
];

const localSignals = {
  readmeHasCorePhrases:
    includes("README.md", "Give AI standards, not roles.") &&
    includes("README.md", "Bring one weak artifact."),
  completionAuditRows: includes("docs/COMPLETION-AUDIT.md", "Publication evidence packet"),
  releaseCheckScript: Boolean(packageJson.scripts?.["release:check"]),
  releaseReviewStatus: releaseReview.status ?? "unknown",
  closureReviewStatus: closureReview.status ?? "unknown",
  stateStatus: state.status ?? "unknown",
};

const complete = gapRegister.completionAllowed === true && closureReview.closureApproved === true && openGateIds.length === 0;

const audit = {
  schema: "mimesis.goal-completion-audit.v0.1",
  generatedAt: new Date().toISOString(),
  objective,
  status: complete ? "complete" : "not_complete_open_gates_remain",
  goalComplete: complete,
  completionAllowed: complete,
  package: {
    name: packageJson.name,
    version: packageJson.version,
    private: packageJson.private === true,
    license: packageJson.license ?? "none",
  },
  openGateCount: openGateIds.length,
  openGateIds,
  requirements,
  localSignals,
  sourceFiles: [
    ".mimesis/gaps/current-gap-register.json",
    ".mimesis/gates/closure-review.json",
    ".mimesis/state/current-state.json",
    ".mimesis/release-review/v0.1-bundle.json",
    "docs/COMPLETION-AUDIT.md",
    "README.md",
    "package.json",
  ],
  freshVerificationRequiredBeforeCompletion: [
    "npm run release:check",
    "npm run release:check:public",
    "npm run audit:sync:strict",
  ],
  allowedClaim:
    "Mimesis has a local goal completion audit that maps objective evidence and open gates without making a completion claim.",
  disallowedClaim:
    "The goal completion audit does not prove completion, does not mark the active goal complete, does not close gates, does not publish, does not choose a license, does not create external proof, and does not prove adoption.",
  boundaries: [
    "does_not_mark_goal_complete",
    "does_not_close_gates",
    "does_not_publish",
    "does_not_choose_license",
    "does_not_create_external_proof",
    "does_not_prove_adoption",
  ],
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(audit, null, 2)}\n`);

console.log(`[goal-completion-audit] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

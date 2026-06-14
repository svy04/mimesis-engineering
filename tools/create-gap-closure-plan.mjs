#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRegister = ".mimesis/gaps/current-gap-register.json";
const outputRelativePath = ".mimesis/gaps/closure-plan.json";
const outputPath = path.join(root, outputRelativePath);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

const closureInstructions = {
  strict_publish_sync: {
    closureType: "local_sync_gate",
    commands: [
      "npm run audit:sync",
      "npm run audit:sync:strict",
      "git status --short --branch",
    ],
    stopConditions: [
      "Stop if the worktree is dirty and no owner has requested staging, committing, pushing, tagging, releasing, or publishing.",
      "Stop if upstream sync cannot be verified from the local git state.",
    ],
    allowedClaimAfterClosure: "The strict local sync gate passed at the recorded time.",
  },
  owner_license_decision: {
    closureType: "owner_decision_gate",
    commands: [
      "npm run license:packet",
      "npm run audit:license-packet",
      "Record the owner's explicit license or no-reuse decision in the release decision record.",
    ],
    stopConditions: [
      "Stop if no owner decision exists.",
      "Stop if the request would require legal advice.",
    ],
    allowedClaimAfterClosure: "The owner recorded a license or no-reuse decision.",
  },
  permissioned_external_artifact: {
    closureType: "permissioned_artifact_gate",
    commands: [
      "npm run proof:intake",
      "npm run audit:proof-intake",
      "Collect one permissioned, user-submitted, or clearly redacted weak artifact.",
    ],
    stopConditions: [
      "Stop if permission, redaction, or submitter scope is unclear.",
      "Stop if the artifact contains secrets or private personal data that should not enter the case trail.",
    ],
    allowedClaimAfterClosure: "One permissioned or clearly redacted weak artifact is available for a proof loop.",
  },
  completed_external_case: {
    closureType: "proof_case_gate",
    commands: [
      "npm run cli -- case:review path/to/intake.md",
      "npm run cli -- case:from-intake path/to/intake.md",
      "npm run cli -- case:check path/to/case",
      "npm run cli -- evidence:from-case path/to/case --out path/to/evidence.md --force",
      "npm run cli -- evidence:review path/to/evidence.md --decision reviewed --reviewer \"Reviewer Name\" --note \"Reviewed against the proof boundary.\"",
    ],
    stopConditions: [
      "Stop if the case lacks before/after artifacts.",
      "Stop if the boundary check does not preserve what remains unproven.",
      "Stop if reviewed evidence is missing.",
    ],
    allowedClaimAfterClosure: "A permissioned before/after case exists with reviewed evidence and explicit proof boundaries.",
  },
  package_publication: {
    closureType: "publication_gate",
    commands: [
      "npm run audit:package",
      "npm run package:dry-run",
      "Owner-controlled npm publish command, only after license and sync gates close.",
    ],
    stopConditions: [
      "Stop if package.json remains private.",
      "Stop if the license decision is pending.",
      "Stop if strict sync has not passed.",
    ],
    allowedClaimAfterClosure: "The npm package was published only if owner-controlled publish evidence exists.",
  },
  action_publication: {
    closureType: "publication_gate",
    commands: [
      "npm run audit:action",
      "Owner-controlled git tag or GitHub Marketplace release flow, only after release gates close.",
    ],
    stopConditions: [
      "Stop if no tag or Marketplace release evidence exists.",
      "Stop if the repository-local action metadata is the only evidence.",
    ],
    allowedClaimAfterClosure: "A tagged GitHub Action or Marketplace release exists only if release evidence is attached.",
  },
  shipped_plugin: {
    closureType: "integration_gate",
    commands: [
      "npm run plugin:install-packet",
      "npm run plugin:packet",
      "npm run audit:plugin-install-packet",
      "npm run audit:plugin-packet",
      "Attach real installation, release, or connector availability evidence.",
    ],
    stopConditions: [
      "Stop if only local plugin scaffolds exist.",
      "Stop if no install or release evidence can be attached.",
    ],
    allowedClaimAfterClosure: "A plugin or connector shipped only if install or release evidence exists.",
  },
  benchmark_study: {
    closureType: "measurement_gate",
    commands: [
      "npm run benchmark:packet",
      "npm run audit:benchmark-packet",
      "Run the measurement protocol and review the resulting evidence packet.",
    ],
    stopConditions: [
      "Stop if no measured before/after study exists.",
      "Stop if evidence has not been reviewed.",
    ],
    allowedClaimAfterClosure: "A benchmark result can be claimed only within the measured study boundary.",
  },
  external_adoption: {
    closureType: "adoption_gate",
    commands: [
      "Create or collect a reviewed adoption evidence packet from templates/evidence-packet.md.",
      "npm run evidence:check path/to/reviewed-adoption-evidence.md",
      "npm run cli -- claim:from-evidence path/to/reviewed-adoption-evidence.md --out path/to/bounded-claim.md",
    ],
    stopConditions: [
      "Stop if public repository visibility is the only evidence.",
      "Stop if the evidence is not external, permissioned, or reviewed.",
    ],
    allowedClaimAfterClosure: "External adoption can be claimed only within the reviewed evidence packet boundary.",
  },
};

const register = readJson(sourceRegister);
const gaps = Array.isArray(register.gaps) ? register.gaps : [];

const steps = gaps.map((gap) => {
  const instruction = closureInstructions[gap.id] ?? {
    closureType: "manual_gate",
    commands: ["Review the gap register entry and attach direct evidence before changing any claim."],
    stopConditions: ["Stop if direct evidence is missing."],
    allowedClaimAfterClosure: "Only the directly evidenced closure can be claimed.",
  };

  return {
    id: gap.id,
    title: gap.title,
    currentStatus: gap.status,
    closureType: instruction.closureType,
    requiredEvidence: gap.requiredEvidence,
    commands: instruction.commands,
    stopConditions: instruction.stopConditions,
    allowedClaimAfterClosure: instruction.allowedClaimAfterClosure,
    boundary: gap.boundary,
    sourceNextAction: gap.nextAction,
  };
});

const plan = {
  schema: "mimesis.gap-closure-plan.v0.1",
  generatedAt: new Date().toISOString(),
  status: "closure_plan_not_closure",
  sourceRegister,
  completionAllowed: false,
  closureCount: steps.length,
  steps,
  boundaries: [
    "does_not_close_gates",
    "does_not_prove_completion",
    "does_not_publish",
    "does_not_stage_commit_push_tag_release",
    "does_not_choose_license",
    "does_not_create_external_proof",
    "does_not_prove_adoption",
  ],
  allowedClaim: "Mimesis has a local gap closure plan that explains how each open gate can be closed with direct evidence.",
  disallowedClaim: "The gap closure plan does not close gates, prove completion, publish, choose a license, create external proof, or prove adoption.",
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(plan, null, 2)}\n`);

console.log(`[gap-closure-plan] ${outputRelativePath}`);

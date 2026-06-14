#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function readJson(relativePath) {
  const content = read(relativePath);
  if (!content) {
    return {};
  }
  try {
    return JSON.parse(content);
  } catch (error) {
    failures.push(`${relativePath} is not valid JSON: ${error.message}`);
    return {};
  }
}

function commandIndex(commands, command) {
  return commands.indexOf(command);
}

function requireBefore(commands, earlier, later) {
  const earlierIndex = commandIndex(commands, earlier);
  const laterIndex = commandIndex(commands, later);

  if (earlierIndex < 0 || laterIndex < 0) {
    return;
  }

  if (earlierIndex >= laterIndex) {
    failures.push(`release:check must run npm run ${earlier} before npm run ${later}`);
  }
}

const requiredGapIds = [
  "strict_publish_sync",
  "owner_license_decision",
  "permissioned_external_artifact",
  "completed_external_case",
  "package_publication",
  "action_publication",
  "shipped_plugin",
  "benchmark_study",
  "external_adoption",
];

const requiredBoundaries = [
  "does_not_close_gates",
  "does_not_prove_completion",
  "does_not_publish",
  "does_not_stage_commit_push_tag_release",
  "does_not_choose_license",
  "does_not_create_external_proof",
  "does_not_prove_adoption",
];

const packageJson = readJson("package.json");
const cli = read("bin/mimesis.mjs");
const doc = read("docs/GAP-CLOSURE-PLAN.md");
const plan = readJson(".mimesis/gaps/closure-plan.json");
const readme = read("README.md");
const completion = read("docs/COMPLETION-AUDIT.md");
const toolsReadme = read("tools/README.md");
const status = read("STATUS.md");
const roadmap = read("ROADMAP.md");
const frameworkManifest = readJson(".mimesis/framework-manifest.json");
const releaseArtifactManifest = readJson(".mimesis/release-artifacts/v0.1-manifest.json");
const releaseCheck = packageJson.scripts?.["release:check"] ?? "";
const releaseCommands = releaseCheck
  .split("&&")
  .map((part) => part.trim())
  .map((part) => part.replace(/^npm\s+run\s+/, "").trim())
  .filter(Boolean);

if (!packageJson.scripts?.["gap:closure-plan"]) {
  failures.push("package.json missing script: gap:closure-plan");
}

if (!packageJson.scripts?.["audit:gap-closure-plan"]) {
  failures.push("package.json missing script: audit:gap-closure-plan");
}

if (!releaseCheck.includes("gap:closure-plan")) {
  failures.push("release:check must generate npm run gap:closure-plan");
}

if (!releaseCheck.includes("audit:gap-closure-plan")) {
  failures.push("release:check must include npm run audit:gap-closure-plan");
}

for (const [earlier, later] of [
  ["gap:register", "gap:closure-plan"],
  ["gap:closure-plan", "release:artifact-manifest"],
  ["gap:closure-plan", "audit:gap-closure-plan"],
  ["audit:gap-register", "audit:gap-closure-plan"],
  ["audit:gap-closure-plan", "audit:release-artifact-manifest"],
]) {
  requireBefore(releaseCommands, earlier, later);
}

if (!cli.includes('"gap:closure-plan"') || !cli.includes('"audit:gap-closure-plan"')) {
  failures.push("CLI missing gap:closure-plan or audit:gap-closure-plan command");
}

for (const text of [
  "gap closure plan",
  "does not close gates",
  "does not prove completion",
  "does not publish",
  "does not create external proof",
  "does not stage",
]) {
  if (!doc.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`docs/GAP-CLOSURE-PLAN.md missing text: ${text}`);
  }
}

if (plan.schema !== "mimesis.gap-closure-plan.v0.1") {
  failures.push("gap closure plan schema must be mimesis.gap-closure-plan.v0.1");
}

if (plan.status !== "closure_plan_not_closure") {
  failures.push("gap closure plan status must be closure_plan_not_closure");
}

if (plan.sourceRegister !== ".mimesis/gaps/current-gap-register.json") {
  failures.push("gap closure plan sourceRegister must point at .mimesis/gaps/current-gap-register.json");
}

if (plan.completionAllowed !== false) {
  failures.push("gap closure plan completionAllowed must be false");
}

if (!plan.generatedAt) {
  failures.push("gap closure plan missing generatedAt");
}

if (!Array.isArray(plan.steps) || plan.steps.length < requiredGapIds.length) {
  failures.push(`gap closure plan must include at least ${requiredGapIds.length} steps`);
}

if (plan.closureCount !== plan.steps?.length) {
  failures.push("gap closure plan closureCount must match steps.length");
}

const steps = Array.isArray(plan.steps) ? plan.steps : [];
const stepIds = new Set(steps.map((step) => step.id));

for (const id of requiredGapIds) {
  if (!stepIds.has(id)) {
    failures.push(`gap closure plan missing step id: ${id}`);
  }
}

for (const step of steps) {
  for (const field of [
    "id",
    "title",
    "currentStatus",
    "closureType",
    "requiredEvidence",
    "commands",
    "stopConditions",
    "allowedClaimAfterClosure",
    "boundary",
  ]) {
    if (!step[field] || (Array.isArray(step[field]) && step[field].length === 0)) {
      failures.push(`gap closure plan step ${step.id ?? "unknown"} missing field: ${field}`);
    }
  }

  if (step.currentStatus === "closed") {
    failures.push(`gap closure plan must not mark a gap as closed: ${step.id}`);
  }
}

const commandsById = new Map(steps.map((step) => [step.id, Array.isArray(step.commands) ? step.commands.join("\n") : ""]));

for (const [id, snippet] of [
  ["strict_publish_sync", "npm run audit:sync:strict"],
  ["permissioned_external_artifact", "npm run proof:intake"],
  ["completed_external_case", "case:review"],
  ["completed_external_case", "case:from-intake"],
  ["completed_external_case", "case:check"],
  ["benchmark_study", "npm run benchmark:packet"],
]) {
  if (!commandsById.get(id)?.includes(snippet)) {
    failures.push(`gap closure plan step ${id} missing command snippet: ${snippet}`);
  }
}

for (const boundary of requiredBoundaries) {
  if (!plan.boundaries?.includes(boundary)) {
    failures.push(`gap closure plan missing boundary: ${boundary}`);
  }
}

for (const text of [
  "Gap Closure Plan",
  "GAP-CLOSURE-PLAN.md",
  "../.mimesis/gaps/closure-plan.json",
  "../tools/create-gap-closure-plan.mjs",
  "../tools/audit-gap-closure-plan.mjs",
]) {
  if (!completion.includes(text)) {
    failures.push(`docs/COMPLETION-AUDIT.md missing gap closure plan evidence: ${text}`);
  }
}

for (const [name, content] of [
  ["README.md", readme],
  ["tools/README.md", toolsReadme],
  ["STATUS.md", status],
  ["ROADMAP.md", roadmap],
]) {
  if (!content.toLowerCase().includes("gap closure plan")) {
    failures.push(`${name} missing gap closure plan text`);
  }
}

for (const command of ["gap:closure-plan", "audit:gap-closure-plan"]) {
  if (!frameworkManifest.commands?.some((entry) => entry.name === command)) {
    failures.push(`.mimesis/framework-manifest.json commands missing ${command}`);
  }
}

const releaseArtifacts = new Set((releaseArtifactManifest.artifacts ?? []).map((artifact) => artifact.path));
for (const artifactPath of [
  "docs/GAP-CLOSURE-PLAN.md",
  ".mimesis/gaps/closure-plan.json",
  "tools/create-gap-closure-plan.mjs",
  "tools/audit-gap-closure-plan.mjs",
]) {
  if (!releaseArtifacts.has(artifactPath)) {
    failures.push(`release artifact manifest missing artifact: ${artifactPath}`);
  }
}

if (failures.length) {
  console.error("\nMimesis gap closure plan audit failed:");
  for (const failure of failures) {
    console.error(`[fail] ${failure}`);
  }
  process.exit(1);
}

console.log("Mimesis gap closure plan audit passed: open gates have bounded closure instructions without claiming closure.");

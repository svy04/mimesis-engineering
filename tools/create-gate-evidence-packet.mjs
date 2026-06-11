#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "gates", "evidence-packet.md");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

const packageJson = readJson("package.json");
const gapRegister = readJson(".mimesis/gaps/current-gap-register.json");
const closurePlan = readJson(".mimesis/gaps/closure-plan.json");
const evidenceTemplate = read("templates/evidence-packet.md");

const closureById = new Map((closurePlan.steps ?? []).map((step) => [step.id, step]));

function evidenceTypeFor(gap) {
  const types = {
    strict_publish_sync: "sync verification evidence, not publication evidence",
    owner_license_decision: "owner decision evidence, not legal advice",
    permissioned_external_artifact: "permission and artifact evidence, not proof by itself",
    completed_external_case: "permissioned before/after case evidence, not universal proof",
    package_publication: "package release event evidence, not dry-run evidence",
    action_publication: "tagged action or Marketplace release event evidence",
    shipped_plugin: "installation or release evidence, not local scaffold evidence",
    benchmark_study: "measurement evidence, not benchmark claim by itself",
    external_adoption: "reviewed adoption evidence, not public visibility evidence",
  };
  return types[gap.id] ?? `${gap.kind} evidence`;
}

function evidenceCommandFor(gap) {
  const commands = {
    strict_publish_sync: "npm run audit:sync:strict",
    owner_license_decision: "npm run release:decision-record && npm run audit:release-decision-record",
    permissioned_external_artifact: "npm run proof:intake && npm run audit:proof-intake",
    completed_external_case: "npm run cli -- case:review path/to/intake.md && npm run cli -- case:from-intake path/to/intake.md && npm run cli -- case:check path/to/case",
    package_publication: "npm run audit:package && npm run package:dry-run",
    action_publication: "npm run audit:action",
    shipped_plugin: "npm run plugin:packet && npm run audit:plugin-packet",
    benchmark_study: "npm run benchmark:packet && npm run audit:benchmark-packet",
    external_adoption: "npm run cli -- evidence:check path/to/reviewed-adoption-evidence.md --require-reviewed",
  };
  return commands[gap.id] ?? "Attach direct evidence, then run npm run cli -- evidence:check path/to/evidence.md";
}

const rows = (gapRegister.gaps ?? []).map((gap) => {
  const closure = closureById.get(gap.id) ?? {};
  const stopCondition = Array.isArray(closure.stopConditions) ? closure.stopConditions[0] : "Stop if direct evidence is missing.";
  const requiredEvidence = Array.isArray(gap.requiredEvidence) ? gap.requiredEvidence.join("<br>") : "";

  return `| \`${gap.id}\` | ${gap.title} | ${evidenceTypeFor(gap)} | ${requiredEvidence} | \`${evidenceCommandFor(gap)}\` | ${stopCondition} |`;
});

const generated = `# Mimesis Gate Evidence Packet

Status: evidence intake packet, not evidence.

Generated from the current gap register and gap closure plan for Mimesis Engineering v${packageJson.version}.

This packet answers one narrow question:

\`\`\`text
When a gate-closing artifact arrives, where should the evidence go?
\`\`\`

It keeps the framework rule intact:

\`\`\`text
No proof, no claim.
\`\`\`

## Evidence Intake Matrix

| Gap ID | Gate | Evidence Type | Minimum Evidence | First Command | Stop Condition |
| --- | --- | --- | --- | --- | --- |
${rows.join("\n")}

## Evidence Packet Template Bridge

Use [templates/evidence-packet.md](../../templates/evidence-packet.md) for any strong claim evidence.

Required evidence packet sections from the current template:

${evidenceTemplate
  .split(/\r?\n/)
  .filter((line) => line.startsWith("## "))
  .map((line) => `- ${line.replace(/^## /, "")}`)
  .join("\n")}

Draft, reviewed, and publishable evidence are different states.
Do not turn a draft packet into a public claim without review.

## Command Path

Use the existing evidence and review gates:

\`\`\`bash
npm run cli -- evidence:check path/to/evidence-packet.md
npm run cli -- evidence:review path/to/evidence-packet.md --decision reviewed --reviewer "Reviewer Name" --note "Reviewed against the proof boundary."
npm run cli -- evidence:check path/to/reviewed-evidence-packet.md --require-reviewed
\`\`\`

For a permissioned external case, run the case path before evidence review:

\`\`\`bash
npm run cli -- case:review path/to/intake.md
npm run cli -- case:from-intake path/to/intake.md
npm run cli -- case:check path/to/case
npm run cli -- evidence:from-case path/to/case --out path/to/evidence-packet.md --force
\`\`\`

## Allowed Claim

Mimesis has a local gate evidence packet that routes open gates to evidence packet requirements and review commands.

## Disallowed Claim

This gate evidence packet is not itself evidence.
It does not mean the gates are closed.
It does not mean Mimesis is externally proven, adopted, benchmarked, published, shipped, legally licensed for reuse, or complete.

## Boundary

This packet does not close gates.
It does not create evidence.
It does not prove completion.
It does not publish.
It does not stage, commit, push, tag, or release.
It does not choose a license.
It does not create external proof.
It does not prove adoption.
It does not prove benchmarked productivity.
It does not prove package publication, Marketplace publication, shipped plugin status, customer outcomes, commercial outcomes, or legal originality.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[gate-evidence-packet] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

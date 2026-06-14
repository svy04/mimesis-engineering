#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const targetArg = args.find((arg) => !arg.startsWith("--")) ?? ".";
const targetRoot = path.resolve(process.cwd(), targetArg);
const mimesisDir = path.join(targetRoot, ".mimesis");
const outputPath = path.join(mimesisDir, "case-publication-packets", "current-casebook-candidate.md");

function usage() {
  console.log(`Usage: mimesis case:publish-packet [target-dir]

Creates a local casebook candidate packet from a completed Mimesis case workspace.
It runs case:check first and does not publish anything.
`);
}

function readMimesis(relativePath) {
  return fs.readFileSync(path.join(mimesisDir, relativePath), "utf8");
}

function excerpt(content, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = content.match(new RegExp(`## ${escaped}\\s*\\n([\\s\\S]*?)(\\n## |$)`, "i"));
  return (match?.[1] ?? "").trim() || "See the source case file.";
}

if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

if (!fs.existsSync(mimesisDir)) {
  console.error(`Target does not contain a .mimesis directory: ${targetRoot}`);
  process.exit(1);
}

const caseCheck = spawnSync(process.execPath, [path.join(root, "tools", "check-case.mjs"), targetRoot, "--write-report"], {
  cwd: root,
  encoding: "utf8",
});

if (caseCheck.status !== 0) {
  console.error(caseCheck.stderr || caseCheck.stdout || "case:check failed");
  process.exit(caseCheck.status ?? 1);
}

const caseNote = readMimesis("case-note.md");
const boundaryCheck = readMimesis("boundary-check.md");
const improvedArtifact = readMimesis("improved-artifact.md");
const referenceSet = readMimesis("reference-set.md");
const relativeTarget = path.relative(root, targetRoot).replaceAll(path.sep, "/") || ".";
const relativeMimesis = path.relative(root, mimesisDir).replaceAll(path.sep, "/") || ".mimesis";

const generated = `# Mimesis Case Publication Packet

Status: local casebook candidate.

Target: \`${relativeTarget}\`

## Case Check Result

\`case:check --write-report\` passed for this local case workspace.

Generated local proof report:

\`\`\`text
${relativeMimesis}/case-proof.md
\`\`\`

## Casebook Shape

Use \`docs/CASEBOOK-PROTOCOL.md\` as the public case shape:

1. Starting Artifact
2. Mimesis Lens or Reference Structure
3. What Changed
4. What Remains Unproven
5. Next Proof Artifact

For external or user-submitted artifacts, review \`docs/PERMISSIONED-CASE-PACKET.md\` and \`docs/CASE-REVIEW-CHECKLIST.md\` before publication.

## Evidence To Copy

- \`${relativeMimesis}/case-note.md\`
- \`${relativeMimesis}/reference-set.md\`
- \`${relativeMimesis}/structure-map.md\`
- \`${relativeMimesis}/transformation-plan.md\`
- \`${relativeMimesis}/improved-artifact.md\`
- \`${relativeMimesis}/boundary-check.md\`
- \`${relativeMimesis}/run_ledger.md\`
- \`${relativeMimesis}/case-proof.md\`

## Candidate Case Excerpts

Starting artifact:

${excerpt(caseNote, "Starting Artifact")}

Reference artifacts:

${excerpt(caseNote, "Reference Artifacts") || excerpt(referenceSet, "References")}

What improved:

${excerpt(caseNote, "What Improved") || excerpt(improvedArtifact, "Why It Is Stronger")}

What remains unproven:

${excerpt(caseNote, "What Remains Unproven") || excerpt(boundaryCheck, "What Remains Unproven")}

## Publication Checklist

- Confirm the artifact owner has permissioned public, anonymized, or redacted publication.
- Remove private data, customer identifiers, credentials, and protected material.
- Keep source/reference provenance visible.
- Keep before/after evidence visible.
- Keep proof boundary visible.
- Run \`case:check\`, \`evidence:check\`, \`audit:secrets\`, and \`claim:pack\` before stronger public claims.
- Do not publish if permission, redaction, license, or proof boundaries are unclear.

## Allowed Claim

This local case workspace passed \`case:check\` and has a generated casebook candidate packet.

## Disallowed Claim

This packet does not publish the case, does not prove external adoption, does not prove benchmarked productivity, does not grant permission, does not choose a license, and does not certify legal originality.

## Boundary

This packet is local handoff evidence only.

It does not publish, post, stage, commit, push, tag, create a pull request, upload to a casebook, prove external adoption, prove benchmarked productivity, grant permission, choose a license, or certify legal originality.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[case-publication-packet] ${path.relative(process.cwd(), outputPath).replaceAll(path.sep, "/")}`);

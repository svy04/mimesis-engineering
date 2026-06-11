#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, ".mimesis", "benchmark-packets", "v0.2-first-benchmark.md");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const packageJson = JSON.parse(read("package.json"));
const completionAudit = read("docs/COMPLETION-AUDIT.md");
const benchmarkGap = /no benchmark study/i.test(completionAudit)
  ? "No benchmark study is currently recorded."
  : "Benchmark evidence must still be verified from current files.";
const adoptionGap = /no external adoption evidence/i.test(completionAudit)
  ? "No external adoption evidence is currently recorded."
  : "Adoption evidence must still be verified from current files.";

const generated = `# Mimesis Benchmark Packet

Generated from the current local repository state for Mimesis Engineering v${packageJson.version}.

Status: measurement protocol, not benchmark proof.

## Current Gap

- ${benchmarkGap}
- ${adoptionGap}

## Claim Under Test

Draft only:

\`\`\`text
Mimesis improves an artifact workflow measurably for one defined task, compared with the same task before the Mimesis loop.
\`\`\`

This is not an allowed public claim until measured evidence exists and passes \`evidence:check --require-reviewed\`.

## Measurement Design

Use a paired before/after design for one narrowly scoped workflow:

- same artifact type
- same operator or clearly described operator difference
- same target reader or evaluator profile
- same task constraints
- same time window or explicitly recorded time difference
- baseline artifact captured before the Mimesis loop
- improved artifact captured after the Mimesis loop
- evaluator rubric captured before scoring

Minimum fields to collect:

| Field | Required Evidence | Boundary |
| --- | --- | --- |
| baseline artifact | path, commit, screenshot, or archived text | not proof by itself |
| improved artifact | path, commit, screenshot, or archived text | not proof by itself |
| task time | timestamped operator log or timer record | not universal productivity proof |
| quality rubric | rubric file or evaluator notes | not legal originality proof |
| evaluator result | scored review or acceptance note | not broad adoption proof |
| adoption event | external issue, PR, install, fork, case submission, user report, or equivalent event | external adoption, not a claim by itself |

## Required Evidence

Before making a benchmarked productivity claim, collect:

- baseline artifact
- post-Mimesis artifact
- transformation ledger
- measurement method
- scoring rubric
- raw notes or logs
- evaluator or reviewer decision
- threats to validity
- completed \`templates/evidence-packet.md\`

Evidence types:

- benchmark study, not a claim by itself
- external adoption, not a claim by itself

## Adoption Evidence

External adoption can be claimed only for a named event such as:

- a third-party issue or case submission
- a user-submitted permissioned artifact
- a public fork or reuse event with context
- a tagged plugin/action/package use event
- a documented external before/after case

Do not count private intention, internal notes, fake engagement, vanity metrics, or unverifiable screenshots as adoption proof.

## Evidence Packet Path

Create an evidence packet from \`templates/evidence-packet.md\`, then run:

\`\`\`bash
npm run cli -- evidence:check path/to/evidence-packet.md --require-reviewed --write-report
\`\`\`

Short command form:

\`\`\`text
evidence:check --require-reviewed
\`\`\`

## Allowed Claim

Allowed now:

\`\`\`text
Mimesis Engineering includes a local benchmark/adoption measurement packet for future evidence collection.
\`\`\`

Allowed only after reviewed evidence exists:

\`\`\`text
In one named benchmark case, Mimesis improved the measured artifact workflow under the stated method and boundary.
\`\`\`

## Disallowed Claim

Not allowed from this packet:

\`\`\`text
Mimesis is benchmarked, externally adopted, commercially proven, or generally improves productivity.
\`\`\`

## Boundary

This packet does not create evidence, does not run a benchmark, does not prove benchmarked productivity, does not prove external adoption, does not prove customer outcomes, does not publish, does not create engagement, does not choose a license, and does not certify commercial impact.
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, generated);

console.log(`[benchmark-packet] ${path.relative(root, outputPath).replaceAll(path.sep, "/")}`);

---
name: mimesis-loop
description: Run a Mimesis Engineering artifact-first loop from one weak artifact while preserving source-first references and proof boundaries.
---

# Mimesis Loop

Use this skill when the user brings one weak artifact and wants to improve it through Mimesis Engineering.

Core standards:

- Give AI standards, not roles.
- Bring one weak artifact.
- Work source-first from primary references, public code, papers, official docs, or permissioned artifacts.
- Keep the proof boundary visible.
- Make no completion claim without files.

## Loop

1. Import: read the weak artifact and current `.mimesis` trail.
2. Distill: name the goal, constraints, references, and claims not allowed.
3. Capsule: split the transformation into small file-backed steps.
4. Shard: improve the artifact and update the matching `.mimesis` files.
5. Verify: run local checks such as `npm run validate`, `npm run case:check`, and any relevant audit.
6. Remember: append the evidence and remaining gaps to `.mimesis/run_ledger.md`.

## Guardrails

- Do not copy surface form from a reference.
- Do not hide references.
- Do not create fake engagement, fake proof, or fake adoption.
- Do not claim external proof from local fixtures.
- Do not claim a plugin is shipped unless a real release exists and is cited.

## Useful Commands

```bash
npm run cli -- init path/to/workspace
npm run cli -- case:start --artifact path/to/artifact.md --reference-pack reference-packs/github-readme.md --title "Artifact Loop"
npm run cli -- case:check path/to/workspace
npm run cli -- validate
npm run cli -- release:check
```

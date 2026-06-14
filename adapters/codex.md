# Codex Adapter Prototype

Status: `prototype`

Use when a builder wants Codex to run a Mimesis loop inside a repository.

## Current Prototype

This repository has been transformed through a Codex-operated Mimesis loop.

The prototype is not a packaged Codex plugin.
It is a documented workflow plus local file protocol evidence.

## Required Inputs

- weak artifact path or pasted artifact
- selected reference pack
- optional reference URLs or local files
- project boundary
- proof boundary

## Required Commands

Codex should follow this sequence:

1. Read the weak artifact and project docs.
2. Create or update `.mimesis/artifact-brief.md`.
3. Create or update `.mimesis/reference-set.md`.
4. Create or update `.mimesis/structure-map.md`.
5. Create or update `.mimesis/transformation-plan.md`.
6. Improve the target artifact.
7. Create or update `.mimesis/boundary-check.md`.
8. Create or update `.mimesis/case-note.md`.
9. Append evidence to `.mimesis/run_ledger.md`.

## Evidence

Local evidence in this repository:

- `.mimesis/run_ledger.md` records the Codex-operated framework completion run.
- `tools/validate-mimesis.mjs` validates the local framework protocol.
- `npm run validate` passes for the current framework surface.
- `tools/init-mimesis.mjs` initializes `.mimesis` workspaces from templates.
- `tools/audit-ecosystem.mjs` checks neighboring Mimesis repo resources.

Allowed claim:
The Codex adapter has a local prototype workflow in this repository.

Not allowed:
The Codex adapter is not a shipped Codex plugin, marketplace extension, or externally verified integration.

## Guardrails

- Do not commit secrets.
- Do not hide references.
- Do not copy protected surface.
- Do not claim verification without running checks.
- Do not call the loop complete without the artifact trail.

## Minimal User Prompt

```text
Run one Mimesis loop on this artifact.
Use the selected reference pack.
Create the .mimesis artifact trail.
Improve the artifact.
Show the proof boundary and update the run ledger.
```

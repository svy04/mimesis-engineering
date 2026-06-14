# Gemini CLI Adapter Prototype

Status: `prototype`

Use when a builder wants Gemini CLI to run a Mimesis loop over local files.

## Current Prototype

This repository can generate a Gemini CLI packet from the current `.mimesis` artifact trail.

The prototype is not a Gemini plugin package.
It does not execute Gemini CLI.
It prepares a local Markdown packet that can be passed to a CLI session.

## Required Inputs

- artifact file path
- reference pack file path
- `.mimesis` folder path
- constraints
- verification command if one exists

## Required Flow

```text
Import artifact
Import reference pack
Fill Artifact Brief
Fill Reference Set
Fill Structure Map
Fill Transformation Plan
Edit artifact
Fill Boundary Check
Fill Case Note
Append Run Ledger
```

## Guardrails

- Keep references visible.
- Reject shallow copying.
- Mark uncertain claims as unproven.
- Prefer local files over unverifiable claims.

## Evidence

Local evidence in this repository:

- `tools/create-cli-packet.mjs` generates a CLI packet from the current artifact trail.
- `npm run adapter:gemini` creates `.mimesis/adapter-packets/gemini-cli.md`.
- `.mimesis/adapter-packets/gemini-cli.md` contains the generated Gemini CLI packet.
- `npm run validate` passes for the current framework surface.

Allowed claim:
The Gemini CLI adapter has a local packet-generation prototype.

Not allowed:
The Gemini CLI adapter is not a shipped Gemini plugin, does not prove Gemini execution, and does not prove account or OAuth integration.

## Boundary

This adapter is a local packet-generation prototype for CLI usage.
It is not a Gemini plugin package in v0.1.

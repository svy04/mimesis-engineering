# Claude Code Adapter Prototype

Status: `prototype`

Use when a builder wants Claude Code to apply Mimesis to a repository artifact.

## Current Prototype

This repository can generate a Claude Code packet from the current `.mimesis` artifact trail.

The prototype is not a packaged Claude Code extension.
It does not execute Claude Code.
It prepares a local Markdown packet that can be used in a Claude Code session.

## Required Inputs

- weak artifact path
- reference pack
- target audience
- constraints
- prohibited claims

## Required Flow

1. Read the weak artifact.
2. Read the reference pack.
3. Write the `.mimesis` artifact trail.
4. Modify the artifact only after the plan is explicit.
5. Run a boundary check.
6. Record verification evidence.

## Claude Code Prompt Shape

```text
Use Mimesis Engineering.
Do not roleplay expertise.
Study the references as standards.
Extract structure, not wording.
Improve the artifact under the listed constraints.
Write the .mimesis files and show the proof boundary.
```

## Evidence

Local evidence in this repository:

- `tools/create-cli-packet.mjs` generates a CLI packet from the current artifact trail.
- `npm run adapter:claude` creates `.mimesis/adapter-packets/claude-code.md`.
- `.mimesis/adapter-packets/claude-code.md` contains the generated Claude Code packet.
- `npm run validate` passes for the current framework surface.

Allowed claim:
The Claude Code adapter has a local packet-generation prototype.

Not allowed:
The Claude Code adapter is not a shipped Claude Code extension, does not prove Claude Code execution, and does not prove account or OAuth integration.

## Boundary

This adapter is a local packet-generation prototype.
It is not a packaged Claude Code extension in v0.1.

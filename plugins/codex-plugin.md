# Codex Plugin Shape

Status: `prototype`

Goal:
Package the Mimesis file protocol as a Codex workflow helper.

## Local Scaffold

Prototype scaffold:

- [mimesis-codex manifest](mimesis-codex/.codex-plugin/plugin.json)
- [mimesis-loop skill](mimesis-codex/skills/mimesis-loop/SKILL.md)
- [scaffold README](mimesis-codex/README.md)

Local audit:

```bash
npm run audit:codex-plugin
```

## Expected Commands

- initialize `.mimesis/`
- select a reference pack
- create a structure map
- create a transformation plan
- run boundary check
- write a case note
- append run ledger evidence

## Required Guardrails

- no hidden references
- no copied surface
- no unsupported proof claims
- no completion claim without files

## v0.1 Boundary

This is a local prototype scaffold, not a shipped Codex plugin.
It does not publish to a marketplace, install in a user environment, prove external adoption, or prove benchmarked productivity.

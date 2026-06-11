# Mimesis Codex Plugin Scaffold

Status: prototype scaffold.

This folder contains a local Codex plugin scaffold for Mimesis Engineering.
It is here to make the plugin boundary reviewable before any marketplace or package release.

## What It Contains

- `.codex-plugin/plugin.json` - local plugin manifest
- `skills/mimesis-loop/SKILL.md` - Codex skill entrypoint for the Mimesis loop

## Local Checks

Run:

```bash
npm run audit:codex-plugin
npm run validate
npm run release:check
```

## Boundary

This is a prototype scaffold, not a shipped plugin.
It does not publish to a marketplace, install a plugin in a user's Codex app, prove benchmarked productivity, or create external proof.
It does not prove external adoption.

The scaffold should only help a human operator keep the artifact trail visible.
It must not hide references, fabricate proof, or replace the `.mimesis` files.

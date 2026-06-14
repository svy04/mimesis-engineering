# Plugins

Plugins are future packaging targets for Mimesis.

v0.1 does not claim shipped marketplace plugins.
This folder defines plugin shapes and readiness criteria so later work does not invent integration behavior loosely.

## Plugin Status Labels

- `idea` - possible package, no implementation
- `contract` - documented behavior and boundaries
- `prototype` - partial local implementation
- `usable` - works for a real loop
- `verified` - has a public case note proving use

## Plugin Rule

A plugin must make the artifact trail easier to create.
It must not replace the artifact trail with hidden automation.

## Plugin Shapes

- [Codex Plugin](codex-plugin.md)
- [GitHub Action](github-action.md)
- [MCP Server](mcp-server.md)
- [Status Matrix](status.md)

## Current Codex Scaffold

The repository includes a local scaffold at `plugins/mimesis-codex`.
It includes a `.codex-plugin/plugin.json` manifest and a `mimesis-loop` skill.
It is a prototype scaffold, not a shipped plugin.

The repository can also generate a local install-readiness packet:

```bash
npm run plugin:install-packet
npm run audit:plugin-install-packet
```

This writes `.mimesis/plugin-install-packets/codex-local.md`.
It does not install, publish, ship, or prove external adoption.

## Current MCP Scaffold

The repository includes a local scaffold at `plugins/mimesis-mcp`.
It maps Mimesis files into a resource index with `mimesis://` URIs and local tool descriptors.
It also includes a local line-delimited JSON-RPC stdio candidate for `initialize`, `resources/list`, `resources/read`, `tools/list`, and `prompts/list`.
It is a prototype scaffold and runtime candidate, not a shipped MCP server.
It does not execute tool commands through stdio.

Run:

```bash
npm run mcp:resources
npm run audit:mcp-server
npm run audit:mcp-stdio
```

## Current Local Action

The repository includes a local composite action at `.github/actions/release-check/action.yml`.
The validation workflow at `.github/workflows/validate-mimesis.yml` calls it.
It runs the local release preflight.
It is not a marketplace action package or tagged public action release.

## Local Audit

Run:

```bash
npm run audit:plugins
```

This checks plugin status labels and evidence boundaries.

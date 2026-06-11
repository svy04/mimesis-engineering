# Plugin Release Packet

Status: local plugin/action release handoff.

`plugin:packet` generates a release-candidate packet for the root GitHub Action and future plugin package surfaces.
It does not publish a marketplace action, tag a release, ship a plugin, or prove external adoption.

## Run

```bash
npm run plugin:packet
```

or:

```bash
npm run cli -- plugin:packet
```

This writes:

```text
.mimesis/plugin-release-packets/v0.1-action-candidate.md
```

## What It Contains

- current plugin status matrix
- local Codex plugin scaffold boundary
- local Codex plugin install-readiness packet boundary
- local MCP server scaffold and stdio runtime-candidate boundary
- root action metadata boundary
- repository-local action evidence
- owner gates before Marketplace or shipped-plugin claims
- allowed and disallowed plugin claims
- required evidence before claiming external adoption

## Boundary

This packet is a release-candidate handoff only.
It does not create a tag, publish a Marketplace listing, publish an npm package, ship a plugin, verify external integration, or prove adoption.
The local Codex scaffold is prototype evidence only, not a shipped plugin.
The local Codex install-readiness packet is a handoff only; it does not install the plugin or prove official host compliance.
The local MCP scaffold is prototype evidence only, not a shipped MCP server.
The local MCP stdio candidate is smoke-test evidence only; it does not execute tool commands or prove external MCP host compliance.

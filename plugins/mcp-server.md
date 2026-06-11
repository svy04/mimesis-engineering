# MCP Server Shape

Status: `prototype`

Goal:
Expose Mimesis artifacts and reference packs as tool-readable resources.

## Local Scaffold

Prototype scaffold:

- [MCP scaffold README](mimesis-mcp/README.md)
- [MCP scaffold manifest](mimesis-mcp/manifest.json) at `plugins/mimesis-mcp/manifest.json`
- [MCP resources](mimesis-mcp/resources.json)
- [MCP tools](mimesis-mcp/tools.json)

Generate the local resource index:

```bash
npm run mcp:resources
npm run audit:mcp-server
```

## Local Stdio Candidate

The repository also includes a small line-delimited JSON-RPC stdio candidate at `tools/mcp-stdio-server.mjs`.
It is smoke-tested by `npm run audit:mcp-stdio`.

Supported audit methods:

- `initialize`
- `resources/list`
- `resources/read`
- `tools/list`
- `prompts/list`

`tools/call` is intentionally disabled.
The candidate exposes Mimesis artifacts as readable local resources and tool descriptors only; it does not execute tool commands.

## Possible Resources

- current artifact brief
- selected reference set
- structure map
- transformation plan
- boundary check
- run ledger
- reference packs
- templates

## Possible Tools

- create artifact brief
- create reference set
- create structure map
- create transformation plan
- run boundary check
- append run ledger

## v0.1 Boundary

This is a local prototype scaffold and stdio candidate, not a shipped MCP server.
It does not install an MCP connector, expose secrets, prove protocol compliance in an external host, prove external adoption, or prove benchmarked productivity.

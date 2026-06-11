# Mimesis MCP Server Scaffold

Status: prototype scaffold.

This folder maps Mimesis Engineering artifacts into a local Model Context Protocol shaped resource index.
It is based on the official MCP architecture and specification shape: JSON-RPC protocol messages, server-side resources, tools, and prompts.

## What It Contains

- `manifest.json` - local scaffold metadata and boundary
- `resources.json` - resource descriptors with `mimesis://` URIs
- `tools.json` - tool descriptors for local Mimesis commands
- `tools/mcp-stdio-server.mjs` - local line-delimited JSON-RPC stdio candidate
- `.mimesis/mcp/resource-index.json` - generated local packet

## Run

```bash
npm run mcp:resources
npm run audit:mcp-server
npm run audit:mcp-stdio
```

Run the local stdio candidate manually:

```bash
npm run mcp:serve
```

The audit sends line-delimited JSON-RPC requests for `initialize`, `resources/list`, `resources/read`, `tools/list`, and `prompts/list`.
`tools/call` returns a disabled error because v0.1 does not execute tool commands through this runtime.

## Boundary

This is a prototype scaffold and local stdio candidate, not a shipped MCP server.
The audit does not start a long-running server; it starts a short-lived stdio process.
It does not install an MCP connector, expose secrets, prove protocol compliance in an external host, prove benchmarked productivity, or create external proof.
It does not prove external adoption.

The scaffold is read-only by default.
Tool entries describe local commands; they are not automatically invoked by this scaffold.
Prompts are represented as descriptors, so no hidden AI workflow is created.

## References

- [MCP Architecture](https://modelcontextprotocol.io/docs/learn/architecture)
- [MCP Specification](https://modelcontextprotocol.io/specification/2025-11-25)
- [Official TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

# Plugin Status Matrix

| Plugin Shape | Status | Evidence |
| --- | --- | --- |
| Codex Plugin | `prototype` | Local scaffold at [plugins/mimesis-codex](mimesis-codex/), manifest at [plugin.json](mimesis-codex/.codex-plugin/plugin.json), and skill at [mimesis-loop](mimesis-codex/skills/mimesis-loop/SKILL.md) |
| GitHub Action | `usable` | Repository-local composite action at `../.github/actions/release-check/action.yml`, called by `../.github/workflows/validate-mimesis.yml`; root `../action.yml` is a release-candidate surface |
| MCP Server | `prototype` | Local scaffold at [plugins/mimesis-mcp](mimesis-mcp/), manifest at [manifest.json](mimesis-mcp/manifest.json), generated resource index at `../.mimesis/mcp/resource-index.json`, and stdio candidate at `../tools/mcp-stdio-server.mjs` |

## Boundary

No plugin in this folder is presented as externally adopted.
The Codex plugin scaffold is local prototype evidence, not a shipped plugin.
The MCP server scaffold and stdio candidate are local prototype evidence, not a shipped MCP server.
The stdio candidate does not execute tool commands or prove external MCP host compliance.
The GitHub Action is usable as a repository-local composite action, not a marketplace package or tagged public action release.
The root action metadata is present, but it is not a published Marketplace action.
The purpose of v0.1 is to make the integration boundary explicit.

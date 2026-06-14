# Adapters

Adapters describe how Mimesis can run inside different AI work surfaces.

Status:
v0.1 adapters in this folder are `contract` documents unless a file says otherwise.
They define the required flow and proof boundary.
They are not claims that an integration package has shipped.

## Status Labels

- `contract` - documented integration shape
- `prototype` - partially implemented
- `usable` - works on a real local loop
- `verified` - has a public case note proving use

## Adapter Rule

An adapter may change the interface.
It may not change the method.

Every adapter must preserve:

- weak artifact input
- reference set input
- structure map output
- transformation plan output
- improved artifact output
- boundary check output
- case note output
- run ledger update

## Available Contracts

- [Codex](codex.md) - `prototype`
- [Claude Code](claude-code.md) - `prototype`
- [Gemini CLI](gemini-cli.md) - `prototype`
- [GitHub Issues](github-issues.md) - `prototype`
- [Local Filesystem](local-filesystem.md)
- [Superpowers](superpowers.md) - `contract`

## Local Audit

Run:

```bash
npm run audit:adapters
```

This checks adapter status labels and evidence requirements.

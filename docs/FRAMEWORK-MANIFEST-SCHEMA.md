# Framework Manifest Schema

Status: local schema contract for the AI-native framework manifest.

The framework manifest schema describes the required shape of `.mimesis/framework-manifest.json`.
It keeps the manifest useful for agents, local CLI commands, MCP resource descriptors, and future plugins without relying on hidden assumptions.

## Files

- Schema: `spec/framework-manifest.schema.json`
- Manifest: `.mimesis/framework-manifest.json`
- Audit: `tools/audit-framework-manifest-schema.mjs`

## Run

```bash
npm run audit:framework-manifest-schema
```

or:

```bash
npm run cli -- audit:framework-manifest-schema
```

The audit checks:

- the schema is valid JSON
- the schema declares JSON Schema draft 2020-12
- the schema closes the manifest root object
- required manifest fields are explicit
- the manifest name and status are pinned to v0.1
- the generated manifest conforms to the local schema subset
- docs, package scripts, CLI exposure, and release preflight wiring exist

## Required Shape

The manifest must include:

- identity: `name`, `version`, `status`, and `purpose`
- operating language: `corePhrases` and `loop`
- AI-native contract: `aiNativeShape`
- visible paths: `entrypoints`
- runnable surface: `commands`
- framework assets: `artifacts`
- still-open gates: `gates`
- proof boundaries: `boundaries`
- provenance: `generatedFrom`

## Boundary

This is local schema evidence.

It does not prove external adoption.
It does not prove package publication.
It does not prove benchmarked productivity.
It does not prove a shipped plugin, MCP connector install, customer outcome, official host compliance, or legal originality guarantee.

The schema exists to make the local framework easier for AI-native tooling to read without inflating the public claim.

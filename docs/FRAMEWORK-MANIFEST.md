# Framework Manifest

Status: generated AI-native framework index for v0.1.

The framework manifest is the machine-readable map of Mimesis Engineering.
It lets agents, CLIs, local MCP scaffolds, and human operators see the same entrypoints, commands, artifacts, gates, and proof boundaries.

## Why It Exists

Mimesis Engineering is not a role prompt.
It is a work framework:

- Give AI standards, not roles.
- Bring one weak artifact.
- No proof, no claim.

The manifest turns that into a small JSON contract at `.mimesis/framework-manifest.json`.
The manifest shape is described by `spec/framework-manifest.schema.json`.

## Generate

```bash
npm run framework:manifest
```

or:

```bash
npm run cli -- framework:manifest
```

This writes:

```text
.mimesis/framework-manifest.json
```

## Audit

```bash
npm run audit:framework-manifest
```

or:

```bash
npm run cli -- audit:framework-manifest
```

The audit checks:

- manifest generation and stale-output detection
- schema compatibility through `npm run audit:framework-manifest-schema`
- package scripts
- CLI commands
- release-check wiring
- core phrases
- entrypoints
- command descriptors
- artifact groups
- remaining gates
- proof boundaries

## Included Shape

The manifest includes:

- `entrypoints`: README, quickstart, spec, spec index, `.mimesis` file protocol, proof boundary, the manifest itself, reference pack index, proof intake record, proof redaction packet, proof submission packet, proof acceptance packet, proof execution report, first weak artifact readiness, first proof candidate packet, current gap register, gap closure plan, gate evidence packet, local Codex plugin install readiness, owner release decision record, release evidence report, owner action queue, owner decision intake, owner decision answer record, owner answer review, owner evidence bundle, owner evidence intake record, owner evidence review, owner evidence attachment form, owner evidence submission record, current state summary, and release artifact manifest
- `commands`: local validation, first-loop demo, gap register generation, gap closure plan generation, gate evidence packet generation, proof redaction packet generation and audit, proof submission packet generation and audit, proof acceptance packet generation and audit, proof execution report generation and audit, first proof candidate packet generation and audit, manifest generation, reference pack index generation, spec index audit, current state summary generation and audit, proof readiness generation, plugin install-readiness generation, release decision record generation, release evidence report generation, owner action queue generation, owner decision intake generation, owner decision answer record generation, owner answer review generation, owner evidence bundle generation, owner evidence intake record generation, owner evidence review generation, owner evidence attachment form generation, owner evidence submission record generation, release artifact manifest generation, status roadmap sync audit, MCP resource generation, and public preflight
- `artifacts`: `spec/`, `.mimesis` file protocol, `templates/`, `reference-packs/`, `cases/`, `prompts/`, `adapters/`, and `plugins/`
- `gates`: license, external proof, strict sync, package publication, plugin/action release, benchmark/adoption
- `boundaries`: what the repository does not prove yet

## Boundary

The framework manifest is local framework evidence.

It does not prove external adoption.
It does not prove benchmarked productivity.
It does not prove package publication.
It does not prove a shipped plugin, Marketplace action, MCP connector install, customer outcome, or legal originality guarantee.

It is useful because it keeps agents pointed at the same protocol surface without inventing claims.

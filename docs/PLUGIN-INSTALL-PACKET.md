# Plugin Install Packet

Status: local Codex plugin install packet, not installation proof.

`plugin:install-packet` generates a local install-readiness handoff for the `plugins/mimesis-codex` prototype scaffold.

It does not install the plugin, does not publish a package, and does not turn the scaffold into a shipped plugin.

## Command

```bash
npm run plugin:install-packet
```

or:

```bash
npm run cli -- plugin:install-packet
```

This writes:

```text
.mimesis/plugin-install-packets/codex-local.md
```

## Purpose

The packet gives an owner one place to review:

- the local Codex plugin manifest
- the `mimesis-loop` skill
- local verification commands
- manual install steps for an owner-controlled Codex environment
- rollback steps
- allowed and disallowed plugin claims

## Required Local Verification

```bash
npm run audit:codex-plugin
npm run audit:plugin-packet
npm run validate
```

## Boundary

This is a prototype scaffold handoff.

It does not install anything, does not publish, does not create a tag, does not publish a Marketplace listing, does not ship a plugin, does not prove external adoption, and does not prove official host compliance.

The local Codex scaffold remains not a shipped plugin until a real release or installation proof exists and is cited.

## Audit

Run:

```bash
npm run audit:plugin-install-packet
```

The audit checks package script wiring, CLI exposure, release preflight wiring, generated packet sections, local plugin paths, and proof-boundary text.

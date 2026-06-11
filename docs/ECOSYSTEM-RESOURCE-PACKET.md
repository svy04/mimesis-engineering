# Ecosystem Resource Packet

Status: local ecosystem resource packet.

`ecosystem:resources` generates a bounded index of the local resources available across `mimesis-engineering`, `mimesis-canvas`, and `mimesis-casebook`.

## Command

```bash
npm run ecosystem:resources
```

or:

```bash
npm run cli -- ecosystem:resources
```

This writes:

```text
.mimesis/ecosystem-resources/current-resource-packet.md
```

## Purpose

Use this before a first loop or proof loop when the operator needs to pick:

- a canvas worksheet from `mimesis-canvas`
- a case grammar example from `mimesis-casebook`
- a framework command from `mimesis-engineering`

The packet indexes the neighboring repositories by file path and intended use.
It does not copy neighboring repository content into this repository.

## Boundary

This packet does not prove external adoption, does not publish anything, does not prove remote freshness, and does not create a new case.
It is a local resource index only.

It does not copy neighboring repository content.
It points to local paths so an operator can inspect the original files directly.

## Audit

Run:

```bash
npm run audit:ecosystem-resources
```

The audit checks that the generated packet names canvas resources, casebook resources, recommended use, allowed claim, disallowed claim, and the no-copy/no-adoption boundary.

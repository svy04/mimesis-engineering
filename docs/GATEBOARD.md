# Gate Board

Status: local operator gate board.

`gate:board` generates a single current-state board for the remaining Mimesis framework gates.

## Command

```bash
npm run gate:board
```

or:

```bash
npm run cli -- gate:board
```

This writes:

```text
.mimesis/gates/current-gateboard.md
```

## What It Combines

- v0.1 local preflight boundary
- strict publish sync boundary
- owner license decision boundary
- v0.2 permissioned external proof boundary
- package and action publication boundary
- plugin shipment boundary
- benchmark and adoption evidence boundary
- benchmark/adoption measurement packet boundary

## What It Does Not Do

The gate board does not choose a license, create external proof, run a transformation, stage files, commit, push, tag, publish to npm, publish a GitHub Marketplace action, prove remote freshness, prove benchmarked productivity, or prove external adoption.

## Audit

Run:

```bash
npm run audit:gateboard
```

The audit checks that the generated board names each remaining gate and keeps the allowed/disallowed claim boundary visible.

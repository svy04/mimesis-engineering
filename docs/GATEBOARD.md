# Gate Board

Status: local operator gate board.

`gate:board` generates a single current-state board for the remaining Mimesis framework gates.
It intentionally does not embed branch names, commit hashes, upstream heads, dirty-worktree counts, or the current sync report.
Use the runtime-only strict sync audit when a publish/sync proof is needed.

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
- strict publish sync boundary as a runtime-only strict sync audit
- owner license decision boundary
- v0.2 permissioned external proof boundary
- package and action publication boundary
- plugin shipment boundary
- benchmark and adoption evidence boundary
- benchmark/adoption measurement packet boundary

## What It Does Not Do

The gate board does not choose a license, create external proof, run a transformation, stage files, commit, push, tag, publish to npm, publish a GitHub Marketplace action, prove remote freshness, prove benchmarked productivity, or prove external adoption.
The committed gate board is not a sync proof; run `npm run audit:sync:strict` after the intended branch is clean and pushed.

## Audit

Run:

```bash
npm run audit:gateboard
```

The audit checks that the generated board names each remaining gate and keeps the allowed/disallowed claim boundary visible.
It also checks that the committed board avoids volatile sync snapshot text and points operators to the runtime-only strict sync audit instead.

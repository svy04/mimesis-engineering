# Activation Surface

Status: local first-action guard.

This document defines the README and quickstart surface that lets a new builder understand Mimesis quickly and start a first loop without hunting through the repository.

## What Must Stay Visible

- 30-second understanding: Mimesis means giving AI standards, not roles.
- First-screen promise: bring one weak artifact and leave with a stronger artifact plus a proof boundary.
- 5-minute first loop: the README must point to `docs/QUICKSTART.md` and name the seven loop moves.
- First executable path: the quickstart must show `npm run first-loop:demo`, `npm run audit:first-loop`, `npm run cli -- case:start`, `node tools/validate-mimesis.mjs`, and `npm run cli -- case:check`.
- First-loop demo: the quickstart must name `.mimesis/first-loop-demo/`, `workspace:check`, `case:check`, and the boundary that it does not prove external adoption.
- Artifact trail: `docs/WHAT-YOU-GET.md` must keep the seven output artifacts visible.

## Audit

Run:

```bash
npm run audit:activation
```

This checks the first-screen promise, 30-second understanding, 5-minute first loop, quickstart commands, and seven artifact headings.

## Boundary

This is a local activation check.
It does not prove external adoption, benchmarked productivity, customer outcomes, publication, or that a reader finished a real case.

# Permissioned Case Fixture

Status: local reviewable fixture.

This document explains the reviewable fixture in `examples/permissioned-case-intake.md`.

The fixture exists so maintainers can test the permissioned intake path without waiting for a real submitter.

## What It Checks

- the fillable intake template has the fields required by `case:review`
- the example fixture has no placeholders
- the example fixture passes `case:review --require-public --write-report`
- the generated review report keeps the proof boundary visible

## Run

```bash
npm run audit:permissioned-fixture
```

or:

```bash
npm run cli -- audit:permissioned-fixture
```

## Boundary

This is a reviewable fixture, not a real submitter artifact.
It does not create external proof, grant permission for a third-party artifact, prove adoption, prove benchmarked productivity, prove customer outcomes, prove legal originality, or publish a case.

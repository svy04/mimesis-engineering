# First Loop Demo

Status: local completed-demo generator.

`first-loop:demo` creates a completed local case workspace from one weak README fixture.
It exists so the 5-minute first loop has a reproducible artifact trail, not only instructions.

## Run

```bash
npm run first-loop:demo
npm run audit:first-loop
```

or:

```bash
npm run cli -- first-loop:demo
npm run cli -- audit:first-loop
```

The generator writes:

```text
.mimesis/first-loop-demo/
```

The audit checks:

- `workspace:check .mimesis/first-loop-demo`
- `case:check .mimesis/first-loop-demo --write-report`
- before/after evidence in the case note
- proof-boundary language
- no automatic claim of external proof

## Boundary

This is a local first-loop demo.
It does not prove external adoption, benchmarked productivity, customer outcomes, legal originality, package publication, or a real permissioned external case.

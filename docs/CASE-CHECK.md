# Case Check

Status: local completed-case evidence check.

`case:check` inspects a Mimesis case workspace after the loop has been filled.
It is stricter than `workspace:check`: it looks for before/after evidence, source/reference notes, an improved artifact, boundary language, and run ledger proof.

## Run

```bash
npm run case:check
```

or:

```bash
npm run cli -- case:check path/to/case
```

To write a local proof report:

```bash
npm run cli -- case:check path/to/case --write-report
```

This writes `.mimesis/case-proof.md`.

## Boundary

Passing `case:check` means the local files meet the framework's minimum case evidence standard.
It does not prove external adoption, benchmarked productivity, customer outcomes, legal originality, or marketplace/package release.

## What It Rejects

- `Case Status: started`
- `TBD`, `TODO`, or fill-in placeholders
- starter-only evidence such as `Not produced yet`
- missing before/after evidence
- missing proof or claim boundary language

## Relationship To `case:start`

`case:start` creates a workspace.
`case:check` decides whether that workspace has enough local evidence to be treated as a completed case note.

# Proof Run Dry Audit

Status: local fixture audit.

`audit:proof-run-dry` runs the first proof-run path against a temporary local fixture.

It checks:

```text
permissioned intake -> started case -> completed case -> reviewed evidence packet -> bounded claim candidate
```

and:

```text
owner evidence bridge -> proof intake record -> started case -> completed case -> reviewed evidence packet -> bounded claim candidate
```

## Command

```bash
npm run audit:proof-run-dry
```

or:

```bash
npm run cli -- audit:proof-run-dry
```

## What It Does

- creates a temporary local fixture intake
- runs `case:review --require-public --write-report`
- runs `case:from-intake`
- verifies the started case fails `case:check`
- completes the temporary case files
- runs `case:check --write-report`
- creates a temporary evidence packet
- runs `evidence:check --require-reviewed --write-report`
- runs `claim:from-evidence` against the reviewed evidence packet
- creates a reviewed temporary owner evidence submission record
- runs `owner:evidence-submission-check --require-field weak_artifact_permission`
- runs `proof:intake-from-owner-evidence`
- runs `proof:intake-check --require-case-ready`
- runs `case:from-record`
- verifies the owner-evidence started case fails `case:check`
- completes the owner-evidence temporary case files
- runs `case:check --write-report`
- creates a second temporary evidence packet
- runs `evidence:check --require-reviewed --write-report`
- runs `claim:from-evidence` against the second reviewed evidence packet
- writes `.mimesis/proof-runs/dry-run-report.md`

## Boundary

This is a temporary local fixture.
It does not create external proof, does not run release:check:public, does not submit a real artifact, does not publish, does not prove external adoption, does not prove benchmarked productivity, does not prove customer outcomes, and does not prove legal originality.

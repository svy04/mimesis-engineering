# Case From Intake

Status: local permissioned-case starter.

`case:from-intake` turns a reviewed permissioned external case intake into a started Mimesis case workspace.
It bridges `case:review` and `case:check`.

## Run

```bash
npm run cli -- case:from-intake path/to/permissioned-case.md --reference-pack reference-packs/github-readme.md --title "External README Case"
```

## What It Does

- runs `case:review --require-public`
- preserves the original intake as `permissioned-intake.md`
- extracts the starting artifact into `weak-artifact.md`
- writes permission, publication, redaction, and proof boundaries into `.mimesis`
- creates a started case workspace

## Boundary

The generated workspace is marked `Case Status: started`.
It does not prove improvement, external adoption, benchmarked productivity, customer outcomes, commercial value, or legal originality.

The case still needs:

- extracted structure
- improved artifact
- boundary check
- before/after case note
- run ledger update
- `case:check`

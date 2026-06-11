# Case From Record

Status: local proof-intake-record starter.

`case:from-record` turns a schema-shaped proof intake record into a started Mimesis case workspace.
It bridges `proof:intake-record` and `case:check`.

## Run

```bash
npm run cli -- case:from-record .mimesis/proof-intake/fixture-record.json --title "Record Case"
```

Optional:

```bash
npm run cli -- case:from-record path/to/proof-intake-record.json --reference-pack reference-packs/github-readme.md --out .mimesis/case-runs/record-case
```

## What It Does

- reads a schema-shaped proof intake record
- rejects records that are not `reviewed`
- rejects `private only` records
- preserves the original record as `proof-intake-record.json`
- extracts the starting artifact into `weak-artifact.md`
- writes permission, publication, redaction, fixture, safety, and proof boundaries into `.mimesis`
- creates a started case workspace

## Boundary

The generated workspace is marked `Case Status: started`.
It does not prove improvement, external adoption, benchmarked productivity, customer outcomes, commercial value, or legal originality.

The local fixture record is not a real submitter artifact.
It does not create external proof, grant permission, or publish a case.

The case still needs:

- extracted structure
- improved artifact
- boundary check
- before/after case note
- run ledger update
- `case:check`

# Owner Proof Input Private Pipeline

Status: private candidate pipeline smoke, not owner decision or proof.

`audit:owner-proof-input-private-pipeline` checks that a candidate owner proof input can move through the local private path without changing public claims.

## What It Runs

The audit uses `.mimesis/owner-actions/fixture-owner-proof-input-remote-issue-candidate.json` and writes temporary files only under `.mimesis/private/audit/`.

Pipeline:

```text
private export
-> convert
-> review
-> check
-> split
-> downstream owner decision/evidence record candidates
```

## Command

```bash
npm run audit:owner-proof-input-private-pipeline
```

## What It Proves

- the candidate fixture can export to a gitignored private issue body
- the private issue body can convert into an owner proof input record
- the record can be reviewed, checked, and split
- downstream owner decision and owner evidence records are generated as candidates
- temporary raw body and candidate outputs stay under `.mimesis/private/audit/`

## Boundary

This audit does not use live owner input.
It does not choose a license.
It does not provide legal advice.
It does not grant permission.
It does not submit an artifact.
It does not create external proof.
It does not approve proof.
It does not publish.
It does not close gates.
It does not prove adoption, benchmarked productivity, customer outcomes, commercial outcomes, package publication, Marketplace publication, shipped plugin status, or legal originality.

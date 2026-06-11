# Owner Proof Input Review

Status: local review gate, not owner decision or proof.

`owner:proof-input-review` checks a draft owner proof input record before it can be promoted to a reviewed record candidate.

## Commands

Review the default fixture record:

```bash
npm run owner:proof-input-review
```

Review a real converted issue record:

```bash
npm run cli -- owner:proof-input-review path/to/owner-proof-input-record.json --write-report path/to/review.md --output-record path/to/reviewed-owner-proof-input-record.json --approve --require-approvable
```

Audit the review gate:

```bash
npm run audit:owner-proof-input-review
```

## Minimum Inputs

- `license_or_no_reuse`
- `weak_artifact_permission`

## Intended Flow

```text
owner:proof-input-issue-convert
-> owner:proof-input-review
-> owner:proof-input-check --require-ready
-> owner:proof-input-split
-> downstream license/evidence/proof checks
```

## Boundary

This review does not choose a license.
It does not provide legal advice.
It does not grant permission.
It does not submit an artifact by itself.
It does not create external proof.
It does not approve proof.
It does not publish.
It does not close gates.
It does not prove adoption, benchmarked productivity, customer outcomes, commercial outcomes, package publication, Marketplace publication, shipped plugin status, or legal originality.

# Owner Proof Input Request

Status: owner-facing request packet, not owner decision or proof.

`owner:proof-input-request` generates one request packet that tells the owner exactly what to submit before the first real proof loop:

- `license_or_no_reuse`
- `weak_artifact_permission`

## Commands

Generate the request packet:

```bash
npm run owner:proof-input-request
```

Audit the request packet:

```bash
npm run audit:owner-proof-input-request
```

## Intended Flow

```text
owner:proof-input-request
-> owner opens owner-proof-input issue form
-> owner:proof-input-issue-convert
-> owner:proof-input-check --require-ready
-> owner:proof-input-split
-> downstream license/evidence/proof checks
```

## Boundary

This request does not choose a license.
It does not provide legal advice.
It does not grant permission.
It does not collect an artifact by itself.
It does not submit proof.
It does not create external proof.
It does not approve proof.
It does not publish.
It does not close gates.
It does not prove adoption, benchmarked productivity, customer outcomes, commercial outcomes, package publication, Marketplace publication, shipped plugin status, or legal originality.

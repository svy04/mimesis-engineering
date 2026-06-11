# Owner Proof Input Issue

Status: public owner-input intake handoff, not owner decision or proof.

`.github/ISSUE_TEMPLATE/owner-proof-input.yml` gives the owner one public issue form for the two minimum proof inputs:

- `license_or_no_reuse`
- `weak_artifact_permission`

It sits before the JSON owner proof input record and downstream split.

## Commands

Generate the local handoff packet:

```bash
npm run owner:proof-input-issue
```

Audit the issue form and packet:

```bash
npm run audit:owner-proof-input-issue
```

## Intended Flow

```text
GitHub issue: owner-proof-input.yml
-> reviewed owner proof input record
-> owner:proof-input-check --require-ready
-> owner:proof-input-split
-> license:decision-from-owner-answer
-> owner:evidence-submission-check --require-field weak_artifact_permission
-> proof:intake-from-owner-evidence
```

## Boundary

This issue form does not choose a license.
It does not provide legal advice.
It does not grant permission.
It does not submit an artifact by itself.
It does not create external proof.
It does not approve proof.
It does not publish.
It does not close gates.
It does not prove adoption, benchmarked productivity, customer outcomes, commercial outcomes, package publication, Marketplace publication, shipped plugin status, or legal originality.

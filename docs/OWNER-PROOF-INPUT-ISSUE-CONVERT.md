# Owner Proof Input Issue Convert

Status: issue-to-record conversion, not owner decision or proof.

`owner:proof-input-issue-convert` converts a GitHub owner proof input issue body into a local owner proof input record candidate.
It accepts both local fixture-style `### license_or_no_reuse` sections and public issue anchor-style `## 1. license_or_no_reuse` / `## 2. weak_artifact_permission` sections.

## Commands

Convert the fixture issue body:

```bash
npm run owner:proof-input-issue-convert
```

Convert a reviewed owner issue body:

```bash
npm run cli -- owner:proof-input-issue-convert path/to/owner-proof-input-issue.md --output path/to/owner-proof-input-record.json --report path/to/report.md --status reviewed --require-complete
```

Audit the converter:

```bash
npm run audit:owner-proof-input-issue-convert
```

## Fixture Files

- `.mimesis/owner-actions/fixture-owner-proof-input-issue.md`
- `.mimesis/owner-actions/fixture-owner-proof-input-issue-record.json`
- `.mimesis/owner-actions/fixture-owner-proof-input-issue-conversion-report.md`

## Intended Flow

```text
GitHub owner-proof-input issue
-> owner:proof-input-issue-convert
-> owner:proof-input-check --require-ready
-> owner:proof-input-split
-> license/evidence/proof intake checks
```

## Public Issue Anchor Compatibility

The audit includes a smoke check for the public owner proof input issue shape used by issue anchors such as issue #7:

- numbered `##` headings
- checkbox choices
- fenced `text` blocks
- publication preference and safety confirmation text inside the weak artifact section

Passing this check only proves the issue body can become a local record candidate.
It does not prove the owner has filled the live issue, does not grant permission, and does not close gates.

## Boundary

This converter does not choose a license.
It does not provide legal advice.
It does not grant permission.
It does not submit an artifact by itself.
It does not create external proof.
It does not approve proof.
It does not publish.
It does not close gates.
It does not prove adoption, benchmarked productivity, customer outcomes, commercial outcomes, package publication, Marketplace publication, shipped plugin status, or legal originality.

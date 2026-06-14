# Owner Evidence Submission Issue Convert

Status: owner evidence submission issue convert path, not owner decision or proof.

This command converts one owner evidence submission issue body into a draft owner evidence submission record candidate:

```bash
npm run owner:evidence-submission-issue-convert
npm run audit:owner-evidence-submission-issue-convert
```

Default fixture input:

- `.mimesis/owner-actions/fixture-owner-evidence-submission-issue.md`

Generated outputs:

- `.mimesis/owner-actions/fixture-owner-evidence-submission-issue-record.json`
- `.mimesis/owner-actions/fixture-owner-evidence-submission-issue-conversion-report.md`

## Purpose

This path answers one narrow question:

```text
Can an owner evidence submission issue body become a schema-shaped owner evidence submission record candidate?
```

For the fixture, the answer is yes, but only as a draft. The converted record is not reviewed and cannot move the `license_or_no_reuse` field until a later review step marks the record reviewed.

## Expected Flow

```bash
npm run owner:evidence-submission-record
npm run owner:evidence-submission-issue-convert
npm run cli -- owner:evidence-submission-check .mimesis/owner-actions/fixture-owner-evidence-submission-issue-record.json --require-field license_or_no_reuse
```

The last command is expected to reject the fixture for field movement because the record status is `draft`.

## Issue Sections

The converter reads these sections:

- `license_or_no_reuse`
- `weak_artifact_permission`
- `publication_scope`
- `package_action_plugin_scope`
- `benchmark_adoption_scope`
- `strict_sync_intent`
- `review_state`
- `safety_confirmation`

## Allowed Claim

Mimesis can convert an owner evidence submission issue body into a draft owner evidence submission record candidate.

## Disallowed Claim

This conversion does not choose a license.
It does not attach evidence by itself.
It does not grant permission.
It does not publish.
It does not create external proof.
It does not prove adoption.
It does not prove benchmarked productivity.
It does not close gates.

## Boundary

This is an intake conversion path only.
It does not replace owner review, legal review, permission review, evidence packet review, release review, or gate-specific closure evidence.

# Proof Intake From Owner Evidence

Status: local bridge from reviewed owner evidence field to proof intake record.

`proof:intake-from-owner-evidence` turns a reviewed owner evidence submission record into a schema-shaped proof intake record only when `weak_artifact_permission` has been submitted.

## Default Report

Run:

```bash
npm run proof:intake-from-owner-evidence
```

This writes:

```text
.mimesis/proof-intake/from-owner-evidence-bridge.md
```

The default report is blocked because the local fixture records `not_submitted_owner_evidence`.

## Convert A Reviewed Field

Run:

```bash
npm run cli -- proof:intake-from-owner-evidence path/to/owner-evidence-submission-record.json --output path/to/proof-intake-record.json --submitter "owner-reviewed weak artifact" --artifact-owner "owner-confirmed artifact owner" --permission-status "owner permits redacted framework review only" --publication-preference redacted --redaction-requirements "redact private details before public use" --reference reference-packs/github-readme.md --desired-transformation "Transform one weak artifact under Mimesis boundaries." --confirm-no-secrets --confirm-no-private-customer-data --confirm-no-copied-protected-material
```

Then check the generated proof intake record:

```bash
npm run cli -- proof:intake-check path/to/proof-intake-record.json --require-case-ready
```

If the check passes, start a case workspace:

```bash
npm run cli -- case:from-record path/to/proof-intake-record.json --title "Owner Evidence Case"
```

The started case still must not pass `case:check` until transformation and before/after evidence are completed.

## Required Gate

The bridge rejects records unless:

- `status` is `reviewed`
- `fields.weak_artifact_permission.submissionStatus` is `submitted`
- the operator supplies submitter, artifact owner, permission status, publication preference, redaction requirements, reference, and desired transformation
- the operator explicitly confirms no secrets, no private customer data, and no copied protected material

## Audit

Run:

```bash
npm run audit:proof-intake-from-owner-evidence
```

The audit creates a temporary reviewed owner evidence submission record, converts it into a proof intake record, checks it with `proof:intake-check`, starts a case with `case:from-record`, and confirms the started case does not pass `case:check` before transformation.

## Boundary

This is a local bridge from owner evidence submission record to proof intake record.

It does not grant permission.
It does not create external proof.
It does not publish.
It does not close gates.
It does not prove adoption.
It does not prove benchmarked productivity.
It does not prove customer outcomes.
It does not prove legal originality.

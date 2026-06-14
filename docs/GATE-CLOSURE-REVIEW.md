# Gate Closure Review

Status: review record, not closure.

`gate:closure-review` creates `.mimesis/gates/closure-review.json`.
It reads the gate closure readiness report, owner evidence submission check, owner evidence submission record, gap register, and current state summary.

Use it after:

```bash
npm run gate:closure-readiness
npm run owner:evidence-submission-check
npm run gate:closure-review
npm run audit:gate-closure-review
```

## Input Modes

Default mode reads the fixture readiness report, owner evidence submission check, and owner evidence submission record:

```bash
npm run cli -- gate:closure-review
```

Candidate review mode can read separate readiness/check/record files produced from a real owner evidence submission:

```bash
npm run cli -- gate:closure-review --readiness path/to/closure-readiness-candidate.json --owner-evidence-submission-check path/to/owner-evidence-field-check.md --owner-evidence-submission path/to/reviewed-owner-evidence-submission.json --output path/to/closure-review-candidate.json
```

The `--readiness`, `--owner-evidence-submission-check`, and `--owner-evidence-submission` inputs can carry `ownerEvidenceReviewReady: true` into a candidate review.
The `--output` file is still a review record, not closure.
Candidate review keeps `decision: keep_open`, `closureApproved: false`, and `canCloseNow: false`.

## What It Records

- one review entry per current gate
- `decision: keep_open`
- `closureApproved: false`
- `canCloseNow: false`
- `ownerEvidenceReviewReady` when owner evidence is ready for gate-specific review
- missing evidence required before closure
- owner evidence fields that are still not submitted
- forbidden claim text for each gate

## Boundary

This is a gate closure review record, not closure.
It does not approve gate closure.
It does not close gates.
It does not submit evidence.
It does not attach evidence.
It does not create evidence.
It does not choose a license.
It does not publish.
It does not create external proof.
It does not prove adoption.

## Allowed Claim

Mimesis has a local gate closure review record that keeps every current gate open until direct closure evidence is reviewed.

## Disallowed Claim

The gate closure review record does not approve gate closure, close gates, submit evidence, attach evidence, publish, choose a license, create external proof, prove adoption, prove benchmarked productivity, or ship a plugin.

# Owner Proof Input Split

Status: local owner proof input split report and converter, not owner decision or proof.

`owner:proof-input-split` checks one owner proof input record and, only when it is reviewed and both minimum inputs are submitted, writes downstream record candidates:

- `owner-decision-answer-record.json`
- `owner-evidence-submission-record.json`

The default committed template is not ready, so the default command writes only a blocked split report.

## Commands

Check the default local template and write the split report:

```bash
npm run owner:proof-input-split
```

Split a real owner-filled record:

```bash
npm run cli -- owner:proof-input-split path/to/owner-proof-input.json --output-dir path/to/split-output --require-ready
```

Audit the surface:

```bash
npm run audit:owner-proof-input-split
```

## Files

- `.mimesis/owner-actions/proof-input-split-report.md`
- `tools/split-owner-proof-input-record.mjs`
- `tools/audit-owner-proof-input-split.mjs`

## Boundary

Owner proof input split only routes owner-provided input into downstream record candidates.
It does not choose a license.
It does not submit an artifact.
It does not grant permission.
It does not create external proof.
It does not approve proof.
It does not publish.
It does not close gates.

After a split, the downstream records still require their own checks, proof intake conversion, proof execution, evidence review, and gate closure review before any stronger claim.

# Owner Proof Input

Status: local owner proof input template and checker, not owner decision or proof.

`owner:proof-input-template` creates one schema-shaped template for the minimum owner inputs needed before the first real proof loop:

- `license_or_no_reuse`
- `weak_artifact_permission`

The template is deliberately not ready. It does not choose a license, submit an artifact, grant permission, create external proof, approve proof, publish, or close gates.

## Commands

Generate the template:

```bash
npm run owner:proof-input-template
```

Check the default template and write the local report:

```bash
npm run owner:proof-input-check
```

Check a real owner-filled record:

```bash
npm run cli -- owner:proof-input-check path/to/owner-proof-input-record.json --require-ready --write-report path/to/owner-proof-input-check.md
```

Audit the surface:

```bash
npm run audit:owner-proof-input
```

## Files

- `spec/owner-proof-input.schema.json`
- `.mimesis/owner-actions/proof-input-template.json`
- `.mimesis/owner-actions/fixture-proof-input-check.md`
- `tools/create-owner-proof-input-template.mjs`
- `tools/check-owner-proof-input-record.mjs`
- `tools/audit-owner-proof-input.mjs`

## Boundary

Owner proof input records only prepare downstream conversion.
They do not replace:

- owner decision answer records,
- owner evidence submission records,
- proof intake records,
- proof execution records,
- evidence review,
- gate closure readiness,
- gate closure review.

The owner proof input template is not a submitted owner input.
The owner proof input check does not choose a license.
It does not submit an artifact.
It does not grant permission.
It does not create external proof.
It does not approve proof.
It does not publish.
It does not close gates.

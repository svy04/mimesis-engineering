# Proof Intake Check

Status: local proof intake check, not external proof.

`proof:intake-check` validates a schema-shaped proof intake record before it becomes a started case workspace.

## Command

```bash
npm run proof:intake-check
```

or:

```bash
npm run cli -- proof:intake-check .mimesis/proof-intake/fixture-record.json --require-case-ready --write-report .mimesis/proof-intake/fixture-check.md
```

This writes:

```text
.mimesis/proof-intake/fixture-check.md
```

## What It Checks

- required proof intake record fields
- `schemaVersion: 0.1.0`
- reviewed status before case creation
- publication preference is not `private only` when case-ready output is required
- reference, proof-boundary, and prohibited-claim lists
- safety confirmations for secrets, private customer data, and copied protected material
- heuristic secret-like strings in the record
- permission, redaction, and publication signals

## Why It Exists

The v0.2 proof path needs a small machine-readable gate between a submitted weak artifact and `case:from-record`.

The safe sequence is:

```text
proof:intake-record
-> proof:intake-check
-> proof:redaction-packet
-> case:from-record
-> case:check
```

## Audit

```bash
npm run audit:proof-intake-check
```

The audit checks package script wiring, CLI exposure, release preflight order, generated report sections, public docs, completion matrix visibility, framework manifest visibility, release artifact manifest coverage, and failure behavior for unsafe records.

## Boundary

This check does not create external proof.
It does not grant permission.
It does not redact files.
It does not publish.
It does not choose a license.
It does not run a transformation.
It does not prove adoption.
It does not guarantee that a record is safe for public release.

It is a local pre-case guardrail, not owner permission, legal review, security proof, or completed before/after evidence.

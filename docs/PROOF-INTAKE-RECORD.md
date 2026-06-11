# Proof Intake Record

Status: local schema-shaped proof intake record fixture.

`proof:intake-record` turns the local permissioned-case markdown fixture into `.mimesis/proof-intake/fixture-record.json`.
The record is schema-shaped by `spec/proof-intake.schema.json`.

## Command

```bash
npm run proof:intake-record
```

or:

```bash
npm run cli -- proof:intake-record
```

This writes:

```text
.mimesis/proof-intake/fixture-record.json
```

## Audit

Run:

```bash
npm run audit:proof-intake-record
```

or:

```bash
npm run cli -- audit:proof-intake-record
```

The audit checks:

- the generated record is fresh
- the record conforms to the proof intake schema subset
- the fixture identifies itself as fixture-derived
- the safety confirmations are explicit
- prohibited claims include adoption, benchmark, customer outcome, and originality boundaries
- package script, CLI, docs, release preflight, and completion matrix wiring exist

## Boundary

This is a local fixture record.

It is not a real submitter artifact.
It does not create external proof.
It does not grant permission.
It does not prove external adoption.
It does not publish a case.
It does not choose a license.

The record exists to keep the first external proof intake path machine-checkable before a real permissioned or clearly redacted weak artifact arrives.

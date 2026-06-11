# Proof Redaction Packet

Status: local redaction checklist packet for the first permissioned external weak artifact.

`proof:redaction-packet` generates a submitter/operator handoff for checking redaction requirements before a weak artifact enters the proof path.

## Command

```bash
npm run proof:redaction-packet
```

or:

```bash
npm run cli -- proof:redaction-packet
```

This writes:

```text
.mimesis/proof-intake/redaction-packet.md
```

## Purpose

The proof redaction packet gives a submitter and operator one place to check:

- what private material must be removed
- how permission status, publication preference, redaction requirements, and safety confirmation connect
- when to stop before `case:review`
- how `audit:secrets` fits into the proof path
- which claims remain forbidden even after redaction

## Audit

```bash
npm run audit:proof-redaction-packet
```

The audit checks package script wiring, CLI exposure, release preflight order, generated packet sections, public docs, completion matrix visibility, framework manifest commands, release artifact manifest coverage, and proof boundaries.

## Boundary

This packet does not redact files.
It does not create external proof.
It does not grant permission.
It does not publish.
It does not choose a license.
It does not run a transformation.
It does not create evidence.
It does not prove adoption.
It does not guarantee complete private-data removal.

It is a local redaction checklist, not a security guarantee, legal review, owner permission, or proof that an artifact is safe to publish.

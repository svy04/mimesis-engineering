# Proof Acceptance Packet

Status: local case creation gate packet for the first permissioned external weak artifact.

`proof:acceptance-packet` generates a proof acceptance packet after the submission handoff and before `case:from-intake`.

## Command

```bash
npm run proof:acceptance-packet
```

or:

```bash
npm run cli -- proof:acceptance-packet
```

This writes:

```text
.mimesis/proof-intake/acceptance-packet.md
```

## Purpose

The proof acceptance packet gives the operator an accept / revise / reject case creation gate:

- accept: the intake can move to `case:review` and then a started case workspace
- revise: the submitter must clarify fields, redaction, or boundaries
- reject: the intake should not enter this proof path

It connects the proof submission packet, redaction packet, first proof candidate packet, and v0.2 proof queue without claiming proof.

## Audit

```bash
npm run audit:proof-acceptance-packet
```

The audit checks package script wiring, CLI exposure, release preflight order, generated packet sections, public docs, completion matrix visibility, framework manifest commands, release artifact manifest coverage, and proof boundaries.

## Boundary

This packet does not accept an artifact.
It does not create external proof.
It does not grant permission.
It does not redact files.
It does not publish.
It does not choose a license.
It does not run a transformation.
It does not create evidence.

It is a local case creation gate, not an accepted artifact, completed proof case, legal review, permission grant, or publication.

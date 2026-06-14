# Proof Submission Packet

Status: local submission handoff packet for the first permissioned external weak artifact.

`proof:submission-packet` generates a submitter/operator handoff that connects the GitHub issue form, permissioned intake template, proof intake kit, proof redaction packet, and first proof candidate packet.

## Command

```bash
npm run proof:submission-packet
```

or:

```bash
npm run cli -- proof:submission-packet
```

This writes:

```text
.mimesis/proof-intake/submission-packet.md
```

## Purpose

The proof submission packet gives a submitter checklist for one permissioned external weak artifact before review:

- which GitHub issue form or Markdown intake path to use
- which fields must be present
- how permission status, publication preference, redaction requirements, and safety confirmation fit together
- what the operator runs after receiving the intake
- when to stop before case creation

## Audit

```bash
npm run audit:proof-submission-packet
```

The audit checks package script wiring, CLI exposure, release preflight order, generated packet sections, GitHub issue form references, public docs, completion matrix visibility, framework manifest commands, release artifact manifest coverage, and proof boundaries.

## Boundary

This packet does not submit an artifact.
It does not create external proof.
It does not grant permission.
It does not redact files.
It does not publish.
It does not choose a license.
It does not run a transformation.
It does not create evidence.

It is a local submission handoff, not a submitted artifact, proof case, legal review, or permission grant.

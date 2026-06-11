# Proof Execution Report

Status: local command evidence ledger packet for the first permissioned proof run.

`proof:execution-report` generates a proof execution report packet after the acceptance gate and proof-run packet.

## Command

```bash
npm run proof:execution-report
```

or:

```bash
npm run cli -- proof:execution-report
```

This writes:

```text
.mimesis/proof-runs/execution-report.md
```

## Purpose

The proof execution report gives the operator a command evidence ledger for a real proof attempt:

- which commands must be run
- which report paths or outputs must be attached
- which execution states are allowed
- where a run stopped
- whether the current state is `not_started`, `running`, `stopped`, or `complete_local_run`

It is generated before a real artifact run so the operator knows what evidence must exist before any stronger claim.

## Audit

```bash
npm run audit:proof-execution-report
```

The audit checks package script wiring, CLI exposure, release preflight order, generated report sections, command evidence ledger visibility, public docs, completion matrix visibility, framework manifest commands, release artifact manifest coverage, and proof boundaries.

## Boundary

This is not executed proof.
This packet does not execute commands.
It does not create external proof.
It does not grant permission.
It does not redact files.
It does not run a transformation.
It does not publish.
It does not choose a license.
It does not create evidence by itself.

It is a local command evidence ledger, not a completed proof run, external case, legal review, permission grant, publication, or release.

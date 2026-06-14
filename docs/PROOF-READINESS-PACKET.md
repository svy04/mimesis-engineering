# Proof Readiness Packet

Status: local first weak artifact readiness handoff.

`proof:readiness` generates the readiness packet for the first v0.2 permissioned proof attempt.

It exists for the moment before the external artifact arrives: the framework has enough local scaffolding to ask for one weak artifact, but it still must not claim external proof.

## Command

```bash
npm run proof:readiness
```

or:

```bash
npm run cli -- proof:readiness
```

This writes:

```text
.mimesis/proof-runs/readiness.md
```

## Purpose

The packet gives an operator one place to see:

- what is already ready locally
- what is still blocked by owner or external evidence
- what to collect before running a permissioned proof loop
- the command path for `case:review`, `case:from-intake`, `case:check`, `evidence:review`, `claim:from-evidence`, and `release:check:public`
- the allowed and forbidden claims before and after the first real artifact

## Required Flow

```text
proof:readiness -> proof:run-packet -> audit:proof-readiness -> audit:proof-run
```

The readiness packet should be generated before the proof-run packet audit, because the proof-run path depends on the same v0.2 gate state.

## Boundary

This packet does not create external proof, does not bypass owner gates, does not choose a license, does not publish, does not prove external adoption, and does not replace a real before/after case.

It only makes the next honest action explicit:

```text
Bring one weak artifact.
```

## Audit

Run:

```bash
npm run audit:proof-readiness
```

The audit checks that the generated readiness packet includes readiness state, prepared local surfaces, blocked gates, intake card, operator command path, claim boundary, next action, and proof-boundary text.

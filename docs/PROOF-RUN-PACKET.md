# Proof Run Packet

Status: local operator proof run handoff.

`proof:run-packet` generates the operator proof run packet for the first v0.2 permissioned proof attempt.

Run `proof:readiness` first when the artifact has not arrived yet.
The readiness packet keeps the current state explicit: Bring one weak artifact, then run the proof loop.

It turns the proof queue, intake kit, owner evidence bridge, permissioned-case review, case checker, benchmark protocol, evidence packet gate, and release preflight into one bounded runbook.

## Command

```bash
npm run proof:run-packet
```

or:

```bash
npm run cli -- proof:run-packet
```

This writes:

```text
.mimesis/proof-runs/v0.2-first-run.md
```

The preceding readiness packet is:

```text
.mimesis/proof-runs/readiness.md
```

## Required Flow

```text
proof:readiness -> case:review -> case:from-intake -> case:check -> evidence:check
```

Owner evidence bridge lane:

```text
owner:evidence-submission-check -> proof:intake-from-owner-evidence -> proof:intake-check -> case:from-record -> case:check -> evidence:check
```

Then run:

```bash
npm run release:check:public
```

## Audit

```bash
npm run audit:proof-run
```

The audit checks that the generated proof run packet includes inputs, operator commands, evidence board, stop conditions, allowed claim, disallowed claim, and boundary text.

## Boundary

This packet does not create external proof, submit an artifact, grant permission, run the transformation, or publish.
It does not publish a case, publish to npm, publish a GitHub Marketplace action, prove adoption, prove benchmarked productivity, prove customer outcomes, or prove legal originality.

It is an operator handoff for a future real proof run.

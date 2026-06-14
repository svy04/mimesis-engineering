# License Packet

Status: local owner-decision handoff.

`license:packet` generates an owner-facing license decision packet from the current repository boundary.
It does not choose a license and is not legal advice.

## Run

```bash
npm run license:packet
```

or:

```bash
npm run cli -- license:packet
```

This writes:

```text
.mimesis/license-packets/owner-decision.md
```

## What It Contains

- current `UNLICENSED` / `private: true` package boundary
- owner decision questions
- candidate license directions
- what remains blocked before npm or open-source reuse claims
- safe and unsafe public claims before the owner chooses

## Boundary

This packet is a decision aid only.
It does not grant reuse rights, publish the package, choose a license, create legal advice, or prove open-source readiness.

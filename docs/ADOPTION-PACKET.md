# Adoption Packet

Status: local external adoption evidence intake protocol, not adoption proof.

`adoption:packet` generates an adoption packet for future external adoption evidence.
It is not adoption proof, and it does not prove external adoption by itself.

## Command

```bash
npm run adoption:packet
```

or:

```bash
npm run cli -- adoption:packet
```

This writes:

```text
.mimesis/adoption-packets/v0.2-first-adoption.md
```

Audit it with:

```bash
npm run audit:adoption-packet
```

## What It Requires

- adoption event type
- source URL or archived artifact path
- public, permissioned, or redacted source boundary
- timestamp or commit reference
- event observation method
- reviewer decision
- reviewed evidence packet
- allowed claim
- disallowed claim

## Boundary

This adoption packet does not create evidence.
It does not prove external adoption, does not publish, does not create engagement, does not close gates, and does not replace `evidence:check --require-reviewed`.

Use `templates/evidence-packet.md` to create the reviewed evidence packet before making any adoption claim.

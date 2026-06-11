# Benchmark Packet

Status: local measurement protocol.

`benchmark:packet` generates a benchmark and adoption measurement packet for future Mimesis proof claims.
It is for designing evidence collection before anyone claims productivity gains, adoption, customer outcomes, or commercial impact.

## Command

```bash
npm run benchmark:packet
```

or:

```bash
npm run cli -- benchmark:packet
```

This writes:

```text
.mimesis/benchmark-packets/v0.2-first-benchmark.md
```

Audit it with:

```bash
npm run audit:benchmark-packet
```

## What It Requires

- exact claim under test
- baseline artifact or workflow
- Mimesis-run artifact or workflow
- measurement method
- sample size or case count
- adoption event definition
- threats to validity
- allowed claim
- disallowed claim
- reviewed evidence packet path

## Boundary

This measurement protocol does not create evidence.
It does not prove benchmarked productivity, does not prove external adoption, does not prove customer outcomes, does not publish, does not create engagement, and does not certify commercial impact.

Any benchmark or adoption claim requires evidence:check with `--require-reviewed` against a completed evidence packet.

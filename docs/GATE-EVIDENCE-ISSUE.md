# Gate Evidence Issue

Status: GitHub issue intake surface for open gate evidence.

Use `.github/ISSUE_TEMPLATE/gate-evidence.yml` when a contributor or owner has evidence that may support one open Mimesis gate.
The issue is intake only.
It does not close gates, does not create proof, does not prove adoption, does not prove benchmark results, and does not publish anything.

## Flow

1. Open one Gate Evidence issue for one gate.
2. Link the direct evidence in `evidence_links`.
3. State the permission and publication boundary.
4. Convert or attach a reviewed evidence packet when the evidence is ready.
5. Run `evidence:check` before using the evidence for stronger claims.
6. Run `evidence:review` for a named reviewer decision.
7. Route reviewed evidence through gate closure readiness and gate closure review before claiming movement.

## Commands

```bash
npm run gate:evidence-issue-convert
npm run audit:gate-evidence-issue-convert
npm run audit:gate-evidence-issue-form
npm run audit:issues
npm run cli -- evidence:check path/to/evidence-packet.md
npm run cli -- evidence:review path/to/evidence-packet.md --decision reviewed --reviewer "Reviewer Name" --note "Reviewed against the proof boundary." --out path/to/reviewed-evidence.md
```

## Boundary

No proof, no claim.

The gate evidence issue form:

- standardizes evidence intake
- keeps the gate id, evidence link, permission boundary, allowed claim, and disallowed claim together
- can be converted into a draft evidence packet with `gate:evidence-issue-convert`
- does not close gates
- does not create proof
- does not prove adoption
- does not replace `evidence:check`
- does not replace `evidence:review`
- does not prove package publication, action publication, shipped plugin status, benchmark results, or external adoption

Treat each issue as a routing surface until a reviewed evidence packet and gate closure review say otherwise.

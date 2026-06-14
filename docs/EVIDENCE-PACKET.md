# Evidence Packet

Status: local claim-evidence gate.

An evidence packet is required before Mimesis copy can claim stronger proof such as external adoption, benchmarked productivity, customer outcomes, npm publication, marketplace release, shipped plugins, or commercial outcomes.
Do not claim those outcomes without named evidence and a visible boundary.

It keeps the rule simple:

```text
No proof, no claim.
```

## Run

```bash
npm run cli -- evidence:check path/to/evidence-packet.md
```

To require an explicit reviewed or publishable decision:

```bash
npm run cli -- evidence:check path/to/evidence-packet.md --require-reviewed
```

To write a local review report beside the packet:

```bash
npm run cli -- evidence:check path/to/evidence-packet.md --write-report
```

## Required Sections

- Claim Under Review
- Evidence Type
- Source / Artifact Links
- Permission / Publication Boundary
- Measurement / Observation Method
- Before / After Or Event Evidence
- Allowed Claim
- Disallowed Claim
- What Remains Unproven
- Review Decision

## Boundary

This gate does not create evidence.
It checks whether a strong claim has a named source trail, permission boundary, observation method, allowed claim, disallowed claim, and remaining proof gap.

Passing this check does not prove universal effectiveness, legal originality, customer outcomes, or external adoption beyond the evidence named in the packet.

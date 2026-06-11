# First Proof Candidate Packet

Status: local candidate selection packet.

The first proof candidate packet sits between the proof intake kit and the proof run packet.
It helps the operator choose the first weak artifact candidate without pretending the artifact has arrived.

Current state:

```text
No permissioned external weak artifact has been submitted yet.
```

The next honest action remains:

```text
Bring one weak artifact.
```

## Generate

```bash
npm run proof:candidate-packet
```

This writes `.mimesis/proof-candidates/first-candidate.md`.

## Audit

```bash
npm run audit:proof-candidate-packet
```

The audit checks:

- package script wiring
- CLI exposure
- release preflight ordering
- generated candidate selection packet sections
- proof intake, proof readiness, gate evidence, and proof queue boundaries
- candidate selection rubric
- non-bypassing case and evidence command path
- release artifact manifest coverage
- README, tools, status, roadmap, completion audit, and framework manifest visibility

## Boundary

The packet helps select a candidate. It is not the candidate.

It does not create external proof.
It does not select a candidate.
It does not grant permission.
It does not create evidence.
It does not prove completion.
It does not publish.
It does not stage, commit, push, tag, or release.
It does not choose a license.
It does not prove external adoption, benchmarked productivity, customer outcomes, commercial outcomes, package publication, Marketplace publication, shipped plugin status, legal originality, or endorsement.

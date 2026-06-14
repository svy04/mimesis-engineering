# Mimesis Gate Evidence Packet

Status: evidence intake packet, not evidence.

Generated from the current gap register and gap closure plan for Mimesis Engineering v0.1.0.

This packet answers one narrow question:

```text
When a gate-closing artifact arrives, where should the evidence go?
```

It keeps the framework rule intact:

```text
No proof, no claim.
```

## Evidence Intake Matrix

| Gap ID | Gate | Evidence Type | Minimum Evidence | First Command | Stop Condition |
| --- | --- | --- | --- | --- | --- |
| `strict_publish_sync` | Strict publish sync gate | sync verification evidence, not publication evidence | npm run audit:sync:strict<br>.mimesis/sync-status.md | `npm run audit:sync:strict` | Stop if the worktree is dirty and no owner has requested staging, committing, pushing, tagging, releasing, or publishing. |
| `owner_license_decision` | Owner license decision | owner decision evidence, not legal advice | docs/LICENSE-DECISION.md<br>.mimesis/license-packets/owner-decision.md | `npm run release:decision-record && npm run audit:release-decision-record` | Stop if no owner decision exists. |
| `permissioned_external_artifact` | One permissioned external weak artifact | permission and artifact evidence, not proof by itself | docs/PROOF-INTAKE-KIT.md<br>.mimesis/proof-intake/first-external-proof-kit.md | `npm run proof:intake && npm run audit:proof-intake` | Stop if permission, redaction, or submitter scope is unclear. |
| `completed_external_case` | Completed permissioned before/after case | permissioned before/after case evidence, not universal proof | npm run cli -- case:review path/to/intake.md<br>npm run cli -- case:from-intake path/to/intake.md<br>npm run cli -- case:check path/to/case | `npm run cli -- case:review path/to/intake.md && npm run cli -- case:from-intake path/to/intake.md && npm run cli -- case:check path/to/case` | Stop if the case lacks before/after artifacts. |
| `package_publication` | npm package publication | package release event evidence, not dry-run evidence | docs/PACKAGE-RELEASE-CANDIDATE.md<br>npm run audit:package<br>owner-controlled npm publish evidence | `npm run audit:package && npm run package:dry-run` | Stop if package.json remains private. |
| `action_publication` | Tagged GitHub Action or Marketplace publication | tagged action or Marketplace release event evidence | docs/ACTION-RELEASE-CANDIDATE.md<br>npm run audit:action<br>tag or Marketplace release evidence | `npm run audit:action` | Stop if no tag or Marketplace release evidence exists. |
| `shipped_plugin` | Shipped plugin or connector proof | installation or release evidence, not local scaffold evidence | docs/PLUGIN-RELEASE-PACKET.md<br>.mimesis/plugin-release-packets/v0.1-action-candidate.md<br>installation or release evidence packet | `npm run plugin:packet && npm run audit:plugin-packet` | Stop if only local plugin scaffolds exist. |
| `benchmark_study` | Benchmarked productivity evidence | measurement evidence, not benchmark claim by itself | docs/BENCHMARK-PACKET.md<br>.mimesis/benchmark-packets/v0.2-first-benchmark.md<br>reviewed evidence packet | `npm run benchmark:packet && npm run audit:benchmark-packet` | Stop if no measured before/after study exists. |
| `external_adoption` | External adoption evidence | reviewed adoption evidence, not public visibility evidence | templates/evidence-packet.md<br>reviewed adoption evidence packet | `npm run cli -- evidence:check path/to/reviewed-adoption-evidence.md --require-reviewed` | Stop if public repository visibility is the only evidence. |

## Evidence Packet Template Bridge

Use [templates/evidence-packet.md](../../templates/evidence-packet.md) for any strong claim evidence.

Required evidence packet sections from the current template:

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

Draft, reviewed, and publishable evidence are different states.
Do not turn a draft packet into a public claim without review.

## Command Path

Use the existing evidence and review gates:

```bash
npm run cli -- evidence:check path/to/evidence-packet.md
npm run cli -- evidence:review path/to/evidence-packet.md --decision reviewed --reviewer "Reviewer Name" --note "Reviewed against the proof boundary."
npm run cli -- evidence:check path/to/reviewed-evidence-packet.md --require-reviewed
```

For a permissioned external case, run the case path before evidence review:

```bash
npm run cli -- case:review path/to/intake.md
npm run cli -- case:from-intake path/to/intake.md
npm run cli -- case:check path/to/case
npm run cli -- evidence:from-case path/to/case --out path/to/evidence-packet.md --force
```

## Allowed Claim

Mimesis has a local gate evidence packet that routes open gates to evidence packet requirements and review commands.

## Disallowed Claim

This gate evidence packet is not itself evidence.
It does not mean the gates are closed.
It does not mean Mimesis is externally proven, adopted, benchmarked, published, shipped, legally licensed for reuse, or complete.

## Boundary

This packet does not close gates.
It does not create evidence.
It does not prove completion.
It does not publish.
It does not stage, commit, push, tag, or release.
It does not choose a license.
It does not create external proof.
It does not prove adoption.
It does not prove benchmarked productivity.
It does not prove package publication, Marketplace publication, shipped plugin status, customer outcomes, commercial outcomes, or legal originality.

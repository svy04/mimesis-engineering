# Owner Decision Intake

`owner:decision-intake` generates a fillable owner decision intake packet from the current owner action queue, release decision record, proof intake kit, license packet, release evidence report, and gap register.

Run:

```bash
npm run owner:decision-intake
```

or:

```bash
npm run cli -- owner:decision-intake
```

This writes:

```text
.mimesis/owner-actions/decision-intake.md
```

## What It Is

The owner decision intake turns the queue into explicit owner-answer fields:

- `license_or_no_reuse`
- `weak_artifact_permission`
- `publication_scope`
- `package_action_plugin_scope`
- `benchmark_adoption_scope`
- `strict_sync_intent`

It is the handoff form for deciding what evidence the owner must attach next.

## Audit

Run:

```bash
npm run audit:owner-decision-intake
```

or:

```bash
npm run cli -- audit:owner-decision-intake
```

The audit checks package script wiring, CLI exposure, release preflight order, generated intake sections, source packet coverage, public docs, validator coverage, framework manifest visibility, release artifact manifest coverage, and no-decision/no-proof boundaries.

## Boundary

This packet does not choose a license.
It does not collect an artifact.
It does not grant permission.
It does not publish.
It does not create external proof.
It does not close gates.

It is a structured intake surface, not a release, proof, benchmark, adoption, or publication event.

# Mimesis Engineering Spec

This folder defines Mimesis Engineering v0.1 as a public framework.

It is not a claim of industry adoption.
It is a working contract for artifact-first AI work.

Status: spec index, not proof.

## Read First

- [mimesis-v0.1.md](mimesis-v0.1.md) — the v0.1 framework contract
- [file-protocol.md](file-protocol.md) — required files for one Mimesis loop
- [framework-manifest.schema.json](framework-manifest.schema.json) — machine-readable manifest shape
- [current-state-summary.schema.json](current-state-summary.schema.json) — machine-readable current state summary shape, not proof or closed gates
- [gate-closure-readiness.schema.json](gate-closure-readiness.schema.json) — machine-readable gate closure readiness shape, not closure or evidence
- [gate-closure-review.schema.json](gate-closure-review.schema.json) — machine-readable gate closure review record shape, not approved closure or closed gates
- [worktree-review-packet.schema.json](worktree-review-packet.schema.json) — machine-readable dirty worktree review packet shape, not publication or strict sync closure
- [release-review-bundle.schema.json](release-review-bundle.schema.json) — machine-readable release review bundle shape, not commit or publication
- [proof-intake.schema.json](proof-intake.schema.json) — machine-readable proof intake record shape
- [proof-execution-record.schema.json](proof-execution-record.schema.json) — machine-readable proof execution record shape, not proof approval or publication
- [owner-decision-answer.schema.json](owner-decision-answer.schema.json) — JSON Schema for pending owner decision answers, not owner decision
- [owner-evidence-intake.schema.json](owner-evidence-intake.schema.json) — JSON Schema for pending owner evidence requirements, not evidence
- [owner-evidence-submission.schema.json](owner-evidence-submission.schema.json) — JSON Schema for owner evidence submission state, not submitted evidence
- [quality-bar.md](quality-bar.md) — the checks every public artifact must pass
- [adapter-contract.md](adapter-contract.md) — how tools should integrate with Mimesis

## Schema Boundaries

The JSON Schema files make local records easier for AI-native tools to read.
They do not choose a license, collect an artifact, submit evidence, attach evidence, grant permission, publish, create external proof, prove benchmarked productivity, or prove adoption.
This spec index does not prove adoption.

Use the schema files to check shape and boundary language only:

- `proof-intake.schema.json` checks the proof-intake fixture shape, not real permission or external proof.
- `current-state-summary.schema.json` checks the current state summary shape, not completion proof, closed gates, publication, or adoption.
- `gate-closure-readiness.schema.json` checks the gate closure readiness shape, not closed gates, submitted evidence, attached evidence, publication, or adoption.
- `gate-closure-review.schema.json` checks the gate closure review record shape, not approved gate closure, closed gates, submitted evidence, attached evidence, publication, or adoption.
- `worktree-review-packet.schema.json` checks the local dirty worktree review packet shape, not staging, commit, push, publication, remote freshness, or strict sync closure.
- `release-review-bundle.schema.json` checks the local release review bundle shape, not staging, commit, push, publication, remote freshness, owner license choice, or strict sync closure.
- `owner-decision-answer.schema.json` checks the owner decision answer record shape for pending owner answers, not owner decision.
- `owner-evidence-intake.schema.json` checks the owner evidence intake record shape for pending owner evidence requirements, not evidence.
- `owner-evidence-submission.schema.json` checks the owner evidence submission record shape for `not_submitted_owner_evidence`, not submitted evidence.
- `proof-execution-record.schema.json` checks an operator-supplied proof execution record shape, not proof approval, publication, closed gates, adoption proof, or benchmark proof.

## Core Lines

Give AI standards, not roles.

Bring one weak artifact.
Leave with a stronger one.

Weak Mimesis copies surface.
Strong Mimesis extracts structure.

No proof, no claim.

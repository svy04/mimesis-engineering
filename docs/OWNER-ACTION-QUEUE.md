# Owner Action Queue

Status: local owner handoff packet.

`owner:queue` generates an owner action queue from the current gap register, gap closure plan, gate evidence packet, release evidence report, release decision record, and proof execution report.
It keeps sync as a runtime-only sync proof requirement instead of embedding sync-report snapshots in the committed owner handoff.

## Command

```bash
npm run owner:queue
```

or:

```bash
npm run cli -- owner:queue
```

This writes:

```text
.mimesis/owner-actions/current-action-queue.md
```

## Purpose

The owner action queue turns the open gates into a direct owner handoff:

- license or no-reuse decision
- one permissioned or clearly redacted weak artifact
- before/after case path
- strict sync before publication
- npm, action, plugin, benchmark, and adoption evidence requirements

It helps an operator move from local framework readiness toward the first real external proof and publication decisions.

## Audit

```bash
npm run audit:owner-queue
```

The audit checks package script wiring, CLI exposure, release preflight order, generated queue sections, required gap IDs, public docs, validator coverage, framework manifest visibility, release artifact manifest coverage, and proof boundaries.

## Boundary

This packet does not choose a license.
It does not collect an artifact.
It does not grant permission.
It does not redact files.
It does not run a transformation.
It does not publish.
It does not stage, commit, push, tag, or release.
It does not publish to npm.
It does not publish a GitHub Marketplace action.
It does not ship a plugin.
It does not create external proof.
It does not prove adoption.
It does not prove sync.
It does not prove benchmarked productivity, customer outcomes, commercial outcomes, legal originality, or endorsement.

# Owner Issue Queue

Status: local owner issue queue packet.

`owner:issue-queue` turns the current gap register, gap closure plan, and owner action queue into copyable GitHub issue body drafts.

It is an owner issue queue, not remote issue creation.
It does not create GitHub issues.

## Command

```bash
npm run owner:issue-queue
```

or:

```bash
npm run cli -- owner:issue-queue
```

This writes:

```text
.mimesis/owner-actions/v0.2-issue-queue.md
```

## Purpose

The owner issue queue turns open gates into issue-ready work units:

- owner license or no-reuse decision
- one permissioned or clearly redacted weak artifact
- before/after case evidence
- strict sync before publication
- package, action, plugin, benchmark, and adoption evidence requirements

Each draft carries direct evidence requirements, suggested local commands, stop conditions, allowed claims, and proof boundaries.

## Audit

```bash
npm run audit:owner-issue-queue
```

The audit checks package script wiring, CLI exposure, release preflight order, generated issue sections, required gap IDs, public docs, validator coverage, framework manifest visibility, release artifact manifest coverage, and no-remote-mutation boundaries.

## Boundary

This packet does not create GitHub issues.
It does not close gates.
It does not choose a license.
It does not collect an artifact.
It does not grant permission.
It does not redact files.
It does not run a transformation.
It does not publish.
It does not stage, commit, push, tag, or release.
It does not create external proof.
It does not prove adoption.

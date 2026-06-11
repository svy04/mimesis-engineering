# Release Decision Record

Status: pending owner decision record.

`release:decision-record` generates a machine-readable owner release decision record.

It captures current release, license, package, action, plugin, proof, benchmark, and adoption gates as pending or blocked.
It does not choose a license, does not stage files, does not create a commit, does not push, does not tag, does not release, and does not publish.

## Command

```bash
npm run release:decision-record
```

or:

```bash
npm run cli -- release:decision-record
```

This writes:

```text
.mimesis/release-decisions/owner-decision-record.json
```

## Purpose

The record gives the owner and future agents a single JSON artifact for:

- license decision status
- public release decision status
- npm publication status
- GitHub Action publication status
- plugin publication status
- external proof status
- benchmark or adoption status
- required fresh commands before any owner-controlled release action
- source files that justify the decision state

## Boundary

This is an owner release decision record, not a release action.

It does not choose a license.
It does not publish.
It does not stage, commit, push, tag, or release.
It does not create external proof.
It does not prove external adoption, benchmarked productivity, shipped plugin status, npm publication, Marketplace publication, or legal originality.

## Audit

Run:

```bash
npm run audit:release-decision-record
```

The audit checks package script wiring, CLI exposure, release preflight wiring, JSON shape, pending owner decision states, required fresh commands, source files, and proof-boundary flags.

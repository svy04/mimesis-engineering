# Release Evidence Report

Status: local publication evidence checklist packet.

`release:evidence-report` generates a release evidence report for the owner-controlled publication path.

## Command

```bash
npm run release:evidence-report
```

or:

```bash
npm run cli -- release:evidence-report
```

This writes:

```text
.mimesis/release-evidence/v0.1-report.md
```

## Purpose

The release evidence report gives the owner a publication evidence table for claims that need direct release proof.
Boundary: this list names required evidence only; it is not proof, not publication, and not shipped plugin evidence:

- committed and pushed repository work
- tagged release
- npm publication
- GitHub Action release or Marketplace listing
- not shipped plugin evidence; shipped plugin release URL or install proof requirement
- external proof, benchmark, adoption, or customer outcome evidence

It names required release evidence before the public copy can make stronger claims.

## Audit

```bash
npm run audit:release-evidence-report
```

The audit checks package script wiring, CLI exposure, release preflight order, generated report sections, publication evidence table visibility, public docs, completion matrix visibility, framework manifest commands, release artifact manifest coverage, and release/proof boundaries.

## Boundary

This packet does not publish.
It does not stage files.
It does not create a commit.
It does not push.
It does not create a tag.
It does not create a GitHub release.
It does not publish to npm.
It does not publish a GitHub Marketplace action.
It does not ship a plugin.
It does not choose a license.
It does not create external proof.

It is a local evidence checklist, not a publication event, release event, package publication, Marketplace listing, plugin shipment, legal review, or proof case.

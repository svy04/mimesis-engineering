# Release Artifact Manifest

Status: local release-review integrity inventory.

The release artifact manifest records selected v0.1 release-review artifacts with `sha256` hashes.
It gives a reviewer a machine-readable checklist of the files that define the current local framework surface.

## Generate

```bash
npm run release:artifact-manifest
```

or:

```bash
npm run cli -- release:artifact-manifest
```

This writes:

```text
.mimesis/release-artifacts/v0.1-manifest.json
```

## Audit

```bash
npm run audit:release-artifact-manifest
```

or:

```bash
npm run cli -- audit:release-artifact-manifest
```

The audit checks:

- package scripts
- CLI exposure
- release preflight wiring
- generated JSON schema name
- local package version
- artifact count
- required release-surface files
- per-artifact `sha256`, byte count, category, and source type
- explicit proof and publication boundaries

## Included Shape

The manifest includes:

- root public documents
- framework specs
- templates and reference packs
- casebook surfaces
- generated `.mimesis` packets
- plugin and adapter surfaces
- release, proof, publication, and claim-boundary docs
- local generators and audits that keep the release surface checkable

The manifest intentionally does not hash itself.
Its own `generatedAt` value changes each run, so a self hash would be unstable.

## Boundary

The release artifact manifest is local integrity evidence.

It does not publish.
It does not stage, commit, push, tag, or release.
It does not choose a license.
It does not create external proof.
It does not prove external adoption, benchmarked productivity, customer outcomes, package publication, Marketplace publication, official host compliance, or legal originality.

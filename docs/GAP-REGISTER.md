# Gap Register

Status: local open-gate register.

The gap register is the machine-readable list of what still blocks stronger Mimesis claims.
It exists so green local checks do not quietly become a completion claim.
Its generated status is `open_gates_remain`, because open gates remain until owner decisions, external proof, publication, benchmark, and adoption evidence exist.

## Generate

```bash
npm run gap:register
```

or:

```bash
npm run cli -- gap:register
```

This writes:

```text
.mimesis/gaps/current-gap-register.json
```

## Audit

```bash
npm run audit:gap-register
npm run audit:gap-register-sync-closure
```

or:

```bash
npm run cli -- audit:gap-register
npm run cli -- audit:gap-register-sync-closure
```

The audit checks:

- package script wiring
- CLI exposure
- release preflight wiring
- generated JSON schema name
- `open_gates_remain` status
- `completionAllowed: false`
- required gap IDs
- strict sync gap runtime-only closure boundary
- required evidence fields
- source files
- proof and publication boundaries
- README, status, roadmap, tools, completion, and framework manifest visibility

## Required Gap IDs

The register currently tracks open gaps.
The strict sync gap remains visible in committed gap-register snapshots because `.mimesis/sync-status.md` is a local report artifact that can become stale after commit or push.
The committed gate board avoids volatile sync snapshot lines and points to the runtime-only strict sync audit instead.

`npm run audit:gap-register-sync-closure` checks this runtime-only boundary.
Use the non-writing strict sync check, `npm run audit:sync:strict`, as the current runtime proof of local upstream sync.

The committed register tracks:

- `strict_publish_sync`
- `owner_license_decision`
- `permissioned_external_artifact`
- `completed_external_case`
- `package_publication`
- `action_publication`
- `shipped_plugin`
- `benchmark_study`
- `external_adoption`

## Boundary

The gap register is local gate visibility.

It does not prove completion.
It does not publish.
It does not stage, commit, push, tag, or release.
It does not choose a license.
It does not create external proof.
It does not prove external adoption, benchmarked productivity, shipped plugins, package publication, Marketplace publication, customer outcomes, legal originality, or remote freshness.

# Status Roadmap Sync

Status: local public-status consistency audit.

The status roadmap sync audit keeps `STATUS.md` and `ROADMAP.md` aligned with the current v0.1 implementation surface.
It exists because a framework can pass technical checks while its public status page quietly falls behind the real artifact trail.

## Audit

```bash
npm run audit:status-roadmap
```

or:

```bash
npm run cli -- audit:status-roadmap
```

The audit checks:

- package script wiring
- CLI exposure
- release preflight wiring
- `STATUS.md` current capability language
- `ROADMAP.md` v0.1 capability language
- release artifact manifest visibility
- publication evidence packet visibility
- goal completion audit visibility
- current state summary visibility
- state snapshot boundary visibility
- worktree review packet visibility
- release review bundle visibility
- gap closure plan visibility
- gate evidence packet visibility
- gate closure readiness visibility
- adoption packet visibility
- first proof candidate packet visibility
- proof redaction packet visibility
- proof submission packet visibility
- proof acceptance packet visibility
- proof execution report visibility
- spec index audit visibility
- owner action queue visibility
- owner issue queue visibility
- owner issue remote sync visibility
- owner proof handoff visibility
- owner proof input visibility
- owner proof input remote issue visibility
- owner proof input remote issue snapshot visibility
- owner proof input remote issue export visibility
- owner proof input remote issue export candidate visibility
- owner proof input review visibility
- owner proof input split visibility
- owner decision intake visibility
- owner decision answer record visibility
- owner answer review visibility
- owner evidence attachment form visibility
- owner evidence submission record visibility
- owner evidence submission check visibility
- owner evidence bundle visibility
- owner evidence intake record visibility
- owner evidence review visibility
- completion audit evidence links
- README and tools documentation links
- release evidence report visibility
- framework manifest command exposure

## Required Current Surface

The audit currently requires the public status and roadmap to name:

- release artifact manifest
- publication evidence packet
- goal completion audit
- current state summary
- state snapshot boundary
- worktree review packet
- release review bundle
- release evidence report
- gap closure plan
- gate evidence packet
- gate closure readiness
- adoption packet
- first proof candidate packet
- proof redaction packet
- proof submission packet
- proof acceptance packet
- proof execution report
- spec index audit
- owner action queue
- owner issue queue
- owner issue remote sync
- owner proof handoff
- owner proof input
- owner proof input remote issue
- owner proof input remote issue snapshot
- owner proof input remote issue export
- owner proof input remote issue export candidate
- owner proof input review
- owner proof input split
- owner decision intake
- owner decision answer record
- owner answer review
- owner evidence attachment form
- owner evidence submission record
- owner evidence submission check
- owner evidence bundle
- owner evidence intake record
- owner evidence review
- status roadmap sync audit

This is intentionally narrow and mechanical.
It prevents newly added release-review surfaces from disappearing from the public operating map.

## Boundary

The status roadmap sync audit is a local documentation consistency check.

It does not prove completion.
It does not publish.
It does not stage, commit, push, tag, or release.
It does not choose a license.
It does not create external proof.
It does not prove external adoption, benchmarked productivity, shipped plugins, package publication, Marketplace publication, customer outcomes, legal originality, or remote freshness.

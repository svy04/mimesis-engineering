# Release Execution Packet

Status: owner release execution handoff.

`release:execution-packet` generates the final local handoff before an owner decides whether to commit, tag, release, publish to npm, or publish a GitHub Action.
It is a stable owner handoff, not a live git/sync report.
Use the runtime-only execution gates when current proof is needed.

## Command

```bash
npm run release:execution-packet
```

or:

```bash
npm run cli -- release:execution-packet
```

This writes:

```text
.mimesis/release-execution/v0.1-owner-handoff.md
```

Audit it with:

```bash
npm run audit:release-execution
```

## What It Combines

- public preflight command
- strict clean/synced worktree gate as a runtime-only execution gate
- owner license decision boundary
- owner release decision record boundary
- package release-candidate boundary
- GitHub Action release-candidate boundary
- publish handoff boundary
- allowed and disallowed release claims

## Boundary

This packet does not publish, does not stage files, does not create a commit, does not push, does not create a tag, does not create a release, does not publish to npm, does not publish a GitHub Marketplace action, does not choose a license, and does not create external proof.
The committed release execution packet is not a sync proof and intentionally avoids branch names, commit hashes, upstream heads, dirty-worktree counts, changed-entry lists, and embedded sync reports.

It is an owner decision handoff only.

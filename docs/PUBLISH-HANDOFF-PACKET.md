# Publish Handoff Packet

Status: local publish/sync handoff generator.

`publish:packet` generates a local handoff packet for the current publish boundary.
It does not stage, commit, push, tag, create a release, publish to npm, or create a pull request.

## Run

```bash
npm run publish:packet
```

or:

```bash
npm run cli -- publish:packet
```

This writes:

```text
.mimesis/publish-packets/local-sync-handoff.md
```

## What It Contains

- current branch and upstream
- current dirty worktree summary
- changed tracked and untracked entries
- required owner decisions before publication
- commands to verify before any commit, tag, release, or push
- allowed and disallowed publish claims

## Boundary

This packet is a local handoff artifact.
It does not publish, push, tag, stage files, create a commit, create a pull request, choose a license, create external proof, or prove remote freshness.

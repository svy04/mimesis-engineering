# Worktree Review Packet

Status: local dirty worktree inventory, not publication.

`worktree:packet` generates a machine-readable worktree review packet before any publication step.
It is designed for a human or agent to review what is still local before staging, committing, pushing, tagging, releasing, or publishing.

## Commands

```bash
npm run worktree:packet
npm run audit:worktree-packet
```

or:

```bash
npm run cli -- worktree:packet
npm run cli -- audit:worktree-packet
```

The generated packet is:

```text
.mimesis/worktree/review-packet.json
```

## What It Records

- branch, upstream, and head commit
- dirty worktree flag
- tracked changed count
- untracked count
- tracked status paths from `git status --short`
- staged changed paths from `git diff --cached --name-status`
- unstaged changed paths from `git diff --name-status`
- untracked root counts and a sample of untracked files when untracked files exist
- source git commands used to create the packet
- allowed and disallowed claims

## Boundary

This worktree review packet does not stage files.
It does not commit.
It does not push.
It does not tag or release.
It does not publish.
It does not close strict sync.
It does not prove remote freshness.
It does not choose a license, create external proof, prove adoption, or prove completion.

Use it as a review inventory before `audit:sync:strict`, `release:ready:publish`, a PR, or any public release action.

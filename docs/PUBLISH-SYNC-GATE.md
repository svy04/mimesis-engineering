# Publish Sync Gate

Status: explicit publication boundary.

This gate separates three different claims:

- local framework checks pass
- expected public repositories are visible
- the remote repository contains the current local worktree

The third claim is not true while the worktree has uncommitted or untracked changes.

## Run

Generate the sync report:

```bash
npm run audit:sync
```

Require a clean worktree synced with upstream:

```bash
npm run audit:sync:strict
```

`audit:sync:strict` runs `tools/audit-sync-status.mjs --strict --no-write`.
It is a non-writing strict sync gate so it does not mutate the worktree while checking publication readiness.
The generated report uses `head matches upstream` instead of dynamic commit hash lines.

Run every local, workspace, remote, and strict sync gate:

```bash
npm run release:ready:publish
```

## Output

`audit:sync` writes:

```text
.mimesis/sync-status.md
```

## Boundary

Passing `release:check:public` does not prove that the remote repository contains the current local worktree.
Passing `audit:sync:strict` means only that the local worktree is clean and the local branch matches its configured upstream ref.
The strict check does not write `.mimesis/sync-status.md`; run `audit:sync` when a report file is needed.

This gate does not choose a license, create a permissioned external case, publish to npm, publish a GitHub Marketplace action, create a tag, or push commits.

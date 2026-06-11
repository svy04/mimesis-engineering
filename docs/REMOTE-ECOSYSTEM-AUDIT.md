# Remote Ecosystem Audit

Status: read-only public repository visibility check.

This audit checks whether the expected Mimesis ecosystem repositories are visible on GitHub.
It uses GitHub CLI in read-only mode when available, then falls back to public GitHub repository metadata when GitHub CLI authentication fails.

## Repositories

- `svy04/mimesis-engineering`
- `svy04/mimesis-canvas`
- `svy04/mimesis-casebook`

## Run

```bash
npm run audit:remote
npm run audit:remote-fallback
```

To combine local, workspace, and remote checks:

```bash
npm run release:check:public
```

## What It Checks

- repository exists
- visibility is `PUBLIC`
- default branch is `main`
- repository is not archived
- repository is not a fork
- fallback path survives a forced GitHub CLI failure

## Boundary

This is a visibility audit.
It does not prove that remote content matches the current local worktree.
It does not prove external adoption, issue activity, stars, usage, marketplace release, npm release, or customer proof.
The fallback path is also visibility-only.

Use it as public-surface evidence only.

# Release Review Bundle

Status: local release review scope, not commit or publication.

`release:review-bundle` generates a machine-readable review bundle from the current worktree packet, current state summary, gap register, and release evidence report.
It turns dirty worktree evidence into review groups so a human or agent can decide what belongs in a future commit, PR, tag, release, or publication.

## Commands

```bash
npm run release:review-bundle
npm run audit:release-review-bundle
```

or:

```bash
npm run cli -- release:review-bundle
npm run cli -- audit:release-review-bundle
```

The generated bundle is:

```text
.mimesis/release-review/v0.1-bundle.json
```

## Review Groups

The bundle classifies local changes into:

- tracked core edits
- generated protocol artifacts
- public documentation
- tooling and cli
- spec and schemas

The bundle also records a required review sequence before any publication action.

## Boundary

This release review bundle does not stage files.
It does not commit.
It does not push.
It does not tag or release.
It does not publish.
It does not choose a license.
It does not close strict sync.
It does not prove remote freshness.
It does not create external proof, prove adoption, or prove completion.

Use it before staging, committing, pushing, tagging, releasing, publishing, or running `audit:sync:strict`.

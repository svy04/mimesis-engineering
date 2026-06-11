# Owner Issue Remote Sync

Status: read-only remote issue sync snapshot, not remote issue creation.

`owner:issue-remote-sync` compares the local owner issue queue with GitHub issue metadata for `svy04/mimesis-engineering`.
It is a visibility tool for open gates. It does not create GitHub issues.

## Commands

Generate the read-only snapshot:

```bash
npm run owner:issue-remote-sync
```

Audit the committed snapshot shape:

```bash
npm run audit:owner-issue-remote-sync
```

Generated files:

- `.mimesis/owner-actions/remote-issue-sync.json`
- `.mimesis/owner-actions/remote-issue-sync.md`

## What It Records

- the expected issue title for each open v0.2 gate
- labels from the local owner issue queue policy
- whether an issue with the expected title already exists remotely
- sanitized metadata for matched issues
- sanitized metadata for existing non-gate issues
- missing gate issues that still require deliberate owner action

## Boundary

This is read-only.
It does not create GitHub issues.
It does not close gates.
It does not choose a license.
It does not collect an artifact.
It does not grant permission.
It does not create external proof.
It does not prove adoption.
It does not prove benchmark results.
It does not publish, tag, stage, commit, or push.

Use this after `owner:issue-queue` when you want to see which local gate issue drafts already have matching remote issues.
If a gate issue is missing, create it deliberately as an owner action only after checking whether the title, labels, and body are safe for public GitHub.

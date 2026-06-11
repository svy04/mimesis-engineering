# Owner Issue Remote Create

Status: gated remote issue creation command, not gate closure.

`owner:issue-remote-create` creates the missing remote GitHub issues for the current v0.2 owner/proof/publication/measurement gates.
It is dry-run by default. It mutates GitHub only when called with `--execute`.

## Commands

Preview the remote issue creation plan:

```bash
npm run owner:issue-remote-create
```

Execute remote issue creation deliberately:

```bash
npm run owner:issue-remote-create -- --execute
```

Audit the committed execute report:

```bash
npm run audit:owner-issue-remote-create
```

Generated files:

- `.mimesis/owner-actions/remote-issue-create.json`
- `.mimesis/owner-actions/remote-issue-create.md`

## What It Does

- reads `.mimesis/gaps/current-gap-register.json`
- creates missing `mimesis-*` labels only when absent
- creates only missing `[Mimesis v0.2 gate] ...` issues by exact title match
- records remote issue number, URL, state, title, and labels
- avoids storing issue bodies in the committed create report

## Boundary

This command creates coordination issues only.
It does not close gates.
It does not choose a license.
It does not provide legal advice.
It does not collect an artifact.
It does not grant permission.
It does not create external proof.
It does not approve proof.
It does not prove adoption.
It does not prove benchmark results.
It does not publish, tag, stage, commit, or push.

After execution, run `owner:issue-remote-sync` again to refresh the read-only remote match snapshot.

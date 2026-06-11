# Owner Proof Input Remote Issue Export

Status: private export path, not owner decision or proof.

Use this only after the owner fills GitHub issue #7 with the two minimum inputs:

- `license_or_no_reuse`
- `weak_artifact_permission`

The command fetches the live issue body, classifies it, and writes the raw body only when it is candidate owner input.
The output path is under `.mimesis/private/`, which is gitignored.

## Commands

```bash
npm run owner:proof-input-remote-issue-export
npm run audit:owner-proof-input-remote-issue-export
```

or:

```bash
npm run cli -- owner:proof-input-remote-issue-export
npm run cli -- audit:owner-proof-input-remote-issue-export
```

Default private output:

```text
.mimesis/private/owner-actions/remote-proof-input-issue-7.md
.mimesis/private/owner-actions/remote-proof-input-issue-7-export.md
```

## Safety Rules

- The export command refuses request-only issue bodies.
- The export command refuses secret-like issue bodies.
- The export command refuses non-private output paths.
- The committed audit checks that `.mimesis/private/` is gitignored.
- The release preflight runs only the audit, not the live raw-body export.

## Downstream Path

After a successful private export, convert the private issue body locally:

```bash
npm run cli -- owner:proof-input-issue-convert .mimesis/private/owner-actions/remote-proof-input-issue-7.md --output .mimesis/private/owner-actions/remote-proof-input-issue-7-record.json --report .mimesis/private/owner-actions/remote-proof-input-issue-7-conversion.md --status reviewed --require-complete
npm run cli -- owner:proof-input-review .mimesis/private/owner-actions/remote-proof-input-issue-7-record.json --write-report .mimesis/private/owner-actions/remote-proof-input-issue-7-review.md --output-record .mimesis/private/owner-actions/remote-proof-input-issue-7-reviewed-record.json --approve --require-approvable
npm run cli -- owner:proof-input-check .mimesis/private/owner-actions/remote-proof-input-issue-7-reviewed-record.json --require-ready --write-report .mimesis/private/owner-actions/remote-proof-input-issue-7-check.md
npm run cli -- owner:proof-input-split .mimesis/private/owner-actions/remote-proof-input-issue-7-reviewed-record.json --output-dir .mimesis/private/owner-actions/remote-proof-input-issue-7-split --require-ready
```

## Boundary

This command does not commit issue body.
It does not choose a license.
It does not provide legal advice.
It does not grant permission.
It does not create external proof.
It does not approve proof.
It does not publish.
It does not close gates.

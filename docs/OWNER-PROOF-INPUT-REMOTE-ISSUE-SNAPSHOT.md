# Owner Proof Input Remote Issue Snapshot

Status: metadata-only remote issue snapshot, not owner decision or proof.

`owner:proof-input-remote-issue-snapshot` reads the current GitHub owner proof input issue metadata and writes a bounded local snapshot.
It does not store the raw issue body.

## Commands

Generate the metadata-only snapshot:

```bash
npm run owner:proof-input-remote-issue-snapshot
```

Audit the committed snapshot shape:

```bash
npm run audit:owner-proof-input-remote-issue-snapshot
```

Generated files:

- `.mimesis/owner-actions/remote-proof-input-issue-snapshot.json`
- `.mimesis/owner-actions/remote-proof-input-issue-snapshot.md`

## What It Records

- issue number, URL, title, state, labels, creation time, and update time
- whether the `owner-proof-input` label is present
- body SHA-256 hash and character count
- whether required headings are present
- whether a license choice and publication preference are checked
- how many safety confirmations are checked
- whether request placeholders are still present
- whether a secret-like pattern was detected
- whether the issue is still request-only or looks like candidate owner input

`candidate_owner_input` requires filled owner text, checked license and publication choices, all three safety confirmations checked, no placeholders, no secret-like pattern, the expected label, and an open issue.

## Boundary

This is metadata-only.
It does not store the raw issue body.
It does not choose a license.
It does not provide legal advice.
It does not grant permission.
It does not submit an artifact.
It does not create external proof.
It does not approve proof.
It does not publish.
It does not close gates.

If the snapshot reports `candidate_owner_input`, export the issue body deliberately to a private local file and run the reviewed local conversion path.
Do not commit raw owner artifact text, secrets, private customer data, or unredacted protected material.

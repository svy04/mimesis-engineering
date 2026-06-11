# Case Publication Packet

Status: local casebook candidate handoff.

`case:publish-packet` turns a completed local Mimesis case workspace into a bounded casebook candidate packet.
It runs the completed-case evidence check first, then writes the public-case handoff notes.

## Command

```bash
npm run case:publish-packet
```

or:

```bash
npm run cli -- case:publish-packet path/to/case
```

This writes:

```text
.mimesis/case-publication-packets/current-casebook-candidate.md
```

Audit it with:

```bash
npm run audit:case-publication
```

## What It Adds

- confirms the case has passed `case:check`
- names the casebook shape to copy into a public case
- lists the evidence files to copy or cite
- keeps permission, redaction, license, and proof boundaries visible
- blocks stronger claims before evidence exists

## Boundary

This is a casebook candidate packet.

It does not publish, post, stage, commit, push, tag, create a pull request, or upload to a casebook.
It does not prove external adoption, does not prove benchmarked productivity, does not grant permission, does not choose a license, and does not certify legal originality.

For external or user-submitted artifacts, use [Permissioned External Case Packet](PERMISSIONED-CASE-PACKET.md) and [Case Review Checklist](CASE-REVIEW-CHECKLIST.md) before publication.

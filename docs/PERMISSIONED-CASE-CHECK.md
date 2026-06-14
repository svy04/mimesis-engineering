# Permissioned Case Check

Status: local intake review gate.

`case:review` checks a permissioned external case intake before it can become public proof.
It turns the manual review checklist into a local gate.

## Run

```bash
npm run cli -- case:review path/to/permissioned-case.md
```

Require that the case can be public, anonymized, or redacted:

```bash
npm run cli -- case:review path/to/permissioned-case.md --require-public
```

Write a local review report:

```bash
npm run cli -- case:review path/to/permissioned-case.md --write-report
```

Create a started case workspace from reviewed intake:

```bash
npm run cli -- case:from-intake path/to/permissioned-case.md --reference-pack reference-packs/github-readme.md
```

## Required Intake Fields

- Starting artifact
- Artifact owner
- Permission status
- Publication preference
- Redaction requirements
- References studied
- Desired transformation
- Proof boundary
- Safety confirmation

## What It Rejects

- missing permission
- missing publication preference
- missing redaction requirements
- missing proof boundary
- secret-like API keys, tokens, passwords, or private data markers
- private-only cases when `--require-public` is used

## Boundary

Passing this check means the intake is coherent enough to review.
It does not prove external adoption, benchmarked productivity, commercial outcomes, legal originality, or that the transformation has already been completed.

Use [Permissioned External Case Packet](PERMISSIONED-CASE-PACKET.md) and [Case Review Checklist](CASE-REVIEW-CHECKLIST.md) before publication.

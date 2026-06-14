# Permissioned External Case Packet

Status: needed for stronger external proof.

This packet defines what is required before Mimesis can claim a permissioned external case.

## Why This Exists

The repository now includes:

- internal cases
- casebook-derived cases
- an external public-source specimen

Those are useful proof artifacts, but they do not replace a user-submitted or permissioned external weak-artifact case.

## Minimum Inputs

A permissioned external case needs:

- starting artifact
- owner or submitter permission
- references studied
- extracted structure
- before/after transformation
- proof boundary
- publication preference
- redaction requirements

## Permission Boundary

Do not publish:

- private source material
- confidential business context
- customer data
- screenshots without permission
- copied protected content
- claims the submitter cannot support

## Public Case Shape

Use:

- Starting Artifact
- Mimesis Lens
- Reference Structure
- What Changed
- Before / After
- What Improved
- What Remains Unproven
- Next Proof Artifact
- Boundary

## Intake Path

Use the GitHub issue form:

[Permissioned External Case](../.github/ISSUE_TEMPLATE/permissioned-external-case.yml)

For already-clean public examples, use:

[Case Submission](../.github/ISSUE_TEMPLATE/case-submission.yml)

or the template:

[Case Note](../templates/case-note.md)

Before publication, review the case with:

[Case Review Checklist](CASE-REVIEW-CHECKLIST.md)

For local intake review, run:

```bash
npm run cli -- case:review path/to/permissioned-case.md --require-public
```

See:
[Permissioned Case Check](PERMISSIONED-CASE-CHECK.md)

To turn a reviewed intake into a started external case workspace, run:

```bash
npm run cli -- case:from-intake path/to/permissioned-case.md --reference-pack reference-packs/github-readme.md
```

See:
[Case From Intake](CASE-FROM-INTAKE.md)

## Claim Boundary

A permissioned external case can prove that a real external artifact went through a documented Mimesis loop.

It still does not prove:

- universal effectiveness
- benchmarked productivity
- customer demand
- legal originality
- commercial success

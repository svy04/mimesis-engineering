# GitHub Issues Adapter Prototype

Status: `prototype`

Use when a community wants to submit weak artifacts, reference packs, cases, or boundary risks through GitHub Issues.

## Current Prototype

This repository includes GitHub issue form YAML files under `.github/ISSUE_TEMPLATE/`.

The forms are not generic issue templates.
They are structured around the Mimesis artifact trail:

- weak artifact
- reference pack
- case submission
- boundary risk

## Issue Types

- Weak Artifact
- Reference Pack
- Case Submission
- Boundary Risk

## Required Output

An issue should help a maintainer create or improve one of these artifacts:

- `.mimesis/artifact-brief.md`
- `.mimesis/reference-set.md`
- `.mimesis/structure-map.md`
- `.mimesis/transformation-plan.md`
- `.mimesis/boundary-check.md`
- `.mimesis/case-note.md`

## Guardrails

- Do not ask contributors for fake stars or engagement.
- Do not accept copied protected material.
- Do not publish a case without permission.
- Do not turn an issue into a result claim.

## Current Implementation

This repository includes GitHub issue form YAML files under `.github/ISSUE_TEMPLATE/`.
The forms are designed around the Mimesis artifact trail.

## Evidence

Local evidence in this repository:

- `.github/ISSUE_TEMPLATE/weak-artifact.yml`
- `.github/ISSUE_TEMPLATE/reference-pack.yml`
- `.github/ISSUE_TEMPLATE/case-submission.yml`
- `.github/ISSUE_TEMPLATE/boundary-risk.yml`
- `tools/audit-issue-forms.mjs` checks the expected issue form fields.
- `npm run audit:issues` passes for the current issue forms.

Allowed claim:
The GitHub Issues adapter has a local prototype through repository issue forms.

Not allowed:
The GitHub Issues adapter does not prove external submissions, community adoption, or GitHub endorsement.

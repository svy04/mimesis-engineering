# Mimesis First External Proof Intake Kit

Generated from the current local repository state for Mimesis Engineering v0.1.0.

Status: intake kit, not external proof.

Use this kit when asking someone to bring one permissioned external weak artifact into the first v0.2 proof loop.

## Submitter Checklist

A submitter must provide:

A permissioned external case needs:

- starting artifact
- owner or submitter permission
- references studied
- extracted structure
- before/after transformation
- proof boundary
- publication preference
- redaction requirements

The first proof candidate also needs:

A v0.2 proof candidate needs:

- one weak artifact from an owner, submitter, or clearly redacted public source
- explicit permission status
- publication preference
- redaction requirements
- safety confirmation
- one chosen reference pack
- completed before/after transformation
- completed boundary check
- completed case note
- reviewed evidence packet for any stronger public claim

## Intake Template

Copy this into a permissioned intake file before running `case:review`.

# Permissioned Case Intake

## Submitter

TODO: Who is submitting the artifact?

## Starting Artifact

TODO: What is the weak artifact?

## Artifact Owner

TODO: Who owns the artifact?

## Permission Status

TODO: Do you own it, have permission, need redaction, or need private-only handling?

## Publication Preference

- public
- anonymized
- redacted
- private only

## References Studied

TODO: What strong artifacts should be studied?

## Desired Transformation

TODO: What should become clearer, stronger, or safer?

## Proof Boundary

TODO: What must this case not claim?

## Redaction Requirements

TODO: What must be removed before publication?

## Safety Confirmation

TODO: Confirm that no secrets, passwords, tokens, private customer data, or copied protected material are included.


## Required Command Path

Run the first permissioned proof loop in this order:

```bash
npm run cli -- proof:readiness
npm run cli -- case:review path/to/permissioned-case.md --require-public --write-report
npm run cli -- case:from-intake path/to/permissioned-case.md --reference-pack reference-packs/github-readme.md --title "Permissioned README Case"
npm run cli -- case:check path/to/started-case
npm run cli -- evidence:from-case path/to/started-case --out path/to/evidence-packet.md
npm run cli -- evidence:review path/to/evidence-packet.md --decision reviewed --reviewer "Reviewer Name" --note "Reviewed against the proof boundary." --out path/to/reviewed-evidence.md
npm run cli -- benchmark:packet
npm run cli -- evidence:check path/to/reviewed-evidence.md --require-reviewed --write-report
npm run cli -- claim:from-evidence path/to/reviewed-evidence.md --out path/to/claim-candidate.md
npm run release:check:public
```

`case:check` should fail until the improved artifact, boundary check, case note, and run ledger are completed.

## Evidence Packet Requirements

After the case transformation is complete, create a reviewed evidence packet for any public claim stronger than local transformation evidence.

Evidence packet template:

# Evidence Packet

Status: draft.

Use this when a claim is stronger than local framework readiness.
Examples: external adoption, benchmarked productivity, customer outcome proof, npm release, marketplace action release, shipped plugin, or commercial outcome.
Do not claim any of these without named evidence and a visible boundary.

## Claim Under Review

Write the exact public sentence or release claim being reviewed.

## Evidence Type

Choose one or more:

Boundary: do not claim any listed outcome without packet evidence.

- permissioned external case, not a claim by itself
- benchmark study, not a claim by itself
- external adoption, not a claim by itself
- package release, not a claim by itself
- action release, not a claim by itself
- shipped plugin, not a claim by itself
- customer outcome, not a claim by itself
- publication event, not a claim by itself
- owner decision, not legal advice or publication by itself
- sync verification, not publication by itself
- gate evidence, not proof by itself

## Source / Artifact Links

List the evidence artifacts.
Use links, paths, issue numbers, release tags, package URLs, or case notes.

## Permission / Publication Boundary

State who can publish the evidence, what must be redacted, and which facts are public.

## Measurement / Observation Method

State how the evidence was observed or measured.
Do not use impressions, vibes, or unverifiable engagement.

## Before / After Or Event Evidence

Show the before/after, benchmark run, release event, adoption event, or review trail.

## Allowed Claim

Write the strongest claim this evidence actually supports.

## Disallowed Claim

Write the stronger claim that this packet still does not support.

## What Remains Unproven

List the proof gaps that remain after this evidence.

## Review Decision

draft.


## Redaction And Permission Boundary

Do not publish:

- private source material
- confidential business context
- customer data
- screenshots without permission
- copied protected content
- claims the submitter cannot support

Required submitter fields include:

- Artifact owner
- Permission status
- Publication preference
- Redaction requirements
- Safety confirmation

## Stop Conditions

Do not claim v0.2 external proof if:

- the artifact owner or permission status is unclear
- publication preference or redaction requirements are missing
- `case:review --require-public` fails
- `case:from-intake` creates only a started workspace and no completed transformation exists
- `case:check` fails
- `benchmark:packet` is described as measurement proof instead of a measurement protocol
- the evidence packet is draft or unsafe
- claims imply adoption, benchmarked productivity, customer outcomes, legal originality, or endorsement without direct evidence

## Allowed Claim

Allowed only after the first candidate passes the full path:

```text
Mimesis Engineering v0.2 includes one permissioned or clearly redacted external before/after proof loop with explicit evidence and claim boundaries.
```

Not allowed yet:

```text
Mimesis is externally adopted, benchmarked, legally original, commercially proven, or universally effective.
```

## Disallowed Claim

This kit does not prove that Mimesis is externally adopted, benchmarked, commercially validated, legally original, universally effective, or production-ready.

## Boundary

This kit does not create external proof, does not prove adoption, does not choose a license, does not grant permission, does not run a transformation, does not publish a case, does not publish to npm, and does not publish a GitHub Marketplace action.

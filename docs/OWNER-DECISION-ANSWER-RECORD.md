# Owner Decision Answer Record

Status: local schema-shaped owner decision answer record fixture.

`owner:decision-answer-record` turns `.mimesis/owner-actions/decision-intake.md` into `.mimesis/owner-actions/fixture-answer-record.json`.
The record is schema-shaped by `spec/owner-decision-answer.schema.json`.

## Command

```bash
npm run owner:decision-answer-record
```

or:

```bash
npm run cli -- owner:decision-answer-record
```

This writes:

```text
.mimesis/owner-actions/fixture-answer-record.json
```

## What It Captures

The fixture preserves pending owner answers for:

- `license_or_no_reuse`
- `weak_artifact_permission`
- `publication_scope`
- `package_action_plugin_scope`
- `benchmark_adoption_scope`
- `strict_sync_intent`

Each field keeps the current signal, evidence to attach, and boundary from the owner decision intake.

## Audit

Run:

```bash
npm run audit:owner-decision-answer-record
```

or:

```bash
npm run cli -- audit:owner-decision-answer-record
```

The audit checks:

- the generated record is fresh
- the record conforms to the owner decision answer schema subset
- all required owner answer fields remain visible
- all fields are still `pending` in the fixture
- required owner/proof/publication/benchmark/adoption gates remain listed
- prohibited claims and no-decision boundaries remain explicit
- package script, CLI, docs, release preflight, validator, framework manifest, release artifact manifest, and completion matrix wiring exist

## License Decision Bridge

When the owner later provides a reviewed owner answer for `license_or_no_reuse`, `license:decision-from-owner-answer` can turn that reviewed owner answer into a bounded release decision record candidate.

The default fixture remains pending and blocked.
The bridge requires a reviewed owner answer, explicit owner confirmation, decision evidence, and confirmations that the operator is not providing legal advice, publishing, or closing gates.

## Boundary

This is a local fixture for pending owner answers.

It does not choose a license.
It does not collect an artifact.
It does not grant permission.
It does not publish.
It does not create external proof.
It does not close gates.

It is not an owner decision, a submitted artifact, a permission grant, a release, a package publication, a Marketplace publication, shipped plugin proof, benchmark proof, adoption proof, customer outcome proof, legal advice, or endorsement.

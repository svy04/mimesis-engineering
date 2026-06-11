# What One Mimesis Loop Produces

A Mimesis loop is complete only when it leaves artifacts behind.

Not vibes.
Not vague inspiration.
Artifacts.

## Artifact Brief

What you are improving, for whom, and why.

It names:

- artifact
- audience
- goal
- current weakness
- constraint
- success condition
- proof needed

## Reference Set

The strong artifacts you will study.

A Reference Set is not a list of things to copy.
It is a standard field.

## Structure Map

The extracted structure:

- knowledge structure
- visual structure
- user flow
- trust devices
- claim boundary
- failure handling
- rhythm and taste

## Transformation Plan

How your artifact will change under your own constraints.

It names:

- patterns to use
- patterns to transform
- patterns to reject
- new structure
- proof needed
- boundary risks

## Improved Artifact

The new version.

It should be visibly stronger.
It should also be visibly yours.

## Boundary Check

Where this could become:

- shallow imitation
- surface copying
- overclaiming
- weak proof
- unclear ownership

## Case Note

A public or private record of:

- before
- references
- extracted structure
- after
- what improved
- what remains unproven

If there is no artifact trail, the Mimesis loop is not complete.

## File Protocol

The default file trail lives in `.mimesis/`:

- `.mimesis/spec_lock.md`
- `.mimesis/procedure_tree.md`
- `.mimesis/artifact-brief.md`
- `.mimesis/reference-set.md`
- `.mimesis/structure-map.md`
- `.mimesis/transformation-plan.md`
- `.mimesis/improved-artifact.md`
- `.mimesis/boundary-check.md`
- `.mimesis/case-note.md`
- `.mimesis/run_ledger.md`

Use [spec/file-protocol.md](../spec/file-protocol.md) for the full contract.
Use [templates/README.md](../templates/README.md) for fillable files.
Use [templates/canvas.md](../templates/canvas.md) when the first pass needs a lighter worksheet.

## Local Validation

This repository includes a local protocol check:

```bash
node tools/validate-mimesis.mjs
```

The validator checks whether the repo surface still has the expected files, links, issue forms, status labels, and completed `.mimesis` trail.

# Case Start

Status: local starter workflow.

`case:start` turns one weak artifact into a Mimesis case workspace.
It is the executable version of "Bring one weak artifact."

## Run

```bash
npm run case:start -- --artifact path/to/weak.md --reference-pack reference-packs/github-readme.md --title "Weak README"
```

or:

```bash
npm run cli -- case:start --artifact path/to/weak.md --reference-pack reference-packs/github-readme.md --title "Weak README"
```

By default this creates:

```text
.mimesis/case-runs/<slug>/
  README.md
  weak-artifact.md
  .mimesis/
    spec_lock.md
    procedure_tree.md
    artifact-brief.md
    reference-set.md
    structure-map.md
    transformation-plan.md
    improved-artifact.md
    boundary-check.md
    case-note.md
    run_ledger.md
```

## Important Boundary

The generated workspace is marked `Case Status: started`.
It does not prove improvement.
It does not prove external adoption, benchmarked productivity, legal originality, or customer outcomes.

`workspace:check` should not pass a newly started case.
It should pass only after the improved artifact, boundary check, case note, and run ledger contain concrete evidence rather than starter notes.

## Complete The Loop

1. Fill the audience, goal, weakness, and constraints in `artifact-brief.md`.
2. Add real references and source-first notes in `reference-set.md`.
3. Extract structure into `structure-map.md`.
4. Write the transformation plan.
5. Produce the improved artifact.
6. Inspect proof and originality risk.
7. Finish the case note and run ledger.
8. Run `mimesis case:check .` from the case folder.
9. Run `mimesis workspace:check .` if you also want the generic file-protocol check.

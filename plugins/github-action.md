# GitHub Action Shape

Status: `usable`

Goal:
Check whether a repository using Mimesis has the expected artifact trail.

Current usable local action:
`.github/actions/release-check/action.yml` wraps `npm run release:check` as a repository-local composite action.

Current workflow:
`.github/workflows/validate-mimesis.yml` calls the local action on push to `main` and on pull requests.

Current root action release candidate:
`action.yml` runs `workspace:check` against a checked-out repository's visible `.mimesis` artifact trail.
This is metadata and local evidence only.
It is not a marketplace action or tagged public action release.

## Possible Checks

- `.mimesis/spec_lock.md` exists
- `.mimesis/artifact-brief.md` exists
- `.mimesis/reference-set.md` exists
- `.mimesis/structure-map.md` exists
- `.mimesis/transformation-plan.md` exists
- `.mimesis/boundary-check.md` exists
- `.mimesis/case-note.md` exists
- `.mimesis/run_ledger.md` exists
- forbidden claim phrases are not present without proof notes

## Non-Goals

- judging legal originality
- validating external outcomes
- measuring productivity gains
- auto-rewriting the artifact

## v0.1 Boundary

The repository-local composite action is usable inside this repository's workflow.
The root action is a release-candidate surface for later publication.
Neither is a marketplace GitHub Action package, a tagged public action release, or externally adopted integration in v0.1.

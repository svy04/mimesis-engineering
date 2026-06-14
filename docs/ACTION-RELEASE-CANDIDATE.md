# GitHub Action Release Candidate

Status: root action metadata is present as a release-candidate surface.

This repository now includes a root `action.yml` that can run the Mimesis workspace protocol check.
The root action.yml is a candidate metadata file, not a publication event.
It is not a marketplace action, not a tagged public action release, and not external adoption proof.

## Source Standards

- GitHub Actions require an action metadata file named `action.yml` or `action.yaml`:
  [GitHub metadata syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/metadata-syntax)
- GitHub Marketplace publication requires a public repository, root action metadata, and a tagged release flow:
  [GitHub Marketplace publishing docs](https://docs.github.com/actions/creating-actions/publishing-actions-in-github-marketplace)

## Current Candidate Surface

- Root `action.yml` runs `workspace:check` by default against the checked-out repository.
- `.github/actions/release-check/action.yml` remains the repository-local release preflight action.
- `.github/workflows/validate-mimesis.yml` still uses the repository-local action for this repository.
- `tools/check-workspace.mjs` validates the visible `.mimesis` protocol trail in a target workspace.

## Local Evidence

Run:

```bash
npm run audit:action
npm run workspace:check
```

The first command checks the root action metadata and boundary docs.
The second command checks the current repository's `.mimesis` protocol trail.

## Boundary

The root action metadata is a release candidate.
It does not prove a GitHub Marketplace listing, a tagged public release, external usage, or verified integration in another repository.

## Owner Gates Before Marketplace Claim

1. Keep or split the repository shape so the root action is the intended published action.
2. Tag a release after `npm run release:check` passes.
3. Publish through the GitHub Marketplace release flow.
4. Add a case note proving use in at least one external repository before claiming adoption.

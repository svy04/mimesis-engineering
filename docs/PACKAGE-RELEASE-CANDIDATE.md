# Package Release Candidate

Status: local release-candidate surface only.

This repository has a local CLI and package metadata that can be inspected before any npm publication.
It is not an npm package release.

## Source Standards

- npm package metadata requires package identity such as `name` and `version` when publishing:
  [npm package.json docs](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/)
- npm publish is the registry publication step:
  [npm publish docs](https://docs.npmjs.com/cli/v10/commands/npm-publish/)
- `npm pack --dry-run` is used here only to inspect the package surface before any publish step.

## Current Candidate Surface

- `package.json` exposes `bin.mimesis`.
- `bin/mimesis.mjs` exposes local framework commands.
- `tools/check-workspace.mjs` can inspect a target repository's `.mimesis` protocol files.
- `package.json` includes a `files` allowlist so the dry-run package surface is explicit.
- `package.json` remains `private: true`.
- `package.json` uses `UNLICENSED` while the owner license decision remains open.

## Local Evidence

Run:

```bash
npm run audit:package
```

This runs `npm pack --dry-run --json` and checks that the candidate package contains the expected CLI, tools, templates, spec, docs, and root action metadata.

## Boundary

This proves only local package-shape coherence.
It does not prove npm publication, installability from the npm registry, external adoption, or reuse rights.

## Owner Gates Before Publish

1. Choose a license or keep a clear no-reuse boundary.
2. Decide whether the package should remain private or become publishable.
3. Confirm package name, scope, registry access, and release tag.
4. Run `npm run release:check`.
5. Publish only from an owner-controlled npm account.

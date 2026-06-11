# License Decision Packet

Status: owner decision required.

This repository is presented as a public framework, but the owner still needs to choose the legal license.

## Current Boundary

Current repository state:

- `LICENSE.md` exists as a license status note.
- No explicit reuse license has been selected yet.
- Public-framework claims should not imply open-source reuse rights until a license is chosen.

GitHub's licensing docs explain that without a license, default copyright applies and the owner retains rights:
[GitHub Docs: Licensing a repository](https://docs.github.com/articles/licensing-a-repository).

The SPDX License List provides standardized identifiers and canonical license texts:
[SPDX License List](https://spdx.org/licenses/).

## Decision Needed

The owner should choose one of these directions:

| Direction | Possible Fit | Boundary |
| --- | --- | --- |
| permissive software license | code and validator reuse | owner must choose exact license text |
| documentation/content license | docs, templates, and cases reuse | may need separate handling from code |
| dual license | code under one license, docs under another | more explicit but more complex |
| no reuse license yet | public viewing only | not open-source reuse-ready |

## Safe Claim Before Decision

```text
Mimesis Engineering is public to inspect, but the reuse license is not selected yet.
```

## Unsafe Claim Before Decision

```text
Mimesis Engineering is open-source and freely reusable.
```

## Next Action

Pick a license and replace `LICENSE.md` with the selected license text or a clear dual-license notice.

This file is not legal advice.

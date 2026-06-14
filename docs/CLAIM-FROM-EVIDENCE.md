# Claim From Evidence

Status: local reviewed-evidence claim candidate.

`claim:from-evidence` creates a bounded claim candidate from a reviewed evidence packet.
It requires `evidence:check --require-reviewed` before writing output.

```bash
npm run cli -- claim:from-evidence path/to/reviewed-evidence.md --out path/to/claim-candidate.md
```

## What It Requires

- a reviewed evidence packet
- an `Allowed Claim`
- a `Disallowed Claim`
- source or artifact links
- remaining proof gaps
- a review decision that passes `evidence:check --require-reviewed`

## What It Writes

- evidence source
- review decision
- bounded claim candidate
- Allowed Claim
- Disallowed Claim
- evidence to cite
- remaining proof gaps
- publication boundary

## Boundary

This command does not create evidence, does not publish, does not post, does not stage, does not commit, does not push, does not create engagement, does not prove external adoption, does not prove benchmarked productivity, does not prove customer outcomes, does not publish a package, does not release an action, does not ship a plugin, does not choose a license, and does not certify legal originality.
It only turns a reviewed evidence packet into a safer copy candidate.

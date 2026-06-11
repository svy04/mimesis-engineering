# Evidence Review

Status: local evidence review writer.

`evidence:review` records a named reviewer decision on an evidence packet.
It is the step between a draft evidence packet and `evidence:check --require-reviewed`.

```bash
npm run cli -- evidence:review .mimesis/evidence-packets/local-case-draft.md --decision reviewed --reviewer "Reviewer Name" --note "Reviewed against the proof boundary." --out path/to/reviewed-evidence.md
npm run cli -- evidence:check path/to/reviewed-evidence.md --require-reviewed
```

## Required Inputs

- evidence packet path
- `--decision reviewed|accepted|publish|publish-redacted|rejected`
- `--reviewer`
- `--note`

## What It Writes

- a reviewed evidence packet copy, or a rejected evidence packet copy
- `Status: reviewed.` for reviewed, accepted, publish, or publish-redacted decisions
- `Status: rejected.` for rejected decisions
- reviewer
- review note
- review timestamp
- review boundary

## Boundary

This command does not create evidence, does not prove external adoption, does not prove benchmarked productivity, does not prove customer outcomes, does not publish a case, does not publish a package, does not release an action, does not ship a plugin, does not choose a license, and does not certify legal originality.
It only records a reviewer decision on a packet that already passes the structural evidence gate.

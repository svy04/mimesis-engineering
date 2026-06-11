# Evidence From Case

Status: local draft evidence-packet starter.

`evidence:from-case` creates a draft evidence packet from a completed Mimesis case workspace.
It runs `case:check` first, writes or refreshes `.mimesis/case-proof.md`, and then writes a packet that can be checked with `evidence:check`.

```bash
npm run cli -- evidence:from-case . --out .mimesis/evidence-packets/local-case-draft.md --force
npm run cli -- evidence:check .mimesis/evidence-packets/local-case-draft.md
```

To turn the draft into a reviewed evidence packet, record a named reviewer decision:

```bash
npm run cli -- evidence:review .mimesis/evidence-packets/local-case-draft.md --decision reviewed --reviewer "Reviewer Name" --note "Reviewed against the proof boundary." --out path/to/reviewed-evidence.md
```

## What It Does

- requires the target case workspace to pass `case:check`
- copies only local case evidence paths and boundary summaries
- writes a draft evidence packet
- keeps the review decision as `draft.`
- does not mark the evidence as reviewed

## Boundary

This command does not create external proof, does not prove external adoption, does not prove benchmarked productivity, does not prove customer outcomes, does not publish a case, does not choose a license, and does not certify legal originality.
Use `evidence:check --require-reviewed` only after a human review decision changes the packet from draft to reviewed or accepted.

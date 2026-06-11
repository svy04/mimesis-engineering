# License Decision From Owner Answer

Status: local owner-answer bridge, not legal advice.

`license:decision-from-owner-answer` bridges a reviewed owner decision answer record into a bounded release decision record candidate.
It reads only the `license_or_no_reuse` field.

## Default Report

Run:

```bash
npm run license:decision-from-owner-answer
```

or:

```bash
npm run cli -- license:decision-from-owner-answer
```

This writes:

```text
.mimesis/release-decisions/from-owner-answer-bridge.md
```

The default report stays blocked because the repository fixture has pending owner answers.

## Reviewed Owner Answer Path

After the owner supplies and reviews a real `license_or_no_reuse` answer:

```bash
npm run cli -- license:decision-from-owner-answer path/to/owner-answer-record.json --output path/to/release-decision-record.json --decision no_reuse_boundary --owner-confirmation "Owner explicitly chose the no-reuse boundary for v0.1." --decision-evidence path/to/reviewed-owner-answer.json --confirm-owner-reviewed --confirm-not-legal-advice --confirm-no-publication
```

For an owner-selected reuse license, use `--decision reuse_license_selected` and add:

```bash
--license-name "Owner-selected license identifier"
```

## Required Input State

The bridge requires:

- `status: reviewed`
- `fields.license_or_no_reuse.answerStatus: answered`
- explicit owner answer text
- `safetyConfirmation.noRealOwnerDecision: false`
- owner confirmation text
- decision evidence
- explicit confirmations that the answer was owner-reviewed, is not legal advice, and does not publish

## Output

The output is a release decision record candidate with:

- `status: owner_license_decision_recorded_not_publication`
- `license.decision: no_reuse_boundary` or `reuse_license_selected`
- the owner answer text
- the owner confirmation
- decision evidence
- public release, package, action, plugin, proof, benchmark, and adoption gates still pending or blocked

## Boundary

This command records reviewed owner intent.

It does not choose a license by code.
It does not recommend a license.
It does not provide legal advice.
It does not publish.
It does not stage, commit, push, tag, or release.
It does not publish to npm.
It does not publish a GitHub Marketplace action.
It does not ship a plugin.
It does not create external proof.
It does not prove adoption.
It does not close gates.
It does not prove benchmarked productivity, customer outcomes, commercial outcomes, legal originality, or endorsement.

## Audit

Run:

```bash
npm run audit:license-decision-from-owner-answer
```

or:

```bash
npm run cli -- audit:license-decision-from-owner-answer
```

The audit checks blocked default behavior, reviewed owner answer conversion, required confirmations, missing license-name rejection for reuse-license output, public docs, CLI exposure, release preflight wiring, validator coverage, framework manifest visibility, release artifact manifest coverage, and no-legal-advice/no-publication/no-proof boundaries.
